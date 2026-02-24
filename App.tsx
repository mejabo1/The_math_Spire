
import React, { useState } from 'react';
import { GameState, Card, MapNode, Enemy } from './types';
import { CARDS, STARTING_DECK_IDS, ENEMIES, GENERATE_MAP, GENERATE_JIMMY_MAP, JIMMY_WIN_TAUNTS, JIMMY_LOSE_TAUNTS, JIMMY_EXCUSES, INITIAL_PLAYER_HP, INITIAL_MAX_ENERGY } from './constants';
import { GameMap } from './components/GameMap';
import { Combat } from './components/Combat';
import { EventRoom } from './components/EventRoom';
import { CardReward } from './components/CardReward';
import { TierTransition } from './components/TierTransition';
import { Play, RotateCw, Wrench, X, Bug, Trophy, Skull, FastForward, ArrowLeft, Flame } from 'lucide-react';

const createInitialDeck = (): Card[] => {
    return STARTING_DECK_IDS.map(id => ({
        ...CARDS[id],
        id: id + Math.random().toString(36).substr(2, 9),
        upgraded: false
    }) as Card);
};

const INITIAL_STATE: GameState = {
    screen: 'MENU',
    player: {
        maxHp: INITIAL_PLAYER_HP,
        currentHp: INITIAL_PLAYER_HP,
        energy: INITIAL_MAX_ENERGY,
        maxEnergy: INITIAL_MAX_ENERGY,
        block: 0,
        gold: 10,
        deck: [],
        discardPile: [],
        drawPile: [],
        hand: [],
        relics: [],
        poison: 0 // Initialize poison
    },
    currentEnemies: [],
    floor: 1,
    tier: 1, // Initialize Tier
    map: [],
    currentMapNodeId: null,
    tutorialSeen: false,
    poisonTutorialSeen: false,
    lastRewardGold: 0,
    gameMode: 'standard'
};

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
    
    // Dev Mode State
    const [isDevOpen, setIsDevOpen] = useState(false);
    const [devPassword, setDevPassword] = useState('');
    const [isDevAuth, setIsDevAuth] = useState(false);
    const [devError, setDevError] = useState(false);
    
    // Cheat Toggles
    const [devGodMode, setDevGodMode] = useState(false);
    const [devOneHpMode, setDevOneHpMode] = useState(false);
    const [devSkipMath, setDevSkipMath] = useState(false);

    // Reward Logic
    const [pendingRewards, setPendingRewards] = useState(0);
    const [rewardTutorialSeen, setRewardTutorialSeen] = useState(false);

    // Jimmy's Taunt State
    const [jimmyTaunt, setJimmyTaunt] = useState<string | null>(null);

    const startGame = () => {
        const deck = createInitialDeck();
        setGameState({
            ...INITIAL_STATE,
            screen: 'MAP',
            map: GENERATE_MAP(1),
            player: {
                ...INITIAL_STATE.player,
                deck: deck,
                drawPile: [...deck]
            },
            gameMode: 'standard'
        });
        setRewardTutorialSeen(false);
    };

    const startJimmyChallenge = () => {
        const deck = createInitialDeck();
        setGameState({
            ...INITIAL_STATE,
            screen: 'MAP',
            map: GENERATE_JIMMY_MAP(),
            player: {
                ...INITIAL_STATE.player,
                deck: deck,
                drawPile: [...deck],
                maxHp: 40, // More HP for endurance
                currentHp: 40
            },
            gameMode: 'jimmy_challenge',
            tier: 3, // Force Tier 3 difficulty for math
            tutorialSeen: true,
            poisonTutorialSeen: true
        });
        setRewardTutorialSeen(false);
    };

    const startTierTwoGame = () => {
        const deck = createInitialDeck();
        const tier = 2;
        const map = GENERATE_MAP(tier);
        
        setGameState({
            ...INITIAL_STATE,
            screen: 'MAP',
            tier: tier,
            map: map,
            player: {
                ...INITIAL_STATE.player,
                deck: deck,
                drawPile: [...deck],
                maxHp: INITIAL_PLAYER_HP + 10, // Buff for starting late
                currentHp: INITIAL_PLAYER_HP + 10,
                gold: 50 // Buff for starting late
            },
            tutorialSeen: true, // Skip Intro Tutorial
            poisonTutorialSeen: false
        });
        setRewardTutorialSeen(false);
        setIsDevOpen(false);
    };
    
    const startTierThreeGame = () => {
        const deck = createInitialDeck();
        const tier = 3;
        const map = GENERATE_MAP(tier);
        
        setGameState({
            ...INITIAL_STATE,
            screen: 'MAP',
            tier: tier,
            map: map,
            player: {
                ...INITIAL_STATE.player,
                deck: deck,
                drawPile: [...deck],
                maxHp: INITIAL_PLAYER_HP + 20, // Buff for starting late
                currentHp: INITIAL_PLAYER_HP + 20,
                gold: 100 
            },
            tutorialSeen: true,
            poisonTutorialSeen: true
        });
        setRewardTutorialSeen(false);
        setIsDevOpen(false);
    };

    const startDevBattle = (enemyTemplate: Enemy, oneHp: boolean) => {
        const deck = createInitialDeck();
        const enemy = {
            ...enemyTemplate,
            id: `${enemyTemplate.id}-dev-${Date.now()}`,
            currentHp: oneHp ? 1 : enemyTemplate.maxHp,
            maxHp: oneHp ? 1 : enemyTemplate.maxHp
        };

        setGameState({
            ...INITIAL_STATE,
            screen: 'COMBAT',
            currentEnemies: [enemy],
            map: [], 
            player: {
                ...INITIAL_STATE.player,
                deck: deck,
                drawPile: [...deck]
            },
            tutorialSeen: true
        });
        setIsDevOpen(false);
    };

    const handleDevLogin = () => {
        if (devPassword === 'sivart') {
            setIsDevAuth(true);
            setDevError(false);
        } else {
            setDevError(true);
        }
    };

    const handleNodeSelect = (node: MapNode) => {
        let nextScreen: GameState['screen'] = 'COMBAT';
        let enemies: Enemy[] = [];
        let isCombatNode = false;
        
        // Parse floor from ID (e.g. "1-1" -> 1)
        const floor = parseInt(node.id.split('-')[0]);

        if (node.type === 'combat') {
            nextScreen = 'COMBAT';
            isCombatNode = true;
            
            // Scaling logic
            let min = 1, max = 1;
            
            if (gameState.gameMode === 'jimmy_challenge') {
                min = 2; max = 3; // Always hard
            } else if (gameState.tier === 1) {
                if (floor === 2) { max = 2; }
                if (floor >= 3) { min = 2; max = 3; }
            } else if (gameState.tier === 2) {
                min = 2; max = 3;
            } else {
                // Tier 3
                min = 1; max = 3; // Keep varied but difficult
            }

            const count = Math.floor(Math.random() * (max - min + 1)) + min;
            
            // Enemy Pool Construction
            let pool = [ENEMIES[0], ENEMIES[1]]; 
            if (gameState.tier >= 2 || gameState.gameMode === 'jimmy_challenge') {
                pool.push(ENEMIES[4]); // Venomous Variable
            }
            if (gameState.tier === 3 || gameState.gameMode === 'jimmy_challenge') {
                pool.push(ENEMIES[7]); // Chaos Calculus (New T3 Enemy)
                pool.push(ENEMIES[2]); // Fraction Phantom
            }
            
            for(let i=0; i<count; i++) {
                const template = pool[Math.floor(Math.random() * pool.length)];
                enemies.push({
                    ...template,
                    id: `${template.id}-${Date.now()}-${i}`,
                    currentHp: devOneHpMode ? 1 : template.maxHp,
                    maxHp: devOneHpMode ? 1 : template.maxHp
                });
            }

        } else if (node.type === 'elite') {
            nextScreen = 'COMBAT';
            isCombatNode = true;
            
            // CHECK FOR MINI-BOSS GUARDIAN (Tier 3, Node 4-5)
            if (gameState.tier === 3 && node.id === '4-5' && gameState.gameMode !== 'jimmy_challenge') {
                 const template = ENEMIES.find(e => e.id === 'miniboss_guardian') || ENEMIES[6]; // Fallback if not found
                 enemies.push({
                    ...template,
                    id: `${template.id}-${Date.now()}`,
                    currentHp: devOneHpMode ? 1 : template.maxHp,
                    maxHp: devOneHpMode ? 1 : template.maxHp
                });
            } else if (gameState.gameMode === 'jimmy_challenge') {
                 // Jimmy Challenge Elites: Mix of MiniBoss and Mimic
                 const r = Math.random();
                 const template = r > 0.5 ? ENEMIES[9] : ENEMIES[6]; // Limit Guardian or Mimic
                 enemies.push({
                    ...template,
                    id: `${template.id}-${Date.now()}`,
                    currentHp: devOneHpMode ? 1 : template.maxHp,
                    maxHp: devOneHpMode ? 1 : template.maxHp
                });
            } else {
                 // SPECIAL ENCOUNTER: MATH MIMIC
                 // Formerly Elite, now a Unique but less punishing encounter
                 const template = ENEMIES[6]; // Math Mimic
                 
                 // Scale Mimic HP slightly for Tiers
                 const maxHp = gameState.tier >= 2 ? 40 : template.maxHp;
                 
                 enemies.push({
                    ...template,
                    id: `${template.id}-${Date.now()}`,
                    currentHp: devOneHpMode ? 1 : maxHp,
                    maxHp: devOneHpMode ? 1 : maxHp
                });
            }

        } else if (node.type === 'boss') {
            nextScreen = 'COMBAT';
            isCombatNode = true;
            
            // SPAWN CORRECT BOSS BASED ON TIER
            let template = ENEMIES[3]; // Default Tier 1: Poly-Gone
            if (gameState.gameMode === 'jimmy_challenge') template = ENEMIES[10]; // Jimmy
            else if (gameState.tier === 2) template = ENEMIES[5]; // Tier 2: Predator
            else if (gameState.tier === 3) template = ENEMIES[8]; // Tier 3: Infinite Prime
            
            enemies.push({
                ...template,
                id: gameState.gameMode === 'jimmy_challenge' ? 'boss-jimmy' : `boss-${gameState.tier}`,
                currentHp: devOneHpMode ? 1 : template.maxHp,
                maxHp: devOneHpMode ? 1 : template.maxHp
            });
        } else if (node.type === 'event') {
            nextScreen = 'EVENT';
        } else if (node.type === 'rest') {
            nextScreen = 'REWARD';
        }

        setGameState(prev => {
            let updatedPlayer = { ...prev.player };
            
            if (isCombatNode) {
                updatedPlayer.drawPile = [...updatedPlayer.deck].sort(() => Math.random() - 0.5);
                updatedPlayer.discardPile = [];
                updatedPlayer.hand = [];
                updatedPlayer.block = 0;
                updatedPlayer.energy = updatedPlayer.maxEnergy;
                updatedPlayer.poison = 0; // Reset poison between fights
            }

            return {
                ...prev,
                screen: nextScreen,
                currentEnemies: enemies,
                currentMapNodeId: node.id,
                map: prev.map.map(n => n.id === node.id ? { ...n, completed: true } : n),
                player: updatedPlayer
            };
        });
    };

    const handleCombatVictory = (remainingHp: number) => {
        const currentNode = gameState.map.find(n => n.id === gameState.currentMapNodeId);
        const isElite = currentNode?.type === 'elite';
        // Fix: Use startsWith('boss-') to avoid matching 'miniboss_guardian'
        const isBoss = currentNode?.type === 'boss' || gameState.currentEnemies.some(e => e.id.startsWith('boss-'));
        const isMiniBoss = gameState.currentEnemies.some(e => e.id.includes('miniboss_guardian'));
        
        // Reward Logic
        // Skip card reward if Tier 1 Boss (The Poly-Gone)
        if (isBoss && gameState.tier === 1) {
            setPendingRewards(0);
        } else {
            // UPDATED: Always reward 1 card, even for Elites
            setPendingRewards(1);
        }
        
        // Gold Logic
        let goldReward = 10;
        if (isElite) goldReward = 30; 
        if (isBoss) goldReward = 50;
        
        // Difficulty Multiplier
        goldReward = goldReward * gameState.tier;

        // JIMMY TAUNT ON VICTORY
        if (gameState.gameMode === 'jimmy_challenge') {
            const taunt = JIMMY_WIN_TAUNTS[Math.floor(Math.random() * JIMMY_WIN_TAUNTS.length)];
            setJimmyTaunt(taunt);
            setTimeout(() => setJimmyTaunt(null), 4000);
        }

        setGameState(prev => {
            if (isBoss && prev.tier === 3 && prev.gameMode !== 'jimmy_challenge') {
                 // Final Victory if beating Boss 3 (The Infinite Prime)
                 return {
                    ...prev,
                    screen: 'VICTORY',
                    currentEnemies: [],
                    player: { 
                        ...prev.player, 
                        currentHp: remainingHp,
                        gold: prev.player.gold + goldReward
                    },
                    lastRewardGold: goldReward
                };
            }

            if (isBoss && prev.gameMode === 'jimmy_challenge') {
                 // Victory over Jimmy
                 return {
                    ...prev,
                    screen: 'VICTORY',
                    currentEnemies: [],
                    player: { 
                        ...prev.player, 
                        currentHp: remainingHp,
                        gold: prev.player.gold + goldReward
                    },
                    lastRewardGold: goldReward
                };
            }

            // Skip Reward Screen for Bosses -> Go directly to Transition
            if (isBoss && (prev.tier === 1 || prev.tier === 2) && prev.gameMode !== 'jimmy_challenge') {
                return {
                    ...prev,
                    screen: 'TIER_TRANSITION',
                    currentEnemies: [],
                    player: { 
                        ...prev.player, 
                        // FULL HEAL FOR BOSS VICTORY
                        currentHp: prev.player.maxHp, 
                        gold: prev.player.gold + goldReward,
                        poison: 0
                    },
                    lastRewardGold: goldReward
                };
            }

            // Normal Reward Screen
            return {
                ...prev,
                screen: 'REWARD',
                currentEnemies: [],
                player: { 
                    ...prev.player, 
                    // Heal logic: Full Heal if MiniBoss, else small heal
                    currentHp: isMiniBoss ? prev.player.maxHp : Math.min(prev.player.maxHp, remainingHp + (isBoss ? 10 : 0)), 
                    gold: prev.player.gold + goldReward,
                    poison: 0
                },
                lastRewardGold: goldReward
            };
        });
    };

    const handleCombatDefeat = () => {
        if (gameState.gameMode === 'jimmy_challenge') {
            const taunt = JIMMY_LOSE_TAUNTS[Math.floor(Math.random() * JIMMY_LOSE_TAUNTS.length)];
            setJimmyTaunt(taunt);
            // Don't clear it automatically on defeat, let it linger on Game Over screen
        }
        setGameState(prev => ({ ...prev, screen: 'GAME_OVER' }));
    };

    const handleTutorialComplete = () => {
        if (!gameState.tutorialSeen) {
            setGameState(prev => ({ ...prev, tutorialSeen: true }));
        } else if (gameState.tier === 2 && !gameState.poisonTutorialSeen) {
            setGameState(prev => ({ ...prev, poisonTutorialSeen: true }));
        }
    };

    const handleEventComplete = (reward: boolean) => {
        setGameState(prev => {
            let newPlayer = { ...prev.player };
            if (reward) {
                newPlayer.maxHp += 10;
                newPlayer.currentHp += 10;
                newPlayer.gold += 50; // Bonus gold for riddle
            }
            return {
                ...prev,
                screen: 'MAP',
                player: newPlayer
            };
        });
    };

    // Called when choosing a card to Add to deck
    const handleCardRewardSelect = (card: Card) => {
        const nextRewards = pendingRewards - 1;
        setPendingRewards(nextRewards);

        setGameState(prev => {
            const newCard = { ...card, id: card.id + Math.random().toString(36).substr(2, 5) };
            const newDeck = [...prev.player.deck, newCard];

            // If rewards are done, go back to Map
            if (nextRewards <= 0) {
                 return {
                     ...prev,
                     screen: 'MAP',
                     player: { ...prev.player, deck: newDeck }
                 };
            }

            // Stay on REWARD screen if more rewards are pending
            return {
                ...prev,
                screen: 'REWARD',
                player: {
                    ...prev.player,
                    deck: newDeck,
                }
            };
        });
    };
    
    // Called from Rest Site
    const handleRestOption = (action: 'heal' | 'upgrade' | 'leave', cardToUpgrade?: Card, cost: number = 0) => {
        setGameState(prev => {
            let newPlayer = { ...prev.player };
            
            if (action === 'heal') {
                const healAmt = Math.floor(newPlayer.maxHp * 0.3); // Heal 30%
                newPlayer.currentHp = Math.min(newPlayer.maxHp, newPlayer.currentHp + healAmt);
            } else if (action === 'upgrade' && cardToUpgrade) {
                // Deduct Gold
                newPlayer.gold = Math.max(0, newPlayer.gold - cost);
                
                // Upgrade Card in Deck
                newPlayer.deck = newPlayer.deck.map(c => {
                    if (c.id === cardToUpgrade.id) {
                        return {
                            ...c,
                            upgraded: true,
                            name: c.name + "+",
                            value: c.value + 3, // Basic Upgrade Logic: +3 Potency
                            description: c.description.replace(/\d+/, (match) => (parseInt(match) + 3).toString()) // Rudimentary desc update
                        };
                    }
                    return c;
                });
            }

            return {
                ...prev,
                screen: 'MAP',
                player: newPlayer
            };
        });
    };
    
    const handleNextTier = () => {
        const nextTier = gameState.tier + 1;
        // Generate new Map for next tier
        const newMap = GENERATE_MAP(nextTier);
        
        // Reset tutorial flags if needed (poison tutorial for Tier 2)
        const showPoisonTutorial = nextTier === 2;
        
        setGameState(prev => ({
            ...prev,
            screen: 'MAP',
            tier: nextTier,
            map: newMap,
            currentMapNodeId: null,
            tutorialSeen: true, // Main tutorial already seen
            poisonTutorialSeen: !showPoisonTutorial // If it's Tier 2, we haven't seen poison tutorial yet
        }));
    };

    return (
        <div className="w-full h-full font-sans overflow-hidden text-slate-100 select-none">
            
            {/* SCREEN: MENU */}
            {gameState.screen === 'MENU' && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 bg-[url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                    
                    <div className="relative z-10 flex flex-col items-center animate-fade-in p-8 text-center">
                        
                        {/* ADVERTISEMENT BADGE */}
                        <div className="mb-8 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 border border-purple-500/50 p-4 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] backdrop-blur-md animate-bounce-slow max-w-md transform rotate-1 hover:rotate-0 transition-transform cursor-default">
                            <div className="flex items-center gap-3 justify-center text-purple-200 font-bold text-lg md:text-xl">
                                <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded uppercase tracking-wider">New</span>
                                Tier 3 Added!
                            </div>
                            <p className="text-purple-300 text-sm md:text-base mt-1">Can you defeat the Infinite Prime?</p>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 drop-shadow-lg mb-2">
                            Math Spire
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-300 font-light mb-12 tracking-wide">
                            Climb. Calculate. Conquer.
                        </p>
                        
                        <div className="flex flex-col gap-4 w-full max-w-xs">
                            <button 
                                onClick={startGame}
                                className="group relative px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white text-xl font-bold rounded-full shadow-lg transition-all hover:scale-105 hover:shadow-amber-500/20 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    <Play fill="currentColor" /> Start Game
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                            </button>

                            <button 
                                onClick={startJimmyChallenge}
                                className="group relative px-8 py-3 bg-red-900 hover:bg-red-800 border border-red-500/50 text-white text-lg font-bold rounded-full shadow-lg transition-all hover:scale-105 hover:shadow-red-500/20 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    <Flame className="text-red-400" /> Jimmy's Challenge
                                </span>
                            </button>

                            <button 
                                onClick={() => setIsDevOpen(true)}
                                className="text-slate-500 hover:text-slate-300 text-sm mt-8 flex items-center justify-center gap-2 transition-colors"
                            >
                                <Wrench size={14} /> Developer Tools
                            </button>
                        </div>
                    </div>

                    {/* JIMMY TAUNT OVERLAY */}
                    {jimmyTaunt && (
                        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
                            <div className="bg-yellow-400 text-black font-bold p-6 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md text-center relative">
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-t-yellow-400"></div>
                                <p className="text-xl font-serif">"{jimmyTaunt}"</p>
                                <p className="text-xs uppercase tracking-widest mt-2 opacity-70">- Jimmy</p>
                            </div>
                        </div>
                    )}

                    {/* DEV TOOLS MODAL */}
                    {isDevOpen && (
                        <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center backdrop-blur-md animate-fade-in">
                            <div className="bg-slate-800 p-8 rounded-xl border border-slate-600 max-w-md w-full shadow-2xl relative">
                                <button onClick={() => setIsDevOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X /></button>
                                <h2 className="text-2xl font-bold text-amber-500 mb-6 flex items-center gap-2"><Bug /> Developer Menu</h2>
                                
                                {!isDevAuth ? (
                                    <div className="space-y-4">
                                        <input 
                                            type="password" 
                                            placeholder="Enter Password" 
                                            className="w-full bg-slate-900 border border-slate-600 p-3 rounded text-white focus:border-amber-500 outline-none"
                                            value={devPassword}
                                            onChange={(e) => setDevPassword(e.target.value)}
                                        />
                                        {devError && <p className="text-red-500 text-sm">Access Denied</p>}
                                        <button onClick={handleDevLogin} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-bold">Authenticate</button>
                                    </div>
                                ) : (
                                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                                        
                                        <div className="space-y-2">
                                            <h3 className="text-slate-400 text-sm uppercase font-bold tracking-wider border-b border-slate-700 pb-1">Cheats</h3>
                                            <div className="flex flex-col gap-2">
                                                <label className="flex items-center gap-3 cursor-pointer hover:bg-slate-700/50 p-2 rounded">
                                                    <input type="checkbox" checked={devGodMode} onChange={(e) => setDevGodMode(e.target.checked)} className="accent-amber-500 w-5 h-5" />
                                                    <span className={devGodMode ? "text-green-400 font-bold" : "text-slate-300"}>God Mode (Map Teleport)</span>
                                                </label>
                                                <label className="flex items-center gap-3 cursor-pointer hover:bg-slate-700/50 p-2 rounded">
                                                    <input type="checkbox" checked={devOneHpMode} onChange={(e) => setDevOneHpMode(e.target.checked)} className="accent-amber-500 w-5 h-5" />
                                                    <span className={devOneHpMode ? "text-green-400 font-bold" : "text-slate-300"}>1 HP Enemies</span>
                                                </label>
                                                <label className="flex items-center gap-3 cursor-pointer hover:bg-slate-700/50 p-2 rounded">
                                                    <input type="checkbox" checked={devSkipMath} onChange={(e) => setDevSkipMath(e.target.checked)} className="accent-amber-500 w-5 h-5" />
                                                    <span className={devSkipMath ? "text-green-400 font-bold" : "text-slate-300"}>Skip Math</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-slate-400 text-sm uppercase font-bold tracking-wider border-b border-slate-700 pb-1">Tier Skip</h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button onClick={startTierTwoGame} className="bg-purple-900/50 hover:bg-purple-800 border border-purple-500/30 text-purple-200 py-2 rounded text-sm font-bold flex items-center justify-center gap-2">
                                                    <FastForward size={14} /> Start Tier 2
                                                </button>
                                                <button onClick={startTierThreeGame} className="bg-indigo-900/50 hover:bg-indigo-800 border border-indigo-500/30 text-indigo-200 py-2 rounded text-sm font-bold flex items-center justify-center gap-2">
                                                    <FastForward size={14} /> Start Tier 3
                                                </button>
                                                <button onClick={startJimmyChallenge} className="col-span-2 bg-red-900/50 hover:bg-red-800 border border-red-500/30 text-red-200 py-2 rounded text-sm font-bold flex items-center justify-center gap-2">
                                                    <Flame size={14} /> Start Jimmy's Challenge
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-slate-400 text-sm uppercase font-bold tracking-wider border-b border-slate-700 pb-1">Enemy Test</h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                {ENEMIES.map(e => (
                                                    <button key={e.id} onClick={() => startDevBattle(e, devOneHpMode)} className="bg-slate-700 hover:bg-slate-600 text-xs py-2 px-1 rounded truncate">
                                                        Vs {e.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* SCREEN: MAP */}
            {gameState.screen === 'MAP' && (
                <div className="w-full h-full relative">
                    <button 
                        className="absolute top-4 left-4 z-50 bg-slate-800/80 hover:bg-slate-700 text-white p-2 rounded-full border border-slate-600 transition-colors"
                        onClick={() => setGameState(INITIAL_STATE)}
                        title="Quit to Menu"
                    >
                        <ArrowLeft /> 
                    </button>
                    <GameMap 
                        mapNodes={gameState.map} 
                        currentNodeId={gameState.currentMapNodeId}
                        onNodeSelect={handleNodeSelect}
                        godMode={devGodMode}
                    />
                </div>
            )}

            {/* SCREEN: COMBAT */}
            {gameState.screen === 'COMBAT' && (
                <Combat 
                    player={gameState.player} 
                    enemies={gameState.currentEnemies}
                    onVictory={handleCombatVictory}
                    onDefeat={handleCombatDefeat}
                    showTutorial={!gameState.tutorialSeen || (gameState.tier === 2 && !gameState.poisonTutorialSeen)}
                    onTutorialComplete={handleTutorialComplete}
                    tier={gameState.tier}
                    tutorialType={gameState.tier === 2 && !gameState.poisonTutorialSeen ? 'poison' : 'intro'}
                    devSkipMath={devSkipMath}
                />
            )}

            {/* SCREEN: EVENT */}
            {gameState.screen === 'EVENT' && (
                 <EventRoom onComplete={handleEventComplete} />
            )}

            {/* SCREEN: REWARD */}
            {gameState.screen === 'REWARD' && (
                <CardReward 
                    onSelect={handleCardRewardSelect} 
                    onRestOption={handleRestOption}
                    type={gameState.map.find(n => n.id === gameState.currentMapNodeId)?.type === 'rest' ? 'rest' : 'combat'}
                    playerDeck={gameState.player.deck}
                    playerGold={gameState.player.gold}
                    earnedGold={gameState.lastRewardGold}
                    showTutorial={pendingRewards > 0 && !rewardTutorialSeen}
                    onTutorialClose={() => setRewardTutorialSeen(true)}
                    tier={gameState.tier}
                />
            )}

            {/* SCREEN: TIER TRANSITION */}
            {gameState.screen === 'TIER_TRANSITION' && (
                <TierTransition 
                    onContinue={handleNextTier} 
                    tier={gameState.tier}
                />
            )}

            {/* SCREEN: VICTORY */}
            {gameState.screen === 'VICTORY' && (
                gameState.gameMode === 'jimmy_challenge' ? (
                    // JIMMY'S SPECIAL VICTORY SCREEN
                    <div className="w-full h-full flex flex-col items-center justify-center bg-yellow-400 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]"></div>
                        
                        <div className="relative z-10 text-center p-8 max-w-3xl animate-bounce-in">
                            <div className="bg-white text-black p-8 rounded-3xl border-8 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">
                                <h1 className="text-6xl md:text-8xl font-black mb-6 uppercase tracking-tighter transform rotate-2 text-red-600">
                                    WHAT?!
                                </h1>
                                <p className="text-2xl md:text-4xl font-bold mb-8 font-mono">
                                    "IMPOSSIBLE! {JIMMY_EXCUSES[Math.floor(Math.random() * JIMMY_EXCUSES.length)]}"
                                </p>
                                
                                <div className="bg-slate-100 p-6 rounded-xl border-4 border-slate-300 mb-8 transform rotate-1">
                                    <h2 className="text-xl font-bold text-slate-500 uppercase tracking-widest mb-4">Official Certificate of Nerdiness</h2>
                                    <p className="text-lg">This certifies that</p>
                                    <p className="text-3xl font-script text-blue-600 my-2">The Player</p>
                                    <p className="text-lg">is way too good at math games.</p>
                                    <div className="mt-6 flex justify-center gap-8 text-sm text-slate-400 font-mono">
                                        <div>Signed: <span className="font-script text-red-500 text-xl">Jimmy (under protest)</span></div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setGameState(INITIAL_STATE)}
                                    className="bg-black hover:bg-slate-800 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-lg transition-transform hover:scale-110 hover:-rotate-2"
                                >
                                    Whatever, Play Again
                                </button>
                            </div>
                        </div>
                        
                        {/* Confetti falling (CSS animation could be added here, but simple text for now) */}
                        <div className="absolute top-10 left-10 text-6xl animate-pulse">😭</div>
                        <div className="absolute bottom-10 right-10 text-6xl animate-pulse">📉</div>
                    </div>
                ) : (
                    // STANDARD VICTORY SCREEN
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 bg-[url('https://images.unsplash.com/photo-1519681393798-38e363ba352e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
                        <div className="relative z-10 text-center p-8 bg-slate-800/80 rounded-3xl border-4 border-amber-500 shadow-2xl animate-fade-in max-w-2xl">
                            <Trophy size={80} className="text-yellow-400 mx-auto mb-6 animate-bounce-slow" />
                            <h1 className="text-6xl font-serif text-amber-100 mb-4">Victory!</h1>
                            <p className="text-2xl text-slate-300 mb-8">
                                You have conquered the Spire and defeated the Infinite Prime!
                            </p>
                            <div className="flex flex-col gap-2 mb-8 text-lg font-mono text-amber-200">
                                 <p>Gold Collected: {gameState.player.gold}</p>
                                 <p>Deck Size: {gameState.player.deck.length}</p>
                            </div>
                            
                            <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                                <button 
                                    onClick={() => {
                                        // NEW GAME PLUS LOGIC
                                        const currentDeck = gameState.player.deck;
                                        setGameState({
                                            ...INITIAL_STATE,
                                            screen: 'MAP',
                                            map: GENERATE_MAP(1),
                                            player: {
                                                ...INITIAL_STATE.player,
                                                deck: currentDeck, // KEEP THE DECK
                                                drawPile: [...currentDeck],
                                                gold: 100, // Bonus gold for NG+
                                                maxHp: INITIAL_PLAYER_HP + 10 // Slight HP Buff for NG+
                                            },
                                            tutorialSeen: true,
                                            poisonTutorialSeen: true
                                        });
                                    }}
                                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-3"
                                >
                                    <FastForward /> New Game + (Keep Deck)
                                </button>
    
                                <button 
                                    onClick={() => setGameState(INITIAL_STATE)}
                                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-3"
                                >
                                    <RotateCw /> Main Menu
                                </button>
                            </div>
                        </div>
                    </div>
                )
            )}

            {/* SCREEN: GAME OVER */}
            {gameState.screen === 'GAME_OVER' && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
                    <div className="relative z-10 text-center animate-fade-in">
                        <Skull size={100} className="text-red-600 mx-auto mb-6 animate-pulse" />
                        <h1 className="text-8xl font-serif text-red-600 mb-4 tracking-widest uppercase" style={{ textShadow: '0 0 20px rgba(220, 38, 38, 0.5)' }}>Defeat</h1>
                        <p className="text-2xl text-slate-400 mb-12 font-light">The math was too strong...</p>
                        <button 
                            onClick={() => setGameState(INITIAL_STATE)}
                            className="bg-slate-800 hover:bg-red-900/50 border border-slate-600 hover:border-red-500 text-slate-200 hover:text-white font-bold py-4 px-12 rounded-full transition-all hover:scale-105 flex items-center gap-3 mx-auto"
                        >
                            <RotateCw /> Try Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
