#!/usr/bin/env python3
"""
Console client: demonstrates full CRUD via the Rift Stats API.
Run the API first (e.g. docker run ... or uvicorn api.main:app --port 8000).
Usage: python cli/console_client.py
Uses stdlib urllib only (no requests required).
"""
import os
import json
import time
import urllib.request
import urllib.error

BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

def _unique_suffix():
    """Unique suffix per run so re-runs don't hit DB unique constraints."""
    return str(int(time.time() * 1000))

def _req(method: str, path: str, body: dict | None = None):
    url = f"{BASE_URL.rstrip('/')}{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read().decode()
            return r.getcode(), json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode() if e.read() else ""
        return e.code, json.loads(raw) if raw else {"detail": str(e)}
    except urllib.error.URLError as e:
        print(f"  Connection error: {e.reason}")
        raise

def main():
    suffix = _unique_suffix()
    print("=" * 60)
    print("Rift Stats — Console Client (CRUD via API)")
    print("=" * 60)
    print(f"Base URL: {BASE_URL}\n")

    # --- TEAM CRUD ---
    print("--- TEAM: Create ---")
    code, team = _req("POST", "/teams", {"name": f"Console Demo Team {suffix}", "short_name": "CDT", "region": "LCK"})
    print(f"POST /teams -> {code}")
    if code not in (200, 201):
        print(f"  Error: {team}")
        return
    team_id = team["id"]
    print(f"  Created: {json.dumps(team, indent=2)}")

    print("\n--- TEAM: Get ---")
    code, body = _req("GET", f"/teams/{team_id}")
    print(f"GET /teams/{team_id} -> {code}")
    print(f"  {json.dumps(body, indent=2)}")

    print("\n--- TEAM: Update ---")
    code, body = _req("PUT", f"/teams/{team_id}", {"name": "Console Demo Team (Updated)", "region": "LCS"})
    print(f"PUT /teams/{team_id} -> {code}")
    print(f"  {json.dumps(body, indent=2)}")

    print("\n--- TEAM: Delete ---")
    code, _ = _req("DELETE", f"/teams/{team_id}")
    print(f"DELETE /teams/{team_id} -> {code}")

    print("\n--- TEAM: Get after delete (expect 404) ---")
    code, body = _req("GET", f"/teams/{team_id}")
    print(f"GET /teams/{team_id} -> {code}")
    if code == 404:
        print(f"  Confirmed: {body.get('detail', body)}")
    else:
        print(f"  {body}")

    # --- PLAYER CRUD ---
    print("\n" + "=" * 60)
    print("--- PLAYER: Create ---")
    code, player = _req("POST", "/players", {
        "name": "Demo Player",
        "gamer_tag": f"ConsoleDemo1_{suffix}",
        "nationality": "NA",
        "role": "MID",
        "age": 21,
    })
    print(f"POST /players -> {code}")
    if code not in (200, 201):
        print(f"  Error: {player}")
        return
    player_id = player["id"]
    print(f"  Created: {json.dumps(player, indent=2)}")

    print("\n--- PLAYER: Get ---")
    code, body = _req("GET", f"/players/{player_id}")
    print(f"GET /players/{player_id} -> {code}")
    print(f"  {json.dumps(body, indent=2)}")

    print("\n--- PLAYER: Update ---")
    code, body = _req("PUT", f"/players/{player_id}", {"age": 22, "role": "JG"})
    print(f"PUT /players/{player_id} -> {code}")
    print(f"  {json.dumps(body, indent=2)}")

    print("\n--- PLAYER: Delete ---")
    code, _ = _req("DELETE", f"/players/{player_id}")
    print(f"DELETE /players/{player_id} -> {code}")

    print("\n--- PLAYER: Get after delete (expect 404) ---")
    code, body = _req("GET", f"/players/{player_id}")
    print(f"GET /players/{player_id} -> {code}")
    if code == 404:
        print(f"  Confirmed: {body.get('detail', body)}")
    else:
        print(f"  {body}")

    # --- ROSTER CRUD (needs a team and player) ---
    print("\n" + "=" * 60)
    print("--- ROSTER: Create team & player for roster ---")
    code, t_roster = _req("POST", "/teams", {"name": f"Roster Demo Team {suffix}", "region": "LCK"})
    if code not in (200, 201):
        print(f"  Error: {t_roster}"); return
    code, p_roster = _req("POST", "/players", {"name": "Roster Player", "gamer_tag": f"RosterDemo1_{suffix}", "role": "TOP"})
    if code not in (200, 201):
        print(f"  Error: {p_roster}"); return
    rid, pid = t_roster["id"], p_roster["id"]
    print(f"  Team id={rid}, Player id={pid}")

    print("\n--- ROSTER: Add entry ---")
    code, roster = _req("POST", "/roster", {"team_id": rid, "player_id": pid, "start_date": "2025-01-01T00:00:00", "role_at_team": "TOP"})
    print(f"POST /roster -> {code}")
    if code not in (200, 201):
        print(f"  Error: {roster}"); return
    roster_id = roster["id"]
    print(f"  Created: {json.dumps(roster, indent=2, default=str)}")

    print("\n--- ROSTER: Get ---")
    code, body = _req("GET", f"/roster/{roster_id}")
    print(f"GET /roster/{roster_id} -> {code}")
    print(f"  {json.dumps(body, indent=2, default=str)}")

    print("\n--- ROSTER: Update ---")
    code, body = _req("PUT", f"/roster/{roster_id}", {"role_at_team": "JG"})
    print(f"PUT /roster/{roster_id} -> {code}")
    print(f"  {json.dumps(body, indent=2, default=str)}")

    print("\n--- ROSTER: Delete ---")
    code, _ = _req("DELETE", f"/roster/{roster_id}")
    print(f"DELETE /roster/{roster_id} -> {code}")

    print("\n--- ROSTER: Get after delete (expect 404) ---")
    code, body = _req("GET", f"/roster/{roster_id}")
    print(f"GET /roster/{roster_id} -> {code}")
    if code == 404:
        print(f"  Confirmed: {body.get('detail', body)}")
    else:
        print(f"  {body}")

    # --- MATCH CRUD (needs two teams) ---
    print("\n" + "=" * 60)
    print("--- MATCH: Create two teams ---")
    code, t_a = _req("POST", "/teams", {"name": f"Match Team A {suffix}", "region": "LCK"})
    if code not in (200, 201):
        print(f"  Error: {t_a}"); return
    code, t_b = _req("POST", "/teams", {"name": f"Match Team B {suffix}", "region": "LCK"})
    if code not in (200, 201):
        print(f"  Error: {t_b}"); return
    ta_id, tb_id = t_a["id"], t_b["id"]
    print(f"  Team A id={ta_id}, Team B id={tb_id}")

    print("\n--- MATCH: Create ---")
    code, match = _req("POST", "/matches", {"team_a_id": ta_id, "team_b_id": tb_id, "match_date": "2025-02-01T14:00:00", "season": "2025 Spring", "best_of": 3})
    print(f"POST /matches -> {code}")
    if code not in (200, 201):
        print(f"  Error: {match}"); return
    match_id = match["id"]
    print(f"  Created: {json.dumps(match, indent=2, default=str)}")

    print("\n--- MATCH: Get ---")
    code, body = _req("GET", f"/matches/{match_id}")
    print(f"GET /matches/{match_id} -> {code}")
    print(f"  {json.dumps(body, indent=2, default=str)}")

    print("\n--- MATCH: Update ---")
    code, body = _req("PUT", f"/matches/{match_id}", {"notes": "Console demo match"})
    print(f"PUT /matches/{match_id} -> {code}")
    print(f"  {json.dumps(body, indent=2, default=str)}")

    print("\n--- MATCH: Delete ---")
    code, _ = _req("DELETE", f"/matches/{match_id}")
    print(f"DELETE /matches/{match_id} -> {code}")

    print("\n--- MATCH: Get after delete (expect 404) ---")
    code, body = _req("GET", f"/matches/{match_id}")
    print(f"GET /matches/{match_id} -> {code}")
    if code == 404:
        print(f"  Confirmed: {body.get('detail', body)}")
    else:
        print(f"  {body}")

    # --- MATCH STATS CRUD (needs match and team) ---
    print("\n" + "=" * 60)
    print("--- MATCH STATS: Create match (reuse teams from above) ---")
    code, m2 = _req("POST", "/matches", {"team_a_id": ta_id, "team_b_id": tb_id, "match_date": "2025-02-02T15:00:00", "season": "2025 Spring"})
    if code not in (200, 201):
        print(f"  Error: {m2}"); return
    m2_id = m2["id"]

    print("\n--- MATCH STATS: Create ---")
    code, stat = _req("POST", "/match_stats", {"match_id": m2_id, "team_id": ta_id, "kills": 15, "deaths": 8, "win": True})
    print(f"POST /match_stats -> {code}")
    if code not in (200, 201):
        print(f"  Error: {stat}"); return
    stat_id = stat["id"]
    print(f"  Created: {json.dumps(stat, indent=2, default=str)}")

    print("\n--- MATCH STATS: Get ---")
    code, body = _req("GET", f"/match_stats/{stat_id}")
    print(f"GET /match_stats/{stat_id} -> {code}")
    print(f"  {json.dumps(body, indent=2, default=str)}")

    print("\n--- MATCH STATS: Update ---")
    code, body = _req("PUT", f"/match_stats/{stat_id}", {"kills": 18, "assists": 25})
    print(f"PUT /match_stats/{stat_id} -> {code}")
    print(f"  {json.dumps(body, indent=2, default=str)}")

    print("\n--- MATCH STATS: Delete ---")
    code, _ = _req("DELETE", f"/match_stats/{stat_id}")
    print(f"DELETE /match_stats/{stat_id} -> {code}")

    print("\n--- MATCH STATS: Get after delete (expect 404) ---")
    code, body = _req("GET", f"/match_stats/{stat_id}")
    print(f"GET /match_stats/{stat_id} -> {code}")
    if code == 404:
        print(f"  Confirmed: {body.get('detail', body)}")
    else:
        print(f"  {body}")

    print("\n" + "=" * 60)
    print("Console client CRUD demo complete (Teams, Players, Roster, Matches, Match Stats).")
    print("=" * 60)

if __name__ == "__main__":
    main()
