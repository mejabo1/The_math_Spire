
import React from 'react';
import { MathProblem } from '../utils/mathGenerator';
import { Brain, X } from 'lucide-react';

interface MathModalProps {
  problem: MathProblem;
  cardName: string;
  onAnswer: (correct: boolean) => void;
  onClose: () => void;
}

export const MathModal: React.FC<MathModalProps> = ({ problem, cardName, onAnswer, onClose }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-slate-800 border-2 border-amber-500 rounded-2xl p-4 md:p-8 max-w-sm md:max-w-md w-full shadow-2xl relative overflow-hidden mx-2"
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

        {/* Options */}
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
        
        <div className="mt-4 md:mt-6 text-center text-xs text-slate-500">
            Solve correctly to cast the card!
        </div>
      </div>
    </div>
  );
};
