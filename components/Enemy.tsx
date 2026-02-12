
import React from 'react';
import { Enemy } from '../types';
import { Sword, Shield, Target, FlaskConical, Droplet } from 'lucide-react';

interface EnemyProps {
  enemy: Enemy;
  animationState?: 'idle' | 'attack' | 'hit';
  isTargetable?: boolean;
  onClick?: () => void;
  taunt?: string | null;
}

export const EnemyComponent: React.FC<EnemyProps> = ({ enemy, animationState = 'idle', isTargetable = false, onClick, taunt }) => {
  // Calculate HP Percentage
  const hpPercent = Math.max(0, (enemy.currentHp / enemy.maxHp) * 100);
  const isAttacking = enemy.intent.type === 'attack' || enemy.intent.type === 'poison' || enemy.intent.type === 'drain';
  const hasBlock = enemy.block > 0;

  let animationClass = "transition-transform duration-500 transform";
  
  if (animationState === 'attack') {
      animationClass += " animate-lunge-left"; 
  } else if (animationState === 'hit') {
      animationClass += " animate-shake";
  } else if (isTargetable) {
      animationClass += " scale-105 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] cursor-pointer hover:scale-110";
  }

  // Add pulsating red glow if attacking and not currently mid-animation
  if (isAttacking && animationState === 'idle') {
      animationClass += " animate-danger-pulse";
  }

  return (
    <div 
        className={`flex flex-col items-center relative animate-fade-in group mx-0.5 md:mx-2 ${isTargetable ? 'z-20' : ''}`}
        onClick={() => isTargetable && onClick && onClick()}
    >
      {/* Taunt Speech Bubble */}
      {taunt && (
          <div className="absolute -top-20 md:-top-28 left-1/2 -translate-x-1/2 w-40 md:w-48 z-50 animate-bounce-slow pointer-events-none">
              <div className="bg-white text-slate-900 p-2 md:p-3 rounded-2xl shadow-2xl border-2 border-slate-800 relative">
                  <p className="text-[10px] md:text-sm font-bold text-center leading-tight uppercase italic">
                      {taunt}
                  </p>
                  {/* Tail */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 md:w-4 md:h-4 bg-white border-r-2 border-b-2 border-slate-800 rotate-45"></div>
              </div>
          </div>
      )}

      {/* Target Reticle on Hover/Targetable */}
      {isTargetable && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
              <Target className="w-12 h-12 md:w-20 md:h-20 text-red-500 animate-ping" />
          </div>
      )}

      {/* Intent Bubble */}
      <div className="absolute -top-6 md:-top-10 bg-white text-slate-900 px-1.5 py-0.5 md:px-3 md:py-1 rounded-full shadow-lg border-2 border-slate-300 flex items-center gap-1 md:gap-2 font-bold animate-bounce-slow z-20 scale-75 md:scale-90 lg:scale-100">
        {enemy.intent.type === 'attack' && <><Sword size={14} className="text-red-600"/> <span className="text-sm md:text-lg">{enemy.intent.value}</span></>}
        {enemy.intent.type === 'poison' && <><FlaskConical size={14} className="text-green-600"/> <span className="text-sm md:text-lg">{enemy.intent.value}</span></>}
        {enemy.intent.type === 'drain' && <><Droplet size={14} className="text-purple-600"/> <span className="text-sm md:text-lg">{enemy.intent.value}</span></>}
        {enemy.intent.type === 'defend' && <><Shield size={14} className="text-blue-600"/> <span className="text-sm md:text-lg">{enemy.intent.value}</span></>}
      </div>

      {/* Enemy Image with animation class - Responsive Sizing */}
      {/* Reduced sizes: w-20 h-20 (80px) base, w-28 h-28 (112px) md */}
      <div className={`w-20 h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 mb-2 md:mb-3 relative ${animationClass}`}>
          {/* Energy Shield Visual Effect */}
          {hasBlock && (
            <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute inset-0 scale-125 rounded-full border-4 border-blue-400/50 bg-blue-500/10 animate-pulse mix-blend-screen shadow-[0_0_20px_rgba(96,165,250,0.4)]"></div>
                <div className="absolute inset-0 scale-110 rounded-full border-2 border-blue-300/30 animate-spin-slow"></div>
            </div>
          )}

          <img 
            src={enemy.image} 
            alt={enemy.name} 
            className="w-full h-full object-contain drop-shadow-2xl relative z-0" 
          />

          {/* Health Bar & Block Counter */}
          <div className="absolute -bottom-3 left-0 w-full z-20">
            {/* Block Counter (mirrors player) */}
            {hasBlock && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-1.5 py-0.5 rounded-full shadow-lg border-2 border-blue-400 flex items-center gap-1 font-bold animate-bounce-slow text-[10px]">
                    <Shield size={10} className="fill-white" />
                    <span>{enemy.block}</span>
                </div>
            )}
            
            <div className="flex justify-between text-[10px] font-bold text-white mb-0.5 px-1 shadow-black drop-shadow-md">
                <span>{enemy.currentHp}</span>
                <span>{enemy.maxHp}</span>
            </div>
            <div className="h-1.5 md:h-2.5 bg-gray-900 rounded-full border border-gray-600 overflow-hidden relative">
                <div 
                    className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500 ease-out"
                    style={{ width: `${hpPercent}%` }}
                />
            </div>
          </div>
      </div>
      
      <h2 className="text-xs md:text-base font-serif text-red-200 mt-2 tracking-wide drop-shadow-lg text-center max-w-[100px] md:max-w-none leading-tight">{enemy.name}</h2>
    </div>
  );
};
