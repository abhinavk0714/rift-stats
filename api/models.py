# api/models.py — Pydantic request/response models
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

# --- Team ---
class TeamCreate(BaseModel):
    name: str
    short_name: Optional[str] = None
    region: Optional[str] = "LCK"

class TeamRead(BaseModel):
    id: int
    name: str
    short_name: Optional[str] = None
    region: str

    class Config:
        from_attributes = True

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    short_name: Optional[str] = None
    region: Optional[str] = None

# --- Player ---
class PlayerCreate(BaseModel):
    name: str
    gamer_tag: str
    nationality: Optional[str] = None
    role: Optional[str] = None
    age: Optional[int] = None

class PlayerRead(BaseModel):
    id: int
    name: str
    gamer_tag: str
    nationality: Optional[str] = None
    role: Optional[str] = None
    age: Optional[int] = None

    class Config:
        from_attributes = True

class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    gamer_tag: Optional[str] = None
    nationality: Optional[str] = None
    role: Optional[str] = None
    age: Optional[int] = None

# --- Team Roster ---
class TeamRosterCreate(BaseModel):
    team_id: int
    player_id: int
    start_date: datetime
    end_date: Optional[datetime] = None
    role_at_team: Optional[str] = None

class TeamRosterRead(BaseModel):
    id: int
    team_id: int
    player_id: int
    start_date: datetime
    end_date: Optional[datetime] = None
    role_at_team: Optional[str] = None

    class Config:
        from_attributes = True

class TeamRosterUpdate(BaseModel):
    end_date: Optional[datetime] = None
    role_at_team: Optional[str] = None

# --- Match ---
class MatchCreate(BaseModel):
    team_a_id: int
    team_b_id: int
    match_date: datetime
    series_id: Optional[int] = None
    region: Optional[str] = "LCK"
    season: Optional[str] = None
    best_of: Optional[int] = 1
    game_number: Optional[int] = 1
    winner_team_id: Optional[int] = None
    patch: Optional[str] = None
    notes: Optional[str] = None

class MatchRead(BaseModel):
    id: int
    series_id: Optional[int] = None
    region: str
    season: Optional[str] = None
    match_date: datetime
    team_a_id: int
    team_b_id: int
    best_of: int
    game_number: int
    winner_team_id: Optional[int] = None
    patch: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class MatchUpdate(BaseModel):
    region: Optional[str] = None
    season: Optional[str] = None
    match_date: Optional[datetime] = None
    best_of: Optional[int] = None
    game_number: Optional[int] = None
    winner_team_id: Optional[int] = None
    patch: Optional[str] = None
    notes: Optional[str] = None

# --- Match Stat ---
class MatchStatCreate(BaseModel):
    match_id: int
    team_id: int
    gold_diff_15: Optional[int] = None
    kills: Optional[int] = None
    deaths: Optional[int] = None
    assists: Optional[int] = None
    towers_taken: Optional[int] = None
    dragons_taken: Optional[int] = None
    barons_taken: Optional[int] = None
    first_blood: Optional[bool] = None
    win: bool = False

class MatchStatRead(BaseModel):
    id: int
    match_id: int
    team_id: int
    gold_diff_15: Optional[int] = None
    kills: Optional[int] = None
    deaths: Optional[int] = None
    assists: Optional[int] = None
    towers_taken: Optional[int] = None
    dragons_taken: Optional[int] = None
    barons_taken: Optional[int] = None
    first_blood: Optional[bool] = None
    win: bool

    class Config:
        from_attributes = True

class MatchStatUpdate(BaseModel):
    gold_diff_15: Optional[int] = None
    kills: Optional[int] = None
    deaths: Optional[int] = None
    assists: Optional[int] = None
    towers_taken: Optional[int] = None
    dragons_taken: Optional[int] = None
    barons_taken: Optional[int] = None
    first_blood: Optional[bool] = None
    win: Optional[bool] = None
