# match_stats_dao.py
from db import SessionLocal
from models import MatchStat

def create_match_stat(match_id, team_id, gold_diff_15=None, kills=None, deaths=None, assists=None, towers_taken=None, dragons_taken=None, barons_taken=None, first_blood=None, win=False):
    s = SessionLocal()
    ms = MatchStat(match_id=match_id, team_id=team_id, gold_diff_15=gold_diff_15, kills=kills, deaths=deaths, assists=assists, towers_taken=towers_taken, dragons_taken=dragons_taken, barons_taken=barons_taken, first_blood=first_blood, win=win)
    s.add(ms); s.commit(); s.refresh(ms); s.close()
    return ms

def get_match_stat(stat_id):
    s = SessionLocal()
    ms = s.get(MatchStat, stat_id)
    s.close()
    return ms

def list_stats_for_match(match_id):
    s = SessionLocal()
    rows = s.query(MatchStat).filter(MatchStat.match_id == match_id).all()
    s.close()
    return rows

def update_match_stat(stat_id, **kwargs):
    s = SessionLocal()
    ms = s.get(MatchStat, stat_id)
    if not ms:
        s.close(); return None
    for k,v in kwargs.items():
        if hasattr(ms, k):
            setattr(ms, k, v)
    s.add(ms); s.commit(); s.refresh(ms); s.close()
    return ms

def delete_match_stat(stat_id):
    s = SessionLocal()
    ms = s.get(MatchStat, stat_id)
    if not ms:
        s.close(); return False
    s.delete(ms); s.commit(); s.close()
    return True
