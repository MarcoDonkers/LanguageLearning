export const TEST_LISTS = {
  basicPhrases: {
    name: 'Basic Phrases',
    description: 'Common Dutch phrases',
  },
  numbers: {
    name: 'Numbers 1-10',
    description: 'Learn to count in Dutch',
  },
  greetings: {
    name: 'Greetings',
    description: '',
  },
};

export const TEST_WORDS = {
  greetings: [
    { dutch: 'hallo', english: 'hello' },
    { dutch: 'tot ziens', english: 'goodbye' },
    { dutch: 'dank je wel', english: 'thank you' },
  ],
  numbers: [
    { dutch: 'een', english: 'one' },
    { dutch: 'twee', english: 'two' },
    { dutch: 'drie', english: 'three' },
  ],
  animals: [
    { dutch: 'kat', english: 'cat' },
    { dutch: 'hond', english: 'dog' },
  ],
};

export const DIFFICULTY_INTERVALS = {
  hard: { minutes: 5, display: '5 min' },
  medium: { minutes: 30, display: '30 min' },
  easy: { minutes: 60, display: '1 hour' },
};
