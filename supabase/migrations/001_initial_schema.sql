-- EdiGuessr Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Game status enum
CREATE TYPE game_status AS ENUM ('waiting', 'active', 'finished');

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invite_code VARCHAR(6) UNIQUE NOT NULL,
  creator_session_id VARCHAR(255) NOT NULL,
  status game_status NOT NULL DEFAULT 'waiting',
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Index for fast invite code lookups
CREATE INDEX idx_games_invite_code ON games(invite_code);
CREATE INDEX idx_games_status ON games(status);

-- Rounds table
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  location JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, round_number)
);

CREATE INDEX idx_rounds_game_id ON rounds(game_id);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, session_id)
);

CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_players_session_id ON players(session_id);

-- Guesses table
CREATE TABLE guesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  guess_lat DOUBLE PRECISION NOT NULL,
  guess_lng DOUBLE PRECISION NOT NULL,
  distance_meters DOUBLE PRECISION NOT NULL,
  points INTEGER NOT NULL,
  time_taken_seconds INTEGER NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(round_id, player_id)
);

CREATE INDEX idx_guesses_round_id ON guesses(round_id);
CREATE INDEX idx_guesses_player_id ON guesses(player_id);

-- Comments
COMMENT ON TABLE games IS 'Stores game sessions with settings';
COMMENT ON TABLE rounds IS 'Stores individual rounds within a game';
COMMENT ON TABLE players IS 'Stores players (guest sessions) in each game';
COMMENT ON TABLE guesses IS 'Stores player guesses for each round';
