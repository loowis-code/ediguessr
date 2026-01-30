# Phase 1: Game History & Stats Foundation - Action Plan

## Goal
Build the basic dashboard showing player statistics and game history list.

**Timeline**: 5-7 days
**Outcome**: Players can view their stats and past games

## Player Persistence Strategy
Using **localStorage with persistent player ID**:
- ✅ No login required (stays guest-friendly)
- ✅ Stats persist across browser sessions
- ✅ Simple to implement
- ⚠️ Stats lost if browser data cleared (we show warning)
- ⚠️ Different per browser/device (future: add accounts)
- 📥 Export/import feature as safety net

**Key Decision**: Each player gets a unique ID stored in localStorage (`player_TIMESTAMP_RANDOM`). This ID links all their games and stats. Later we can add optional accounts to sync across devices.

---

## Step 1: Database Schema (Day 1)

### 1.1 Create Migration File
**File**: `supabase/migrations/003_game_history.sql`

```sql
-- Game History: Record completed games per player
CREATE TABLE game_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id VARCHAR(255) NOT NULL, -- Persistent localStorage ID
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  db_player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE, -- DB player record
  final_score INTEGER NOT NULL,
  placement INTEGER, -- 1 = 1st place, 2 = 2nd, etc.
  total_players INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, db_player_id)
);

CREATE INDEX idx_game_history_player ON game_history(player_id);
CREATE INDEX idx_game_history_completed ON game_history(completed_at DESC);

-- Player Stats: Aggregated metrics per persistent player
CREATE TABLE player_stats (
  player_id VARCHAR(255) PRIMARY KEY, -- Persistent localStorage ID
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  best_game_score INTEGER DEFAULT 0,
  total_distance_meters BIGINT DEFAULT 0,
  total_guesses INTEGER DEFAULT 0,
  first_game_at TIMESTAMP WITH TIME ZONE,
  last_game_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to game_history"
ON game_history FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert to game_history"
ON game_history FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public read access to player_stats"
ON player_stats FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert to player_stats"
ON player_stats FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public update to player_stats"
ON player_stats FOR UPDATE TO public USING (true) WITH CHECK (true);
```

**Action**: Apply this migration in Supabase dashboard

---

## Step 2: Player Identity System (Day 1-2)

### 2.1 Create Player Identity Utility
**File**: `lib/player-identity.ts`

```typescript
'use client';

const STORAGE_KEY = 'ediguessr_player_id';

/**
 * Get or create persistent player ID stored in localStorage
 */
export function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined') return '';

  let playerId = localStorage.getItem(STORAGE_KEY);

  if (!playerId) {
    playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, playerId);
    localStorage.setItem(`${STORAGE_KEY}_created`, new Date().toISOString());
  }

  return playerId;
}

/**
 * Export stats for backup
 */
export function exportStats(): void {
  if (typeof window === 'undefined') return;

  const data = {
    playerId: localStorage.getItem(STORAGE_KEY),
    createdAt: localStorage.getItem(`${STORAGE_KEY}_created`),
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ediguessr-stats-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import stats from backup
 */
export function importStats(jsonData: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const data = JSON.parse(jsonData);
    if (data.playerId) {
      localStorage.setItem(STORAGE_KEY, data.playerId);
      if (data.createdAt) {
        localStorage.setItem(`${STORAGE_KEY}_created`, data.createdAt);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
```

### 2.2 Create Stats Helper Functions
**File**: `lib/db/stats.ts`

```typescript
import { supabase } from '@/lib/supabase';

/**
 * Record game completion in history and update player stats
 */
export async function recordGameCompletion(
  playerId: string, // From localStorage
  gameId: string,
  dbPlayerId: string, // Database player record ID
  finalScore: number,
  placement: number,
  totalPlayers: number
) {
  // Insert game history record
  const { error: historyError } = await supabase
    .from('game_history')
    .insert({
      player_id: playerId,
      game_id: gameId,
      db_player_id: dbPlayerId,
      final_score: finalScore,
      placement,
      total_players: totalPlayers
    });

  if (historyError) {
    console.error('Error recording game history:', historyError);
    return { error: historyError };
  }

  // Update player stats
  await updatePlayerStats(playerId, finalScore, placement === 1);

  return { success: true };
}

/**
 * Update aggregated player statistics
 */
async function updatePlayerStats(
  playerId: string,
  gameScore: number,
  isWin: boolean
) {
  // Fetch current stats
  const { data: existingStats } = await supabase
    .from('player_stats')
    .select('*')
    .eq('player_id', playerId)
    .single();

  const now = new Date().toISOString();

  if (!existingStats) {
    // Create new stats record
    await supabase.from('player_stats').insert({
      player_id: playerId,
      games_played: 1,
      games_won: isWin ? 1 : 0,
      total_score: gameScore,
      best_game_score: gameScore,
      first_game_at: now,
      last_game_at: now,
      updated_at: now
    });
  } else {
    // Update existing stats
    await supabase
      .from('player_stats')
      .update({
        games_played: existingStats.games_played + 1,
        games_won: existingStats.games_won + (isWin ? 1 : 0),
        total_score: existingStats.total_score + gameScore,
        best_game_score: Math.max(existingStats.best_game_score, gameScore),
        last_game_at: now,
        updated_at: now
      })
      .eq('player_id', playerId);
  }
}

/**
 * Calculate total distance for a game (sum all guesses)
 */
export async function calculateGameDistance(gameId: string, playerId: string) {
  const { data: guesses } = await supabase
    .from('guesses')
    .select('distance_meters')
    .eq('player_id', playerId)
    .in('round_id',
      supabase
        .from('rounds')
        .select('id')
        .eq('game_id', gameId)
    );

  if (!guesses) return 0;
  return guesses.reduce((sum, g) => sum + g.distance_meters, 0);
}
```

### 2.3 Create API Endpoint to Record Stats
**File**: `app/api/game-complete/route.ts`

New endpoint called from client when game ends:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { recordGameCompletion } from '@/lib/db/stats';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId, gameId, dbPlayerId, finalScore, placement, totalPlayers } = body;

    await recordGameCompletion(
      playerId,
      gameId,
      dbPlayerId,
      finalScore,
      placement,
      totalPlayers
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 2.4 Call from Client When Game Ends
**File**: `app/game/[inviteCode]/page.tsx`

```typescript
import { getOrCreatePlayerId } from '@/lib/player-identity';

// When game ends and redirects to results
const handleGameEnded = useCallback(async () => {
  // Record stats for this player
  const playerId = getOrCreatePlayerId();
  await fetch('/api/game-complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      playerId,
      gameId: game.id,
      dbPlayerId: currentPlayer.id,
      finalScore: calculateFinalScore(),
      placement: calculatePlacement(),
      totalPlayers: players.length
    })
  });

  router.push(`/results/${inviteCode}`);
}, [router, inviteCode]);
```

**Action**: Update game end flow to record stats from client side

---

## Step 3: Stats API Endpoints (Day 2-3)

### 3.1 Get Player Stats
**File**: `app/api/stats/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const playerId = searchParams.get('playerId');

  if (!playerId) {
    return NextResponse.json({ error: 'No player ID provided' }, { status: 400 });
  }

  // Get aggregated stats
  const { data: stats, error } = await supabase
    .from('player_stats')
    .select('*')
    .eq('player_id', playerId)
    .single();

  if (error || !stats) {
    return NextResponse.json({
      gamesPlayed: 0,
      gamesWon: 0,
      winRate: 0,
      avgScore: 0,
      bestScore: 0
    });
  }

  // Calculate derived metrics
  const avgScore = stats.games_played > 0
    ? Math.round(stats.total_score / stats.games_played)
    : 0;
  const winRate = stats.games_played > 0
    ? stats.games_won / stats.games_played
    : 0;

  return NextResponse.json({
    gamesPlayed: stats.games_played,
    gamesWon: stats.games_won,
    winRate,
    avgScore,
    bestScore: stats.best_game_score,
    firstGameAt: stats.first_game_at,
    lastGameAt: stats.last_game_at
  });
}
```

### 3.2 Get Game History
**File**: `app/api/game-history/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const playerId = searchParams.get('playerId');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  if (!playerId) {
    return NextResponse.json({ error: 'No player ID provided' }, { status: 400 });
  }

  // Get game history with game details
  const { data: history, error, count } = await supabase
    .from('game_history')
    .select(`
      *,
      games (
        id,
        settings,
        created_at
      )
    `, { count: 'exact' })
    .eq('player_id', playerId)
    .order('completed_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    games: history || [],
    total: count || 0,
    limit,
    offset
  });
}
```

---

## Step 4: Stats Page UI (Day 3-4)

### 4.1 Create Stats Page
**File**: `app/stats/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './stats.module.css';

interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  avgScore: number;
  bestScore: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const playerId = getOrCreatePlayerId();
        const response = await fetch(`/api/stats?playerId=${playerId}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>Loading stats...</div>
      </main>
    );
  }

  if (!stats || stats.gamesPlayed === 0) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Your Stats</h1>
          <p className={styles.noGames}>No games played yet!</p>
          <Link href="/create" className={styles.button}>
            Play Your First Game
          </Link>
        </div>
      </main>
    );
  }

  const handleExport = () => {
    exportStats();
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Your Stats</h1>

        <div className={styles.warning}>
          ⚠️ Stats are stored in your browser. Clearing browser data will reset your stats.
          <button onClick={handleExport} className={styles.exportButton}>
            📥 Export Backup
          </button>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.gamesPlayed}</div>
            <div className={styles.statLabel}>Games Played</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.avgScore.toLocaleString()}</div>
            <div className={styles.statLabel}>Avg Score</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.gamesWon}</div>
            <div className={styles.statLabel}>Wins</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statValue}>
              {(stats.winRate * 100).toFixed(0)}%
            </div>
            <div className={styles.statLabel}>Win Rate</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.bestScore.toLocaleString()}</div>
            <div className={styles.statLabel}>Best Score</div>
          </div>
        </div>

        <Link href="/stats/history" className={styles.button}>
          View Game History
        </Link>
      </div>
    </main>
  );
}
```

### 4.2 Create Neobrutalist Styles
**File**: `app/stats/stats.module.css`

```css
.main {
  min-height: 100vh;
  padding: 2rem;
  background: #fde047;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.title {
  font-size: 3rem;
  font-weight: 900;
  color: #000000;
  margin: 0 0 2rem;
  text-transform: uppercase;
  text-align: center;
}

.loading {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 900;
  color: #000000;
  text-transform: uppercase;
  padding: 4rem;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.statCard {
  background: #ffffff;
  border: 4px solid #000000;
  box-shadow: 6px 6px 0 #000000;
  padding: 2rem;
  text-align: center;
}

.statValue {
  font-size: 2.5rem;
  font-weight: 900;
  color: #ec4899;
  margin-bottom: 0.5rem;
}

.statLabel {
  font-size: 0.875rem;
  font-weight: 700;
  color: #000000;
  text-transform: uppercase;
}

.noGames {
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #000000;
  margin: 2rem 0;
}

.button {
  display: block;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 1.25rem;
  background: #22c55e;
  color: #000000;
  border: 4px solid #000000;
  box-shadow: 6px 6px 0 #000000;
  font-size: 1.125rem;
  font-weight: 900;
  text-transform: uppercase;
  text-align: center;
  text-decoration: none;
  transition: transform 0.1s;
}

.button:hover {
  transform: translate(-2px, -2px);
  box-shadow: 8px 8px 0 #000000;
}

.button:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #000000;
}

.warning {
  background: #fde047;
  border: 4px solid #000000;
  box-shadow: 4px 4px 0 #000000;
  padding: 1.25rem;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 700;
  color: #000000;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.exportButton {
  padding: 0.75rem 1.5rem;
  background: #ffffff;
  border: 4px solid #000000;
  box-shadow: 4px 4px 0 #000000;
  font-weight: 900;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.1s;
}

.exportButton:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #000000;
}

.exportButton:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #000000;
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }

  .statsGrid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .statCard {
    padding: 1.5rem;
  }

  .statValue {
    font-size: 2rem;
  }
}
```

---

## Step 5: Game History List (Day 4-5)

### 5.1 Create History Page
**File**: `app/stats/history/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './history.module.css';

interface GameHistory {
  id: string;
  completed_at: string;
  final_score: number;
  placement: number;
  total_players: number;
  games: {
    settings: {
      rounds: number;
      timeLimit: number;
    };
  };
}

export default function HistoryPage() {
  const [games, setGames] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async (offset = 0) => {
    try {
      const response = await fetch(`/api/game-history?limit=20&offset=${offset}`);
      if (response.ok) {
        const data = await response.json();
        setGames(prev => offset === 0 ? data.games : [...prev, ...data.games]);
        setHasMore(data.games.length === 20);
      }
    } catch (error) {
      console.error('Error fetching game history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlacementEmoji = (placement: number) => {
    if (placement === 1) return '🥇';
    if (placement === 2) return '🥈';
    if (placement === 3) return '🥉';
    return `#${placement}`;
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>Loading history...</div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/stats" className={styles.backButton}>
            ← Back to Stats
          </Link>
          <h1 className={styles.title}>Game History</h1>
        </div>

        {games.length === 0 ? (
          <p className={styles.noGames}>No games yet!</p>
        ) : (
          <>
            <div className={styles.gameList}>
              {games.map((game) => (
                <div key={game.id} className={styles.gameCard}>
                  <div className={styles.gameDate}>
                    {new Date(game.completed_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div className={styles.gameInfo}>
                    <div className={styles.placement}>
                      {getPlacementEmoji(game.placement)} {game.total_players} players
                    </div>
                    <div className={styles.score}>
                      {game.final_score.toLocaleString()} points
                    </div>
                  </div>
                  <div className={styles.gameDetails}>
                    {game.games.settings.rounds} rounds • {game.games.settings.timeLimit}s per round
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <button
                onClick={() => fetchGames(games.length)}
                className={styles.loadMore}
              >
                Load More
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
}
```

---

## Step 6: Testing (Day 5-6)

### Test Checklist
- [ ] Complete a game → stats record in database
- [ ] View /stats page → correct numbers display
- [ ] Win a game → win count increments
- [ ] Play multiple games → avg score calculates correctly
- [ ] View /stats/history → games list chronologically
- [ ] Load more games → pagination works
- [ ] Different browsers → each session has separate stats
- [ ] Mobile responsive → all pages work on small screens

---

## Step 7: Integration (Day 6-7)

### Add Stats Link to Navigation
Update homepage and game pages to include "View Stats" link

**File**: `app/page.tsx`
```typescript
<Link href="/stats" className={styles.statsLink}>
  📊 View Your Stats
</Link>
```

---

## Summary

**What We're Building**:
1. Database tables to track game history
2. Backend logic to record completions
3. API endpoints to retrieve stats
4. Stats dashboard page
5. Game history list page

**What's NOT in Phase 1** (save for later):
- Charts/graphs
- Neighborhood stats
- Achievements
- Detailed game breakdowns

Want to start implementing? I'd suggest:
1. Create and apply the database migration
2. Test it manually by inserting data
3. Build the stats recording logic
4. Then move to the UI

Ready to begin?
