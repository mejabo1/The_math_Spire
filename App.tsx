
import React, { useState, useEffect } from 'react';
import { GameState, Card, MapNode, Enemy } from './types';
import { CARDS, STARTING_DECK_IDS, ENEMIES, GENERATE_MAP, INITIAL_PLAYER_HP, INITIAL_MAX_ENERGY } from './constants';
import { GameMap } from './components/GameMap';
import { Combat } from './components/Combat';
import { EventRoom } from './components/EventRoom';
import { CardReward } from './components/CardReward';
import { TierTransition } from './components/TierTransition';
import { Play, RotateCw, Wrench, Lock, X, Bug, Trophy, Unlock, Skull, FastForward } from 'lucide-react';

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
};

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
    const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });
    
    // Dev Mode State
    const [isDevOpen, setIsDevOpen] = useState(false);
    const [devPassword, setDevPassword] = useState('');
    const [isDevAuth, setIsDevAuth] = useState(false);
    const [devError, setDevError] = useState(false);
    
    // Cheat Toggles
    const [devGodMode, setDevGodMode] = useState(false);
    const [devOneHpMode, setDevOneHpMode] = useState(false);

    // Reward Logic
    const [pendingRewards, setPendingRewards] = useState(0);
    const [rewardTutorialSeen, setRewardTutorialSeen] = useState(false);

    // FIX: Handle device resize quirks
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ w: window.innerWidth, h: window.innerHeight });
        };
        
        window.addEventListener('resize', handleResize);
        
        // Force multiple checks to catch post-load resize (common in iframes)
        const timeouts = [100, 500, 1000, 2000].map(t => setTimeout(handleResize, t));

        return () => {
            window.removeEventListener('resize', handleResize);
            timeouts.forEach(clearTimeout);
        };
    }, []);

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
            }
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
            
            // Tier 1 scaling: Floor 2 (1-2), Floor 3+ (2-3)
            // Tier 2 scaling: Harder.
            let min = 1, max = 1;
            
            if (gameState.tier === 1) {
                if (floor === 2) { max = 2; }
                if (floor >= 3) { min = 2; max = 3; }
            } else {
                // Tier 2 is harder
                min = 2; max = 3;
            }

            const count = Math.floor(Math.random() * (max - min + 1)) + min;
            
            // Enemy Pool: Include Poison enemies in Tier 2
            let pool = [ENEMIES[0], ENEMIES[1]]; 
            if (gameState.tier === 2) {
                pool.push(ENEMIES[4]); // Venomous Variable
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
             // Elite encounter
             // Tier 1: Fraction Phantom
             // Tier 2: Venomous Variable (Buffed)
             const template = gameState.tier === 2 ? ENEMIES[4] : ENEMIES[2];
             
             const maxHp = Math.floor(template.maxHp * 1.5);
             
             enemies.push({
                ...template,
                id: `${template.id}-${Date.now()}`,
                currentHp: devOneHpMode ? 1 : maxHp,
                maxHp: devOneHpMode ? 1 : maxHp
            });

        } else if (node.type === 'boss') {
            nextScreen = 'COMBAT';
            isCombatNode = true;
            
            // SPAWN CORRECT BOSS BASED ON TIER
            const template = gameState.tier === 2 ? ENEMIES[5] : ENEMIES[3]; // 5 is Predator, 3 is Poly-Gone
            
            enemies.push({
                ...template,
                id: `boss-${gameState.tier}`,
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
        const isBoss = currentNode?.type === 'boss' || gameState.currentEnemies.some(e => e.id.includes('boss'));
        
        // Reward Logic
        // Skip card reward if Tier 1 Boss (The Poly-Gone)
        if (isBoss && gameState.tier === 1) {
            setPendingRewards(0);
        } else {
            setPendingRewards(isElite ? 2 : 1);
        }
        
        // Gold Logic
        let goldReward = 10;
        if (isElite) goldReward = 20;
        if (isBoss) goldReward = 50;
        
        // Difficulty Multiplier
        goldReward = goldReward * gameState.tier;

        setGameState(prev => {
            if (isBoss && prev.tier === 2) {
                 // Final Victory if beating Boss 2 (Tier 2)
                 return {
                    ...prev,
                    screen: 'VICTORY',
                    currentEnemies: [],
                    player: { 
                        ...prev.player, 
                        currentHp: remainingHp,
                        gold: prev.player.gold + goldReward
                    }
                };
            }

            // Skip Reward Screen for Tier 1 Boss -> Go directly to Transition
            if (isBoss && prev.tier === 1) {
                return {
                    ...prev,
                    screen: 'TIER_TRANSITION',
                    currentEnemies: [],
                    player: { 
                        ...prev.player, 
                        // FULL HEAL FOR TIER 1 BOSS VICTORY
                        currentHp: prev.player.maxHp, 
                        gold: prev.player.gold + goldReward,
                        poison: 0
                    }
                };
            }

            // Normal Reward Screen
            return {
                ...prev,
                screen: 'REWARD',
                currentEnemies: [],
                player: { 
                    ...prev.player, 
                    currentHp: Math.min(prev.player.maxHp, remainingHp + (isBoss ? 10 : 0)), // Small heal after boss
                    gold: prev.player.gold + goldReward,
                    poison: 0
                }
            };
        });
    };

    const handleCombatDefeat = () => {
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
    
    const handleStartTierTwo = () => {
        const nextTier = 2;
        // CRITICAL: Generate the map FIRST and store it in a variable to ensure it's not empty
        const nextMapNodes = GENERATE_MAP(nextTier);
        
        console.log("Starting Tier 2 with Nodes:", nextMapNodes);

        setGameState(prev => ({
            ...prev,
            tier: nextTier,
            screen: 'MAP',
            map: nextMapNodes,
            currentMapNodeId: null,
            currentEnemies: [],
            floor: 1,
            poisonTutorialSeen: false, // Ensure tutorial triggers
            player: {
                ...prev.player, // EXPLICITLY PRESERVE PLAYER STATS AND DECK
                drawPile: [...prev.player.deck], // Reset deck for new run leg
                discardPile: [],
                hand: [],
                energy: prev.player.maxEnergy,
                block: 0,
                poison: 0
            }
        }));
    };

    const getCurrentNodeType = () => {
        return gameState.map.find(n => n.id === gameState.currentMapNodeId)?.type || 'combat';
    }

    const nodeType = getCurrentNodeType();

    return (
        <div 
            className="fixed inset-0 bg-black text-white overflow-hidden" 
            style={{ width: `${windowSize.w}px`, height: `${windowSize.h}px` }}
        >
            {/* Dev Mode Modal */}
            {isDevOpen && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
                    <div className="bg-slate-800 border-2 border-slate-600 p-8 rounded-xl max-w-lg w-full relative shadow-2xl">
                        <button onClick={() => setIsDevOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                        
                        {!isDevAuth ? (
                            <div className="flex flex-col gap-6">
                                <h2 className="text-3xl font-serif text-amber-500 flex items-center gap-3">
                                    <Lock size={32} /> Developer Access
                                </h2>
                                <p className="text-slate-400">Please authenticate to access debug tools.</p>
                                <div className="space-y-2">
                                    <input 
                                        type="password" 
                                        value={devPassword}
                                        onChange={(e) => setDevPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleDevLogin()}
                                        placeholder="Enter Password"
                                        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 p-4 rounded text-white outline-none transition-all"
                                    />
                                    {devError && <p className="text-red-500 text-sm">Incorrect password.</p>}
                                </div>
                                <button 
                                    onClick={handleDevLogin}
                                    className="w-full bg-amber-700 hover:bg-amber-600 text-white py-3 rounded font-bold shadow-lg transition-all"
                                >
                                    Login
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <h2 className="text-2xl font-serif text-emerald-500 flex items-center gap-3 border-b border-slate-700 pb-4">
                                    <Bug size={28} /> Debug Menu
                                </h2>

                                {/* Cheats Section */}
                                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-700">
                                    <div 
                                        className={`flex items-center justify-between p-3 rounded cursor-pointer border transition-colors ${devGodMode ? 'bg-amber-500/20 border-amber-500' : 'bg-slate-700 border-slate-600'}`}
                                        onClick={() => setDevGodMode(!devGodMode)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Unlock size={20} className={devGodMode ? "text-amber-400" : "text-slate-400"} />
                                            <span className="font-bold">Unlock Map</span>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full ${devGodMode ? 'bg-amber-500' : 'bg-slate-500'}`}></div>
                                    </div>

                                    <div 
                                        className={`flex items-center justify-between p-3 rounded cursor-pointer border transition-colors ${devOneHpMode ? 'bg-red-500/20 border-red-500' : 'bg-slate-700 border-slate-600'}`}
                                        onClick={() => setDevOneHpMode(!devOneHpMode)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Skull size={20} className={devOneHpMode ? "text-red-400" : "text-slate-400"} />
                                            <span className="font-bold">1 HP Enemies</span>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full ${devOneHpMode ? 'bg-red-500' : 'bg-slate-500'}`}></div>
                                    </div>
                                </div>

                                <button 
                                    onClick={startTierTwoGame}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded font-bold shadow-lg transition-all flex items-center justify-center gap-2 mb-4 cursor-pointer"
                                >
                                    <FastForward size={20} /> Start Tier 2 Run
                                </button>
                                
                                <p className="text-slate-400 text-sm">Quick Combat Test</p>
                                
                                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {ENEMIES.map(enemy => (
                                        <div key={enemy.id} className="flex items-center justify-between bg-slate-700/50 p-4 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-800 rounded p-1">
                                                    <img src={enemy.image} className="w-full h-full object-contain" alt={enemy.name} />
                                                </div>
                                                <span className="font-bold text-slate-200">{enemy.name}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => startDevBattle(enemy, false)}
                                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-xs font-bold transition-colors shadow-md"
                                                >
                                                    FIGHT
                                                </button>
                                                <button 
                                                    onClick={() => startDevBattle(enemy, true)}
                                                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-xs font-bold transition-colors shadow-md border border-red-400"
                                                >
                                                    1 HP
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {gameState.screen === 'MENU' && (
                <div className="flex flex-col items-center justify-center h-full bg-slate-900 bg-[url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
                    <div className="bg-black/60 p-10 rounded-2xl backdrop-blur-sm text-center border border-white/10 relative">
                        <h1 className="text-6xl font-serif mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 drop-shadow-lg">MATH SPIRE</h1>
                        <p className="text-xl text-gray-300 mb-8 font-light">Climb the tower. Solve the equations.</p>
                        <button 
                            onClick={startGame}
                            className="bg-red-700 hover:bg-red-600 text-white font-bold py-4 px-12 rounded-full shadow-[0_0_20px_rgba(185,28,28,0.5)] transition-all hover:scale-105 flex items-center gap-3 mx-auto text-xl cursor-pointer"
                        >
                            <Play fill="white" /> Start Journey
                        </button>
                    </div>

                    {/* Dev Mode Trigger Button */}
                    <button 
                        onClick={() => setIsDevOpen(true)}
                        className="absolute bottom-6 right-6 p-3 bg-black/40 text-slate-500 hover:text-white hover:bg-black/60 rounded-full transition-all backdrop-blur-sm border border-transparent hover:border-slate-500 cursor-pointer"
                        title="Dev Mode"
                    >
                        <Wrench size={24} />
                    </button>
                </div>
            )}

            {gameState.screen === 'MAP' && (
                <>
                    <GameMap 
                        key={`map-tier-${gameState.tier}`}
                        mapNodes={gameState.map} 
                        currentNodeId={gameState.currentMapNodeId}
                        onNodeSelect={handleNodeSelect}
                        godMode={devGodMode}
                    />
                    {/* Map Screen Dev Mode Trigger */}
                    <button 
                        onClick={() => setIsDevOpen(true)}
                        className="absolute top-6 right-6 p-3 bg-black/40 text-slate-500 hover:text-white hover:bg-black/60 rounded-full transition-all backdrop-blur-sm border border-transparent hover:border-slate-500 z-50 cursor-pointer"
                        title="Dev Mode"
                    >
                        <Wrench size={24} />
                    </button>
                </>
            )}

            {gameState.screen === 'COMBAT' && (
                <Combat 
                    player={gameState.player}
                    enemies={gameState.currentEnemies}
                    onVictory={handleCombatVictory}
                    onDefeat={handleCombatDefeat}
                    showTutorial={!gameState.tutorialSeen || (gameState.tier === 2 && !gameState.poisonTutorialSeen)}
                    tutorialType={!gameState.tutorialSeen ? 'intro' : 'poison'}
                    onTutorialComplete={handleTutorialComplete}
                    tier={gameState.tier}
                />
            )}

            {gameState.screen === 'EVENT' && (
                <EventRoom onComplete={handleEventComplete} />
            )}

            {gameState.screen === 'REWARD' && (
                <CardReward 
                    key={pendingRewards} // Force re-mount to refresh cards when reward count changes
                    onSelect={handleCardRewardSelect} 
                    onRestOption={handleRestOption}
                    type={nodeType === 'rest' ? 'rest' : 'combat'} 
                    playerDeck={gameState.player.deck}
                    playerGold={gameState.player.gold}
                    showTutorial={!rewardTutorialSeen && nodeType !== 'rest'}
                    onTutorialClose={() => setRewardTutorialSeen(true)}
                />
            )}

            {gameState.screen === 'TIER_TRANSITION' && (
                <TierTransition onContinue={handleStartTierTwo} />
            )}

            {gameState.screen === 'GAME_OVER' && (
                <div className="flex flex-col items-center justify-center h-full bg-red-950/90 text-center">
                    <h2 className="text-6xl font-serif text-red-500 mb-4">DEFEAT</h2>
                    <p className="text-2xl text-red-200 mb-8">The numbers were too strong.</p>
                    <button 
                        onClick={() => setGameState(INITIAL_STATE)}
                        className="bg-white text-red-900 font-bold py-3 px-8 rounded hover:bg-gray-200 flex items-center gap-2 cursor-pointer"
                    >
                       <RotateCw /> Try Again
                    </button>
                </div>
            )}

            {gameState.screen === 'VICTORY' && (
                <div className="flex flex-col items-center justify-center h-full bg-slate-900 bg-[url('https://images.unsplash.com/photo-1533240332313-0dbdd3199061?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center text-center">
                    <div className="bg-black/80 p-12 rounded-2xl backdrop-blur-md border-2 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.5)] flex flex-col items-center">
                        <Trophy size={80} className="text-yellow-400 mb-6 animate-bounce-slow" />
                        <h2 className="text-6xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 mb-6">VICTORY!</h2>
                        <p className="text-2xl text-slate-200 mb-2">You have conquered Tier {gameState.tier}!</p>
                        <p className="text-xl text-amber-200 mb-10 font-light italic">The Spire remains infinite...</p>
                        
                        <button 
                            onClick={() => setGameState(INITIAL_STATE)}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-3 mx-auto text-xl cursor-pointer"
                        >
                           <RotateCw /> Play Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
