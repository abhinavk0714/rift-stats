-- Seed data for rift-stats (50+ rows). Run table_creation.sql first.
-- Order: players → teams → team_roster → matches → match_stats

-- 1) Players (12 rows)
INSERT INTO players (id, name, gamer_tag, nationality, role, age) VALUES
(1, 'Kim Min-seok', 'Faker', 'KR', 'MID', 28),
(2, 'Park Jae-hyuk', 'Keria', 'KR', 'SUP', 22),
(3, 'Lee Min-hyung', 'Gumayusi', 'KR', 'ADC', 23),
(4, 'Choi Woo-je', 'Zeus', 'KR', 'TOP', 21),
(5, 'Moon O-jin', 'Oner', 'KR', 'JG', 22),
(6, 'Yoon Sung-young', 'Chovy', 'KR', 'MID', 24),
(7, 'Park Jin-young', 'Viper', 'KR', 'ADC', 24),
(8, 'Hwang Seong-hoon', 'Kingen', 'KR', 'TOP', 25),
(9, 'Kim Geon-bu', 'Canyon', 'KR', 'JG', 23),
(10, 'Ryu Min-seok', 'Kellin', 'KR', 'SUP', 23),
(11, 'Zhang Wei', 'Knight', 'CN', 'MID', 24),
(12, 'Tian Yi', 'Tian', 'CN', 'JG', 24)
ON CONFLICT (id) DO NOTHING;

-- 2) Teams (4 rows)
INSERT INTO teams (id, name, short_name, region) VALUES
(1, 'T1', 'T1', 'LCK'),
(2, 'Gen.G', 'GEN', 'LCK'),
(3, 'Hanwha Life Esports', 'HLE', 'LCK'),
(4, 'Dplus KIA', 'DK', 'LCK')
ON CONFLICT (id) DO NOTHING;

-- 3) Team roster (12 rows)
INSERT INTO team_roster (id, team_id, player_id, start_date, end_date, role_at_team) VALUES
(1, 1, 1, '2023-01-01', NULL, 'MID'),
(2, 1, 2, '2023-01-01', NULL, 'SUP'),
(3, 1, 3, '2023-01-01', NULL, 'ADC'),
(4, 1, 4, '2023-01-01', NULL, 'TOP'),
(5, 1, 5, '2023-01-01', NULL, 'JG'),
(6, 2, 6, '2024-01-01', NULL, 'MID'),
(7, 2, 7, '2024-01-01', NULL, 'ADC'),
(8, 2, 8, '2024-01-01', NULL, 'TOP'),
(9, 2, 9, '2024-01-01', NULL, 'JG'),
(10, 2, 10, '2024-01-01', NULL, 'SUP'),
(11, 3, 11, '2024-01-01', NULL, 'MID'),
(12, 4, 12, '2024-01-01', NULL, 'JG')
ON CONFLICT (id) DO NOTHING;


-- 4) Matches (15 rows) — team_a_id, team_b_id must differ; winner_team_id optional
INSERT INTO matches (id, series_id, region, season, match_date, team_a_id, team_b_id, best_of, game_number, winner_team_id, patch, notes) VALUES
(1, 1, 'LCK', '2025 Spring', '2025-01-15 14:00:00+00', 1, 2, 3, 1, 1, '14.1', 'Opening week'),
(2, 1, 'LCK', '2025 Spring', '2025-01-15 15:30:00+00', 1, 2, 3, 2, 2, '14.1', NULL),
(3, 1, 'LCK', '2025 Spring', '2025-01-15 17:00:00+00', 1, 2, 3, 3, 1, '14.1', NULL),
(4, 2, 'LCK', '2025 Spring', '2025-01-16 14:00:00+00', 3, 4, 3, 1, 3, '14.1', NULL),
(5, 2, 'LCK', '2025 Spring', '2025-01-16 15:30:00+00', 3, 4, 3, 2, 4, '14.1', NULL),
(6, 2, 'LCK', '2025 Spring', '2025-01-16 17:00:00+00', 3, 4, 3, 3, 3, '14.1', NULL),
(7, 3, 'LCK', '2025 Spring', '2025-01-22 14:00:00+00', 1, 3, 3, 1, 1, '14.2', NULL),
(8, 3, 'LCK', '2025 Spring', '2025-01-22 15:30:00+00', 1, 3, 3, 2, 1, '14.2', NULL),
(9, 4, 'LCK', '2025 Spring', '2025-01-23 14:00:00+00', 2, 4, 3, 1, 2, '14.2', NULL),
(10, 4, 'LCK', '2025 Spring', '2025-01-23 15:30:00+00', 2, 4, 3, 2, 4, '14.2', NULL),
(11, 4, 'LCK', '2025 Spring', '2025-01-23 17:00:00+00', 2, 4, 3, 3, 2, '14.2', NULL),
(12, 5, 'LCK', '2025 Spring', '2025-01-29 14:00:00+00', 1, 4, 3, 1, 1, '14.2', NULL),
(13, 5, 'LCK', '2025 Spring', '2025-01-29 15:30:00+00', 1, 4, 3, 2, 1, '14.2', NULL),
(14, 6, 'LCK', '2025 Spring', '2025-01-30 14:00:00+00', 2, 3, 3, 1, 2, '14.2', NULL),
(15, 6, 'LCK', '2025 Spring', '2025-01-30 15:30:00+00', 2, 3, 3, 2, 3, '14.2', NULL);

-- 5) Match stats (30 rows — two per match, one per team)
INSERT INTO match_stats (id, match_id, team_id, gold_diff_15, kills, deaths, assists, towers_taken, dragons_taken, barons_taken, first_blood, win) VALUES
(1, 1, 1, 1200, 18, 5, 42, 11, 3, 1, true, true),
(2, 1, 2, -1200, 5, 18, 12, 2, 0, 0, false, false),
(3, 2, 1, -500, 8, 12, 22, 4, 1, 0, false, false),
(4, 2, 2, 500, 12, 8, 28, 9, 2, 1, true, true),
(5, 3, 1, 800, 14, 7, 35, 8, 2, 1, true, true),
(6, 3, 2, -800, 7, 14, 18, 3, 1, 0, false, false),
(7, 4, 3, 600, 13, 9, 32, 7, 2, 1, true, true),
(8, 4, 4, -600, 9, 13, 21, 4, 1, 0, false, false),
(9, 5, 3, -400, 10, 11, 25, 5, 1, 0, false, false),
(10, 5, 4, 400, 11, 10, 28, 8, 2, 1, true, true),
(11, 6, 3, 1100, 16, 6, 38, 10, 3, 1, true, true),
(12, 6, 4, -1100, 6, 16, 14, 2, 0, 0, false, false),
(13, 7, 1, 900, 15, 8, 40, 9, 2, 1, true, true),
(14, 7, 3, -900, 8, 15, 19, 3, 1, 0, false, false),
(15, 8, 1, 700, 14, 9, 36, 8, 2, 1, true, true),
(16, 8, 3, -700, 9, 14, 22, 4, 1, 0, false, false),
(17, 9, 2, 500, 12, 10, 30, 7, 2, 1, true, true),
(18, 9, 4, -500, 10, 12, 24, 5, 1, 0, false, false),
(19, 10, 2, -300, 9, 11, 23, 4, 1, 0, false, false),
(20, 10, 4, 300, 11, 9, 26, 8, 2, 1, true, true),
(21, 11, 2, 1000, 17, 7, 41, 10, 3, 1, true, true),
(22, 11, 4, -1000, 7, 17, 16, 2, 0, 0, false, false),
(23, 12, 1, 1300, 19, 5, 44, 11, 3, 1, true, true),
(24, 12, 4, -1300, 5, 19, 11, 2, 0, 0, false, false),
(25, 13, 1, 600, 13, 9, 33, 8, 2, 1, true, true),
(26, 13, 4, -600, 9, 13, 20, 4, 1, 0, false, false),
(27, 14, 2, -200, 10, 11, 24, 5, 1, 0, false, false),
(28, 14, 3, 200, 11, 10, 27, 7, 2, 1, true, true),
(29, 15, 2, -600, 8, 13, 19, 3, 0, 0, false, false),
(30, 15, 3, 600, 13, 8, 31, 9, 2, 1, true, true);

-- Reset sequences so future inserts get correct IDs (optional but recommended)
SELECT setval(pg_get_serial_sequence('players', 'id'), (SELECT COALESCE(MAX(id), 1) FROM players));
SELECT setval(pg_get_serial_sequence('teams', 'id'), (SELECT COALESCE(MAX(id), 1) FROM teams));
SELECT setval(pg_get_serial_sequence('team_roster', 'id'), (SELECT COALESCE(MAX(id), 1) FROM team_roster));
SELECT setval(pg_get_serial_sequence('matches', 'id'), (SELECT COALESCE(MAX(id), 1) FROM matches));
SELECT setval(pg_get_serial_sequence('match_stats', 'id'), (SELECT COALESCE(MAX(id), 1) FROM match_stats));
