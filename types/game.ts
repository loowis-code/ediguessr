export interface Game {
  id: string;
  invite_code: string;
  creator_session_id: string;
  status: 'waiting' | 'active' | 'finished';
  settings: GameSettings;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
}

export interface GameSettings {
  rounds: number;
  timeLimit: number;
  moveAllowed: boolean;
  panAllowed: boolean;
  zoomAllowed: boolean;
}

export interface Round {
  id: string;
  game_id: string;
  round_number: number;
  location: Location;
  created_at: string;
}

export interface Location {
  lat: number;
  lng: number;
  mapillary_image_id: string;
  image_url?: string; // Optional fallback for direct image display
}

export interface Player {
  id: string;
  game_id: string;
  session_id: string;
  nickname: string;
  joined_at: string;
}

export interface Guess {
  id: string;
  round_id: string;
  player_id: string;
  guess_lat: number;
  guess_lng: number;
  distance_meters: number;
  points: number;
  time_taken_seconds: number;
  submitted_at: string;
}

export interface GameState {
  game: Game;
  players: Player[];
  rounds: Round[];
  guesses: Guess[];
}
