# tests/test_team_service.py
import pytest
from business.team_service import TeamService
from business.base_service import NotFoundError

# These tests require a DB; use pytest with env or mock the DAO.
# Minimal smoke test that the service raises on invalid input.

def test_create_team_validation():
    svc = TeamService()
    with pytest.raises(ValueError, match="name is required"):
        svc.create_team({})
    with pytest.raises(ValueError, match="name is required"):
        svc.create_team({"name": "   "})
