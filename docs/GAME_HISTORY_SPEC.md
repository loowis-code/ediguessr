# Game History & Stats - Detailed Specification

## Overview
Track player performance over time with personal statistics, game history, and geographical insights. Works with guest sessions (no login required).

---

## Features

### 1. Personal Dashboard
**Route**: `/stats` or `/profile`

#### Key Metrics (Hero Section)
```
┌─────────────────────────────────────────────────────────┐
│  YOUR STATS                                       │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   47    │  │  23,450 │  │   4.2   │             │
│  │  Games  │  │  Avg    │  │   km    │             │
│  │  Played │  │  Score  │  │   Avg   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   5     │  │  4,987  │  │   12    │             │
│  │  Wins   │  │  Best   │  │  Days   │             │
│  │  (11%)  │  │  Score  │  │  Active │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

**Metrics Explained**:
- **Games Played**: Total games completed (not abandoned)
- **Average Score**: Mean of final scores across all games
- **Average Distance**: Mean error distance per guess (shows accuracy)
- **Wins**: Games where you finished 1st place
- **Win Rate**: Percentage of games won
- **Best Score**: Personal record for single game
- **Days Active**: Unique days with at least 1 game played

---

### 2. Performance Over Time
**Chart showing score progression**

```
Score Trend (Last 30 Days)
┌─────────────────────────────────────────┐
│ 5000│                          ●    │
│     │                    ●   ●   ●  │
│ 4000│        ●     ●   ●   ●       ●│
│     │   ●  ●   ●     ●              │
│ 3000│ ●                             │
│     │                               │
│ 2000│──────────────────────────────────│
│     Jan 1      Jan 15      Jan 30   │
└─────────────────────────────────────────┘

📈 +450 points from last week
```

**Features**:
- Line chart of game scores over time
- Toggle: Last 7 days / 30 days / All time
- Trend indicator (improving/declining)
- Moving average line to smooth volatility

---

### 3. Edinburgh Geography Heatmap
**Visual showing which areas you're best/worst at**

```
NEIGHBORHOOD ACCURACY

Old Town           ████████░░ 84% (12 games)
New Town           ██████████ 92% (18 games)
Leith              ████░░░░░░ 45% (8 games)
Holyrood Park      ███████░░░ 73% (6 games)
Arthur's Seat      ██░░░░░░░░ 23% (3 games)
Stockbridge        ████████░░ 81% (7 games)
Portobello         ██████░░░░ 61% (4 games)

💡 You're strongest in New Town!
🎯 Practice more in Leith to improve
```

**How It Works**:
1. Each guess is tagged with neighborhood based on coordinates
2. Calculate average accuracy (5000 - avg error) per neighborhood
3. Show percentage bars and game counts
4. Highlight strengths and weaknesses

**Neighborhood Boundaries** (Edinburgh areas):
- Old Town (Royal Mile, Grassmarket)
- New Town (Princes Street, George Street)
- Leith (Shore, Ocean Terminal)
- Holyrood (Palace, Parliament)
- Arthur's Seat (Salisbury Crags)
- Stockbridge (Raeburn Place)
- Portobello (Beach)
- Bruntsfield/Morningside
- Dean Village
- Southside (Newington, Marchmont)

---

### 4. Recent Game History
**List of past games with key details**

```
RECENT GAMES

┌─────────────────────────────────────────────────────┐
│ Jan 30, 2026 • 3 players                       │
│ ⭐ 1st Place • 24,567 points                    │
│ 5 rounds • 2:00 per round                      │
│ [View Details]                                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Jan 29, 2026 • 2 players                       │
│ 🥈 2nd Place • 18,234 points                    │
│ 3 rounds • 2:00 per round                      │
│ [View Details]                                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Jan 29, 2026 • Solo practice                   │
│ 16,789 points                                  │
│ 5 rounds • No time limit                       │
│ [View Details]                                 │
└─────────────────────────────────────────────────────┘

[Load More...]
```

**Shows**:
- Date and time played
- Number of players
- Your placement (1st, 2nd, 3rd, etc.)
- Final score
- Game settings (rounds, time limit)
- Link to detailed breakdown

---

### 5. Detailed Game Breakdown
**Route**: `/game-history/[gameId]`

```
GAME DETAILS
Jan 30, 2026 • 3 players • You: 1st Place

FINAL SCORES
┌──────────────────────────────────────────┐
│ 🥇 YourNickname      24,567 points   │
│ 🥈 Player2           22,134 points   │
│ 🥉 Player3           19,876 points   │
└──────────────────────────────────────────┘

ROUND BY ROUND BREAKDOWN

Round 1 - Old Town (Royal Mile)
┌────────────────────────────────────────────┐
│ Your guess: 156m away • 4,678 points   │
│ Player2:    423m away • 4,123 points   │
│ Player3:    1.2km away • 2,456 points  │
│                                        │
│ [View on Map]                          │
└────────────────────────────────────────────┘

Round 2 - Leith (The Shore)
┌────────────────────────────────────────────┐
│ Your guess: 2.1km away • 1,834 points  │
│ Player2:    892m away • 3,234 points   │
│ Player3:    1.8km away • 2,103 points  │
│                                        │
│ [View on Map]                          │
└────────────────────────────────────────────┘

... (continues for all rounds)

PERFORMANCE SUMMARY
┌────────────────────────────────────────────┐
│ Average distance: 1.2 km               │
│ Best round:       Round 1 (4,678 pts)  │
│ Worst round:      Round 4 (986 pts)    │
│ Time efficiency:  Avg 45s per guess    │
└────────────────────────────────────────────┘

[Play Again with Same Settings]
```

**Features**:
- See all rounds with locations and scores
- Compare your guesses to other players
- Visual map showing each round's guesses
- Identify which rounds cost you the win
- "Play Again" creates new game with identical settings

---

### 6. Achievements & Milestones
**Gamification to encourage continued play**

```
ACHIEVEMENTS

✅ First Steps         Play your first game
✅ Getting Started     Play 10 games
✅ Regular Player      Play 25 games
⬜ Edinburgh Expert    Play 100 games
⬜ Century Club        Play 1000 games

✅ Perfect Guess       Get 5000 points in one round
✅ Eagle Eye           Average <500m distance in a game
⬜ Neighborhood King   Master all Edinburgh areas (80%+ accuracy)

✅ Speed Demon         Win a game with <30s avg per guess
⬜ Marathon Runner     Complete a 10-round game

✅ Social Butterfly    Play with 5+ different people
⬜ Party Host          Create 50 games

Progress: 8 / 24 achievements unlocked
```

**Achievement Types**:
- **Participation**: Games played milestones
- **Skill**: Perfect guesses, high accuracy
- **Speed**: Fast guesses while maintaining accuracy
- **Social**: Multiplayer engagement
- **Geography**: Neighborhood mastery
- **Variety**: Try different game modes

---

### 7. Comparison & Leaderboards
**See how you stack up (future feature)**

```
YOUR RANK

Today:          #47 of 234 players
This Week:      #89 of 1,203 players
All Time:       #2,456 of 12,034 players

Top Edinburgh Experts:
1. ProGuessr     158,234 avg
2. EdinburghBuff 156,789 avg
3. ScotlandPro   154,234 avg
...
47. YourNickname 23,450 avg
```

---

## Database Schema Changes

### New Table: `game_history`
```sql
CREATE TABLE game_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  game_id UUID REFERENCES games(id),
  player_id UUID REFERENCES players(id),
  final_score INTEGER NOT NULL,
  placement INTEGER, -- 1st, 2nd, 3rd place
  total_players INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, player_id)
);

CREATE INDEX idx_game_history_session ON game_history(session_id);
CREATE INDEX idx_game_history_completed ON game_history(completed_at);
```

### New Table: `player_stats`
```sql
CREATE TABLE player_stats (
  session_id VARCHAR(255) PRIMARY KEY,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  best_game_score INTEGER DEFAULT 0,
  total_distance_meters BIGINT DEFAULT 0,
  total_guesses INTEGER DEFAULT 0,
  first_game_at TIMESTAMP WITH TIME ZONE,
  last_game_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### New Table: `neighborhood_stats`
```sql
CREATE TABLE neighborhood_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  neighborhood VARCHAR(100) NOT NULL,
  guesses_count INTEGER DEFAULT 0,
  total_distance_meters BIGINT DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, neighborhood)
);

CREATE INDEX idx_neighborhood_stats_session ON neighborhood_stats(session_id);
```

### Update Existing: `guesses` table
```sql
-- Add neighborhood column to track where each guess was
ALTER TABLE guesses ADD COLUMN neighborhood VARCHAR(100);
```

---

## API Endpoints Needed

### GET `/api/stats/[sessionId]`
Returns aggregated player statistics
```json
{
  "gamesPlayed": 47,
  "gamesWon": 5,
  "winRate": 0.106,
  "avgScore": 23450,
  "bestScore": 24987,
  "avgDistance": 4234.5,
  "totalGuesses": 235,
  "daysActive": 12,
  "firstGameAt": "2026-01-15T10:00:00Z",
  "lastGameAt": "2026-01-30T15:30:00Z"
}
```

### GET `/api/game-history/[sessionId]?limit=20&offset=0`
Returns paginated list of past games
```json
{
  "games": [
    {
      "id": "uuid",
      "completedAt": "2026-01-30T15:30:00Z",
      "finalScore": 24567,
      "placement": 1,
      "totalPlayers": 3,
      "rounds": 5,
      "timeLimit": 120
    }
  ],
  "total": 47,
  "limit": 20,
  "offset": 0
}
```

### GET `/api/game-history/detail/[gameId]/[sessionId]`
Returns detailed breakdown of specific game
```json
{
  "game": {...},
  "yourScore": 24567,
  "placement": 1,
  "allPlayers": [...],
  "rounds": [
    {
      "roundNumber": 1,
      "location": {...},
      "neighborhood": "Old Town",
      "yourGuess": {
        "distance": 156,
        "points": 4678,
        "timeTaken": 45
      },
      "allGuesses": [...]
    }
  ]
}
```

### GET `/api/neighborhood-stats/[sessionId]`
Returns performance by Edinburgh neighborhood
```json
{
  "neighborhoods": [
    {
      "name": "Old Town",
      "guessCount": 12,
      "avgDistance": 342,
      "avgPoints": 4234,
      "accuracy": 0.84
    },
    {
      "name": "Leith",
      "guessCount": 8,
      "avgDistance": 1234,
      "avgPoints": 2567,
      "accuracy": 0.45
    }
  ]
}
```

### GET `/api/achievements/[sessionId]`
Returns unlocked achievements
```json
{
  "unlocked": [
    {
      "id": "first_steps",
      "name": "First Steps",
      "description": "Play your first game",
      "unlockedAt": "2026-01-15T10:00:00Z"
    }
  ],
  "progress": {
    "games_played": 47,
    "perfect_guesses": 3,
    "neighborhoods_mastered": 2
  }
}
```

---

## UI Components Needed

### `/components/StatsCard.tsx`
Reusable card for displaying individual stats with icon and value
```tsx
<StatsCard
  icon="🎮"
  value={47}
  label="Games Played"
  trend="+5 this week"
/>
```

### `/components/PerformanceChart.tsx`
Line chart showing score progression using Recharts or Chart.js
```tsx
<PerformanceChart
  data={scoreHistory}
  timeRange="30d"
/>
```

### `/components/NeighborhoodHeatmap.tsx`
Bar chart showing accuracy by neighborhood
```tsx
<NeighborhoodHeatmap
  neighborhoods={neighborhoodStats}
/>
```

### `/components/GameHistoryList.tsx`
Paginated list of past games
```tsx
<GameHistoryList
  games={gameHistory}
  onLoadMore={handleLoadMore}
/>
```

### `/components/AchievementBadge.tsx`
Badge display with locked/unlocked states
```tsx
<AchievementBadge
  achievement={achievement}
  locked={!unlocked}
/>
```

---

## Implementation Steps

### Phase 1: Data Collection (Week 1)
1. Add database tables (game_history, player_stats, neighborhood_stats)
2. Update RLS policies for new tables
3. Implement neighborhood detection algorithm
4. Update game completion flow to record history
5. Create background job to calculate stats

### Phase 2: Basic Stats Page (Week 1-2)
1. Create `/stats` page with hero metrics
2. Implement API endpoints for stats retrieval
3. Build StatsCard component
4. Add game history list
5. Style with neobrutalist design

### Phase 3: Advanced Features (Week 2)
1. Add performance chart (score over time)
2. Implement neighborhood heatmap
3. Create detailed game breakdown page
4. Add "Play Again" functionality

### Phase 4: Gamification (Week 2-3)
1. Define achievement criteria
2. Implement achievement tracking system
3. Build achievement UI components
4. Add unlocked notifications

---

## Neighborhood Detection Algorithm

```typescript
// lib/neighborhoods.ts
export const EDINBURGH_NEIGHBORHOODS = [
  {
    name: 'Old Town',
    bounds: {
      north: 55.9530,
      south: 55.9450,
      east: -3.1810,
      west: -3.2010
    }
  },
  {
    name: 'New Town',
    bounds: {
      north: 55.9600,
      south: 55.9510,
      east: -3.1870,
      west: -3.2050
    }
  },
  // ... more neighborhoods
];

export function detectNeighborhood(lat: number, lng: number): string {
  for (const neighborhood of EDINBURGH_NEIGHBORHOODS) {
    if (
      lat >= neighborhood.bounds.south &&
      lat <= neighborhood.bounds.north &&
      lng >= neighborhood.bounds.west &&
      lng <= neighborhood.bounds.east
    ) {
      return neighborhood.name;
    }
  }
  return 'Other';
}
```

---

## Privacy Considerations

Since this is guest-based:
- All stats are tied to browser session ID
- No personally identifiable information stored
- Stats clear if user clears cookies/localStorage
- Option to "Export Stats" as JSON for backup
- Option to "Clear All History" to delete everything

---

## Future Enhancements

1. **Compare with Friends**: If user accounts added later
2. **Weekly Reports**: "Your week in EdiGuessr" summary
3. **Predictions**: "You'll reach 100 games in 2 weeks at this rate"
4. **Challenges**: "Try to beat your Old Town record this week"
5. **Data Visualizations**: Heat maps on actual Edinburgh map showing guess patterns
6. **Export Options**: Download stats as PDF or CSV

---

## Testing Checklist

- [ ] Stats calculate correctly after game completion
- [ ] Neighborhood detection works for all Edinburgh areas
- [ ] Charts render properly with various data sizes
- [ ] Pagination works for game history
- [ ] Mobile responsive design
- [ ] Stats persist across sessions
- [ ] Handle edge cases (0 games, 1 game, 1000+ games)
- [ ] Performance with large datasets

---

## Cost Estimate

**Development Time**: 2-3 weeks
- Backend: 5-7 days (DB, APIs, stats calculation)
- Frontend: 5-7 days (UI components, pages, charts)
- Testing: 2-3 days

**Ongoing Costs**:
- Minimal increase in DB storage (a few MB per 1000 games)
- Stays within free tier for moderate usage

---

Let me know if you want to dive into any specific aspect or start implementing!
