
export interface MathRiddle {
  question: string;
  options: string[];
  correctIndex: number;
  rewardText: string;
}

const RIDDLES: MathRiddle[] = [
  {
    question: "I have no voice, but I can tell you all. I have leaves, but I am not a tree. I have a spine, but I have no bones. What am I?",
    options: ["A Book", "A Map", "A Ghost"],
    correctIndex: 0,
    rewardText: "Knowledge is power."
  },
  {
    question: "I am an odd number. Take away a letter and I become even. What number am I?",
    options: ["One", "Seven", "Eleven"],
    correctIndex: 1,
    rewardText: "Even the oddest things have a solution."
  },
  {
    question: "What 3 positive numbers give the same result when multiplied and added together?",
    options: ["1, 2, and 3", "2, 4, and 6", "0, 1, and 2"],
    correctIndex: 0,
    rewardText: "1 + 2 + 3 = 6. 1 x 2 x 3 = 6. Perfect harmony."
  },
  {
    question: "What weighs more? A pound of iron or a pound of feathers?",
    options: ["Iron", "Feathers", "They weigh the same"],
    correctIndex: 2,
    rewardText: "Density deceives, but gravity does not lie."
  },
  {
    question: "What number do you get when you multiply all of the numbers on a telephone's number pad?",
    options: ["362,880", "100", "Zero"],
    correctIndex: 2,
    rewardText: "Anything multiplied by zero is zero."
  },
  {
    question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
    options: ["A Dream", "A Map", "A Globe"],
    correctIndex: 1,
    rewardText: "You have found your way."
  },
  {
    question: "What occurs once in a minute, twice in a moment, but never in a thousand years?",
    options: ["The letter M", "The number 1", "An Eclipse"],
    correctIndex: 0,
    rewardText: "Moments are fleeting."
  },
  {
    question: "What has a head and a tail but no body?",
    options: ["A Snake", "A Coin", "A Comet"],
    correctIndex: 1,
    rewardText: "Probability favors the prepared."
  },
  {
    question: "What goes up but never comes down?",
    options: ["A Balloon", "Your Age", "Rain"],
    correctIndex: 1,
    rewardText: "Time flows only one way."
  },
  {
    question: "I am full of holes, yet I can hold water. What am I?",
    options: ["A Net", "A Sponge", "A Cloud"],
    correctIndex: 1,
    rewardText: "Absorb the knowledge."
  },
  {
    question: "The more you take, the more you leave behind. What are they?",
    options: ["Footsteps", "Memories", "Fingerprints"],
    correctIndex: 0,
    rewardText: "Walk your path carefully."
  }
];

export const generateMathRiddle = async (): Promise<MathRiddle | null> => {
  // Simulating a short delay for dramatic effect (like entering a room)
  return new Promise((resolve) => {
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * RIDDLES.length);
      resolve(RIDDLES[randomIndex]);
    }, 600);
  });
};
