# business/match_service.py
from datetime import datetime
from data import match_dao, team_dao
from business.base_service import NotFoundError

class MatchService:
    def __init__(self):
        self._dao = match_dao

    def create_match(self, data: dict):
        team_a_id = data.get("team_a_id")
        team_b_id = data.get("team_b_id")
        match_date = data.get("match_date")
        if team_a_id is None or team_b_id is None:
            raise ValueError("team_a_id and team_b_id are required")
        if int(team_a_id) == int(team_b_id):
            raise ValueError("team_a_id and team_b_id must be different")
        if match_date is None:
            raise ValueError("match_date is required")
        if team_dao.get_team(team_a_id) is None:
            raise NotFoundError(f"Team {team_a_id} not found")
        if team_dao.get_team(team_b_id) is None:
            raise NotFoundError(f"Team {team_b_id} not found")
        if isinstance(match_date, str):
            match_date = datetime.fromisoformat(match_date.replace("Z", "+00:00"))
        return self._dao.create_match(
            series_id=data.get("series_id"),
            region=data.get("region") or "LCK",
            season=data.get("season"),
            match_date=match_date,
            team_a_id=int(team_a_id),
            team_b_id=int(team_b_id),
            best_of=data.get("best_of", 1),
            game_number=data.get("game_number", 1),
            winner_team_id=data.get("winner_team_id"),
            patch=data.get("patch"),
            notes=data.get("notes"),
        )

    def get_match(self, match_id: int):
        m = self._dao.get_match(match_id)
        if m is None:
            raise NotFoundError(f"Match {match_id} not found")
        return m

    def list_matches(self, limit: int = 100):
        return self._dao.list_matches(limit=limit)

    def update_match(self, match_id: int, updates: dict):
        m = self._dao.get_match(match_id)
        if m is None:
            raise NotFoundError(f"Match {match_id} not found")
        return self._dao.update_match(match_id, **{k: v for k, v in updates.items() if v is not None})

    def delete_match(self, match_id: int):
        m = self._dao.get_match(match_id)
        if m is None:
            raise NotFoundError(f"Match {match_id} not found")
        return self._dao.delete_match(match_id)
