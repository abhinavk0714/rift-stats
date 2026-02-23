# api/routers/team_roster.py
from fastapi import APIRouter, HTTPException
from business.team_roster_service import TeamRosterService
from business.base_service import NotFoundError
from api.models import TeamRosterCreate, TeamRosterRead, TeamRosterUpdate

router = APIRouter(prefix="/roster", tags=["roster"])
svc = TeamRosterService()

def _to_read(r):
    return TeamRosterRead(
        id=r.id, team_id=r.team_id, player_id=r.player_id,
        start_date=r.start_date, end_date=r.end_date, role_at_team=r.role_at_team,
    )

@router.post("", response_model=TeamRosterRead, status_code=201)
def add_roster_entry(body: TeamRosterCreate):
    try:
        r = svc.add_roster_entry(body.model_dump())
        return _to_read(r)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/team/{team_id}", response_model=list[TeamRosterRead])
def list_roster_for_team(team_id: int):
    try:
        rows = svc.list_roster_for_team(team_id)
        return [_to_read(r) for r in rows]
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{entry_id}", response_model=TeamRosterRead)
def get_roster_entry(entry_id: int):
    try:
        r = svc.get_roster_entry(entry_id)
        return _to_read(r)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/{entry_id}", response_model=TeamRosterRead)
def update_roster(entry_id: int, body: TeamRosterUpdate):
    try:
        updates = body.model_dump(exclude_unset=True)
        r = svc.update_roster(entry_id, updates)
        return _to_read(r)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{entry_id}", status_code=204)
def delete_roster(entry_id: int):
    try:
        svc.delete_roster(entry_id)
    except NotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
