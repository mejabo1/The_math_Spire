

import React, { useState, useEffect, useRef } from 'react';
import { Player, Enemy, Card as CardType } from '../types';
import { CardComponent } from './Card';
import { EnemyComponent } from './Enemy';
import { PlayerComponent } from './Player';
import { MathModal } from './MathModal';
import { TutorialModal } from './TutorialModal';
import { generateProblem, MathProblem } from '../utils/mathGenerator';
import { BOSS_PUNS, BOSS_ATTACK_TAUNTS, drawCards, getEffectTargetType } from '../utils/combatUtils';
import { Zap, RotateCcw, ScrollText, Shield as ShieldIcon, Target, Coins, Hand, FileText } from 'lucide-react';
import { HAND_SIZE, SVG_BOSS_INFINITE_TRUE_FORM, SVG_TEACHER } from '../constants';

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

  // Special Boss Event State
  const [hasGremillionRevived, setHasGremillionRevived] = useState(false);
  const [showGremillion, setShowGremillion] = useState(false);

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

  // ... (handleHandCardClick, handleCardClick, handleEnemyClick, handleMathAnswer, handleMathCancel, playCard, finalizeCardPlay, resolveCardEffect - Unchanged)
  
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

  const handleMathCancel = () => {
    setPendingCard(null);
    setTargetId(null);
    setActiveProblem(null);
    setTurnPhase('PLAYER');
    addLog("Casting cancelled.");
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
        case 'heal_player':
             setPlayer(p => {
                triggerVfx(`+${card.value} HP`, "info", "player");
                return { ...p, currentHp: Math.min(p.maxHp, p.currentHp + card.value) };
             });
             break;
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
                // Modified to cap max block from enemy HP at 10 (unless it's Golden Ratio which doubles block)
                const rawAmt = target.currentHp;
                const amt = card.name === 'Golden Ratio' ? player.block : Math.min(10, rawAmt); 
                
                if (card.name === 'Golden Ratio') {
                    triggerVfx(`Block Doubled!`, "block", "player");
                    setPlayer(p => ({...p, block: p.block * 2 }));
                    return;
                }
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
                
                // Infinite Prime Phase Transition Check
                if (tier === 3 && e.id === 'boss-3' && (!e.phase || e.phase === 1) && newHp <= 0) {
                     triggerVfx("INFINITE!", "info", e.id);
                     showEnemyTaunt(e.id, "How can you defeat that which is infinite?");
                     
                     setTimeout(() => {
                         showEnemyTaunt(e.id, "Behold my true form!");
                     }, 2500);

                     return {
                         ...e,
                         currentHp: 70,
                         maxHp: 70,
                         phase: 2,
                         image: SVG_BOSS_INFINITE_TRUE_FORM,
                         name: "The Infinite Prime (True Form)",
                         block: 0
                     };
                }

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
                    if (newHp > 0 && newHp < 10 && (!e.phase || e.phase === 2)) { // Only taunt low HP if in Phase 2 or normal boss
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
            
            let newHp = prev.currentHp - unblocked;

            if (unblocked > 0) {
                // Trigger shake visual
                triggerPlayerShake();
                triggerVfx(unblocked.toString(), "damage", "player");

                // --- SPECIAL EVENT: Mr. Gremillion's Homework Pass ---
                // If player is dying in Tier 3 boss fight and hasn't used the pass yet
                const isFinalBoss = tier === 3 && enemies.some(e => e.id === 'boss-3');
                if (newHp <= 0 && isFinalBoss && !hasGremillionRevived) {
                    // Trigger the save!
                    newHp = prev.maxHp; // Full Heal
                    setHasGremillionRevived(true);
                    setShowGremillion(true);
                    addLog("Mr. Gremillion uses a Homework Pass!");
                    
                    // Hide the overlay after a delay
                    setTimeout(() => setShowGremillion(false), 4000);
                }
            } else {
                 triggerVfx("Blocked!", "block", "player"); 
            }
            
            return { ...prev, block: prev.block - blocked, currentHp: newHp };
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

  // ... (endTurn, processEnemyTurn, getRandomIntent - Unchanged)
  
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
      const lastType = enemy?.intent.type;

      // Tier 1 Boss Logic (Poly-Gone)
      if (enemy && (enemy.id.includes('boss-geometry') || enemy.id === 'boss-1')) {
          if (lastType === 'defend') {
               return { type: 'attack' as const, value: 5 + tier }; 
          }
          const r = Math.random();
          if (r > 0.5) return { type: 'attack' as const, value: 5 + tier }; 
          return { type: 'defend' as const, value: 5 + tier };
      }

      // Tier 2 Boss Logic (Prime Predator) - Vampirism/Drain
      if (enemy && (enemy.id.includes('boss-predator') || enemy.id === 'boss-2')) {
          if (lastType === 'defend') {
              // Can't defend, re-roll between drain (40%) and attack (30%). Normalized: 4/7 vs 3/7.
              const r = Math.random();
              if (r < 0.57) return { type: 'drain' as const, value: 5 + tier };
              return { type: 'attack' as const, value: 7 + tier };
          }

          const r = Math.random();
          if (r < 0.4) return { type: 'drain' as const, value: 5 + tier }; // 40% chance to Life Drain
          if (r < 0.7) return { type: 'attack' as const, value: 7 + tier }; // 30% Heavy Attack
          return { type: 'defend' as const, value: 8 }; // 30% Heavy Defend
      }

      // Tier 3 Mini-Boss: The Limit Guardian - NERFED
      if (enemy && enemy.id.includes('miniboss_guardian')) {
          if (lastType === 'defend') {
              // After defend, heavy attack
              return { type: 'attack' as const, value: 8 }; // Reduced from 12
          }
          // 50/50 Chance to Defend heavy or Attack
          const r = Math.random();
          if (r > 0.5) return { type: 'defend' as const, value: 15 };
          return { type: 'attack' as const, value: 6 }; // Reduced from 9
      }

      // Tier 3 Boss Logic (Infinite Prime) - Relentless Scaling - NERFED
      if (enemy && (enemy.id.includes('boss-infinite') || enemy.id === 'boss-3')) {
           const r = Math.random();
           // Phase 2 Logic (Usually phase is undefined or 1 initially, but updated in dealDamage)
           const isPhase2 = enemy.phase === 2;
           
           if (isPhase2) {
               // More aggressive in Phase 2
               if (lastType === 'defend') return { type: 'attack' as const, value: 12 }; // Reduced from 18
               if (r < 0.1) return { type: 'defend' as const, value: 25 }; 
               return { type: 'attack' as const, value: 8 }; // Reduced from 12
           }

           // Phase 1
           if (lastType === 'defend') return { type: 'attack' as const, value: 10 }; // Reduced from 15
           
           if (r < 0.2) return { type: 'defend' as const, value: 20 }; 
           if (r < 0.6) return { type: 'attack' as const, value: 10 }; // Reduced from 15
           return { type: 'attack' as const, value: 6 }; // Reduced from 8
      }
      
      // Poison Enemy Logic
      if (enemy && enemy.id.includes('venomous')) {
          if (lastType === 'defend') {
               const r = Math.random();
               if (r < 0.57) return { type: 'poison' as const, value: 2 };
               return { type: 'attack' as const, value: 4 + tier };
          }
          const r = Math.random();
          if (r < 0.4) return { type: 'poison' as const, value: 2 }; // 40% chance to poison
          if (r < 0.7) return { type: 'attack' as const, value: 4 + tier };
          return { type: 'defend' as const, value: 4 };
      }

      // Math Mimic Logic (Peek-a-boo pattern)
      if (enemy && enemy.id.includes('math_mimic')) {
          if (lastType === 'defend') {
              // Open up and attack
              return { type: 'attack' as const, value: 8 + tier };
          } else {
              // Close up and defend heavily
              return { type: 'defend' as const, value: 12 };
          }
      }

      // Default Logic
      if (lastType === 'defend') {
           return { type: 'attack' as const, value: Math.floor(Math.random() * 2) + 1 + tier };
      }

      const r = Math.random();
      if (r > 0.5) return { type: 'attack' as const, value: Math.floor(Math.random() * 2) + 1 + tier };
      return { type: 'defend' as const, value: 3 + Math.floor(tier/2) };
  };

  return (
    <div className="h-full flex flex-row relative overflow-hidden bg-slate-900 select-none">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black"></div>

      {showTutorial && <TutorialModal key={tutorialType} onClose={onTutorialComplete} type={tutorialType} />}

      {/* --- MR GREMILLION EVENT OVERLAY --- */}
      {showGremillion && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 animate-fade-in pointer-events-none">
              <div className="relative flex flex-col items-center">
                  <div className="w-48 h-48 md:w-64 md:h-64 animate-bounce-slow relative z-10">
                       <img src={SVG_TEACHER} alt="Mr. Gremillion" className="w-full h-full drop-shadow-2xl" />
                  </div>
                  
                  {/* Speech Bubble */}
                  <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-2xl border-4 border-amber-500 max-w-sm text-center relative mt-4 animate-shake">
                      <p className="text-2xl font-bold font-serif mb-2">"Here! This might help!"</p>
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rotate-45 border-t-4 border-l-4 border-amber-500"></div>
                  </div>

                  {/* Homework Pass Visual */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping-slow opacity-0 animate-[ping_1s_ease-in-out_infinite]">
                      <div className="bg-yellow-200 border-4 border-yellow-600 p-8 rounded-lg rotate-12 shadow-2xl">
                          <div className="flex items-center gap-2 text-yellow-900 font-bold text-3xl uppercase tracking-widest border-b-2 border-yellow-900/50 pb-2 mb-2">
                              <FileText size={32} /> Homework Pass
                          </div>
                          <div className="text-center font-serif text-xl text-yellow-800">
                              Redeem for 1 Full Heal
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {turnPhase === 'MATH_CHALLENGE' && activeProblem && pendingCard && (
          <MathModal 
            problem={activeProblem} 
            cardName={pendingCard.name}
            onAnswer={handleMathAnswer}
            onClose={handleMathCancel}
            tier={tier} // Passed Tier
          />
      )}

      {turnPhase === 'TARGETING' && (
          <div className="absolute top-10 md:top-20 left-0 w-full text-center z-50 pointer-events-none">
              <div className="inline-block bg-black/70 px-4 py-2 md:px-8 md:py-3 rounded-full border-2 border-red-500 animate-pulse">
                  <span className="text-lg md:text-2xl font-bold text-red-100 flex items-center gap-3">
                      <Target className="animate-spin-slow" /> SELECT TARGET
                  </span>
              </div>
          </div>
      )}

      {turnPhase === 'HAND_SELECTION' && (
           <div className="absolute top-10 md:top-20 left-0 w-full text-center z-50 pointer-events-none">
              <div className="inline-block bg-black/70 px-4 py-2 md:px-8 md:py-3 rounded-full border-2 border-amber-500 animate-pulse">
                  <span className="text-lg md:text-2xl font-bold text-amber-100 flex items-center gap-3">
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
            className={`absolute z-50 pointer-events-none font-bold text-xl md:text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] animate-float-damage
                ${effect.type === 'damage' ? 'text-red-500' : effect.type === 'block' ? 'text-blue-400' : 'text-yellow-300'}`}
            style={{ left: `${effect.x}%`, top: `${effect.y}%` }}
          >
              {effect.text}
          </div>
      ))}
      
      {playerFlash && <div className="absolute inset-0 bg-red-500/20 z-40 animate-flash-hit pointer-events-none" />}

      {/* --- UI OVERLAY LAYER (Absolute Positioned for safety) --- */}
      
      {/* 1. ENERGY & GOLD - Fixed Top-Left */}
      <div className="absolute top-4 left-4 z-30 flex flex-col items-center gap-2 pointer-events-none">
          <div className="relative group">
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 shadow-[0_0_20px_rgba(245,158,11,0.6)] flex items-center justify-center border-4 border-amber-200 relative overflow-hidden transition-transform group-hover:scale-105">
                  <Zap className="absolute w-[120%] h-[120%] text-yellow-900/20 fill-yellow-900/20 rotate-12 -z-0" />
                  <span className="text-3xl md:text-4xl font-black text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] z-10 relative leading-none mt-1">
                      {player.energy}/{player.maxEnergy}
                  </span>
              </div>
          </div>
          <div className="bg-black/60 px-4 py-1.5 rounded-full border border-yellow-500/30 text-yellow-400 flex items-center gap-2 text-sm md:text-base font-bold backdrop-blur-sm">
              <Coins size={18} /> {player.gold}
          </div>
      </div>

      {/* 2. DECK PILES - Fixed Bottom-Left */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-30 pointer-events-none text-xs md:text-sm font-bold text-slate-500">
          <div className="bg-slate-800/90 px-3 py-1.5 md:px-4 md:py-2 rounded border border-slate-700 relative text-slate-300 shadow-lg">
              Draw: {player.drawPile.length}
          </div>
          <div className="bg-slate-800/90 px-3 py-1.5 md:px-4 md:py-2 rounded border border-slate-700 relative text-slate-300 shadow-lg">
              Discard: {player.discardPile.length}
          </div>
      </div>

      {/* 3. END TURN BUTTON - Fixed Bottom-Right (Above cards area) */}
      <div className="absolute bottom-40 md:bottom-56 right-8 z-30">
          <button 
              disabled={turnPhase !== 'PLAYER' || showTutorial}
              onClick={endTurn}
              className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 px-6 md:py-4 md:px-10 rounded-full shadow-lg border-2 border-amber-400 disabled:border-slate-600 transition-all active:scale-95 flex items-center gap-3 hover:shadow-amber-500/20 text-sm md:text-lg cursor-pointer"
          >
              End Turn <RotateCcw size={20} />
          </button>
      </div>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="flex-1 flex flex-col justify-between relative z-10 w-full h-full">
        
        {/* ARENA (Player & Enemies) */}
        {/* Fill available space */}
        <div className="flex-1 flex items-center justify-center gap-8 md:gap-32 px-4 py-8">
            
            {/* Player Container */}
            <div className={`transition-transform duration-100 ${playerShake ? 'translate-x-[-10px] grayscale' : ''}`}>
                 <div className="relative">
                      {turnDamageBonus > 0 && (
                          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce-slow">
                              <div className="bg-red-600 text-white px-3 py-1 rounded-full border-2 border-red-400 font-bold text-xs md:text-sm shadow-lg mb-1">
                                  +{turnDamageBonus} DMG
                              </div>
                          </div>
                      )}
                      <PlayerComponent player={player} isBlocking={playerBlockAnim} />
                 </div>
            </div>

            {/* Enemies Container */}
            <div className="flex items-end justify-center gap-4 md:gap-8">
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

        {/* HAND - Fixed Height Container for Cards */}
        {/* Increased height to allow for larger cards */}
        <div className="h-[280px] md:h-[350px] flex items-end justify-center pb-4 md:pb-8 relative z-20 w-full px-12 md:px-24">
            {player.hand.map((card, idx) => {
                const totalCards = player.hand.length;
                const middleIndex = (totalCards - 1) / 2;
                const offset = idx - middleIndex;
                const rotation = offset * 5; 
                const translateY = Math.abs(offset) * 12; // Slightly increased curve
                const isSelected = pendingCard?.id === card.id;
                const isHovered = hoveredCardId === card.id;
                // Adjusted squeeze for larger cards
                const squeeze = totalCards > 5 ? -60 : -30; 
                const style = {
                    marginLeft: idx === 0 ? 0 : `${squeeze}px`,
                    zIndex: isSelected ? 50 : (isHovered ? 40 : idx),
                    transform: isSelected 
                        ? 'translateY(-120px) scale(1.15) rotate(0deg)' 
                        : isHovered 
                            ? 'translateY(-100px) scale(1.15) rotate(0deg)' 
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

      {/* LOG - Desktop Only */}
      <div className="hidden xl:flex w-80 h-full bg-slate-950/80 border-l border-slate-800 p-6 flex-col backdrop-blur-md relative z-10 shrink-0">
          <div className="flex items-center gap-3 mb-4 text-amber-500 border-b border-slate-800 pb-3">
              <ScrollText size={24} />
              <h3 className="font-serif font-bold uppercase tracking-wider text-base">Combat Log</h3>
          </div>
          <div ref={logContainerRef} className="flex-1 overflow-y-auto space-y-3 text-base text-slate-400 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {combatLog.map((log, i) => (
                  <div key={i} className="animate-fade-in border-l-2 border-slate-700 pl-3 py-1 leading-snug">{log}</div>
              ))}
          </div>
      </div>
    </div>
  );
};
