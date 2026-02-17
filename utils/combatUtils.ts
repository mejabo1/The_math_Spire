
import { Card as CardType } from '../types';

export const BOSS_PUNS = [
    "Stop being so irrational!",
    "Your strategy is pointless!",
    "I'm too acute to lose!",
    "You're just a fraction of my power!",
    "Don't be such a square!",
    "I'll divide and conquer you!",
    "Your logic is full of holes!",
    "You can't handle my volume!",
    "Parallel lines never meet... like our skill levels!",
    "Are you a zero? Because you mean nothing to me!"
];

export const BOSS_ATTACK_TAUNTS = [
    "I'm about to lower your average!",
    "Let's subtract some of that HP!",
    "I hope you're good at division, because I'm splitting you in half!",
    "Your survival chances are approaching zero!",
    "Behold, the power of a perfect shape!",
    "I'm the variable you can't solve!",
    "Prepare for some long division!"
];

export const drawCards = (currentDeck: CardType[], currentDiscard: CardType[], amount: number, onShuffle?: () => void) => {
    let deck = [...currentDeck];
    let discard = [...currentDiscard];
    let hand: CardType[] = [];

    for (let i = 0; i < amount; i++) {
        if (deck.length === 0) {
            if (discard.length === 0) break;
            deck = [...discard].sort(() => Math.random() - 0.5);
            discard = [];
            if (onShuffle) onShuffle();
        }
        const card = deck.pop();
        if (card) hand.push(card);
    }
    return { deck, discard, hand };
};

export const getEffectTargetType = (effectId: string): 'enemy' | 'none' => {
     return [
          'deal_damage', 
          'deal_damage_heavy', 
          'damage_x', 
          'reckless_attack', 
          'lifesteal', 
          'multi_hit', 
          'multi_hit_2',
          'damage_prime',
          'block_slam',
          'damage_equal_to_block',
          'block_damage',
          'damage_discard',
          'damage_x_draw',
          'block_enemy',
          'damage_exhaust' 
      ].includes(effectId) ? 'enemy' : 'none';
};
