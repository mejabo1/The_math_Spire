
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

  // INCREASED SIZING for fuller screen usage
  // sm: w-28 h-40 (112px x 160px)
  // md: w-36 h-52 (144px x 208px)
  // xl: w-44 h-64 (176px x 256px)
  const baseClasses = "relative w-28 h-40 md:w-36 md:h-52 xl:w-44 xl:h-64 rounded-xl border-2 transition-all duration-200 transform select-none cursor-pointer flex flex-col overflow-hidden shadow-lg";
  
  // Base background/border logic with FALLBACK Styles
  let typeClasses = "";
  let fallbackStyle = {};

  if (isAttack) {
      typeClasses = "bg-rose-900 border-rose-500 hover:bg-rose-800 text-rose-50";
      fallbackStyle = { backgroundColor: '#881337', borderColor: '#f43f5e', color: '#fff1f2' };
  } else if (isSkill) {
      typeClasses = "bg-slate-800 border-slate-400 hover:bg-slate-700 text-slate-50";
      fallbackStyle = { backgroundColor: '#1e293b', borderColor: '#94a3b8', color: '#f8fafc' };
  } else {
      typeClasses = "bg-amber-900 border-amber-500 hover:bg-amber-800 text-amber-50";
      fallbackStyle = { backgroundColor: '#78350f', borderColor: '#f59e0b', color: '#fffbeb' };
  }

  // Upgraded Override
  if (isUpgraded) {
     typeClasses += " ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]";
  }

  // If noAnim is true, we strip the hover movement/scale classes, allowing parent to control transforms.
  const interactClasses = (playable && !disabled) 
    ? (noAnim ? "hover:shadow-2xl z-10 hover:z-20 ring-2 ring-transparent hover:ring-white" : "hover:-translate-y-4 hover:scale-105 hover:shadow-2xl z-10 hover:z-20 ring-2 ring-transparent hover:ring-white")
    : "opacity-50 cursor-not-allowed grayscale";

  // Helper to determine icon
  const renderCardIcon = () => {
    // Unique SVG for Multiply Slam
    if (card.name === 'Multiply Slam') {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 md:w-16 md:h-16 text-yellow-400 drop-shadow-lg">
                <path d="M18 6L6 18M6 6l12 12" strokeOpacity="0.3" strokeWidth="3" />
                <path d="M14.5 2l-4.5 4.5l-6-1l1.5 6l4.5 4.5l9-9l-4.5-5z" fill="currentColor" fillOpacity="0.2" />
                <path d="M6 21h12" strokeWidth="1" strokeOpacity="0.8" />
            </svg>
        );
    }

    // Unique SVG for Divided Cleave
    if (card.name === 'Divided Cleave') {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 md:w-16 md:h-16 text-blue-300 drop-shadow-lg">
                <circle cx="12" cy="6" r="1.5" fill="currentColor" />
                <circle cx="12" cy="18" r="1.5" fill="currentColor" />
                <path d="M5 12h14" strokeOpacity="0.2" strokeWidth="4" />
                <path d="M21 3L3 21" stroke="white" strokeWidth="3" className="drop-shadow-sm" />
            </svg>
        );
    }

    // Specific overrides based on card name or mathType
    if (card.name.includes("Minus") || card.mathType === 'subtraction') {
        return <Minus className="w-8 h-8 md:w-14 md:h-14 opacity-80" />;
    }
    if (card.name.includes("Multiply") || card.mathType === 'multiplication') {
        return <X className="w-8 h-8 md:w-14 md:h-14 opacity-80" />;
    }
    if (card.name.includes("Divided") || card.name.includes("Division") || card.mathType === 'division') {
        return <Divide className="w-8 h-8 md:w-14 md:h-14 opacity-80" />;
    }
    if (card.mathType === 'geometry') {
        return <CircleSlash className="w-8 h-8 md:w-14 md:h-14 opacity-80" />;
    }

    // Default Type Icons
    if (isAttack) return <Sword className="w-8 h-8 md:w-14 md:h-14 opacity-50" />;
    if (isSkill) return <Shield className="w-8 h-8 md:w-14 md:h-14 opacity-50" />;
    return <Zap className="w-8 h-8 md:w-14 md:h-14 opacity-50" />;
  };

  return (
    <div 
      className={`${baseClasses} ${typeClasses} ${interactClasses}`}
      style={fallbackStyle} 
      onClick={() => (playable && !disabled) && onClick(card)}
    >
      {/* Energy Cost Badge */}
      <div className="absolute top-1 left-1 md:top-2 md:left-2 w-6 h-6 md:w-8 md:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md z-10 border border-blue-300 text-sm md:text-lg">
        {card.cost}
      </div>

      {/* Card Image Placeholder */}
      <div className="h-20 md:h-28 bg-black/30 w-full flex items-center justify-center relative shrink-0">
        {renderCardIcon()}
        
        {/* Rarity Gem */}
        {card.rarity !== 'common' && (
             <div className="absolute top-1 right-1">
                 <Sparkles className={`w-4 h-4 md:w-5 md:h-5 ${card.rarity === 'rare' ? 'text-blue-300' : 'text-purple-400'}`} />
             </div>
        )}
      </div>

      {/* Content */}
      <div className="p-1 md:p-2 flex-1 flex flex-col items-center text-center overflow-hidden justify-start pt-2">
        <h3 className={`card-title font-bold text-xs md:text-sm mb-1 uppercase tracking-wider leading-tight truncate w-full ${isUpgraded ? 'text-emerald-300' : ''}`}>
          {card.name}
        </h3>
        <p className={`text-[9px] md:text-xs font-light leading-tight mt-0.5 line-clamp-3 ${isUpgraded ? 'text-emerald-100' : 'text-gray-200'}`}>
            {card.description}
        </p>
      </div>

      <div className="bg-black/20 py-1 text-[8px] md:text-[10px] text-center uppercase tracking-widest text-white/50 shrink-0">
        {card.type}
      </div>
    </div>
  );
};
