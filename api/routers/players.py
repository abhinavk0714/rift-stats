# api/routers/players.py
from fastapi import APIRouter, HTTPException
from business.player_service import PlayerService
from business.base_service import NotFoundError
from api.models import PlayerCreate, PlayerRead, PlayerUpdate

router = APIRouter(prefix="/players", tags=["players"])
svc = PlayerService()

def _to_read(p):
    return PlayerRead(id=p.id, name=p.name, gamer_tag=p.gamer_tag, nationality=p.nationality, role=p.role, age=p.age)

@router.post("", response_model=PlayerRead, status_code=201)
def create_player(body: PlayerCreate):
    try:
        p = svc.create_player(body.model_dump())
        return _to_read(p)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{player_id}", response_model=PlayerRead)
def get_player(player_id: int):
    try:
        p = svc.get_player(player_id)
        return _to_read(p)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("", response_model=list[PlayerRead])
def list_players(limit: int = 200):
    players = svc.list_players(limit=limit)
    return [_to_read(p) for p in players]

@router.put("/{player_id}", response_model=PlayerRead)
def update_player(player_id: int, body: PlayerUpdate):
    try:
        updates = body.model_dump(exclude_unset=True)
        p = svc.update_player(player_id, updates)
        return _to_read(p)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{player_id}", status_code=204)
def delete_player(player_id: int):
    try:
        svc.delete_player(player_id)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
