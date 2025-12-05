import React, { useEffect, useRef, useState } from 'react';
import { Word, GameStatus } from '../types';
import { generateWords } from '../services/wordService';

interface GameEngineProps {
  themePrompt: string;
  onGameOver: (score: number) => void;
  onBack: () => void;
}

export const GameEngine: React.FC<GameEngineProps> = ({ themePrompt, onGameOver, onBack }) => {
  // State for rendering
  const [words, setWords] = useState<Word[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [status, setStatus] = useState<GameStatus>(GameStatus.LOADING);
  
  // Refs for game loop logic (mutable state to avoid closure staleness)
  const wordsRef = useRef<Word[]>([]);
  const frameRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);
  const spawnRateRef = useRef<number>(2000); 
  const fallSpeedMultiplierRef = useRef<number>(1);
  const scoreRef = useRef(0);
  const livesRef = useRef(5);
  const isGameOverRef = useRef(false);
  
  // Initialize Game
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const generatedList = await generateWords(themePrompt);
        if (!mounted) return;
        
        wordsRef.current = [];
        startLoop(generatedList);
      } catch (e) {
        console.error(e);
        onBack();
      }
    };

    init();
    return () => { 
        mounted = false; 
        cancelAnimationFrame(frameRef.current); 
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themePrompt]);

  const startLoop = (wordList: string[]) => {
    setStatus(GameStatus.PLAYING);
    let lastTime = performance.now();
    const availableWords = [...wordList];

    const loop = (time: number) => {
      if (isGameOverRef.current) return;

      const delta = time - lastTime;
      lastTime = time;

      // 1. Spawning Logic
      if (time - lastSpawnTimeRef.current > spawnRateRef.current) {
        const text = availableWords[Math.floor(Math.random() * availableWords.length)];
        const newWord: Word = {
          id: Math.random().toString(36).substr(2, 9),
          text: text,
          x: Math.random() * 80 + 10, 
          y: -10, 
          speed: (Math.random() * 0.05 + 0.02), // Base speed
          typedIndex: 0,
          isLocked: false,
        };
        
        const tooClose = wordsRef.current.some(w => Math.abs(w.x - newWord.x) < 15 && w.y < 20);
        if (!tooClose) {
          wordsRef.current.push(newWord);
          lastSpawnTimeRef.current = time;
        }
      }

      // 2. Update Positions
      let hitBottom = false;
      wordsRef.current = wordsRef.current.filter(word => {
        // Dynamic speed based on score multiplier
        word.y += word.speed * fallSpeedMultiplierRef.current * (delta / 16); 

        if (word.y > 100) {
          hitBottom = true;
          return false;
        }
        return true;
      });

      if (hitBottom) {
        livesRef.current -= 1;
        setLives(livesRef.current);
        if (livesRef.current <= 0) {
            isGameOverRef.current = true;
            setStatus(GameStatus.GAME_OVER);
            onGameOver(scoreRef.current);
            return;
        }
      }

      setWords([...wordsRef.current]);
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
  };

  // Keyboard Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING || isGameOverRef.current) return;

      const key = e.key.toLowerCase();
      if (!/^[a-z]$/.test(key)) return;

      const currentWords = wordsRef.current;
      const lockedWordIndex = currentWords.findIndex(w => w.isLocked);

      if (lockedWordIndex !== -1) {
        const word = currentWords[lockedWordIndex];
        const nextChar = word.text[word.typedIndex];

        if (key === nextChar) {
          word.typedIndex++;
          if (word.typedIndex === word.text.length) {
            // Word Complete
            scoreRef.current += word.text.length * 10;
            
            // === DIFFICULTY INCREMENT ===
            fallSpeedMultiplierRef.current = Math.min(6, fallSpeedMultiplierRef.current + 0.05);
            spawnRateRef.current = Math.max(300, spawnRateRef.current - 25);

            setScore(scoreRef.current);
            wordsRef.current.splice(lockedWordIndex, 1);
            setWords([...wordsRef.current]);
          } else {
             setWords([...wordsRef.current]);
          }
        }
      } else {
        const candidates = currentWords
          .map((w, i) => ({ ...w, originalIndex: i }))
          .filter(w => w.text[0] === key)
          .sort((a, b) => b.y - a.y);

        if (candidates.length > 0) {
          const target = candidates[0];
          wordsRef.current[target.originalIndex].isLocked = true;
          wordsRef.current[target.originalIndex].typedIndex = 1;
          
          if (target.text.length === 1) {
             scoreRef.current += 10;
             setScore(scoreRef.current);
             wordsRef.current.splice(target.originalIndex, 1);
          }
          setWords([...wordsRef.current]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]); 

  if (status === GameStatus.LOADING) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-zinc-400">
        <div className="animate-pulse font-mono text-xl">GENERATING WORDS...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-zinc-950 overflow-hidden cursor-default select-none">
      {/* HUD */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 pointer-events-none">
        <div className="flex flex-col">
           <span className="text-xs text-zinc-500 uppercase tracking-widest">Score</span>
           <span className="text-4xl font-mono font-bold text-white">{score}</span>
        </div>
        
        <div className="flex flex-col items-end">
           <span className="text-xs text-zinc-500 uppercase tracking-widest">Lives</span>
           <div className="flex space-x-1 mt-1">
             {Array.from({ length: 5 }).map((_, i) => (
               <div 
                 key={i} 
                 className={`h-2 w-8 rounded-full transition-colors duration-300 ${
                   i < lives ? 'bg-emerald-500' : 'bg-zinc-800'
                 }`}
               />
             ))}
           </div>
        </div>
      </div>

      <button 
        onClick={onBack}
        className="absolute bottom-6 right-6 text-zinc-600 hover:text-zinc-300 transition-colors z-20 pointer-events-auto font-mono text-xs uppercase"
      >
        Abort
      </button>

      {/* Game Area */}
      {words.map((word) => (
        <div
          key={word.id}
          className={`absolute transform -translate-x-1/2 transition-colors duration-100 font-mono text-xl md:text-2xl font-bold tracking-tight whitespace-nowrap
            ${word.isLocked ? 'text-white z-10 scale-110' : 'text-zinc-600'}
          `}
          style={{ 
            left: `${word.x}%`, 
            top: `${word.y}%`,
            textShadow: word.isLocked ? '0 0 20px rgba(255,255,255,0.3)' : 'none'
          }}
        >
          <span className="text-emerald-400">{word.text.substring(0, word.typedIndex)}</span>
          <span className={word.isLocked ? 'text-white' : 'text-zinc-500'}>
            {word.text.substring(word.typedIndex)}
          </span>
          {word.isLocked && (
            <span className="inline-block w-2 h-5 bg-emerald-400 ml-1 align-middle custom-cursor" />
          )}
        </div>
      ))}
      
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-red-900/20 to-transparent pointer-events-none" />
    </div>
  );
};