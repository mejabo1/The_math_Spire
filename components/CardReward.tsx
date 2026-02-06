
import React, { useMemo } from 'react';
import { Card as CardType } from '../types';
import { CARDS, REWARD_POOL_IDS } from '../constants';
import { CardComponent } from './Card';
import { Tent, Trophy, Info } from 'lucide-react';

interface CardRewardProps {
  onSelect: (card: CardType) => void;
  type?: 'rest' | 'combat';
  showTutorial?: boolean;
  onTutorialClose?: () => void;
}

export const CardReward: React.FC<CardRewardProps> = ({ onSelect, type = 'combat', showTutorial = false, onTutorialClose }) => {
  
  // Memoize random selection so it doesn't reshuffle on re-renders
  const rewardCards = useMemo(() => {
    // Shuffle the pool ID array
    const shuffled = [...REWARD_POOL_IDS].sort(() => 0.5 - Math.random());
    // Take the first 3
    const selectedIds = shuffled.slice(0, 3);
    
    // Map to Card Objects and give unique IDs for display
    return selectedIds.map(id => ({
        ...CARDS[id],
        id: `reward_${id}`
    }) as CardType);
  }, []);

  const isRest = type === 'rest';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 bg-[url('https://images.unsplash.com/photo-1579208575657-c595a05383b7?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      {/* Reward Tutorial Modal */}
      {showTutorial && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
             <div className="bg-slate-800 border-2 border-amber-500 rounded-xl p-8 max-w-md w-full shadow-2xl text-center relative">
                 <div className="mx-auto w-16 h-16 bg-amber-900/50 rounded-full flex items-center justify-center mb-4 border border-amber-500/30">
                     <Info size={32} className="text-amber-400" />
                 </div>
                 <h3 className="text-2xl font-serif text-amber-100 mb-4">Expanding Your Arsenal</h3>
                 <p className="text-slate-300 mb-6 leading-relaxed">
                     Victory brings rewards! You can now choose <strong>one card</strong> to add to your deck permanently. 
                     <br/><br/>
                     Choose wisely to build powerful combinations!
                 </p>
                 <button 
                    onClick={onTutorialClose}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all hover:scale-105"
                 >
                    Got it!
                 </button>
             </div>
        </div>
      )}
      
      <div className="relative z-10 flex flex-col items-center max-w-5xl w-full p-4 md:p-8">
        
        <div className="bg-amber-900/40 p-4 rounded-full border-2 border-amber-500/50 mb-4 md:mb-6 animate-pulse-slow">
            {isRest ? (
                <Tent size={32} className="md:w-12 md:h-12 text-amber-400" />
            ) : (
                <Trophy size={32} className="md:w-12 md:h-12 text-yellow-400" />
            )}
        </div>

        <h2 className="text-2xl md:text-4xl font-serif text-amber-100 mb-2 drop-shadow-lg">
            {isRest ? "Rest & Reforge" : "Victory!"}
        </h2>
        <p className="text-sm md:text-xl text-amber-200/80 mb-8 md:mb-12 font-light text-center">
            {isRest ? "Choose a new technique to add to your deck." : "Claim your reward: Add a card to your deck."}
        </p>

        <div className="flex flex-wrap justify-center gap-4 md:gap-16">
          {rewardCards.map((card, idx) => (
            <div key={idx} className="flex flex-col items-center group">
                <div className="transform transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-4">
                    <CardComponent 
                        card={card} 
                        onClick={() => onSelect(card)} 
                        disabled={showTutorial} 
                        playable={true} 
                    />
                </div>
                <button 
                    onClick={() => onSelect(card)}
                    disabled={showTutorial}
                    className="mt-4 md:mt-6 px-6 py-2 bg-slate-800 hover:bg-amber-600 border border-slate-600 hover:border-amber-400 text-slate-200 hover:text-white rounded-full font-bold transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 disabled:opacity-0 text-sm md:text-base"
                >
                    Select
                </button>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
};
