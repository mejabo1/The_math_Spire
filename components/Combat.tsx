
import React, { useState, useEffect, useRef } from 'react';
import { Player, Enemy, Card as CardType } from '../types';
import { CardComponent } from './Card';
import { EnemyComponent } from './Enemy';
import { PlayerComponent } from './Player';
import { MathModal } from './MathModal';
import { TutorialModal } from './TutorialModal';
import { generateProblem, MathProblem } from '../utils/mathGenerator';
import { BOSS_PUNS, BOSS_ATTACK_TAUNTS, drawCards, getEffectTargetType } from '../utils/combatUtils';
import { Zap, RotateCcw, ScrollText, Shield as ShieldIcon, Target, Coins, Hand } from 'lucide-react';
import { HAND_SIZE } from '../constants';

interface CombatProps {
  player: Player;
  enemies: Enemy[];
  onVictory: (remainingHp: number) => void;
  onDefeat: () => void;
  showTutorial: boolean;
  onTutorialComplete: () => void;
  backgroundImage?: string;
  tier?: number;
  tutorialType?: 'intro' | 'poison';
}

type TurnPhase = 'PLAYER' | 'TARGETING' | 'MATH_CHALLENGE' | 'HAND_SELECTION' | 'ENEMY_ANIMATING' | 'ENEMY' | 'END' | 'TRANSITION';

interface VisualEffect {
    id: number;
    text: string | React.ReactNode;
    type: 'damage' | 'block' | 'info';
    x: number; 
    y: number;
    targetId: string | 'player';
}

export const Combat: React.FC<CombatProps> = ({ 
    player: initialPlayer, 
    enemies: initialEnemies, 
    onVictory, 
    onDefeat,
    showTutorial,
    onTutorialComplete,
    tier = 1,
    tutorialType = 'intro'
}) => {
  const [player, setPlayer] = useState<Player>(initialPlayer);
  const [enemies, setEnemies] = useState<Enemy[]>(initialEnemies);
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('TRANSITION');
  
  // Math & Targeting State
  const [pendingCard, setPendingCard] = useState<CardType | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [activeProblem, setActiveProblem] = useState<MathProblem | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Hand Selection State (Exhausting/Modifying)
  const [handSelectionEffect, setHandSelectionEffect] = useState<'exhaust_draw_1' | 'exhaust_draw_2' | 'damage_exhaust' | 'reduce_cost' | null>(null);
  
  // Turn based buffs
  const [turnDamageBonus, setTurnDamageBonus] = useState(0);

  // Battle Log
  const [combatLog, setCombatLog] = useState<string[]>(["Encounter started!"]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Visual Effects State
  const [effects, setEffects] = useState<VisualEffect[]>([]);
  const [playerShake, setPlayerShake] = useState(false);
  const [playerFlash, setPlayerFlash] = useState(false);
  const [playerBlockAnim, setPlayerBlockAnim] = useState(false);
  
  // Track animation state per enemy ID
  const [enemyAnimStates, setEnemyAnimStates] = useState<Record<string, 'idle' | 'attack' | 'hit'>>({});
  const [enemyFlashes, setEnemyFlashes] = useState<Record<string, boolean>>({});
  const [enemyTaunts, setEnemyTaunts] = useState<Record<string, string | null>>({});
  const [bossHitCounter, setBossHitCounter] = useState<Record<string, number>>({});

  const addLog = (message: string) => {
      setCombatLog(prev => [...prev, message]);
  };

  const triggerVfx = (text: string | React.ReactNode, type: 'damage' | 'block' | 'info', targetId: string | 'player') => {
      const id = Date.now() + Math.random();
      let x = 30;
      let y = 30;

      if (targetId !== 'player') {
         x = 60 + Math.random() * 20; 
         y = 30 + Math.random() * 10;
      }
      
      setEffects(prev => [...prev, { id, text, type, x, y, targetId }]);
      setTimeout(() => {
          setEffects(prev => prev.filter(e => e.id !== id));
      }, 1000);
  };

  const triggerPlayerShake = () => {
      setPlayerShake(true);
      setPlayerFlash(true);
      setTimeout(() => { setPlayerShake(false); setPlayerFlash(false); }, 500);
  };

  const triggerEnemyShake = (id: string) => {
      setEnemyAnimStates(prev => ({ ...prev, [id]: 'hit' }));
      setEnemyFlashes(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
          setEnemyAnimStates(prev => ({ ...prev, [id]: 'idle' }));
          setEnemyFlashes(prev => ({ ...prev, [id]: false }));
      }, 500);
  };

  const showEnemyTaunt = (enemyId: string, taunt: string) => {
      setEnemyTaunts(prev => ({ ...prev, [enemyId]: taunt }));
      setTimeout(() => {
          setEnemyTaunts(prev => ({ ...prev, [enemyId]: null }));
      }, 2500);
  };

  // Auto scroll log
  useEffect(() => {
    if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [combatLog]);

  // Initialize Combat
  useEffect(() => {
    startTurn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTurn = () => {
    setTurnPhase('TRANSITION');
    setTurnDamageBonus(0);
    
    addLog("--- Player Turn ---");
    
    // Process Poison Damage before draw
    setPlayer(prev => {
        let currentHp = prev.currentHp;
        let poison = prev.poison;

        if (poison > 0) {
            addLog(`Poison deals ${poison} damage!`);
            currentHp -= poison;
            triggerVfx(`${poison} Poison`, "damage", "player");
            triggerPlayerShake();
            poison = Math.max(0, poison - 1); // Decrease poison level
        }

        const { deck, discard, hand } = drawCards(prev.drawPile, prev.discardPile, HAND_SIZE, () => addLog("Deck shuffled."));
        
        return {
            ...prev,
            currentHp,
            poison,
            energy: prev.maxEnergy,
            block: 0,
            drawPile: deck,
            discardPile: [...discard, ...prev.hand],
            hand: hand
        };
    });
    setTurnPhase('PLAYER');
  };

  const handleHandCardClick = (targetCard: CardType) => {
      if (turnPhase !== 'HAND_SELECTION' || !pendingCard || !handSelectionEffect) return;
      if (targetCard.id === pendingCard.id) {
          triggerVfx("Invalid Target", "info", "player");
          return;
      }
      if (handSelectionEffect === 'exhaust_draw_1' || handSelectionEffect === 'exhaust_draw_2') {
          const drawCount = handSelectionEffect === 'exhaust_draw_2' ? 2 : 1;
          setPlayer(p => {
              const remainingHand = p.hand.filter(c => c.id !== targetCard.id);
              const { deck, discard, hand } = drawCards(p.drawPile, p.discardPile, drawCount, () => addLog("Deck shuffled."));
              triggerVfx("Exhausted!", "info", "player");
              triggerVfx(`Draw ${drawCount}`, "info", "player");
              return {
                  ...p,
                  hand: [...remainingHand, ...hand],
                  drawPile: deck,
                  discardPile: discard
              };
          });
      } else if (handSelectionEffect === 'reduce_cost') {
          setPlayer(p => ({
              ...p,
              hand: p.hand.map(c => c.id === targetCard.id ? { ...c, cost: Math.max(0, c.cost - 1) } : c)
          }));
          triggerVfx("Cost Reduced", "info", "player");
      } else if (handSelectionEffect === 'damage_exhaust') {
           setPlayer(p => ({
               ...p,
               hand: p.hand.filter(c => c.id !== targetCard.id)
           }));
           triggerVfx("Exhausted!", "info", "player");
           if (targetId) dealDamage(targetCard.cost + turnDamageBonus, targetId, true);
      }
      finalizeCardPlay(pendingCard);
  };

  const handleCardClick = (card: CardType) => {
      if (showTutorial) return; 
      if (turnPhase === 'HAND_SELECTION') {
          handleHandCardClick(card);
          return;
      }
      if (player.energy < card.cost) {
          triggerVfx("No Energy!", "info", "player");
          return;
      }
      const targetType = getEffectTargetType(card.effectId);
      const livingEnemies = enemies.filter(e => e.currentHp > 0);
      
      if (targetType === 'enemy' && livingEnemies.length > 1) {
          setPendingCard(card);
          setTurnPhase('TARGETING');
          addLog("Select a target...");
      } else {
          setPendingCard(card);
          if (targetType === 'enemy' && livingEnemies.length === 1) setTargetId(livingEnemies[0].id);
          else setTargetId(null);
          // Pass current tier to math generator
          setActiveProblem(generateProblem(card.mathType, tier));
          setTurnPhase('MATH_CHALLENGE');
      }
  };

  const handleEnemyClick = (enemy: Enemy) => {
      if (showTutorial) return;
      if (turnPhase === 'TARGETING' && enemy.currentHp > 0) {
          setTargetId(enemy.id);
          setActiveProblem(generateProblem(pendingCard?.mathType, tier));
          setTurnPhase('MATH_CHALLENGE');
      }
  };

  const handleMathAnswer = (correct: boolean) => {
      if (pendingCard) {
          if (correct) {
              playCard(pendingCard, targetId);
          } else {
              setPlayer(p => {
                  const isPopQuiz = pendingCard.name === 'Pop Quiz';
                  return {
                     ...p,
                     energy: p.energy - pendingCard.cost,
                     hand: p.hand.filter(c => c.id !== pendingCard.id),
                     discardPile: isPopQuiz ? p.discardPile : [...p.discardPile, pendingCard]
                  };
              });
              addLog("Calculation Failed! Energy lost.");
              triggerVfx("Fizzle...", "info", "player");
              if (pendingCard.name === 'Order of Ops') {
                  triggerVfx("-2 Block", "damage", "player");
                  setPlayer(p => ({...p, block: Math.max(0, p.block - 2)}));
              }
              setPendingCard(null);
              setTargetId(null);
              setActiveProblem(null);
              setTurnPhase('PLAYER');
          }
      }
  };

  const playCard = (card: CardType, targetId: string | null) => {
    setPlayer(p => ({ ...p, energy: p.energy - card.cost }));
    if (['exhaust_1_draw_1', 'exhaust_1_draw_2', 'reduce_cost', 'damage_exhaust'].includes(card.effectId)) {
        if (card.effectId === 'exhaust_1_draw_1') setHandSelectionEffect('exhaust_draw_1');
        else if (card.effectId === 'exhaust_1_draw_2') setHandSelectionEffect('exhaust_draw_2');
        else if (card.effectId === 'reduce_cost') setHandSelectionEffect('reduce_cost');
        else if (card.effectId === 'damage_exhaust') setHandSelectionEffect('damage_exhaust');
        setTurnPhase('HAND_SELECTION');
        return;
    }
    resolveCardEffect(card, targetId);
    finalizeCardPlay(card);
  };

  const finalizeCardPlay = (card: CardType) => {
      setPlayer(p => ({
        ...p,
        hand: p.hand.filter(c => c.id !== card.id),
        discardPile: [...p.discardPile, card]
    }));
    setPendingCard(null);
    setTargetId(null);
    setActiveProblem(null);
    setHandSelectionEffect(null);
    setTurnPhase('PLAYER');
  };

  const resolveCardEffect = (card: CardType, targetId: string | null) => {
    let damage = card.value + turnDamageBonus;
    let block = card.value;
    const getTarget = () => enemies.find(e => e.id === targetId);
    switch (card.effectId) {
        // ... (Effect resolution logic remains largely same, just abbreviated for xml context limits if necessary, but full logic below) ...
        case 'chaos_hand':
             setPlayer(p => {
                 const newHand = [...p.hand].sort(() => Math.random() - 0.5);
                 const reducedHand = newHand.map(c => ({ ...c, cost: Math.max(0, c.cost - 1) }));
                 triggerVfx("Chaos!", "info", "player");
                 return { ...p, hand: reducedHand };
             });
             return;
        case 'gain_energy':
            setPlayer(p => ({ ...p, energy: p.energy + card.value }));
            triggerVfx(`+${card.value} Energy`, "info", "player");
            return;
        case 'block_hand_size':
            setPlayer(p => {
                const amt = Math.max(0, p.hand.length - 1);
                triggerVfx(`+${amt} Block`, "block", "player");
                return { ...p, block: p.block + amt };
            });
            return;
        case 'damage_x_draw':
            setPlayer(p => {
                const amt = Math.max(0, p.hand.length - 1) + turnDamageBonus;
                if (targetId) dealDamage(amt, targetId, true);
                const { deck, discard, hand } = drawCards(p.drawPile, p.discardPile, 1, () => addLog("Deck shuffled."));
                triggerVfx("Draw 1", "info", "player");
                return { ...p, drawPile: deck, discardPile: discard, hand: [...p.hand, ...hand] };
            });
            return;
        case 'block_enemy':
            const target = getTarget();
            if (target) {
                const amt = target.currentHp;
                triggerVfx(`+${amt} Block`, "block", "player");
                setPlayer(p => ({ ...p, block: p.block + amt }));
            }
            return;
        case 'buff_damage':
            setTurnDamageBonus(prev => prev + card.value);
            triggerVfx(`+${card.value} Dmg Up`, "info", "player");
            return;
        case 'damage_x':
            damage = (card.value * player.hand.length) + turnDamageBonus;
            break;
        case 'damage_equal_to_block':
            damage = player.block + turnDamageBonus;
            triggerVfx(`${damage} Block Slam!`, "info", "player");
            break;
        case 'damage_all':
             enemies.forEach(e => { if (e.currentHp > 0) dealDamage(damage, e.id, true); });
             return; 
        case 'draw_cards':
            setPlayer(p => {
                const { deck, discard, hand } = drawCards(p.drawPile, p.discardPile, card.value, () => addLog("Deck shuffled."));
                triggerVfx("Draw Cards", "info", "player");
                return { ...p, drawPile: deck, discardPile: discard, hand: [...p.hand, ...hand] };
            });
            break;
        case 'damage_prime':
            const t = getTarget();
             const isPrime = (num: number) => {
                if (num <= 1) return false;
                for(let i = 2, s = Math.sqrt(num); i <= s; i++) if(num % i === 0) return false; 
                return true;
            }
            if (t && isPrime(t.currentHp)) { damage *= 2; triggerVfx("CRITICAL!", "damage", t.id); }
            break;
        case 'multi_hit':
             damage = card.value + turnDamageBonus;
             if (targetId) {
                setTimeout(() => dealDamage(damage, targetId, true), 100);
                setTimeout(() => dealDamage(damage, targetId, true), 300);
                setTimeout(() => dealDamage(damage, targetId, true), 500);
             }
             return;
        case 'multi_hit_2':
             damage = card.value + turnDamageBonus;
             if (targetId) {
                setTimeout(() => dealDamage(damage, targetId, true), 100);
                setTimeout(() => dealDamage(damage, targetId, true), 400);
             }
             return;
        case 'swap_stats':
             setPlayer(p => {
                const newBlock = Math.min(10, p.currentHp); 
                const newHp = Math.min(p.maxHp, Math.max(1, p.block));
                triggerVfx("Swap!", "info", "player");
                return { ...p, currentHp: newHp, block: newBlock };
             });
             return;
        case 'block_slam':
            setPlayer(p => {
                const newBlock = p.block + block;
                triggerVfx(<ShieldIcon size={40} className="text-blue-400 fill-blue-900/50" />, "block", "player");
                if (targetId) dealDamage(newBlock + turnDamageBonus, targetId, true);
                return { ...p, block: newBlock };
            });
            return;
        case 'reckless_attack':
            setPlayer(p => {
                triggerVfx(`-1`, "damage", "player");
                triggerPlayerShake();
                return { ...p, currentHp: Math.max(1, p.currentHp - 1) };
            });
            break;
        case 'lifesteal':
             setPlayer(p => {
                 triggerVfx(`+1`, "info", "player");
                 return { ...p, currentHp: Math.min(p.maxHp, p.currentHp + 1) };
             });
             break;
        case 'block_draw':
             setPlayer(p => {
                const { deck, discard, hand } = drawCards(p.drawPile, p.discardPile, 1, () => addLog("Deck shuffled."));
                triggerVfx("Draw 1", "info", "player");
                triggerVfx(`+${block}`, "block", "player");
                return { ...p, block: p.block + block, drawPile: deck, discardPile: discard, hand: [...p.hand, ...hand] };
             });
             return;
        case 'upgrade_hand':
             setPlayer(p => {
                const otherCards = p.hand.filter(c => c.id !== card.id);
                let newHand = [...p.hand];
                if (otherCards.length > 0) {
                    const randomCard = otherCards[Math.floor(Math.random() * otherCards.length)];
                    const upgradedCard = { ...randomCard, value: randomCard.value + 3, name: randomCard.name + "+" };
                    triggerVfx("Card Upgraded!", "info", "player");
                    newHand = p.hand.map(c => c.id === randomCard.id ? upgradedCard : c);
                }
                triggerVfx(`+${block}`, "block", "player");
                return { ...p, block: p.block + block, hand: newHand };
             });
             return;
        case 'block_damage':
             setPlayer(p => { triggerVfx(`+1`, "block", "player"); return { ...p, block: p.block + 1 }; });
             damage = 2 + turnDamageBonus; 
             if (targetId) dealDamage(damage, targetId, true);
             return;
        case 'damage_discard':
             if (targetId) dealDamage(damage, targetId, true);
             setPlayer(p => {
                 const otherCards = p.hand.filter(c => c.id !== card.id);
                 if (otherCards.length === 0) return p;
                 const randomIdx = Math.floor(Math.random() * otherCards.length);
                 const toDiscard = otherCards[randomIdx];
                 triggerVfx("Discarded!", "info", "player");
                 return { ...p, hand: p.hand.filter(c => c.id !== toDiscard.id), discardPile: [...p.discardPile, toDiscard] };
             });
             return;
    }
    if (getEffectTargetType(card.effectId) === 'enemy' && targetId) dealDamage(damage, targetId, true); 
    else if (card.type === 'skill' && (card.effectId === 'gain_block' || card.effectId === 'gain_block_heavy')) {
        setPlayer(p => ({ ...p, block: p.block + block }));
        triggerVfx(<ShieldIcon size={40} className="text-blue-400 fill-blue-900/50" />, "block", "player");
        triggerVfx(`+${block}`, "info", "player");
    }
  };

  const dealDamage = (amount: number, targetId: string, isPlayerSource: boolean) => {
    if (isPlayerSource) {
        setEnemies(prev => prev.map(e => {
            if (e.id === targetId) {
                const blocked = Math.min(e.block, amount);
                const unblocked = amount - blocked;
                const newHp = e.currentHp - unblocked;
                
                if (blocked > 0) {
                    triggerVfx(`Blocked ${blocked}`, "block", e.id);
                }
                if (unblocked > 0) {
                    triggerVfx(unblocked.toString(), "damage", e.id);
                } else if (amount > 0 && unblocked === 0) {
                    triggerVfx("Blocked!", "block", e.id);
                }

                triggerEnemyShake(e.id);
                
                // Boss Taunt Logic
                if (e.id.includes('boss')) {
                    const currentHitCount = (bossHitCounter[e.id] || 0) + 1;
                    setBossHitCounter(prev => ({ ...prev, [e.id]: currentHitCount }));

                    let taunt: string | null = null;
                    if (newHp > 0 && newHp < 10) {
                        taunt = "What manner of creature are you!?";
                    } else if (currentHitCount % 3 === 0) {
                        taunt = BOSS_PUNS[Math.floor(Math.random() * BOSS_PUNS.length)];
                    }

                    if (taunt) showEnemyTaunt(e.id, taunt);
                }

                return { ...e, block: e.block - blocked, currentHp: newHp };
            }
            return e;
        }));
    } else {
        setPlayer(prev => {
            const blocked = Math.min(prev.block, amount);
            const unblocked = amount - blocked;
            if (blocked > 0) {
                triggerVfx(`Blocked ${blocked}`, "block", "player");
                setPlayerBlockAnim(true);
                setTimeout(() => setPlayerBlockAnim(false), 600); 
            }
            if (unblocked > 0) { triggerVfx(unblocked.toString(), "damage", "player"); triggerPlayerShake(); }
            else { triggerVfx("Blocked!", "block", "player"); }
            return { ...prev, block: prev.block - blocked, currentHp: prev.currentHp - unblocked };
        });
    }
  };

  useEffect(() => {
    if (enemies.length > 0 && enemies.every(e => e.currentHp <= 0)) {
        setTurnPhase('END');
        addLog(`Victory!`);
        setTimeout(() => onVictory(player.currentHp), 1500);
    }
  }, [enemies, onVictory, player.currentHp]);

  useEffect(() => {
    if (player.currentHp <= 0) { setTurnPhase('END'); onDefeat(); }
  }, [player.currentHp, onDefeat]);

  const endTurn = async () => {
    setTurnPhase('ENEMY_ANIMATING');
    addLog("--- Enemy Turn ---");
    
    // Clear enemy block at the START of the enemy phase
    setEnemies(prev => prev.map(e => ({ ...e, block: 0 })));

    const livingEnemies = enemies.filter(e => e.currentHp > 0);
    for (const enemy of livingEnemies) await processEnemyTurn(enemy);
    setEnemies(prev => prev.map(e => {
        if (e.currentHp > 0) return { ...e, intent: getRandomIntent(e) };
        return e;
    }));
    startTurn();
  };

  const processEnemyTurn = (enemy: Enemy): Promise<void> => {
      return new Promise(resolve => {
        setTimeout(() => {
            const intent = enemy.intent;
            
            if (intent.type === 'attack') {
                if (enemy.id.includes('boss')) {
                    showEnemyTaunt(enemy.id, BOSS_ATTACK_TAUNTS[Math.floor(Math.random() * BOSS_ATTACK_TAUNTS.length)]);
                }
                setEnemyAnimStates(prev => ({ ...prev, [enemy.id]: 'attack' }));
                setTimeout(() => {
                    dealDamage(intent.value, 'player', false); 
                    setEnemyAnimStates(prev => ({ ...prev, [enemy.id]: 'idle' }));
                    resolve();
                }, 500);

            } else if (intent.type === 'drain') {
                // New Vampirism/Drain Logic for Boss 2
                if (enemy.id.includes('boss')) {
                    showEnemyTaunt(enemy.id, "I hunger for your integers!");
                }
                setEnemyAnimStates(prev => ({ ...prev, [enemy.id]: 'attack' }));
                
                setTimeout(() => {
                    setPlayer(prev => {
                        const blocked = Math.min(prev.block, intent.value);
                        const unblocked = intent.value - blocked;
                        
                        // Handle Block VFX
                        if (blocked > 0) {
                            triggerVfx(`Blocked ${blocked}`, "block", "player");
                            setPlayerBlockAnim(true);
                            setTimeout(() => setPlayerBlockAnim(false), 600);
                        }

                        // Damage Logic
                        if (unblocked > 0) {
                            triggerVfx(unblocked.toString(), "damage", "player");
                            triggerPlayerShake();
                            
                            // HEAL THE ENEMY
                            setEnemies(currEnemies => currEnemies.map(e => {
                                if (e.id === enemy.id) {
                                    const healAmt = unblocked;
                                    triggerVfx(`+${healAmt}`, "info", e.id);
                                    addLog(`${e.name} drains ${healAmt} HP!`);
                                    return { ...e, currentHp: Math.min(e.maxHp, e.currentHp + healAmt) };
                                }
                                return e;
                            }));
                        } else {
                            triggerVfx("Blocked!", "block", "player");
                        }
                        return { ...prev, block: prev.block - blocked, currentHp: prev.currentHp - unblocked };
                    });

                    setEnemyAnimStates(prev => ({ ...prev, [enemy.id]: 'idle' }));
                    resolve();
                }, 500);

            } else if (intent.type === 'poison') {
                // Poison Attack Logic
                setEnemyAnimStates(prev => ({ ...prev, [enemy.id]: 'attack' }));
                setTimeout(() => {
                    // Custom damage deal to check if unblocked
                    setPlayer(prev => {
                         const blocked = Math.min(prev.block, intent.value);
                         const unblocked = intent.value - blocked;
                         
                         if (blocked > 0) {
                            triggerVfx(`Blocked ${blocked}`, "block", "player");
                            setPlayerBlockAnim(true);
                            setTimeout(() => setPlayerBlockAnim(false), 600);
                         }

                         if (unblocked > 0) {
                             triggerVfx(unblocked.toString(), "damage", "player");
                             triggerPlayerShake();
                             
                             // APPLY POISON if damage went through
                             addLog("Poisoned!");
                             triggerVfx("POISON!", "info", "player");
                             return { ...prev, block: prev.block - blocked, currentHp: prev.currentHp - unblocked, poison: 3 }; 
                         } else {
                             triggerVfx("Blocked!", "block", "player");
                             addLog("Poison blocked!");
                         }
                         return { ...prev, block: prev.block - blocked, currentHp: prev.currentHp - unblocked };
                    });

                    setEnemyAnimStates(prev => ({ ...prev, [enemy.id]: 'idle' }));
                    resolve();
                }, 500);

            } else if (intent.type === 'defend') { 
                addLog(`${enemy.name} gains ${intent.value} block.`); 
                triggerVfx(`+${intent.value} Block`, "block", enemy.id);
                setEnemies(prev => prev.map(e => e.id === enemy.id ? { ...e, block: e.block + intent.value } : e));
                setTimeout(resolve, 500);
            } else {
                setTimeout(resolve, 500);
            }
        }, 600);
      });
  };

  const getRandomIntent = (enemy?: Enemy) => {
      // Tier 1 Boss Logic (Poly-Gone)
      if (enemy && enemy.id.includes('boss-geometry')) {
          const r = Math.random();
          if (r > 0.5) return { type: 'attack' as const, value: 5 + tier }; 
          return { type: 'defend' as const, value: 5 + tier };
      }

      // Tier 2 Boss Logic (Prime Predator) - Vampirism/Drain
      if (enemy && enemy.id.includes('boss-predator')) {
          const r = Math.random();
          if (r < 0.4) return { type: 'drain' as const, value: 5 + tier }; // 40% chance to Life Drain
          if (r < 0.7) return { type: 'attack' as const, value: 7 + tier }; // 30% Heavy Attack
          return { type: 'defend' as const, value: 8 }; // 30% Heavy Defend
      }
      
      // Poison Enemy Logic
      if (enemy && enemy.id.includes('venomous')) {
          const r = Math.random();
          if (r < 0.4) return { type: 'poison' as const, value: 2 }; // 40% chance to poison
          if (r < 0.7) return { type: 'attack' as const, value: 4 + tier };
          return { type: 'defend' as const, value: 4 };
      }

      // Default Logic
      const r = Math.random();
      if (r > 0.5) return { type: 'attack' as const, value: Math.floor(Math.random() * 2) + 1 + tier };
      return { type: 'defend' as const, value: 3 + Math.floor(tier/2) };
  };

  return (
    <div className="h-full flex flex-row relative overflow-hidden bg-slate-900 select-none">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black"></div>

      {showTutorial && <TutorialModal key={tutorialType} onClose={onTutorialComplete} type={tutorialType} />}

      {turnPhase === 'MATH_CHALLENGE' && activeProblem && pendingCard && (
          <MathModal 
            problem={activeProblem} 
            cardName={pendingCard.name}
            onAnswer={handleMathAnswer}
          />
      )}

      {turnPhase === 'TARGETING' && (
          <div className="absolute top-20 left-0 w-full text-center z-50 pointer-events-none">
              <div className="inline-block bg-black/70 px-8 py-3 rounded-full border-2 border-red-500 animate-pulse">
                  <span className="text-2xl font-bold text-red-100 flex items-center gap-3">
                      <Target className="animate-spin-slow" /> SELECT TARGET
                  </span>
              </div>
          </div>
      )}

      {turnPhase === 'HAND_SELECTION' && (
           <div className="absolute top-20 left-0 w-full text-center z-50 pointer-events-none">
              <div className="inline-block bg-black/70 px-8 py-3 rounded-full border-2 border-amber-500 animate-pulse">
                  <span className="text-2xl font-bold text-amber-100 flex items-center gap-3">
                      <Hand className="animate-bounce" /> 
                      {handSelectionEffect === 'exhaust_draw_1' || handSelectionEffect === 'exhaust_draw_2' ? "SELECT CARD TO EXHAUST" : 
                       handSelectionEffect === 'reduce_cost' ? "SELECT CARD TO MODIFY" : 
                       "SELECT CARD TO SACRIFICE"}
                  </span>
              </div>
          </div>
      )}

      {effects.map(effect => (
          <div 
            key={effect.id}
            className={`absolute z-50 pointer-events-none font-bold text-2xl md:text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] animate-float-damage
                ${effect.type === 'damage' ? 'text-red-500' : effect.type === 'block' ? 'text-blue-400' : 'text-yellow-300'}`}
            style={{ left: `${effect.x}%`, top: `${effect.y}%` }}
          >
              {effect.text}
          </div>
      ))}
      
      {playerFlash && <div className="absolute inset-0 bg-red-500/20 z-40 animate-flash-hit pointer-events-none" />}

      {/* ARENA */}
      <div className="flex-1 flex flex-col justify-between p-2 md:p-4 relative z-10">
        
        <div className="flex-1 flex items-center justify-between px-4 md:px-12 relative pt-4 md:pt-10">
            <div className={`transition-transform duration-100 ${playerShake ? 'translate-x-[-10px] grayscale' : ''}`}>
                 <div className="relative">
                      {turnDamageBonus > 0 && (
                          <div className="absolute -top-16 md:-top-20 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce-slow">
                              <div className="bg-red-600 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full border-2 border-red-400 font-bold text-[10px] md:text-xs shadow-lg mb-1">
                                  +{turnDamageBonus} DMG
                              </div>
                          </div>
                      )}
                      <PlayerComponent player={player} isBlocking={playerBlockAnim} />
                 </div>
            </div>

            <div className="flex items-end justify-center gap-1 md:gap-4 min-w-[150px] md:min-w-[300px]">
                {enemies.filter(e => e.currentHp > 0).map(enemy => (
                    <div key={enemy.id} className="relative">
                         {enemyFlashes[enemy.id] && <div className="absolute inset-0 w-full h-full bg-white/50 z-20 animate-slash rotate-45 scale-150" style={{ background: 'linear-gradient(transparent, white, transparent)'}}></div>}
                         <EnemyComponent 
                            enemy={enemy} 
                            animationState={enemyAnimStates[enemy.id]} 
                            isTargetable={turnPhase === 'TARGETING'}
                            onClick={() => handleEnemyClick(enemy)}
                            taunt={enemyTaunts[enemy.id]}
                        />
                    </div>
                ))}
            </div>
        </div>

        {/* HAND */}
        <div className="h-[30%] min-h-[200px] max-h-[280px] flex flex-col justify-end relative z-20">
            <div className="absolute left-2 md:left-10 top-0 z-20 flex flex-col items-center gap-2">
                <div className="relative group">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 shadow-[0_0_20px_rgba(245,158,11,0.6)] flex items-center justify-center border-4 border-amber-200 relative overflow-hidden transition-transform group-hover:scale-105">
                        <Zap className="absolute w-[120%] h-[120%] text-yellow-900/20 fill-yellow-900/20 rotate-12 -z-0" />
                        <span className="text-lg md:text-3xl font-black text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] z-10 relative leading-none mt-1">
                            {player.energy}/{player.maxEnergy}
                        </span>
                    </div>
                </div>
                <div className="bg-black/60 px-2 py-1 rounded-full border border-yellow-500/30 text-yellow-400 flex items-center gap-1 text-xs md:text-sm font-bold">
                    <Coins size={14} /> {player.gold}
                </div>
            </div>

            <div className="absolute left-2 md:left-4 bottom-2 md:bottom-4 text-[10px] md:text-xs font-bold text-slate-500 flex flex-col gap-1 z-30">
                <div className="bg-slate-800 px-2 py-1 rounded border border-slate-700 cursor-help hover:border-amber-500 hover:text-slate-300 transition-colors relative">
                    Draw: {player.drawPile.length}
                </div>
                <div className="bg-slate-800 px-2 py-1 rounded border border-slate-700 cursor-help hover:border-amber-500 hover:text-slate-300 transition-colors relative">
                    Discard: {player.discardPile.length}
                </div>
            </div>

            <div className="absolute right-2 md:right-4 top-0 z-20">
                <button 
                    disabled={turnPhase !== 'PLAYER' || showTutorial}
                    onClick={endTurn}
                    className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-2 px-4 md:py-3 md:px-8 rounded-full shadow-lg border-2 border-amber-400 disabled:border-slate-600 transition-all active:scale-95 flex items-center gap-2 hover:shadow-amber-500/20 text-xs md:text-base cursor-pointer"
                >
                    End Turn <RotateCcw size={16} />
                </button>
            </div>

            <div className="flex justify-center items-end w-full px-4 md:px-10 pb-2 md:pb-4 h-full overflow-visible">
                {player.hand.map((card, idx) => {
                    const totalCards = player.hand.length;
                    const middleIndex = (totalCards - 1) / 2;
                    const offset = idx - middleIndex;
                    const rotation = offset * 5; 
                    const translateY = Math.abs(offset) * 10; 
                    const isSelected = pendingCard?.id === card.id;
                    const isHovered = hoveredCardId === card.id;
                    const squeeze = totalCards > 5 ? -45 : -25;
                    const style = {
                        marginLeft: idx === 0 ? 0 : `${squeeze}px`,
                        zIndex: isSelected ? 50 : (isHovered ? 40 : idx),
                        transform: isSelected 
                            ? 'translateY(-120px) scale(1.1) rotate(0deg)' 
                            : isHovered 
                                ? 'translateY(-100px) scale(1.1) rotate(0deg)' 
                                : `rotate(${rotation}deg) translateY(${translateY}px)`,
                        transition: 'transform 0.2s cubic-bezier(0.1, 0.7, 0.1, 1), margin 0.2s',
                    };

                    return (
                        <div key={card.id} style={style} onMouseEnter={() => setHoveredCardId(card.id)} onMouseLeave={() => setHoveredCardId(null)} className="relative origin-bottom shrink-0">
                            <div className="animate-card-deal" style={{ animationDelay: `${idx * 150}ms` }}>
                                <CardComponent 
                                    card={card} 
                                    onClick={handleCardClick}
                                    disabled={turnPhase !== 'PLAYER' && turnPhase !== 'TARGETING' && turnPhase !== 'HAND_SELECTION'} 
                                    playable={turnPhase === 'HAND_SELECTION' ? (pendingCard?.id !== card.id) : player.energy >= card.cost}
                                    noAnim={true} 
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      {/* LOG */}
      <div className="hidden lg:flex w-64 xl:w-72 h-full bg-slate-950/80 border-l border-slate-800 p-4 flex-col backdrop-blur-md relative z-10 shrink-0">
          <div className="flex items-center gap-2 mb-4 text-amber-500 border-b border-slate-800 pb-2">
              <ScrollText size={20} />
              <h3 className="font-serif font-bold uppercase tracking-wider text-sm">Combat Log</h3>
          </div>
          <div ref={logContainerRef} className="flex-1 overflow-y-auto space-y-3 text-sm text-slate-400 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {combatLog.map((log, i) => (
                  <div key={i} className="animate-fade-in border-l-2 border-slate-700 pl-2 py-1 leading-snug">{log}</div>
              ))}
          </div>
      </div>
    </div>
  );
};
