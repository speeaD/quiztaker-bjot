import type { CbtQuestion, CbtQuestionSet } from '@/components/cbt/types';

export const demoSets: CbtQuestionSet[] = [
  { _id: 'demo-english', title: 'Use of English', questionCount: 3, totalPoints: 3 },
  { _id: 'demo-mathematics', title: 'Mathematics', questionCount: 3, totalPoints: 3 },
  { _id: 'demo-physics', title: 'Physics', questionCount: 3, totalPoints: 3 },
  { _id: 'demo-chemistry', title: 'Chemistry', questionCount: 3, totalPoints: 3 },
  { _id: 'demo-biology', title: 'Biology', questionCount: 3, totalPoints: 3 },
];

const samples: Record<string, Array<[string, string[], string]>> = {
  'demo-english': [
    ['Choose the correctly spelled word.', ['Accomodate', 'Accommodate', 'Acommodate', 'Acomodate'], 'Accommodate'],
    ['Which word is closest in meaning to “brief”?', ['Lengthy', 'Concise', 'Distant', 'Loud'], 'Concise'],
    ['Choose the correct sentence.', ['She have arrived.', 'She has arrived.', 'She are arrived.', 'She arriving.'], 'She has arrived.'],
  ],
  'demo-mathematics': [
    ['What is 15% of 200?', ['15', '20', '30', '45'], '30'],
    ['Solve 3x + 5 = 20.', ['3', '5', '7', '10'], '5'],
    ['What is the area of a 6 cm by 4 cm rectangle?', ['10 cm²', '20 cm²', '24 cm²', '36 cm²'], '24 cm²'],
  ],
  'demo-physics': [
    ['What is the SI unit of force?', ['Joule', 'Newton', 'Watt', 'Pascal'], 'Newton'],
    ['Speed is calculated as distance divided by what?', ['Mass', 'Time', 'Force', 'Energy'], 'Time'],
    ['Which instrument measures electric current?', ['Voltmeter', 'Thermometer', 'Ammeter', 'Barometer'], 'Ammeter'],
  ],
  'demo-chemistry': [
    ['What is the chemical symbol for sodium?', ['S', 'Na', 'So', 'N'], 'Na'],
    ['A solution with pH 7 is what?', ['Acidic', 'Basic', 'Neutral', 'Salty'], 'Neutral'],
    ['How many protons does carbon have?', ['4', '6', '8', '12'], '6'],
  ],
  'demo-biology': [
    ['Which organelle produces most cellular energy?', ['Nucleus', 'Ribosome', 'Mitochondrion', 'Vacuole'], 'Mitochondrion'],
    ['What gas do plants absorb during photosynthesis?', ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], 'Carbon dioxide'],
    ['What carries genetic information?', ['DNA', 'Glucose', 'Starch', 'Water'], 'DNA'],
  ],
};

export function demoQuestions(setId: string): CbtQuestion[] {
  return (samples[setId] || samples['demo-mathematics']).map(([question, options], index) => ({
    _id: `${setId}-${index + 1}`, type: 'multiple-choice', question, options, points: 1, order: index + 1,
  }));
}

export function demoScore(questionIds: string[], answers: Record<string, string>) {
  const score = questionIds.reduce((sum, id) => {
    const setId = id.slice(0, id.lastIndexOf('-'));
    const index = Number(id.slice(id.lastIndexOf('-') + 1)) - 1;
    return sum + (answers[id] === (samples[setId] || samples['demo-mathematics'])[index]?.[2] ? 1 : 0);
  }, 0);
  return { score, totalPoints: questionIds.length, percentage: questionIds.length ? Math.round(score / questionIds.length * 100) : 0 };
}
