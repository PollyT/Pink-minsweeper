export enum CellStatus {
  HIDDEN,
  REVEALED,
  FLAGGED,
}

export interface CellData {
  id: string; // unique coordinate string "x-y"
  x: number;
  y: number;
  isMine: boolean;
  status: CellStatus;
  neighborMines: number;
}

export enum GameStatus {
  IDLE, // Before first click
  PLAYING,
  WON,
  LOST,
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export interface GameConfig {
  rows: number;
  cols: number;
  mines: number;
}

export interface TarotCard {
  id: number;
  name: string;
  seed: number; // for picsum
  keywords: string[];
  unlocked: boolean;
  reading?: string; // AI Generated reading
}

export interface SoundConfig {
  volume: number;
  enabled: boolean;
}