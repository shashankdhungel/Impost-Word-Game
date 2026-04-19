export type GameState = "LOBBY" | "ROLES" | "CLUES" | "VOTING" | "RESULT";

export interface Player {
  id: string;
  nickname: string;
  isHost: boolean;
  role?: "PLAYER" | "IMPOSTER";
  clue?: string;
  votedFor?: string;
  score: number;
}

export interface Room {
  code: string;
  players: Player[];
  state: GameState;
  category?: string;
  word?: string;
  imposterId?: string;
  currentTurnIndex: number;
  winner?: "PLAYERS" | "IMPOSTER";
  imposterGuess?: string;
  caught?: boolean;
}
