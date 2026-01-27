# EdiGuessr

A real-time multiplayer GeoGuessr clone focused on Edinburgh, Scotland.

## Features

- 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Edinburgh-focused street view exploration
- 👥 Real-time multiplayer via Pusher
- 🎮 Guest sessions (no login required)
- 🔗 Invite link system
- ⚙️ Customizable game settings (rounds, time limits, movement controls)
- 🏆 Live scoring and leaderboards
- 📱 Mobile responsive

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript + CSS Modules
- **Map Provider**: Mapillary API (free street imagery)
- **Map Display**: Leaflet.js
- **Real-time**: Pusher
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier)
- Pusher account (free tier)
- Mapillary API token (free)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in your credentials:

```bash
cp .env.local.example .env.local
```

3. Set up your Supabase database by running the migration in `supabase/migrations/001_initial_schema.sql`

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ediguessr/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Home page
│   ├── create/            # Game creation
│   ├── lobby/             # Waiting room
│   ├── game/              # Active gameplay
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Core libraries
│   ├── db/               # Database operations
│   ├── supabase.ts       # Supabase client
│   ├── pusher.ts         # Pusher client
│   ├── mapillary.ts      # Mapillary API
│   └── constants.ts      # Edinburgh bounds, etc.
├── types/                # TypeScript definitions
└── supabase/migrations/  # Database schema

```

## How to Play

1. Click "Create Game" on the home page
2. Configure game settings (rounds, time limit, controls)
3. Share the invite link with friends
4. Wait in the lobby for players to join
5. Host starts the game
6. Guess the location on the map for each round
7. Winner has the highest total score!

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment

Deploy to Vercel:

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Cost

All services used are free tier:
- Vercel: Free hobby tier
- Supabase: 500MB database, unlimited API requests
- Pusher: 100 concurrent connections, 200k messages/day
- Mapillary: Unlimited API usage

**Total: $0/month** for moderate traffic

## Future Enhancements

- Expand to other cities (Glasgow, London, etc.)
- User accounts and persistent stats
- Custom location collections
- Team mode
- Daily challenges
- Mobile PWA

## License

MIT

---

Built with ❤️ for Edinburgh
