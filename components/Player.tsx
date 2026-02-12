
import React from 'react';
import { Player } from '../types';
import { Shield, Heart, FlaskConical } from 'lucide-react';

interface PlayerProps {
  player: Player;
  isBlocking?: boolean;
}

export const PlayerComponent: React.FC<PlayerProps> = ({ player, isBlocking = false }) => {
  const hpPercent = Math.max(0, (player.currentHp / player.maxHp) * 100);

  return (
    <div className="flex flex-col items-center relative group">
       
       {/* Visual Block Effect Overlay */}
       {isBlocking && (
          <div className="absolute top-0 w-28 h-28 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full border-4 border-blue-400 bg-blue-500/20 animate-block-flash z-20 pointer-events-none mix-blend-screen"></div>
       )}

       {/* Block Icon floating above */}
       {player.block > 0 && (
          <div className="absolute -top-6 md:-top-10 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-lg border-2 border-blue-400 flex items-center gap-1 font-bold z-10 animate-bounce-slow text-xs">
            <Shield size={12} className="fill-white md:w-3 md:h-3" />
            <span>{player.block}</span>
          </div>
       )}

       {/* Poison Icon */}
       {player.poison > 0 && (
          <div className="absolute -top-6 md:-top-10 right-0 bg-green-900 text-green-300 px-2 py-0.5 rounded-full shadow-lg border-2 border-green-500 flex items-center gap-1 font-bold z-10 animate-pulse text-xs">
            <FlaskConical size={12} className="md:w-3 md:h-3" />
            <span>{player.poison}</span>
          </div>
       )}

      {/* Character Image - Custom SVG Student Sprite - Responsive Size */}
      {/* Reduced sizes: w-28 h-28 (112px) on base, w-40 h-40 (160px) on md */}
      <div className="w-28 h-28 md:w-40 md:h-40 lg:w-48 lg:h-48 mb-2 relative filter drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
         <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full transform scale-x-[-1]">
            {/* Hoodie Body */}
            <path d="M60 140 Q60 180 140 180 Q140 140 140 140 L130 90 L70 90 Z" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="3" />
            <path d="M70 90 L50 130" stroke="#1e3a8a" strokeWidth="3" fill="none" />
            <path d="M130 90 L150 130" stroke="#1e3a8a" strokeWidth="3" fill="none" />
            
            {/* Backpack Straps */}
            <path d="M75 90 L75 140" stroke="#1f2937" strokeWidth="4" />
            <path d="M125 90 L125 140" stroke="#1f2937" strokeWidth="4" />

            {/* Head */}
            <circle cx="100" cy="70" r="35" fill="#fca5a5" stroke="#7f1d1d" strokeWidth="3" />
            
            {/* Glasses */}
            <circle cx="90" cy="70" r="8" fill="#e0f2fe" stroke="black" strokeWidth="2" />
            <circle cx="110" cy="70" r="8" fill="#e0f2fe" stroke="black" strokeWidth="2" />
            <line x1="98" y1="70" x2="102" y2="70" stroke="black" strokeWidth="2" />

            {/* Hair */}
            <path d="M65 70 Q70 30 100 30 Q130 30 135 70" fill="#4b5563" stroke="black" strokeWidth="2" />

            {/* Giant Pencil Staff */}
            <rect x="140" y="40" width="15" height="120" fill="#facc15" stroke="#854d0e" strokeWidth="2" transform="rotate(15 140 100)" />
            <polygon points="135,35 155,35 145,15" fill="#fbcfe8" stroke="#be185d" strokeWidth="2" transform="rotate(15 140 100)" /> {/* Eraser */}
            <polygon points="140,160 155,160 147.5,180" fill="#fcd34d" stroke="#854d0e" strokeWidth="2" transform="rotate(15 140 100)" /> {/* Tip Wood */}
            <polygon points="144,175 151,175 147.5,180" fill="black" transform="rotate(15 140 100)" /> {/* Lead */}
         </svg>
          
          {/* Floor Shadow */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-14 md:w-20 h-2 bg-black/40 rounded-[100%] blur-sm"></div>
      </div>

      {/* HP Bar */}
      <div className="w-full max-w-[90px] md:max-w-[120px] relative -mt-3 z-10">
          <div className="flex justify-between text-[10px] font-bold text-white mb-0.5 px-1 shadow-black drop-shadow-md">
             <span className="flex items-center gap-1 text-red-300"><Heart size={10} className="text-red-500 fill-red-500"/> {player.currentHp}/{player.maxHp}</span>
          </div>
          <div className="h-1.5 md:h-2.5 bg-gray-900 rounded-full border border-gray-600 overflow-hidden relative shadow-inner">
            <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500 ease-out"
                style={{ width: `${hpPercent}%` }}
            />
          </div>
      </div>
    </div>
  );
};
