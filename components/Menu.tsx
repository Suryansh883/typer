import React from 'react';
import { THEMES, Theme } from '../types';

interface MenuProps {
  onStart: (theme: Theme) => void;
  lastScore: number | null;
}

export const Menu: React.FC<MenuProps> = ({ onStart, lastScore }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-100 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-5">
         <div className="absolute top-10 left-10 text-9xl font-bold">T</div>
         <div className="absolute bottom-20 right-20 text-9xl font-bold">F</div>
      </div>

      <div className="z-10 max-w-md w-full text-center space-y-12">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold tracking-tighter mb-4">TypeFall</h1>
          <p className="text-zinc-500 text-sm uppercase tracking-widest">Minimalist Speed Typing</p>
        </div>

        {lastScore !== null && (
          <div className="text-xl text-zinc-300 font-mono border border-zinc-800 p-4 inline-block rounded">
            Last Score: <span className="text-emerald-400">{lastScore}</span>
          </div>
        )}

        <div className="space-y-6">
          <p className="text-zinc-400 text-sm">Select a Theme</p>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onStart(theme)}
                className="group relative px-6 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 transition-all duration-300 rounded text-left overflow-hidden"
              >
                <span className="relative z-10 text-zinc-300 group-hover:text-white font-mono text-sm tracking-wide">
                  {theme.label}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
            ))}
          </div>
        </div>

        <div className="pt-8 text-xs text-zinc-600 font-mono">
          Powered by Gemini 2.5 Flash
        </div>
      </div>
    </div>
  );
};