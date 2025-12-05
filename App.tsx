import React, { useState } from 'react';
import { Menu } from './components/Menu';
import { GameEngine } from './components/GameEngine';
import { Theme } from './types';

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [lastScore, setLastScore] = useState<number | null>(null);

  const handleStart = (theme: Theme) => {
    setCurrentTheme(theme);
    setIsPlaying(true);
  };

  const handleGameOver = (score: number) => {
    setIsPlaying(false);
    setLastScore(score);
    setCurrentTheme(null);
  };

  const handleBack = () => {
    setIsPlaying(false);
    setCurrentTheme(null);
  };

  return (
    <div className="antialiased text-zinc-100 bg-zinc-950 min-h-screen">
      {isPlaying && currentTheme ? (
        <GameEngine 
          themePrompt={currentTheme.prompt} 
          onGameOver={handleGameOver}
          onBack={handleBack}
        />
      ) : (
        <Menu onStart={handleStart} lastScore={lastScore} />
      )}
    </div>
  );
};

export default App;