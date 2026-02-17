
import React, { useState, useEffect, useRef } from 'react';
import { MathProblem } from '../utils/mathGenerator';
import { Brain, X, Check, AlertCircle } from 'lucide-react';

interface MathModalProps {
  problem: MathProblem;
  cardName: string;
  onAnswer: (correct: boolean) => void;
  onClose: () => void;
  tier?: number;
}

export const MathModal: React.FC<MathModalProps> = ({ problem, cardName, onAnswer, onClose, tier = 1 }) => {
  const [inputValue, setInputValue] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInputMode = tier >= 3;

  useEffect(() => {
    if (isInputMode && inputRef.current) {
        inputRef.current.focus();
    }
  }, [isInputMode]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    // Normalizing string for comparison (removing spaces, case insensitive)
    const normalizedInput = inputValue.trim().toLowerCase().replace(/\s/g, '');
    const normalizedCorrect = problem.correctAnswer.toString().toLowerCase().replace(/\s/g, '');

    if (normalizedInput === normalizedCorrect) {
        onAnswer(true);
    } else {
        setShake(true);
        setTimeout(() => {
            onAnswer(false); // Fail immediately on wrong text input in Tier 3? Or give feedback?
            // Current design: Fail immediately to keep tension high, or maybe 
            // the onAnswer(false) in parent handles logic (exhausting/fizzling).
        }, 500);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className={`bg-slate-800 border-2 border-amber-500 rounded-2xl p-4 md:p-8 max-w-sm md:max-w-md w-full shadow-2xl relative overflow-hidden mx-2 ${shake ? 'animate-shake' : ''}`}
        style={{ backgroundColor: '#1e293b', borderColor: '#f59e0b' }} 
      >
        
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-2 right-2 md:top-4 md:right-4 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full p-2 transition-all z-10 cursor-pointer"
            title="Cancel Casting"
        >
            <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-4 md:mb-6 mt-2">
            <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-900/50 mb-2 border border-amber-500/30">
                <Brain className="text-amber-400 w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-slate-400 text-xs uppercase tracking-widest mb-1">Casting Spell</h3>
            <h2 className="text-xl md:text-2xl font-serif text-white font-bold">{cardName}</h2>
        </div>

        {/* Question */}
        <div 
            className="bg-slate-900/50 p-4 md:p-6 rounded-xl border border-slate-700 mb-4 md:mb-6 text-center"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', borderColor: '#334155' }}
        >
            <span className="text-xs text-slate-500 uppercase tracking-wide block mb-2">{problem.topic}</span>
            <p className="text-2xl md:text-3xl font-mono text-amber-100">{problem.question}</p>
        </div>

        {/* Input Mode (Tier 3+) vs Option Mode */}
        {isInputMode ? (
             <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                 <div className="relative">
                    <input
                        ref={inputRef}
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type answer..."
                        className="w-full bg-slate-950 border-2 border-slate-600 focus:border-amber-500 rounded-lg py-3 px-4 text-center text-xl text-white outline-none placeholder-slate-600 font-mono"
                    />
                    <div className="text-xs text-slate-500 mt-2 text-center flex items-center justify-center gap-1">
                        <AlertCircle size={12} /> Press Enter to cast
                    </div>
                 </div>
                 <button 
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-500 text-white py-3 rounded-lg font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                 >
                    Cast Spell <Check size={18} />
                 </button>
             </form>
        ) : (
            <div className="grid grid-cols-2 gap-3 md:gap-4">
                {problem.options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => onAnswer(option === problem.correctAnswer)}
                        className="bg-slate-700 hover:bg-slate-600 border border-slate-500 hover:border-amber-400 text-white py-3 md:py-4 rounded-lg text-lg md:text-xl font-bold transition-all active:scale-95 shadow-lg cursor-pointer"
                        style={{ backgroundColor: '#334155', color: 'white', borderColor: '#64748b' }}
                    >
                        {option}
                    </button>
                ))}
            </div>
        )}
        
        <div className="mt-4 md:mt-6 text-center text-xs text-slate-500">
            {isInputMode ? "Tier 3: Precision required." : "Solve correctly to cast the card!"}
        </div>
      </div>
    </div>
  );
};
