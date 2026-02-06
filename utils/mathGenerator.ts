

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

export const generateProblem = (forcedTopic?: MathTopic): MathProblem => {
  let type = forcedTopic;
  
  if (!type) {
    // Weight arithmetic higher as it's the fastest to solve
    const r = Math.random();
    if (r > 0.5) type = 'arithmetic';
    else if (r > 0.35) type = 'algebra';
    else if (r > 0.2) type = 'geometry';
    else type = 'percentage';
  }

  switch (type) {
    case 'addition': return generateAddition();
    case 'subtraction': return generateSubtraction();
    case 'multiplication': return generateMultiplication();
    case 'division': return generateDivision();
    case 'integer': return generateIntegerProblem();
    case 'exponent': return generateExponent();
    case 'arithmetic': return generateArithmetic();
    case 'algebra': return generateAlgebra();
    case 'geometry': return generateGeometry();
    case 'percentage': return generatePercentage();
    case 'factorization': return generateFactorization();
    case 'pemdas': return generatePEMDAS();
    case 'absolute_value': return generateAbsoluteValue();
    case 'prime_factors': return generatePrimeFactors();
    
    // New Topics
    case 'subtraction_3digit': return generateSubtraction3Digit();
    case 'decimal_addition': return generateDecimalAddition();
    case 'decimal_multiplication': return generateDecimalMultiplication();
    case 'decimal_division': return generateDecimalDivision();
    case 'fraction_simplification': return generateFractionSimplification();
    
    default: return generateArithmetic();
  }
};

const generateOptions = (correct: number | string, type: 'number' | 'string' = 'number'): string[] => {
  const options = new Set<string>();
  options.add(correct.toString());

  while (options.size < 4) {
    let wrong: string | number = "";
    if (type === 'number') {
      const val = Number(correct);
      // Generate close numbers for distraction but not too tricky
      // Handle decimals
      if (val % 1 !== 0) {
           wrong = parseFloat((val + (Math.random() > 0.5 ? 0.1 : -0.1) * getRandomInt(1, 10)).toFixed(2));
           if (wrong === val) wrong = val + 0.5;
      } else {
           wrong = val + getRandomInt(-5, 5);
           if (wrong === val) wrong = val + 1;
      }
    } else {
        // String fallback (fractions etc)
        // Just generic placeholder randomizer if specific logic isn't called
        wrong = (Number(correct) + getRandomInt(1, 10)).toString(); 
    }
    options.add(wrong.toString());
  }
  return Array.from(options).sort(() => Math.random() - 0.5);
};

// ... Basic generators ...
const generateAddition = (): MathProblem => {
  const a = getRandomInt(10, 99);
  const b = getRandomInt(10, 99);
  const ans = a + b;
  return { question: `${a} + ${b} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Addition' };
};

const generateSubtraction = (): MathProblem => {
  const a = getRandomInt(20, 99);
  const b = getRandomInt(10, a - 1);
  const ans = a - b;
  return { question: `${a} - ${b} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Subtraction' };
};

const generateMultiplication = (): MathProblem => {
  const a = getRandomInt(3, 15);
  const b = getRandomInt(3, 12);
  const ans = a * b;
  return { question: `${a} × ${b} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Multiplication' };
};

const generateDivision = (): MathProblem => {
  const b = getRandomInt(3, 12);
  const ans = getRandomInt(4, 15);
  const a = b * ans;
  return { question: `${a} ÷ ${b} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Division' };
};

const generateIntegerProblem = (): MathProblem => {
  const ops = ['+', '-'];
  const op = ops[getRandomInt(0, 1)];
  let a = getRandomInt(-15, 15);
  let b = getRandomInt(-15, 15);
  const bStr = b < 0 ? `(${b})` : `${b}`;
  let ans = op === '+' ? a + b : a - b;
  return { question: `${a} ${op} ${bStr} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Integers' };
};

const generateExponent = (): MathProblem => {
    const base = getRandomInt(2, 9);
    const power = base <= 3 ? getRandomInt(2, 4) : 2;
    const ans = Math.pow(base, power);
    return { question: `${base}^${power} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Exponents' };
};

const generateArithmetic = (): MathProblem => {
  const ops = ['+', '-', '*'];
  const op = ops[getRandomInt(0, 2)];
  let a = 0, b = 0, ans = 0;
  if (op === '*') { a = getRandomInt(2, 9); b = getRandomInt(2, 9); ans = a * b; }
  else if (op === '-') { a = getRandomInt(5, 20); b = getRandomInt(1, a - 1); ans = a - b; }
  else { a = getRandomInt(2, 15); b = getRandomInt(2, 10); ans = a + b; }
  return { question: `${a} ${op} ${b} = ?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Arithmetic' };
};

const generateAlgebra = (): MathProblem => {
  const x = getRandomInt(2, 9);
  const a = getRandomInt(1, 9);
  const b = x + a;
  return { question: `Find x: x + ${a} = ${b}`, options: generateOptions(x), correctAnswer: x.toString(), topic: 'Algebra' };
};

const generateGeometry = (): MathProblem => {
    const w = getRandomInt(2, 6);
    const h = getRandomInt(2, 6);
    const ans = w * h;
    return { question: `Area of ${w} by ${h} rectangle?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Geometry' };
};

const generatePercentage = (): MathProblem => {
    const percentValues = [10, 25, 50];
    const percent = percentValues[getRandomInt(0, 2)];
    let total = 0;
    if (percent === 10) total = getRandomInt(1, 9) * 10;
    else if (percent === 50) total = getRandomInt(2, 20) * 2;
    else total = getRandomInt(1, 5) * 4;
    const ans = (percent / 100) * total;
    return { question: `${percent}% of ${total}?`, options: generateOptions(ans), correctAnswer: ans.toString(), topic: 'Percentage' };
};

// --- COMPLEX GENERATORS ---

const generateFactorization = (): MathProblem => {
  // Find the Greatest Common Factor (GCF)
  const a = getRandomInt(2, 6) * 2;
  const b = getRandomInt(2, 6) * 3;
  
  // Let's do GCF
  const gcd = (x: number, y: number): number => !y ? x : gcd(y, x % y);
  const ans = gcd(a, b);
  
  return {
    question: `GCF of ${a} and ${b}?`,
    options: generateOptions(ans),
    correctAnswer: ans.toString(),
    topic: 'Factorization'
  };
};

const generatePEMDAS = (): MathProblem => {
  // Simple order of operations: 3 + 4 * 2
  const m1 = getRandomInt(2, 5);
  const m2 = getRandomInt(2, 5);
  const add = getRandomInt(2, 10);
  const ans = add + (m1 * m2);
  
  return {
    question: `${add} + ${m1} × ${m2} = ?`,
    options: generateOptions(ans),
    correctAnswer: ans.toString(),
    topic: 'Order of Ops'
  };
};

const generateAbsoluteValue = (): MathProblem => {
  const val = getRandomInt(2, 15);
  const neg = -val;
  
  const type = getRandomInt(0, 1);
  if (type === 0) {
      return {
          question: `|${neg}| = ?`,
          options: generateOptions(val),
          correctAnswer: val.toString(),
          topic: 'Absolute Value'
      };
  } else {
      const v2 = getRandomInt(1, 5);
      const ans = val + v2;
      return {
          question: `|${neg}| + |${v2}| = ?`,
          options: generateOptions(ans),
          correctAnswer: ans.toString(),
          topic: 'Absolute Value'
      };
  }
};

const generatePrimeFactors = (): MathProblem => {
  const primes = [2, 3, 5, 7];
  // Pick 2 to 3 factors to keep numbers reasonable
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
  
  // Custom option generation for factor strings
  while(options.size < 4) {
     const r = Math.random();
     if (r < 0.4) {
         // Same length, slightly different primes
         const wrongFactors = [...factors];
         wrongFactors[getRandomInt(0, wrongFactors.length-1)] = primes[getRandomInt(0, primes.length-1)];
         wrongFactors.sort((a,b) => a-b);
         options.add(wrongFactors.join(' × '));
     } else if (r < 0.7) {
         // Totally different random set
         const wf = [];
         for(let i=0; i<count; i++) wf.push(primes[getRandomInt(0, primes.length-1)]);
         wf.sort((a,b) => a-b);
         options.add(wf.join(' × '));
     } else {
         // Fake composite format "1 x Product"
         options.add(`1 × ${product}`);
     }
  }

  return {
    question: `Prime factorization of ${product}?`,
    options: Array.from(options).sort(() => Math.random() - 0.5),
    correctAnswer: correctAnswer,
    topic: 'Prime Factors'
  };
};

// --- NEW TOPICS ---

const generateSubtraction3Digit = (): MathProblem => {
    const a = getRandomInt(300, 999);
    const b = getRandomInt(100, 299);
    const ans = a - b;
    return { 
        question: `${a} - ${b} = ?`, 
        options: generateOptions(ans), 
        correctAnswer: ans.toString(), 
        topic: 'Subtraction (3-Digit)' 
    };
};

const generateDecimalAddition = (): MathProblem => {
    const a = getRandomDecimal(1, 10, 1);
    const b = getRandomDecimal(1, 10, 1);
    const ans = parseFloat((a + b).toFixed(1));
    return {
        question: `${a} + ${b} = ?`,
        options: generateOptions(ans, 'number'),
        correctAnswer: ans.toString(),
        topic: 'Decimal Addition'
    };
};

const generateDecimalMultiplication = (): MathProblem => {
    // Keep it simple: 0.5 * 4, 1.2 * 3
    const isSmall = Math.random() > 0.5;
    let a, b;
    if (isSmall) {
        a = parseFloat((getRandomInt(1, 9) / 10).toFixed(1)); // 0.1 to 0.9
        b = getRandomInt(2, 10);
    } else {
        a = getRandomDecimal(1, 5, 1);
        b = getRandomInt(2, 5);
    }
    const ans = parseFloat((a * b).toFixed(2));
    
    return {
        question: `${a} × ${b} = ?`,
        options: generateOptions(ans, 'number'),
        correctAnswer: ans.toString(),
        topic: 'Decimal Multiplication'
    };
};

const generateDecimalDivision = (): MathProblem => {
    // Generate inverse of multiplication to ensure clean answers
    const ans = getRandomDecimal(1, 10, 1); // Answer e.g. 2.5
    const divisor = getRandomInt(2, 5); // Divisor e.g. 2
    const dividend = parseFloat((ans * divisor).toFixed(2)); // 5.0
    
    return {
        question: `${dividend} ÷ ${divisor} = ?`,
        options: generateOptions(ans, 'number'),
        correctAnswer: ans.toString(),
        topic: 'Decimal Division'
    };
};

const generateFractionSimplification = (): MathProblem => {
    // Generate a/b where they share a factor
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
    options.add(`${bigNum}/${bigDen}`); // The unsimplified one is a distractor
    
    // Ensure 4 options
    while(options.size < 4) {
        options.add(`${getRandomInt(1,5)}/${getRandomInt(6,9)}`);
    }

    return {
        question: `Simplify: ${bigNum}/${bigDen}`,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        correctAnswer: ans,
        topic: 'Simplifying Fractions'
    };
};
