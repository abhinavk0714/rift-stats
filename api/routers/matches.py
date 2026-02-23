# api/routers/matches.py
from fastapi import APIRouter, HTTPException
from business.match_service import MatchService
from business.base_service import NotFoundError
from api.models import MatchCreate, MatchRead, MatchUpdate

router = APIRouter(prefix="/matches", tags=["matches"])
svc = MatchService()

def _to_read(m):
    return MatchRead(
        id=m.id, series_id=m.series_id, region=m.region, season=m.season,
        match_date=m.match_date, team_a_id=m.team_a_id, team_b_id=m.team_b_id,
        best_of=m.best_of, game_number=m.game_number, winner_team_id=m.winner_team_id,
        patch=m.patch, notes=m.notes,
    )

@router.post("", response_model=MatchRead, status_code=201)
def create_match(body: MatchCreate):
    try:
        m = svc.create_match(body.model_dump())
        return _to_read(m)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{match_id}", response_model=MatchRead)
def get_match(match_id: int):
    try:
        m = svc.get_match(match_id)
        return _to_read(m)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("", response_model=list[MatchRead])
def list_matches(limit: int = 100):
    matches = svc.list_matches(limit=limit)
    return [_to_read(m) for m in matches]

@router.put("/{match_id}", response_model=MatchRead)
def update_match(match_id: int, body: MatchUpdate):
    try:
        updates = body.model_dump(exclude_unset=True)
        m = svc.update_match(match_id, updates)
        return _to_read(m)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{match_id}", status_code=204)
def delete_match(match_id: int):
    try:
        svc.delete_match(match_id)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
