
import { Card, Enemy, MapNode } from './types';

export const INITIAL_PLAYER_HP = 20;
export const INITIAL_MAX_ENERGY = 3;
export const HAND_SIZE = 4;

// --- CARD LIBRARY ---

export const CARDS: Record<string, Omit<Card, 'id'>> = {
  strike: {
    name: 'Integer Strike',
    type: 'attack',
    cost: 1,
    value: 2,
    description: 'Deal 2 damage.',
    effectId: 'deal_damage',
    rarity: 'common',
    mathType: 'integer'
  },
  defend: {
    name: 'Absolute Shield',
    type: 'skill',
    cost: 2,
    value: 3,
    description: 'Gain 3 Block.',
    effectId: 'gain_block',
    rarity: 'common',
    mathType: 'addition'
  },
  subtraction: {
    name: 'Quick Minus',
    type: 'attack',
    cost: 0,
    value: 1,
    description: 'Deal 1 damage.',
    effectId: 'deal_damage',
    rarity: 'common',
    mathType: 'subtraction'
  },
  multiply_slam: {
    name: 'Multiply Slam',
    type: 'attack',
    cost: 1,
    value: 0,
    description: 'Deal damage equal to your current Block.',
    effectId: 'damage_equal_to_block',
    rarity: 'rare',
    mathType: 'multiplication'
  },
  divided_cleave: {
    name: 'Divided Cleave',
    type: 'attack',
    cost: 3,
    value: 3,
    description: 'Deal 2 damage to ALL enemies.',
    effectId: 'damage_all',
    rarity: 'rare',
    mathType: 'division'
  },
  // --- EXISTING REWARD CARDS ---
  greater_exponentially: {
    name: 'Greater Exponentially',
    type: 'skill',
    cost: 1,
    value: 3,
    description: 'Gain 3 Block. Upgrade a random card in hand.',
    effectId: 'upgrade_hand',
    rarity: 'rare',
    mathType: 'exponent'
  },
  keep_change_change: {
    name: 'Keep Change Change',
    type: 'attack',
    cost: 2,
    value: 2,
    description: 'Gain 1 Block. Deal 2 damage.',
    effectId: 'block_damage',
    rarity: 'common',
    mathType: 'integer'
  },
  aggressive_multiplied: {
    name: 'Aggressive Multiplied',
    type: 'attack',
    cost: 1,
    value: 4,
    description: 'Deal 4 damage. Discard a random card.',
    effectId: 'damage_discard',
    rarity: 'common',
    mathType: 'multiplication'
  },
  pop_quiz: {
    name: 'Pop Quiz',
    type: 'skill',
    cost: 1,
    value: 2,
    description: 'Gain 2 Energy. Exhausts if math answer is wrong.',
    effectId: 'gain_energy',
    rarity: 'common'
  },
  factor_defense: {
    name: 'Factor Defense',
    type: 'skill',
    cost: 1,
    value: 0,
    description: 'Gain Block equal to cards in hand.',
    effectId: 'block_hand_size',
    rarity: 'rare',
    mathType: 'factorization'
  },
  order_of_ops: {
    name: 'Order of Ops',
    type: 'attack',
    cost: 1,
    value: 3,
    description: 'Deal 3 damage. Incorrect answer reduces Block by 2.',
    effectId: 'deal_damage', 
    rarity: 'common',
    mathType: 'pemdas'
  },
  chain_calculation: {
    name: 'Chain Calculation',
    type: 'attack',
    cost: 3,
    value: 3,
    description: 'Deal 2 damage 2 times.',
    effectId: 'multi_hit_2', 
    rarity: 'rare',
    mathType: 'arithmetic'
  },
  divided_fraction_split: {
    name: 'Divided Fraction Split',
    type: 'attack',
    cost: 2,
    value: 2,
    description: 'Deal 2 damage to ALL enemies.',
    effectId: 'damage_all',
    rarity: 'rare',
    mathType: 'division' 
  },
  variable_strike: {
    name: 'Variable Strike',
    type: 'attack',
    cost: 3,
    value: 0,
    description: 'Deal damage equal to cards in hand. Draw 1 card.',
    effectId: 'damage_x_draw',
    rarity: 'epic',
    mathType: 'algebra'
  },
  absolute_value: {
    name: 'Absolute Value',
    type: 'power', 
    cost: 1,
    value: 2,
    description: 'Gain 2 Strength (Damage) for this combat.',
    effectId: 'buff_damage',
    rarity: 'rare',
    mathType: 'absolute_value'
  },
  balance_equation: {
    name: 'Balance Equation',
    type: 'skill',
    cost: 1,
    value: 0,
    description: 'Gain Block equal to the target enemy\'s HP.',
    effectId: 'block_enemy',
    rarity: 'epic',
    mathType: 'algebra'
  },
  reckless_attack: {
    name: 'Reckless Attack',
    type: 'attack',
    cost: 1,
    value: 5,
    description: 'Deal 5 damage. Lose 1 HP.',
    effectId: 'reckless_attack',
    rarity: 'common',
    mathType: 'prime_factors'
  },

  // --- NEW REQUESTED CARDS ---
  clean_eraser: {
    name: 'Clean Eraser',
    type: 'skill',
    cost: 1,
    value: 0,
    description: 'Exhaust 1 card from hand. Draw 1 card.',
    effectId: 'exhaust_1_draw_1',
    rarity: 'common',
    mathType: 'subtraction_3digit'
  },
  show_your_work: {
    name: 'Show Your Work',
    type: 'skill',
    cost: 1,
    value: 0,
    description: 'Exhaust 1 card from hand. Draw 2 cards.',
    effectId: 'exhaust_1_draw_2',
    rarity: 'common',
    mathType: 'decimal_addition'
  },
  mistake_detector: {
    name: 'Mistake Detector',
    type: 'attack',
    cost: 1,
    value: 0,
    description: 'Exhaust 1 card from hand. Deal damage equal to its cost.',
    effectId: 'damage_exhaust',
    rarity: 'rare',
    mathType: 'decimal_multiplication'
  },
  simplify: {
    name: 'Simplify',
    type: 'skill',
    cost: 1,
    value: 0,
    description: 'Reduce the cost of a card in hand by 1.',
    effectId: 'reduce_cost',
    rarity: 'rare',
    mathType: 'fraction_simplification'
  },
  loose_notes_chaos: {
    name: 'Loose Notes Chaos',
    type: 'skill',
    cost: 3,
    value: 0,
    description: 'Shuffle your hand. Reduce cost of ALL cards in hand by 1.',
    effectId: 'chaos_hand',
    rarity: 'epic',
    mathType: 'decimal_division'
  },
  decimal_salve: {
    name: 'Decimal Salve',
    type: 'skill',
    cost: 2,
    value: 3,
    description: 'Heal 3 HP.',
    effectId: 'heal_player',
    rarity: 'rare',
    mathType: 'decimal_addition'
  },
  integer_fortress: {
    name: 'Wordy Shield',
    type: 'skill',
    cost: 3,
    value: 7,
    description: 'Gain 7 Block.',
    effectId: 'gain_block',
    rarity: 'common',
    mathType: 'integer_word_problem'
  }
};

export const REWARD_POOL_IDS = [
  'greater_exponentially',
  'keep_change_change',
  'aggressive_multiplied',
  'pop_quiz',
  'factor_defense',
  'order_of_ops',
  'chain_calculation',
  'divided_fraction_split',
  'variable_strike',
  'absolute_value',
  'balance_equation',
  'reckless_attack',
  'clean_eraser',
  'show_your_work',
  'mistake_detector',
  'simplify',
  'loose_notes_chaos',
  'decimal_salve',
  'integer_fortress'
];

export const STARTING_DECK_IDS = [
  'strike', 'strike', 'strike', 
  'defend', 'defend', 'defend', 'defend',
  'subtraction',
  'multiply_slam',
  'divided_cleave'
];

// --- PLAYER SPRITE ---
export const PLAYER_SPRITE = `data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M60 140 Q60 180 140 180 Q140 140 140 140 L130 90 L70 90 Z" fill="%233b82f6" stroke="%231e3a8a" stroke-width="3"/><path d="M70 90 L50 130" stroke="%231e3a8a" stroke-width="3" fill="none"/><path d="M130 90 L150 130" stroke="%231e3a8a" stroke-width="3" fill="none"/><path d="M75 90 L75 140" stroke="%231f2937" stroke-width="4"/><path d="M125 90 L125 140" stroke="%231f2937" stroke-width="4"/><circle cx="100" cy="70" r="35" fill="%23fca5a5" stroke="%237f1d1d" stroke-width="3"/><circle cx="90" cy="70" r="8" fill="%23e0f2fe" stroke="black" stroke-width="2"/><circle cx="110" cy="70" r="8" fill="%23e0f2fe" stroke="black" stroke-width="2"/><line x1="98" y1="70" x2="102" y2="70" stroke="black" stroke-width="2"/><path d="M65 70 Q70 30 100 30 Q130 30 135 70" fill="%234b5563" stroke="black" stroke-width="2"/><rect x="140" y="40" width="15" height="120" fill="%23facc15" stroke="%23854d0e" stroke-width="2" transform="rotate(15 140 100)"/><polygon points="135,35 155,35 145,15" fill="%23fbcfe8" stroke="%23be185d" stroke-width="2" transform="rotate(15 140 100)"/><polygon points="140,160 155,160 147.5,180" fill="%23fcd34d" stroke="%23854d0e" stroke-width="2" transform="rotate(15 140 100)"/><polygon points="144,175 151,175 147.5,180" fill="black" transform="rotate(15 140 100)"/></svg>`;

// --- ENEMY SPRITES (SVG Data URIs) ---

const SVG_TRIANGLE = `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 10 L90 90 L10 90 Z" fill="%23ef4444" stroke="%237f1d1d" stroke-width="3"/><circle cx="40" cy="50" r="5" fill="white"/><circle cx="60" cy="50" r="5" fill="white"/><path d="M40 70 Q50 60 60 70" stroke="black" stroke-width="3" fill="none"/></svg>`;

const SVG_ALGEBRA_IMP = `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="20" y="20" width="60" height="60" rx="10" fill="%238b5cf6" stroke="%234c1d95" stroke-width="3"/><text x="50" y="65" font-family="monospace" font-size="40" fill="white" text-anchor="middle" font-weight="bold">x</text><path d="M30 30 L40 40 M70 30 L60 40" stroke="black" stroke-width="3"/></svg>`;

const SVG_FRACTION_PHANTOM = `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="%233b82f6" opacity="0.8"/><line x1="20" y1="50" x2="80" y2="50" stroke="white" stroke-width="4"/><circle cx="35" cy="35" r="4" fill="white"/><circle cx="65" cy="35" r="4" fill="white"/><path d="M40 70 Q50 60 60 70" stroke="white" stroke-width="2" fill="none"/></svg>`;

const SVG_VENOMOUS_VARIABLE = `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M30 20 Q50 5 70 20 Q85 40 70 70 Q50 95 30 70 Q15 40 30 20 Z" fill="%2310b981" stroke="%23064e3b" stroke-width="3"/><path d="M40 35 L45 45 L50 35 L55 45 L60 35" stroke="%23064e3b" stroke-width="2" fill="none"/><circle cx="35" cy="50" r="3" fill="%23064e3b"/><circle cx="65" cy="50" r="3" fill="%23064e3b"/><path d="M40 70 Q50 65 60 70" stroke="%23064e3b" stroke-width="2" fill="none"/><path d="M20 50 Q10 40 20 30" stroke="%2310b981" stroke-width="4" fill="none" opacity="0.6"/><path d="M80 50 Q90 60 80 70" stroke="%2310b981" stroke-width="4" fill="none" opacity="0.6"/></svg>`;

const SVG_BOSS_POLYGONE = `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="50 5, 95 27, 95 72, 50 95, 5 72, 5 27" fill="%231e293b" stroke="%23fbbf24" stroke-width="4"/><circle cx="35" cy="40" r="6" fill="%23ef4444" className="animate-pulse"/><circle cx="65" cy="40" r="6" fill="%23ef4444" className="animate-pulse"/><path d="M30 70 Q50 85 70 70" stroke="%23fbbf24" stroke-width="3" fill="none"/></svg>`;

// Tier 2 Boss: The Prime Predator (Wolf/Beast theme with numbers)
const SVG_BOSS_PREDATOR = `data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%237f1d1d"/><stop offset="100%" stop-color="%23000"/></linearGradient></defs><path d="M20 30 Q10 10 30 15 Q40 5 50 20 Q60 5 70 15 Q90 10 80 30 Q95 50 80 70 Q90 90 50 95 Q10 90 20 70 Q5 50 20 30 Z" fill="url(%23g)" stroke="%23dc2626" stroke-width="3"/><path d="M30 40 L40 45 L35 55 Z" fill="%23ef4444"/><path d="M70 40 L60 45 L65 55 Z" fill="%23ef4444"/><path d="M40 70 L50 80 L60 70" stroke="%23ef4444" stroke-width="2" fill="none"/><path d="M25 60 L35 75 L45 60" fill="white"/><path d="M75 60 L65 75 L55 60" fill="white"/><circle cx="35" cy="45" r="2" fill="white"/><circle cx="65" cy="45" r="2" fill="white"/></svg>`;


// --- ENEMIES ---

export const ENEMIES: Enemy[] = [
  {
    id: 'basic_shape',
    name: 'Angry Triangle',
    maxHp: 10,
    currentHp: 10,
    block: 0,
    intent: { type: 'attack', value: 3 },
    image: SVG_TRIANGLE
  },
  {
    id: 'algebra_imp',
    name: 'Algebra Imp',
    maxHp: 5, 
    currentHp: 5,
    block: 0,
    intent: { type: 'defend', value: 4 },
    image: SVG_ALGEBRA_IMP
  },
  {
    id: 'fraction_phantom',
    name: 'Fraction Phantom',
    maxHp: 20,
    currentHp: 20,
    block: 0,
    intent: { type: 'attack', value: 6 },
    image: SVG_FRACTION_PHANTOM
  },
  {
    id: 'boss_geometry',
    name: 'The Poly-Gone',
    maxHp: 40,
    currentHp: 40,
    block: 0,
    intent: { type: 'attack', value: 5 },
    image: SVG_BOSS_POLYGONE
  },
  // TIER 2 ENEMY
  {
    id: 'venomous_variable',
    name: 'Venomous Variable',
    maxHp: 15, // NERFED from 25
    currentHp: 15, // NERFED from 25
    block: 0,
    intent: { type: 'poison', value: 2 },
    image: SVG_VENOMOUS_VARIABLE
  },
  // TIER 2 BOSS
  {
    id: 'boss_predator',
    name: 'The Fraction Freak',
    maxHp: 65,
    currentHp: 65,
    block: 0,
    intent: { type: 'drain', value: 6 }, // Unique mechanic: Life Steal
    image: SVG_BOSS_PREDATOR
  }
];

// --- MAP GENERATION HELPERS ---

export const GENERATE_MAP = (tier: number = 1): MapNode[] => {
    // Explicitly handle Tier 2
    if (Number(tier) === 2) {
        const t2Nodes: MapNode[] = [];
        // Floor 1: Wider Start (Shifted UP from y=82 to y=75)
        t2Nodes.push({ id: '1-1', type: 'combat', x: 20, y: 75, next: ['2-1', '2-2'], completed: false });
        t2Nodes.push({ id: '1-2', type: 'combat', x: 40, y: 75, next: ['2-2', '2-3'], completed: false });
        t2Nodes.push({ id: '1-3', type: 'combat', x: 60, y: 75, next: ['2-3', '2-4'], completed: false });
        t2Nodes.push({ id: '1-4', type: 'combat', x: 80, y: 75, next: ['2-4', '2-5'], completed: false });

        // Floor 2: Chaos Layer (Shifted UP from y=66 to y=60)
        t2Nodes.push({ id: '2-1', type: 'combat', x: 15, y: 60, next: ['3-1'], completed: false });
        t2Nodes.push({ id: '2-2', type: 'event', x: 35, y: 60, next: ['3-1', '3-2'], completed: false });
        t2Nodes.push({ id: '2-3', type: 'combat', x: 55, y: 60, next: ['3-2', '3-3'], completed: false });
        t2Nodes.push({ id: '2-4', type: 'event', x: 75, y: 60, next: ['3-3', '3-4'], completed: false });
        t2Nodes.push({ id: '2-5', type: 'combat', x: 90, y: 60, next: ['3-4'], completed: false });

        // Floor 3: Elite Gauntlet (Shifted UP from y=50 to y=45)
        t2Nodes.push({ id: '3-1', type: 'elite', x: 25, y: 45, next: ['4-1', '4-2'], completed: false });
        t2Nodes.push({ id: '3-2', type: 'rest', x: 45, y: 45, next: ['4-2'], completed: false });
        t2Nodes.push({ id: '3-3', type: 'elite', x: 65, y: 45, next: ['4-3'], completed: false });
        t2Nodes.push({ id: '3-4', type: 'rest', x: 85, y: 45, next: ['4-3'], completed: false });

        // Floor 4: Pre-Boss (Shifted UP from y=34 to y=30)
        t2Nodes.push({ id: '4-1', type: 'event', x: 30, y: 30, next: ['5-1'], completed: false });
        t2Nodes.push({ id: '4-2', type: 'combat', x: 50, y: 30, next: ['5-1'], completed: false });
        t2Nodes.push({ id: '4-3', type: 'rest', x: 70, y: 30, next: ['5-1'], completed: false });

        // Floor 5: Boss 2
        t2Nodes.push({ id: '5-1', type: 'boss', x: 50, y: 15, next: [], completed: false });
        
        return t2Nodes;
    }

    // Default Tier 1 Map (Fallback)
    const t1Nodes: MapNode[] = [];
    
    // Floor 1: The Entrance (Combat)
    t1Nodes.push({ id: '1-1', type: 'combat', x: 25, y: 80, next: ['2-1', '2-2'], completed: false });
    t1Nodes.push({ id: '1-2', type: 'combat', x: 50, y: 80, next: ['2-2', '2-3'], completed: false });
    t1Nodes.push({ id: '1-3', type: 'combat', x: 75, y: 80, next: ['2-3', '2-4'], completed: false });

    // Floor 2: The Fork (Combat/Event)
    t1Nodes.push({ id: '2-1', type: 'combat', x: 20, y: 65, next: ['3-1', '3-2'], completed: false });
    t1Nodes.push({ id: '2-2', type: 'event', x: 40, y: 65, next: ['3-2'], completed: false });
    t1Nodes.push({ id: '2-3', type: 'combat', x: 60, y: 65, next: ['3-2', '3-3'], completed: false });
    t1Nodes.push({ id: '2-4', type: 'event', x: 80, y: 65, next: ['3-3'], completed: false });

    // Floor 3: The Midpoint (Elite/Rest)
    t1Nodes.push({ id: '3-1', type: 'elite', x: 30, y: 50, next: ['4-1', '4-2'], completed: false });
    t1Nodes.push({ id: '3-2', type: 'rest', x: 50, y: 50, next: ['4-2'], completed: false });
    t1Nodes.push({ id: '3-3', type: 'elite', x: 70, y: 50, next: ['4-2', '4-3'], completed: false });

    // Floor 4: The Ascent (Prep)
    t1Nodes.push({ id: '4-1', type: 'event', x: 30, y: 35, next: ['5-1'], completed: false });
    t1Nodes.push({ id: '4-2', type: 'combat', x: 50, y: 35, next: ['5-1'], completed: false });
    t1Nodes.push({ id: '4-3', type: 'rest', x: 70, y: 35, next: ['5-1'], completed: false });

    // Floor 5: The Boss
    t1Nodes.push({ id: '5-1', type: 'boss', x: 50, y: 15, next: [], completed: false });

    return t1Nodes;
};
