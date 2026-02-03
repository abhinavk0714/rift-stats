# player_dao.py
from db import SessionLocal
from models import Player
from sqlalchemy.exc import IntegrityError

def create_player(name, gamer_tag, nationality=None, role=None, age=None):
    s = SessionLocal()
    try:
        p = Player(name=name, gamer_tag=gamer_tag, nationality=nationality, role=role, age=age)
        s.add(p); s.commit(); s.refresh(p)
        return p
    except IntegrityError:
        s.rollback()
        raise
    finally:
        s.close()

def get_player(player_id):
    s = SessionLocal()
    p = s.get(Player, player_id)
    s.close()
    return p

def list_players(limit=200):
    s = SessionLocal()
    rows = s.query(Player).order_by(Player.id).limit(limit).all()
    s.close()
    return rows

def update_player(player_id, **kwargs):
    s = SessionLocal()
    p = s.get(Player, player_id)
    if not p:
        s.close(); return None
    for k,v in kwargs.items():
        if hasattr(p, k):
            setattr(p, k, v)
    s.add(p); s.commit(); s.refresh(p)
    s.close()
    return p

def delete_player(player_id):
    s = SessionLocal()
    p = s.get(Player, player_id)
    if not p:
        s.close(); return False
    s.delete(p); s.commit(); s.close()
    return True
