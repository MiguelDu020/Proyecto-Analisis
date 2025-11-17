/**
 * Tipos y modelos del juego Policías y Ladrón
 */

export type Position = {
  row: number;
  col: number;
};

export type PieceType = 'thief' | 'police';

export type GamePiece = {
  id: string;
  type: PieceType;
  position: Position;
};

export type BoardSize = 8 | 16;

export type ThiefMode = 'manual' | 'random';

export type GameState = 'playing' | 'thief-won' | 'police-won' | 'paused' | 'not-started';

export type Move = {
  pieceId: string;
  from: Position;
  to: Position;
  turn: number;
};

export type GameConfig = {
  boardSize: BoardSize;
  policeCount: number;
  thiefCount: number;
  thiefMode: ThiefMode;
  showAnimations: boolean;
  cellSize: 'small' | 'medium' | 'large';
  colorScheme: 'default' | 'dark' | 'colorful';
};

export type GameResult = {
  winner: 'thief' | 'police';
  message: string;
  isManual: boolean;
};

export type GameStatus = {
  state: GameState;
  turn: number;
  currentPlayer: 'thief' | 'police';
  moves: Move[];
  result?: GameResult;
};

