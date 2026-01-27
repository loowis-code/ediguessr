import { render, screen } from '@testing-library/react'
import ScoreDisplay from '@/components/ScoreDisplay'
import type { Player, Guess } from '@/types/game'

describe('ScoreDisplay Component', () => {
  const mockPlayers: Player[] = [
    {
      id: '1',
      game_id: 'game-1',
      session_id: 'session-1',
      nickname: 'Alice',
      joined_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      game_id: 'game-1',
      session_id: 'session-2',
      nickname: 'Bob',
      joined_at: '2024-01-01T00:00:01Z'
    }
  ]

  const mockGuesses: Guess[] = [
    {
      id: 'guess-1',
      round_id: 'round-1',
      player_id: '1',
      guess_lat: 55.95,
      guess_lng: -3.18,
      distance_meters: 500,
      points: 4938,
      time_taken_seconds: 45,
      submitted_at: '2024-01-01T00:00:45Z'
    },
    {
      id: 'guess-2',
      round_id: 'round-1',
      player_id: '2',
      guess_lat: 55.96,
      guess_lng: -3.19,
      distance_meters: 1200,
      points: 4800,
      time_taken_seconds: 60,
      submitted_at: '2024-01-01T00:01:00Z'
    }
  ]

  it('should render player scores in descending order', () => {
    render(<ScoreDisplay players={mockPlayers} guesses={mockGuesses} />)

    const names = screen.getAllByText(/Alice|Bob/)
    expect(names[0]).toHaveTextContent('Alice')
    expect(names[1]).toHaveTextContent('Bob')
  })

  it('should display total points for each player', () => {
    render(<ScoreDisplay players={mockPlayers} guesses={mockGuesses} />)

    expect(screen.getByText('4,938')).toBeInTheDocument()
    expect(screen.getByText('4,800')).toBeInTheDocument()
  })

  it('should show rank badges for players', () => {
    render(<ScoreDisplay players={mockPlayers} guesses={mockGuesses} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should handle players with no guesses', () => {
    render(<ScoreDisplay players={mockPlayers} guesses={[]} />)

    // Players should still be rendered even with 0 points
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('should display title correctly', () => {
    render(<ScoreDisplay players={mockPlayers} guesses={mockGuesses} />)

    expect(screen.getByText('Scores')).toBeInTheDocument()
  })
})
