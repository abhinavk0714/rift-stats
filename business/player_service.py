# business/player_service.py
from data import player_dao
from business.base_service import NotFoundError

VALID_ROLES = {"TOP", "JG", "MID", "ADC", "SUP"}

class PlayerService:
    def __init__(self):
        self._dao = player_dao

    def create_player(self, data: dict):
        name = data.get("name")
        gamer_tag = data.get("gamer_tag")
        if not name or not str(name).strip():
            raise ValueError("Player name is required")
        if not gamer_tag or not str(gamer_tag).strip():
            raise ValueError("Gamer tag is required")
        role = data.get("role")
        if role is not None and role not in VALID_ROLES:
            raise ValueError(f"Role must be one of {VALID_ROLES}")
        return self._dao.create_player(
            name=str(name).strip(),
            gamer_tag=str(gamer_tag).strip(),
            nationality=data.get("nationality"),
            role=role,
            age=data.get("age"),
        )

    def get_player(self, player_id: int):
        p = self._dao.get_player(player_id)
        if p is None:
            raise NotFoundError(f"Player {player_id} not found")
        return p

    def list_players(self, limit: int = 200):
        return self._dao.list_players(limit=limit)

    def update_player(self, player_id: int, updates: dict):
        p = self._dao.get_player(player_id)
        if p is None:
            raise NotFoundError(f"Player {player_id} not found")
        if updates.get("name") is not None and not str(updates["name"]).strip():
            raise ValueError("Player name cannot be empty")
        if updates.get("gamer_tag") is not None and not str(updates["gamer_tag"]).strip():
            raise ValueError("Gamer tag cannot be empty")
        role = updates.get("role")
        if role is not None and role not in VALID_ROLES:
            raise ValueError(f"Role must be one of {VALID_ROLES}")
        return self._dao.update_player(player_id, **{k: v for k, v in updates.items() if v is not None})

    def delete_player(self, player_id: int):
        p = self._dao.get_player(player_id)
        if p is None:
            raise NotFoundError(f"Player {player_id} not found")
        return self._dao.delete_player(player_id)
