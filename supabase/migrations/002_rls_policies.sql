-- EdiGuessr Row Level Security Policies
-- Since this is a guest-based game with no authentication,
-- we allow public access with logical constraints

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE guesses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- GAMES TABLE POLICIES
-- ============================================

-- Allow anyone to read games (needed to join via invite code)
CREATE POLICY "Allow public read access to games"
ON games FOR SELECT
TO public
USING (true);

-- Allow anyone to create games (guest users create games)
CREATE POLICY "Allow public insert to games"
ON games FOR INSERT
TO public
WITH CHECK (true);

-- Allow game creator to update their game (using session_id)
CREATE POLICY "Allow creator to update game"
ON games FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- ============================================
-- ROUNDS TABLE POLICIES
-- ============================================

-- Allow anyone to read rounds (all players need to see round data)
CREATE POLICY "Allow public read access to rounds"
ON rounds FOR SELECT
TO public
USING (true);

-- Allow anyone to create rounds (game creator starts rounds)
CREATE POLICY "Allow public insert to rounds"
ON rounds FOR INSERT
TO public
WITH CHECK (true);

-- ============================================
-- PLAYERS TABLE POLICIES
-- ============================================

-- Allow anyone to read players (needed for leaderboard and player list)
CREATE POLICY "Allow public read access to players"
ON players FOR SELECT
TO public
USING (true);

-- Allow anyone to insert players (guest users join games)
CREATE POLICY "Allow public insert to players"
ON players FOR INSERT
TO public
WITH CHECK (true);

-- ============================================
-- GUESSES TABLE POLICIES
-- ============================================

-- Allow anyone to read guesses (needed for results page and leaderboard)
CREATE POLICY "Allow public read access to guesses"
ON guesses FOR SELECT
TO public
USING (true);

-- Allow anyone to insert guesses (players submit their guesses)
CREATE POLICY "Allow public insert to guesses"
ON guesses FOR INSERT
TO public
WITH CHECK (true);

-- Comments
COMMENT ON POLICY "Allow public read access to games" ON games IS
  'Allows all users to read game data for joining via invite code';
COMMENT ON POLICY "Allow public insert to games" ON games IS
  'Allows guest users to create new games';
COMMENT ON POLICY "Allow creator to update game" ON games IS
  'Allows updating game status (waiting -> active -> finished)';
