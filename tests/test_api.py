# tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_root():
    r = client.get("/")
    assert r.status_code == 200
    assert "Rift Stats" in r.json().get("message", "")

def test_teams_list():
    r = client.get("/teams")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_teams_get_not_found():
    r = client.get("/teams/999999")
    assert r.status_code == 404

def test_matches_list():
    r = client.get("/matches")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_roster_get_not_found():
    r = client.get("/roster/999999")
    assert r.status_code == 404

def test_match_stats_get_not_found():
    r = client.get("/match_stats/999999")
    assert r.status_code == 404
