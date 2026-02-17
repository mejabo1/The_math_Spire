
import React, { useMemo, useState } from 'react';
import { Card as CardType } from '../types';
import { CARDS, REWARD_POOL_IDS, TIER_3_REWARD_IDS } from '../constants';
import { CardComponent } from './Card';
import { Tent, Trophy, Info, Heart, Hammer, Coins, ArrowLeft } from 'lucide-react';

interface CardRewardProps {
  onSelect: (card: CardType) => void;
  onRestOption?: (action: 'heal' | 'upgrade', card?: CardType, cost?: number) => void;
  type?: 'rest' | 'combat';
  playerDeck?: CardType[];
  playerGold?: number;
  earnedGold?: number; // New prop to display gold earned from combat
  showTutorial?: boolean;
  onTutorialClose?: () => void;
  tier?: number;
}

export const CardReward: React.FC<CardRewardProps> = ({ 
    onSelect, 
    onRestOption,
    type = 'combat', 
    playerDeck = [], 
    playerGold = 0,
    earnedGold = 0,
    showTutorial = false, 
    onTutorialClose,
    tier = 1
}) => {
  const [restView, setRestView] = useState<'selection' | 'deck_upgrade'>('selection');

  // Combat Reward Cards
  const rewardCards = useMemo(() => {
    if (type === 'rest') return [];
    
    // Select correct pool based on Tier
    const pool = tier === 3 ? TIER_3_REWARD_IDS : REWARD_POOL_IDS;

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selectedIds = shuffled.slice(0, 3);
    
    return selectedIds.map(id => ({
        ...CARDS[id],
        id: `reward_${id}`
    }) as CardType);
  }, [type, tier]);

  const isRest = type === 'rest';
  const upgradeCost = 20;

  const handleUpgradeSelect = (card: CardType) => {
      if (onRestOption) {
          onRestOption('upgrade', card, upgradeCost);
      }
  };

  // Rest Site Logic - Deck View
  if (isRest && restView === 'deck_upgrade') {
      return (
        <div className="w-full h-full bg-slate-900 bg-[url('https://images.unsplash.com/photo-1579208575657-c595a05383b7?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md"></div>
            
            <div className="relative z-10 flex-1 flex flex-col p-4 md:p-8">
                <div className="flex items-center justify-between mb-8 max-w-6xl mx-auto w-full">
                    <button onClick={() => setRestView('selection')} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                        <ArrowLeft /> Back
                    </button>
                    <div className="flex flex-col items-center">
                        <h2 className="text-3xl font-serif text-amber-100 flex items-center gap-3">
                            <Hammer className="text-amber-500" /> Select Card to Upgrade
                        </h2>
                        <div className="text-amber-400 font-bold flex items-center gap-2 mt-2">
                             Cost: <span className="text-white">{upgradeCost}</span> <Coins size={16} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-yellow-400 font-bold bg-black/40 px-4 py-2 rounded-full border border-yellow-500/30">
                        <Coins size={20} /> {playerGold}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-wrap justify-center gap-6 pb-20">
                        {playerDeck.filter(c => !c.upgraded).map((card) => (
                            <div key={card.id} className="group relative flex flex-col items-center">
                                <CardComponent 
                                    card={card} 
                                    onClick={() => handleUpgradeSelect(card)} 
                                    disabled={false} 
                                    playable={true} 
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-amber-500/10 rounded-xl transition-colors pointer-events-none"></div>
                                <button 
                                    onClick={() => handleUpgradeSelect(card)}
                                    className="mt-4 bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-full font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
                                >
                                    Reforge
                                </button>
                            </div>
                        ))}
                        {playerDeck.filter(c => !c.upgraded).length === 0 && (
                            <div className="text-slate-400 italic text-xl">All your cards are already upgraded!</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // Rest Site Logic - Main Selection
  if (isRest) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 bg-[url('https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          
          <div className="relative z-10 flex flex-col items-center max-w-4xl w-full p-8">
            <div className="mb-8 flex flex-col items-center">
                 <Tent size={64} className="text-amber-400 mb-4 drop-shadow-lg" />
                 <h2 className="text-5xl font-serif text-amber-100 mb-2">Rest Site</h2>
                 <p className="text-xl text-slate-300">The fire crackles warmly. You feel safe here.</p>
                 <div className="mt-4 flex items-center gap-2 text-yellow-400 font-bold bg-black/40 px-6 py-2 rounded-full border border-yellow-500/30">
                    <Coins size={20} /> Gold: {playerGold}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {/* HEAL OPTION */}
                <button 
                    onClick={() => onRestOption && onRestOption('heal')}
                    className="group bg-slate-800/80 hover:bg-emerald-900/80 border-2 border-slate-600 hover:border-emerald-500 p-8 rounded-2xl transition-all flex flex-col items-center text-center shadow-xl hover:scale-105"
                >
                    <div className="bg-emerald-500/20 p-4 rounded-full mb-4 group-hover:bg-emerald-500/40 transition-colors">
                        <Heart size={48} className="text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Rest</h3>
                    <p className="text-slate-300 group-hover:text-emerald-100">Heal for <span className="text-emerald-400 font-bold">30%</span> of your Max HP.</p>
                </button>

                {/* UPGRADE OPTION */}
                <button 
                    onClick={() => {
                        if (playerGold && playerGold >= upgradeCost) {
                            setRestView('deck_upgrade');
                        }
                    }}
                    disabled={!playerGold || playerGold < upgradeCost}
                    className="group bg-slate-800/80 hover:bg-amber-900/80 disabled:opacity-50 disabled:hover:bg-slate-800/80 border-2 border-slate-600 hover:border-amber-500 disabled:hover:border-slate-600 p-8 rounded-2xl transition-all flex flex-col items-center text-center shadow-xl hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                    <div className="bg-amber-500/20 p-4 rounded-full mb-4 group-hover:bg-amber-500/40 transition-colors">
                        <Hammer size={48} className="text-amber-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Hire Blacksmith</h3>
                    <p className="text-slate-300 group-hover:text-amber-100 mb-2">Upgrade a card in your deck.</p>
                    <div className={`font-bold px-4 py-1 rounded-full border ${(!playerGold || playerGold < upgradeCost) ? 'text-red-400 border-red-500/30 bg-red-900/20' : 'text-yellow-400 border-yellow-500/30 bg-black/40'}`}>
                        Cost: {upgradeCost} Gold
                    </div>
                </button>
            </div>
          </div>
        </div>
      );
  }

  // Standard Combat Reward
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 bg-[url('https://images.unsplash.com/photo-1579208575657-c595a05383b7?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

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
            <Trophy size={32} className="md:w-12 md:h-12 text-yellow-400" />
        </div>

        <h2 className="text-2xl md:text-4xl font-serif text-amber-100 mb-2 drop-shadow-lg">
            Victory!
        </h2>
        <div className="flex items-center gap-4 mb-8">
            <p className="text-sm md:text-xl text-amber-200/80 font-light text-center">
                Claim your reward: Add a card to your deck.
            </p>
            <div className="bg-black/50 px-4 py-1 rounded-full border border-yellow-500/30 text-yellow-400 flex items-center gap-2">
                <Coins size={16} /> +{earnedGold} Gold
            </div>
        </div>

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
