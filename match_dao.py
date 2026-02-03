# match_dao.py
from db import SessionLocal
from models import Match

def create_match(series_id, region, season, match_date, team_a_id, team_b_id, best_of=1, game_number=1, winner_team_id=None, patch=None, notes=None):
    s = SessionLocal()
    m = Match(series_id=series_id, region=region, season=season, match_date=match_date, team_a_id=team_a_id, team_b_id=team_b_id, best_of=best_of, game_number=game_number, winner_team_id=winner_team_id, patch=patch, notes=notes)
    s.add(m); s.commit(); s.refresh(m); s.close()
    return m

def get_match(match_id):
    s = SessionLocal()
    m = s.get(Match, match_id)
    s.close()
    return m

def list_matches(limit=100):
    s = SessionLocal()
    rows = s.query(Match).order_by(Match.match_date.desc()).limit(limit).all()
    s.close()
    return rows

def update_match(match_id, **kwargs):
    s = SessionLocal()
    m = s.get(Match, match_id)
    if not m:
        s.close(); return None
    for k,v in kwargs.items():
        if hasattr(m, k):
            setattr(m, k, v)
    s.add(m); s.commit(); s.refresh(m); s.close()
    return m

def delete_match(match_id):
    s = SessionLocal()
    m = s.get(Match, match_id)
    if not m:
        s.close(); return False
    s.delete(m); s.commit(); s.close()
    return True
