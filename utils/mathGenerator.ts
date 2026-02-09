
import { MathTopic } from '../types';

export interface MathProblem {
  question: string;
  options: string[];
  correctAnswer: string;
  topic: string;
}

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDecimal = (min: number, max: number, precision: number = 1) => {
    const val = Math.random() * (max - min) + min;
    return parseFloat(val.toFixed(precision));
};

export const generateProblem = (forcedTopic?: MathTopic, tier: number = 1): MathProblem => {
  let type = forcedTopic;
  
  if (!type) {
    const r = Math.random();
    if (r > 0.5) type = 'arithmetic';
    else if (r > 0.35) type = 'algebra';
    else if (r > 0.2) type = 'geometry';
    else type = 'percentage';
  }

  // Tier Scaling Functions
  switch (type) {
    case 'addition': return generateAddition(tier);
    case 'subtraction': return generateSubtraction(tier);
    case 'multiplication': return generateMultiplication(tier);
    case 'division': return generateDivision(tier);
    case 'integer': return generateIntegerProblem(tier);
    case 'exponent': return generateExponent(tier);
    case 'arithmetic': return generateArithmetic(tier);
    case 'algebra': return generateAlgebra(tier);
    case 'geometry': return generateGeometry(tier);
    case 'percentage': return generatePercentage(tier);
    case 'factorization': return generateFactorization();
    case 'pemdas': return generatePEMDAS(tier);
    case 'absolute_value': return generateAbsoluteValue();
    case 'prime_factors': return generatePrimeFactors();
    
    // New Topics
    case 'subtraction_3digit': return generateSubtraction3Digit();
    case 'decimal_addition': return generateDecimalAddition();
    case 'decimal_multiplication': return generateDecimalMultiplication();
    case 'decimal_division': return generateDecimalDivision();
    case 'fraction_simplification': return generateFractionSimplification();
    case 'integer_word_problem': return generateIntegerWordProblem();
    
    default: return generateArithmetic(tier);
  }
};

const generateOptions = (correct: number | string, type: 'number' | 'string' = 'number'): string[] => {
  const options = new Set<string>();
  options.add(correct.toString());

  while (options.size < 4) {
    let wrong: string | number = "";
    if (type === 'number') {
      const val = Number(correct);
      if (val % 1 !== 0) {
           wrong = parseFloat((val + (Math.random() > 0.5 ? 0.1 : -0.1) * getRandomInt(1, 10)).toFixed(2));
           if (wrong === val) wrong = val + 0.5;
      } else {
           wrong = val + getRandomInt(-5, 5);
           if (wrong === val) wrong = val + 1;
      }
    } else {
        wrong = (Number(correct) + getRandomInt(1, 10)).toString(); 
    }
    options.add(wrong.toString());
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
};

// ... Generators with Tier Scaling ...

const generateAddition = (tier: number): MathProblem => {
  const min = tier === 1 ? 10 : 100;
  const max = tier === 1 ? 99 : 999;
  const a = getRandomInt(min, max);
  const b = getRandomInt(min, max);
  const ans = a + b;
  return { question: `${a} + ${b} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Addition' };
};

const generateSubtraction = (tier: number): MathProblem => {
  const min = tier === 1 ? 20 : 200;
  const max = tier === 1 ? 99 : 999;
  const a = getRandomInt(min, max);
  const b = getRandomInt(min/2, a - 1);
  const ans = a - b;
  return { question: `${a} - ${b} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Subtraction' };
};

const generateMultiplication = (tier: number): MathProblem => {
  const min = tier === 1 ? 3 : 8;
  const max = tier === 1 ? 12 : 20;
  const a = getRandomInt(min, max);
  const b = getRandomInt(3, 12);
  const ans = a * b;
  return { question: `${a} × ${b} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Multiplication' };
};

const generateDivision = (tier: number): MathProblem => {
  const b = getRandomInt(tier === 1 ? 3 : 5, tier === 1 ? 12 : 15);
  const ans = getRandomInt(4, tier === 1 ? 15 : 25);
  const a = b * ans;
  return { question: `${a} ÷ ${b} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Division' };
};

const generateIntegerProblem = (tier: number): MathProblem => {
  const ops = ['+', '-'];
  const op = ops[getRandomInt(0, 1)];
  const range = tier === 1 ? 15 : 50;
  let a = getRandomInt(-range, range);
  let b = getRandomInt(-range, range);
  const bStr = b < 0 ? `(${b})` : `${b}`;
  let ans = op === '+' ? a + b : a - b;
  return { question: `${a} ${op} ${bStr} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Integers' };
};

const generateExponent = (tier: number): MathProblem => {
    const base = getRandomInt(2, tier === 1 ? 9 : 12);
    const power = base <= 3 ? getRandomInt(2, tier === 1 ? 4 : 5) : 2;
    const ans = Math.pow(base, power);
    return { question: `${base}^${power} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Exponents' };
};

const generateArithmetic = (tier: number): MathProblem => {
  const ops = ['+', '-', '*'];
  const op = ops[getRandomInt(0, 2)];
  let a = 0, b = 0, ans = 0;
  
  if (op === '*') { 
      a = getRandomInt(2, tier === 1 ? 9 : 15); 
      b = getRandomInt(2, tier === 1 ? 9 : 15); 
      ans = a * b; 
  } else if (op === '-') { 
      a = getRandomInt(5, tier === 1 ? 20 : 100); 
      b = getRandomInt(1, a - 1); 
      ans = a - b; 
  } else { 
      a = getRandomInt(2, tier === 1 ? 15 : 50); 
      b = getRandomInt(2, tier === 1 ? 10 : 50); 
      ans = a + b; 
  }
  return { question: `${a} ${op} ${b} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Arithmetic' };
};

const generateAlgebra = (tier: number): MathProblem => {
  if (tier === 1) {
    const x = getRandomInt(2, 9);
    const a = getRandomInt(1, 9);
    const b = x + a;
    return { question: `Find x: x + ${a} = ${b}`, options: generateOptions(x), correctAnswer: x.toString(), topic: 'Algebra' };
  } else {
    // 2x + 5 = 15
    const x = getRandomInt(2, 12);
    const m = getRandomInt(2, 5);
    const a = getRandomInt(1, 10);
    const b = (m * x) + a;
    return { question: `Find x: ${m}x + ${a} = ${b}`, options: generateOptions(x), correctAnswer: x.toString(), topic: 'Algebra' };
  }
};

const generateGeometry = (tier: number): MathProblem => {
    const w = getRandomInt(2, tier === 1 ? 6 : 12);
    const h = getRandomInt(2, tier === 1 ? 6 : 12);
    const ans = w * h;
    return { question: `Area of ${w} by ${h} rectangle?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Geometry' };
};

const generatePercentage = (tier: number): MathProblem => {
    const percentValues = tier === 1 ? [10, 25, 50] : [10, 20, 25, 50, 75];
    const percent = percentValues[getRandomInt(0, percentValues.length - 1)];
    let total = 0;
    if (percent === 10) total = getRandomInt(1, 9) * 10;
    else if (percent === 50) total = getRandomInt(2, 20) * 2;
    else total = getRandomInt(1, 5) * 4;
    const ans = (percent / 100) * total;
    return { question: `${percent}% of ${total}?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Percentage' };
};

const generatePEMDAS = (tier: number): MathProblem => {
  const m1 = getRandomInt(2, tier === 1 ? 5 : 9);
  const m2 = getRandomInt(2, tier === 1 ? 5 : 9);
  const add = getRandomInt(2, tier === 1 ? 10 : 20);
  const ans = add + (m1 * m2);
  
  return {
    question: `${add} + ${m1} × ${m2} = ?`,
    options: generateOptions(ans),
    correctAnswer: ans.toString(),
    topic: 'Order of Ops'
  };
};

const generateFactorization = (): MathProblem => {
  const a = getRandomInt(2, 6) * 2;
  const b = getRandomInt(2, 6) * 3;
  const gcd = (x: number, y: number): number => !y ? x : gcd(y, x % y);
  const ans = gcd(a, b);
  return { question: `GCF of ${a} and ${b}?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Factorization' };
};

const generateAbsoluteValue = (): MathProblem => {
  const val = getRandomInt(2, 15);
  const neg = -val;
  const type = getRandomInt(0, 1);
  if (type === 0) {
      return { question: `|${neg}| = ?`, options: generateOptions(val), correctAnswer: val.toString(), topic: 'Absolute Value' };
  } else {
      const v2 = getRandomInt(1, 5);
      const ans = val + v2;
      return { question: `|${neg}| + |${v2}| = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Absolute Value' };
  }
};

const generatePrimeFactors = (): MathProblem => {
  const primes = [2, 3, 5, 7];
  const count = getRandomInt(2, 3);
  const factors: number[] = [];
  let product = 1;
  for(let i=0; i<count; i++) {
    const p = primes[getRandomInt(0, primes.length - 1)];
    factors.push(p);
    product *= p;
  }
  factors.sort((a,b) => a-b);
  const correctAnswer = factors.join(' × ');
  const options = new Set<string>();
  options.add(correctAnswer);
  while(options.size < 4) {
     const r = Math.random();
     if (r < 0.4) {
         const wrongFactors = [...factors];
         wrongFactors[getRandomInt(0, wrongFactors.length-1)] = primes[getRandomInt(0, primes.length-1)];
         wrongFactors.sort((a,b) => a-b);
         options.add(wrongFactors.join(' × '));
     } else if (r < 0.7) {
         const wf = [];
         for(let i=0; i<count; i++) wf.push(primes[getRandomInt(0, primes.length-1)]);
         wf.sort((a,b) => a-b);
         options.add(wf.join(' × '));
     } else {
         options.add(`1 × ${product}`);
     }
  }
  return { question: `Prime factorization of ${product}?`, options: Array.from(options).sort(() => Math.random() - 0.5), correctAnswer: correctAnswer, topic: 'Prime Factors' };
};

const generateSubtraction3Digit = (): MathProblem => {
    const a = getRandomInt(300, 999);
    const b = getRandomInt(100, 299);
    const ans = a - b;
    return { question: `${a} - ${b} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Subtraction (3-Digit)' };
};

const generateDecimalAddition = (): MathProblem => {
    const a = getRandomDecimal(1, 10, 1);
    const b = getRandomDecimal(1, 10, 1);
    const ans = parseFloat((a + b).toFixed(1));
    return { question: `${a} + ${b} = ?`, options: generateOptions(ans, 'number'), correctAnswer: ans.toString(), topic: 'Decimal Addition' };
};

const generateDecimalMultiplication = (): MathProblem => {
    const isSmall = Math.random() > 0.5;
    let a, b;
    if (isSmall) {
        a = parseFloat((getRandomInt(1, 9) / 10).toFixed(1));
        b = getRandomInt(2, 10);
    } else {
        a = getRandomDecimal(1, 5, 1);
        b = getRandomInt(2, 5);
    }
    const ans = parseFloat((a * b).toFixed(2));
    return { question: `${a} × ${b} = ?`, options: generateOptions(ans, 'number'), correctAnswer: ans.toString(), topic: 'Decimal Multiplication' };
};

const generateDecimalDivision = (): MathProblem => {
    const ans = getRandomDecimal(1, 10, 1);
    const divisor = getRandomInt(2, 5);
    const dividend = parseFloat((ans * divisor).toFixed(2));
    return { question: `${dividend} ÷ ${divisor} = ?`, options: generateOptions(ans, 'number'), correctAnswer: ans.toString(), topic: 'Decimal Division' };
};

const generateFractionSimplification = (): MathProblem => {
    const factor = getRandomInt(2, 5);
    const num = getRandomInt(1, 5);
    const den = getRandomInt(num + 1, 9);
    const bigNum = num * factor;
    const bigDen = den * factor;
    const ans = `${num}/${den}`;
    const options = new Set<string>();
    options.add(ans);
    options.add(`${num}/${den+1}`);
    options.add(`${num+1}/${den}`);
    options.add(`${bigNum}/${bigDen}`);
    while(options.size < 4) {
        options.add(`${getRandomInt(1,5)}/${getRandomInt(6,9)}`);
    }
    return { question: `Simplify: ${bigNum}/${bigDen}`, options: Array.from(options).sort(() => Math.random() - 0.5), correctAnswer: ans, topic: 'Simplifying Fractions' };
};

const generateIntegerWordProblem = (): MathProblem => {
  const scenarios = [
    { t: "Temperature", q: (a: number, b: number) => `The temperature was ${a}°C. It dropped by ${b}°C. What is it now?`, calc: (a: number, b: number) => a - b },
    { t: "Elevation", q: (a: number, b: number) => `A diver is at ${-a}m. They dive ${b}m deeper. What is their depth?`, calc: (a: number, b: number) => -a - b },
    { t: "Bank Account", q: (a: number, b: number) => `You have $${a}. You spend $${b}. What is your balance?`, calc: (a: number, b: number) => a - b },
    { t: "Elevator", q: (a: number, b: number) => `You are on floor ${a}. You go down ${b} floors. What floor are you on?`, calc: (a: number, b: number) => a - b }
  ];
  
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  const a = getRandomInt(5, 20);
  const b = getRandomInt(5, 20);
  const ans = scenario.calc(a, b);
  
  return { 
    question: scenario.q(a, b), 
    options: generateOptions(ans), 
    correctAnswer: ans.toString(), 
    topic: 'Integer Word Problem' 
  };
};
