export enum GameStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
}

export interface Word {
  id: string;
  text: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  speed: number;
  typedIndex: number; // How many characters have been correctly typed
  isLocked: boolean; // If the user is currently typing this word
}

export interface Theme {
  id: string;
  label: string;
  prompt: string;
}

export const THEMES: Theme[] = [
  { id: 'code', label: 'Code', prompt: 'programming, web development, syntax, tech terms' },
  { id: 'space', label: 'Cosmos', prompt: 'astronomy, planets, space travel, universe' },
  { id: 'nature', label: 'Nature', prompt: 'forests, oceans, animals, weather' },
  { id: 'minimal', label: 'Abstract', prompt: 'abstract concepts, philosophy, emotions' },
  { id: 'cyber', label: 'Cyberpunk', prompt: 'neon, futuristic, hacking, dystopia' },
];
