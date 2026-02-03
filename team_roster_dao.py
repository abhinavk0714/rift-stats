# team_roster_dao.py
from db import SessionLocal
from models import TeamRoster

def add_roster_entry(team_id, player_id, start_date, end_date=None, role_at_team=None):
    s = SessionLocal()
    rr = TeamRoster(team_id=team_id, player_id=player_id, start_date=start_date, end_date=end_date, role_at_team=role_at_team)
    s.add(rr); s.commit(); s.refresh(rr); s.close()
    return rr

def get_roster_entry(entry_id):
    s = SessionLocal()
    r = s.get(TeamRoster, entry_id)
    s.close()
    return r

def list_roster_for_team(team_id):
    s = SessionLocal()
    rows = s.query(TeamRoster).filter(TeamRoster.team_id == team_id).order_by(TeamRoster.start_date.desc()).all()
    s.close()
    return rows

def update_roster(entry_id, **kwargs):
    s = SessionLocal()
    r = s.get(TeamRoster, entry_id)
    if not r:
        s.close(); return None
    for k,v in kwargs.items():
        if hasattr(r, k):
            setattr(r, k, v)
    s.add(r); s.commit(); s.refresh(r); s.close()
    return r

def delete_roster(entry_id):
    s = SessionLocal()
    r = s.get(TeamRoster, entry_id)
    if not r:
        s.close(); return False
    s.delete(r); s.commit(); s.close()
    return True
