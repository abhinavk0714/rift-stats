# business/team_roster_service.py
from datetime import datetime
from data import team_roster_dao, team_dao, player_dao
from business.base_service import NotFoundError

class TeamRosterService:
    def __init__(self):
        self._dao = team_roster_dao

    def add_roster_entry(self, data: dict):
        team_id = data.get("team_id")
        player_id = data.get("player_id")
        start_date = data.get("start_date")
        if team_id is None:
            raise ValueError("team_id is required")
        if player_id is None:
            raise ValueError("player_id is required")
        if start_date is None:
            raise ValueError("start_date is required")
        if team_dao.get_team(team_id) is None:
            raise NotFoundError(f"Team {team_id} not found")
        if player_dao.get_player(player_id) is None:
            raise NotFoundError(f"Player {player_id} not found")
        if isinstance(start_date, str):
            start_date = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
        return self._dao.add_roster_entry(
            team_id=int(team_id),
            player_id=int(player_id),
            start_date=start_date,
            end_date=data.get("end_date"),
            role_at_team=data.get("role_at_team"),
        )

    def get_roster_entry(self, entry_id: int):
        r = self._dao.get_roster_entry(entry_id)
        if r is None:
            raise NotFoundError(f"Roster entry {entry_id} not found")
        return r

    def list_roster_for_team(self, team_id: int):
        if team_dao.get_team(team_id) is None:
            raise NotFoundError(f"Team {team_id} not found")
        return self._dao.list_roster_for_team(team_id)

    def update_roster(self, entry_id: int, updates: dict):
        r = self._dao.get_roster_entry(entry_id)
        if r is None:
            raise NotFoundError(f"Roster entry {entry_id} not found")
        return self._dao.update_roster(entry_id, **{k: v for k, v in updates.items() if v is not None})

    def delete_roster(self, entry_id: int):
        r = self._dao.get_roster_entry(entry_id)
        if r is None:
            raise NotFoundError(f"Roster entry {entry_id} not found")
        return self._dao.delete_roster(entry_id)
