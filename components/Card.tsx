

import React from 'react';
import { Card as CardType } from '../types';
import { Sword, Shield, Zap, Sparkles, Minus, X, Divide, CircleSlash } from 'lucide-react';

interface CardProps {
  card: CardType;
  onClick: (card: CardType) => void;
  disabled: boolean;
  playable: boolean;
  noAnim?: boolean;
}

export const CardComponent: React.FC<CardProps> = ({ card, onClick, disabled, playable, noAnim = false }) => {
  const isAttack = card.type === 'attack';
  const isSkill = card.type === 'skill';
  const isUpgraded = card.upgraded;

  // Responsive Dimensions: w-32 h-44 on small, w-40 h-56 on md+
  const baseClasses = "relative w-32 h-44 md:w-40 md:h-56 rounded-xl border-2 transition-all duration-200 transform select-none cursor-pointer flex flex-col overflow-hidden shadow-lg";
  
  // Base background/border logic
  let typeClasses = "";
  if (isAttack) {
      typeClasses = "bg-rose-900 border-rose-500 hover:bg-rose-800 text-rose-50";
  } else if (isSkill) {
      typeClasses = "bg-slate-800 border-slate-400 hover:bg-slate-700 text-slate-50";
  } else {
      typeClasses = "bg-amber-900 border-amber-500 hover:bg-amber-800 text-amber-50";
  }

  // Upgraded Override
  if (isUpgraded) {
     typeClasses += " ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]";
  }

  // If noAnim is true, we strip the hover movement/scale classes, allowing parent to control transforms.
  const interactClasses = (playable && !disabled) 
    ? (noAnim ? "hover:shadow-2xl z-10 hover:z-20 ring-2 ring-transparent hover:ring-white" : "hover:-translate-y-6 hover:scale-110 hover:shadow-2xl z-10 hover:z-20 ring-2 ring-transparent hover:ring-white")
    : "opacity-50 cursor-not-allowed grayscale";

  // Helper to determine icon
  const renderCardIcon = () => {
    // Specific overrides based on card name or mathType
    if (card.name.includes("Minus") || card.mathType === 'subtraction') {
        return <Minus className="w-8 h-8 md:w-12 md:h-12 opacity-80" />;
    }
    if (card.name.includes("Multiply") || card.mathType === 'multiplication') {
        return <X className="w-8 h-8 md:w-12 md:h-12 opacity-80" />;
    }
    if (card.name.includes("Divided") || card.name.includes("Division") || card.mathType === 'division') {
        return <Divide className="w-8 h-8 md:w-12 md:h-12 opacity-80" />;
    }
    if (card.mathType === 'geometry') {
        return <CircleSlash className="w-8 h-8 md:w-12 md:h-12 opacity-80" />;
    }

    // Default Type Icons
    if (isAttack) return <Sword className="w-8 h-8 md:w-12 md:h-12 opacity-50" />;
    if (isSkill) return <Shield className="w-8 h-8 md:w-12 md:h-12 opacity-50" />;
    return <Zap className="w-8 h-8 md:w-12 md:h-12 opacity-50" />;
  };

  return (
    <div 
      className={`${baseClasses} ${typeClasses} ${interactClasses}`}
      onClick={() => (playable && !disabled) && onClick(card)}
    >
      {/* Energy Cost Badge */}
      <div className="absolute top-2 left-2 w-6 h-6 md:w-8 md:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md z-10 border border-blue-300 text-sm md:text-lg">
        {card.cost}
      </div>

      {/* Card Image Placeholder */}
      <div className="h-20 md:h-24 bg-black/30 w-full flex items-center justify-center relative shrink-0">
        {renderCardIcon()}
        
        {/* Rarity Gem */}
        {card.rarity !== 'common' && (
             <div className="absolute top-1 right-1">
                 <Sparkles className={`w-3 h-3 md:w-4 md:h-4 ${card.rarity === 'rare' ? 'text-blue-300' : 'text-purple-400'}`} />
             </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 md:p-3 flex-1 flex flex-col items-center text-center overflow-hidden">
        <h3 className={`card-title font-bold text-xs md:text-sm mb-1 uppercase tracking-wider leading-tight truncate w-full ${isUpgraded ? 'text-emerald-300' : ''}`}>
          {card.name}
        </h3>
        <p className={`text-[10px] md:text-xs font-light leading-snug mt-0.5 line-clamp-3 ${isUpgraded ? 'text-emerald-100' : 'text-gray-200'}`}>
            {card.description}
        </p>
      </div>

      <div className="bg-black/20 py-1 text-[8px] md:text-[10px] text-center uppercase tracking-widest text-white/50 shrink-0">
        {card.type}
      </div>
    </div>
  );
};
