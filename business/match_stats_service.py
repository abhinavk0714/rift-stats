# business/match_stats_service.py
from data import match_stats_dao, match_dao, team_dao
from business.base_service import NotFoundError

class MatchStatsService:
    def __init__(self):
        self._dao = match_stats_dao

    def create_match_stat(self, data: dict):
        match_id = data.get("match_id")
        team_id = data.get("team_id")
        if match_id is None or team_id is None:
            raise ValueError("match_id and team_id are required")
        if match_dao.get_match(match_id) is None:
            raise NotFoundError(f"Match {match_id} not found")
        if team_dao.get_team(team_id) is None:
            raise NotFoundError(f"Team {team_id} not found")
        return self._dao.create_match_stat(
            match_id=int(match_id),
            team_id=int(team_id),
            gold_diff_15=data.get("gold_diff_15"),
            kills=data.get("kills"),
            deaths=data.get("deaths"),
            assists=data.get("assists"),
            towers_taken=data.get("towers_taken"),
            dragons_taken=data.get("dragons_taken"),
            barons_taken=data.get("barons_taken"),
            first_blood=data.get("first_blood"),
            win=data.get("win", False),
        )

    def get_match_stat(self, stat_id: int):
        s = self._dao.get_match_stat(stat_id)
        if s is None:
            raise NotFoundError(f"Match stat {stat_id} not found")
        return s

    def list_stats_for_match(self, match_id: int):
        if match_dao.get_match(match_id) is None:
            raise NotFoundError(f"Match {match_id} not found")
        return self._dao.list_stats_for_match(match_id)

    def update_match_stat(self, stat_id: int, updates: dict):
        s = self._dao.get_match_stat(stat_id)
        if s is None:
            raise NotFoundError(f"Match stat {stat_id} not found")
        return self._dao.update_match_stat(stat_id, **{k: v for k, v in updates.items() if v is not None})

    def delete_match_stat(self, stat_id: int):
        s = self._dao.get_match_stat(stat_id)
        if s is None:
            raise NotFoundError(f"Match stat {stat_id} not found")
        return self._dao.delete_match_stat(stat_id)
