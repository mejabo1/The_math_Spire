
import React, { useState } from 'react';
import { ChevronRight, Zap, Brain, Shield, Sword, X, RefreshCw, Layers } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Math Spire",
      content: "Climb the spire by defeating enemies using deck-building strategies and 6th-grade math skills.",
      icon: <Brain size={64} className="text-amber-400" />
    },
    {
      title: "Energy & Cards",
      content: "You have 3 Energy per turn (top left). Playing cards costs Energy. Click a card to play it.",
      icon: <Zap size={64} className="text-yellow-400" />
    },
    {
      title: "The Deck Cycle",
      content: "You draw 5 cards every turn. Played cards go to your Discard pile. When your Draw pile is empty, your Discard pile is shuffled to form a new Draw pile.",
      icon: (
        <div className="flex items-center gap-6 text-slate-300">
           <div className="flex flex-col items-center gap-1">
              <Layers size={32} />
              <span className="text-xs">Draw</span>
           </div>
           <RefreshCw size={24} className="text-amber-500 animate-spin-slow" />
           <div className="flex flex-col items-center gap-1">
              <Layers size={32} className="opacity-50" />
              <span className="text-xs">Discard</span>
           </div>
        </div>
      )
    },
    {
      title: "Math is Power",
      content: "Every card requires you to solve a math problem. Answer correctly to cast the spell. Incorrect answers waste the card!",
      icon: <div className="text-6xl font-serif text-amber-200">2 + x = 5</div>
    },
    {
      title: "Enemy Intents",
      content: "Look above the enemies. A Sword means they will attack. A Shield means they will block. Plan accordingly!",
      icon: (
        <div className="flex gap-4">
            <Sword size={48} className="text-red-500" />
            <Shield size={48} className="text-blue-500" />
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-800 border-2 border-amber-500 rounded-2xl p-8 max-w-lg w-full shadow-2xl relative flex flex-col items-center text-center">
        
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-white"
        >
            <X size={24} />
        </button>

        <div className="mb-6 mt-4 p-6 bg-slate-900 rounded-full border border-slate-700 shadow-inner min-h-[120px] flex items-center justify-center">
            {steps[step].icon}
        </div>

        <h2 className="text-3xl font-serif text-amber-100 mb-4">{steps[step].title}</h2>
        <p className="text-lg text-slate-300 mb-8 leading-relaxed px-4 min-h-[80px]">
            {steps[step].content}
        </p>

        <div className="flex items-center justify-between w-full px-4">
            <div className="flex gap-2">
                {steps.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`w-3 h-3 rounded-full transition-all ${idx === step ? 'bg-amber-500 scale-125' : 'bg-slate-600'}`}
                    />
                ))}
            </div>

            <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-bold shadow-lg transition-transform hover:-translate-y-1"
            >
                {step === steps.length - 1 ? "Start Battle" : "Next"}
                <ChevronRight size={20} />
            </button>
        </div>

      </div>
    </div>
  );
};
