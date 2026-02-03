# team_dao.py
from db import SessionLocal
from models import Team
from sqlalchemy.exc import IntegrityError

def create_team(name, short_name=None, region='LCK'):
    s = SessionLocal()
    try:
        t = Team(name=name, short_name=short_name, region=region)
        s.add(t); s.commit(); s.refresh(t)
        return t
    except IntegrityError:
        s.rollback()
        raise
    finally:
        s.close()

def get_team(team_id):
    s = SessionLocal()
    t = s.get(Team, team_id)
    s.close()
    return t

def list_teams(limit=100):
    s = SessionLocal()
    rows = s.query(Team).order_by(Team.id).limit(limit).all()
    s.close()
    return rows

def update_team(team_id, **kwargs):
    s = SessionLocal()
    t = s.get(Team, team_id)
    if not t:
        s.close(); return None
    for k,v in kwargs.items():
        if hasattr(t, k):
            setattr(t, k, v)
    s.add(t); s.commit(); s.refresh(t)
    s.close()
    return t

def delete_team(team_id):
    s = SessionLocal()
    t = s.get(Team, team_id)
    if not t:
        s.close(); return False
    s.delete(t); s.commit(); s.close()
    return True
