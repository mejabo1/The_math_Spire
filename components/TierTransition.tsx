
import React from 'react';
import { ArrowDown, Swords, ShieldAlert, Sparkles } from 'lucide-react';

interface TierTransitionProps {
  onContinue: () => void;
}

export const TierTransition: React.FC<TierTransitionProps> = ({ onContinue }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900 bg-[url('https://images.unsplash.com/photo-1516934024742-b461fba47600?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 max-w-2xl w-full p-8 text-center animate-fade-in">
        <div className="mb-6 inline-block p-4 rounded-full bg-amber-900/50 border-2 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-pulse-slow">
            <Swords size={48} className="text-amber-400" />
        </div>
        
        <h2 className="text-5xl font-serif text-amber-100 mb-4 tracking-widest drop-shadow-lg">TIER 1 CLEARED</h2>
        
        <div className="h-1 w-32 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-8"></div>
        
        <div className="space-y-6 text-xl text-slate-300 mb-10 leading-relaxed font-serif">
            <p>
                The <span className="text-red-400">Geometry Golems</span> crumble into dust. 
                <br/>The path opens upward, spiraling into the dark clouds above.
            </p>
            <p>
                The equations grow more complex. The variables turn toxic.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-lg mx-auto mb-10 bg-black/40 p-6 rounded-xl border border-slate-700">
             <div className="flex items-start gap-3">
                <ShieldAlert className="text-red-400 shrink-0 mt-1" />
                <div>
                    <h4 className="font-bold text-slate-200">Dangerous Enemies</h4>
                    <p className="text-sm text-slate-400">Foes in Tier 2 strike harder and use Poison.</p>
                </div>
             </div>
             <div className="flex items-start gap-3">
                <Sparkles className="text-green-400 shrink-0 mt-1" />
                <div>
                    <h4 className="font-bold text-slate-200">Greater Rewards</h4>
                    <p className="text-sm text-slate-400">Earn more Gold and find rarer Cards.</p>
                </div>
             </div>
        </div>

        <button 
            onClick={onContinue}
            className="group relative px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white text-xl font-bold rounded-full shadow-lg transition-all hover:scale-105 hover:shadow-amber-500/20 overflow-hidden cursor-pointer"
        >
            <span className="relative z-10 flex items-center gap-2">
                Descend to Tier 2 <ArrowDown className="group-hover:translate-y-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
        </button>
      </div>
    </div>
  );
};
