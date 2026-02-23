# business/team_service.py
from data import team_dao
from business.base_service import NotFoundError

class TeamService:
    def __init__(self):
        self._dao = team_dao

    def create_team(self, data: dict):
        name = data.get("name")
        if not name or not str(name).strip():
            raise ValueError("Team name is required")
        return self._dao.create_team(
            name=str(name).strip(),
            short_name=data.get("short_name"),
            region=data.get("region") or "LCK",
        )

    def get_team(self, team_id: int):
        t = self._dao.get_team(team_id)
        if t is None:
            raise NotFoundError(f"Team {team_id} not found")
        return t

    def list_teams(self, limit: int = 100):
        return self._dao.list_teams(limit=limit)

    def update_team(self, team_id: int, updates: dict):
        t = self._dao.get_team(team_id)
        if t is None:
            raise NotFoundError(f"Team {team_id} not found")
        if updates.get("name") is not None and not str(updates["name"]).strip():
            raise ValueError("Team name cannot be empty")
        return self._dao.update_team(team_id, **{k: v for k, v in updates.items() if v is not None})

    def delete_team(self, team_id: int):
        t = self._dao.get_team(team_id)
        if t is None:
            raise NotFoundError(f"Team {team_id} not found")
        return self._dao.delete_team(team_id)
