# api/routers/match_stats.py
from fastapi import APIRouter, HTTPException
from business.match_stats_service import MatchStatsService
from business.base_service import NotFoundError
from api.models import MatchStatCreate, MatchStatRead, MatchStatUpdate

router = APIRouter(prefix="/match_stats", tags=["match_stats"])
svc = MatchStatsService()

def _to_read(s):
    return MatchStatRead(
        id=s.id, match_id=s.match_id, team_id=s.team_id,
        gold_diff_15=s.gold_diff_15, kills=s.kills, deaths=s.deaths, assists=s.assists,
        towers_taken=s.towers_taken, dragons_taken=s.dragons_taken, barons_taken=s.barons_taken,
        first_blood=s.first_blood, win=s.win,
    )

@router.post("", response_model=MatchStatRead, status_code=201)
def create_match_stat(body: MatchStatCreate):
    try:
        s = svc.create_match_stat(body.model_dump())
        return _to_read(s)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/match/{match_id}", response_model=list[MatchStatRead])
def list_stats_for_match(match_id: int):
    try:
        rows = svc.list_stats_for_match(match_id)
        return [_to_read(s) for s in rows]
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{stat_id}", response_model=MatchStatRead)
def get_match_stat(stat_id: int):
    try:
        s = svc.get_match_stat(stat_id)
        return _to_read(s)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/{stat_id}", response_model=MatchStatRead)
def update_match_stat(stat_id: int, body: MatchStatUpdate):
    try:
        updates = body.model_dump(exclude_unset=True)
        s = svc.update_match_stat(stat_id, updates)
        return _to_read(s)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{stat_id}", status_code=204)
def delete_match_stat(stat_id: int):
    try:
        svc.delete_match_stat(stat_id)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
