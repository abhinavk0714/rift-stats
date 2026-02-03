# models.py
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Player(Base):
    __tablename__ = 'players'
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    gamer_tag = Column(String(60), nullable=False, unique=True)
    nationality = Column(String(50))
    role = Column(String(20))   # TOP,JG,MID,ADC,SUP
    age = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Team(Base):
    __tablename__ = 'teams'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    short_name = Column(String(20))
    region = Column(String(50), nullable=False, default='LCK')
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class TeamRoster(Base):
    __tablename__ = 'team_roster'
    id = Column(Integer, primary_key=True)
    team_id = Column(Integer, ForeignKey('teams.id', ondelete='CASCADE'), nullable=False)
    player_id = Column(Integer, ForeignKey('players.id', ondelete='CASCADE'), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    role_at_team = Column(String(20))

class Match(Base):
    __tablename__ = 'matches'
    id = Column(Integer, primary_key=True)
    series_id = Column(Integer)
    region = Column(String(50), nullable=False, default='LCK')
    season = Column(String(50))
    match_date = Column(DateTime(timezone=True), nullable=False)
    team_a_id = Column(Integer, ForeignKey('teams.id', ondelete='RESTRICT'), nullable=False)
    team_b_id = Column(Integer, ForeignKey('teams.id', ondelete='RESTRICT'), nullable=False)
    best_of = Column(Integer, nullable=False, default=1)
    game_number = Column(Integer, nullable=False, default=1)
    winner_team_id = Column(Integer, ForeignKey('teams.id'), nullable=True)
    patch = Column(String(30))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MatchStat(Base):
    __tablename__ = 'match_stats'
    id = Column(Integer, primary_key=True)
    match_id = Column(Integer, ForeignKey('matches.id', ondelete='CASCADE'), nullable=False)
    team_id = Column(Integer, ForeignKey('teams.id', ondelete='CASCADE'), nullable=False)
    gold_diff_15 = Column(Integer)
    kills = Column(Integer)
    deaths = Column(Integer)
    assists = Column(Integer)
    towers_taken = Column(Integer)
    dragons_taken = Column(Integer)
    barons_taken = Column(Integer)
    first_blood = Column(Boolean)
    win = Column(Boolean, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
