# api/routers/teams.py
from fastapi import APIRouter, HTTPException
from business.team_service import TeamService
from business.base_service import NotFoundError
from api.models import TeamCreate, TeamRead, TeamUpdate

router = APIRouter(prefix="/teams", tags=["teams"])
svc = TeamService()

def _to_read(t):
    return TeamRead(id=t.id, name=t.name, short_name=t.short_name, region=t.region)

@router.post("", response_model=TeamRead, status_code=201)
def create_team(body: TeamCreate):
    try:
        t = svc.create_team(body.model_dump())
        return _to_read(t)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{team_id}", response_model=TeamRead)
def get_team(team_id: int):
    try:
        t = svc.get_team(team_id)
        return _to_read(t)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("", response_model=list[TeamRead])
def list_teams(limit: int = 100):
    teams = svc.list_teams(limit=limit)
    return [_to_read(t) for t in teams]

@router.put("/{team_id}", response_model=TeamRead)
def update_team(team_id: int, body: TeamUpdate):
    try:
        updates = body.model_dump(exclude_unset=True)
        t = svc.update_team(team_id, updates)
        return _to_read(t)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{team_id}", status_code=204)
def delete_team(team_id: int):
    try:
        svc.delete_team(team_id)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
