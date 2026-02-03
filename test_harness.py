# test_harness.py
"""
Demonstrates CRUD for each DAO and console retrieval of records.
Usage:
    python test_harness.py           # create tables, seed sample via Python, show all, demo CRUD
    python test_harness.py --no-seed # only ensure tables + show records (use after seed_data.sql)
"""
import sys
from datetime import datetime
from db import engine, SessionLocal
from models import Base
from team_dao import create_team, list_teams, get_team, update_team, delete_team
from player_dao import create_player, list_players, get_player, update_player, delete_player
from team_roster_dao import add_roster_entry, list_roster_for_team
from match_dao import create_match, list_matches, get_match, update_match, delete_match
from match_stats_dao import create_match_stat, list_stats_for_match, update_match_stat, delete_match_stat, get_match_stat
from tabulate import tabulate

def init_db():
    Base.metadata.create_all(bind=engine)
    print("DB tables ensured (create if not exist).")

def seed_sample():
    # create two teams
    t1 = create_team("Rift A", short_name="RFTA", region="LCK")
    t2 = create_team("Rift B", short_name="RFTB", region="LCK")
    print("Created teams:", t1.id, t2.id)

    # create players
    p1 = create_player(name="Lee Top", gamer_tag="LeeTop", nationality="KR", role="TOP", age=20)
    p2 = create_player(name="Jung K", gamer_tag="JungK", nationality="KR", role="JG", age=21)
    print("Created players:", p1.gamer_tag, p2.gamer_tag)

    # add roster entries
    add_roster_entry(team_id=t1.id, player_id=p1.id, start_date=datetime.utcnow())
    add_roster_entry(team_id=t1.id, player_id=p2.id, start_date=datetime.utcnow())

    # create a match (one game)
    m = create_match(series_id=1, region="LCK", season="2026 Spring", match_date=datetime.utcnow(), team_a_id=t1.id, team_b_id=t2.id, best_of=1, game_number=1, winner_team_id=t1.id, patch="13.1")
    print("Created match id:", m.id)

    # create match stats (two rows)
    create_match_stat(match_id=m.id, team_id=t1.id, gold_diff_15=1200, kills=18, deaths=5, assists=30, towers_taken=11, dragons_taken=3, barons_taken=1, first_blood=True, win=True)
    create_match_stat(match_id=m.id, team_id=t2.id, gold_diff_15=-1200, kills=5, deaths=18, assists=10, towers_taken=2, dragons_taken=0, barons_taken=0, first_blood=False, win=False)

def show_all():
    ts = list_teams()
    print("\n=== Teams ===")
    print(tabulate([(t.id,t.name,t.region) for t in ts], headers=["id","name","region"]))

    ps = list_players()
    print("\n=== Players ===")
    print(tabulate([(p.id,p.gamer_tag,p.role,p.age) for p in ps], headers=["id","gamer_tag","role","age"]))

    ms = list_matches(20)
    print("\n=== Matches ===")
    print(tabulate([(m.id, m.match_date.strftime('%Y-%m-%d %H:%M'), m.team_a_id, m.team_b_id, m.winner_team_id) for m in ms], headers=["id","date","team_a","team_b","winner"]))

    # show stats for first match if exists
    if ms:
        first_match_id = ms[0].id
        stats = list_stats_for_match(first_match_id)
        print(f"\n=== Stats for match {first_match_id} ===")
        print(tabulate([(s.id,s.team_id,s.gold_diff_15,s.kills,s.win) for s in stats], headers=["id","team_id","gold_diff15","kills","win"]))

def demonstrate_updates_and_deletes():
    # Update a team name
    teams = list_teams()
    if teams:
        t = teams[0]
        print("\nUpdating team name for id", t.id)
        update_team(t.id, name=t.name + " (UPDATED)")
        print("After update:", get_team(t.id).name)

    # Update a player
    players = list_players()
    if players:
        p = players[0]
        print("\nUpdating player age for", p.gamer_tag)
        update_player(p.id, age=(p.age or 20) + 1)
        print("After update:", get_player(p.id).age)

    # Delete a match stat (if exists)
    ms = list_matches(10)
    if ms:
        mid = ms[0].id
        stats = list_stats_for_match(mid)
        if stats:
            stat = stats[0]
            print("\nDeleting match_stat id", stat.id)
            delete_match_stat(stat.id)
            print("Remaining stats for match:", [s.id for s in list_stats_for_match(mid)])

def showcase_one_crud_per_dao():
    """One labeled CRUD operation per DAO (Read/Get so it works with --no-seed)."""
    print("\n" + "=" * 60)
    print("One CRUD operation per DAO")
    print("=" * 60)

    # 1) Team DAO — Read (get by id)
    t = get_team(1)
    print("\n[Team DAO] Read — get_team(1):")
    print(f"  -> id={t.id}, name={t.name}, region={t.region}" if t else "  -> None")

    # 2) Player DAO — Read (get by id)
    p = get_player(1)
    print("\n[Player DAO] Read — get_player(1):")
    print(f"  -> id={p.id}, gamer_tag={p.gamer_tag}, role={p.role}" if p else "  -> None")

    # 3) Team Roster DAO — Read (list by team)
    roster = list_roster_for_team(1)
    print("\n[Team Roster DAO] Read — list_roster_for_team(1):")
    if roster:
        r0 = roster[0]
        print(f"  -> {len(roster)} entries; first: id={r0.id}, team_id={r0.team_id}, player_id={r0.player_id}")
    else:
        print("  -> []")

    # 4) Match DAO — Read (get by id)
    m = get_match(1)
    print("\n[Match DAO] Read — get_match(1):")
    print(f"  -> id={m.id}, team_a={m.team_a_id}, team_b={m.team_b_id}, winner={m.winner_team_id}" if m else "  -> None")

    # 5) Match Stats DAO — Read (get by id)
    s = get_match_stat(1)
    print("\n[Match Stats DAO] Read — get_match_stat(1):")
    print(f"  -> id={s.id}, match_id={s.match_id}, team_id={s.team_id}, kills={s.kills}, win={s.win}" if s else "  -> None")

    print()

def main():
    no_seed = '--no-seed' in sys.argv
    init_db()
    if no_seed:
        print("(--no-seed: skipping Python seed and CRUD demo; showing existing records only)\n")
        show_all()
        showcase_one_crud_per_dao()
    else:
        seed_sample()
        show_all()
        demonstrate_updates_and_deletes()
        showcase_one_crud_per_dao()
    print("\nDemo complete.")

if __name__ == '__main__':
    main()
