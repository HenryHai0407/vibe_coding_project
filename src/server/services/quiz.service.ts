export type QuizCardInput = {
  id: string;
  prompt: string;
  answer: string;
};

export type QuizQuestion = {
  reviewCardId: string;
  prompt: string;
  options: string[];
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function isQuizAnswerCorrect(expectedAnswer: string, selectedAnswer: string): boolean {
  return normalize(expectedAnswer) === normalize(selectedAnswer);
}

export function buildQuizQuestions(cards: QuizCardInput[]): QuizQuestion[] {
  const answerPool = Array.from(new Set(cards.map((card) => card.answer.trim()).filter(Boolean)));

  return cards.map((card) => {
    const correctAnswer = card.answer.trim();
    const distractors = answerPool
      .filter((answer) => normalize(answer) !== normalize(correctAnswer))
      .slice(0, 10);

    const pickedDistractors = shuffle(distractors).slice(0, 3);
    const options = shuffle(Array.from(new Set([correctAnswer, ...pickedDistractors])));

    return {
      reviewCardId: card.id,
      prompt: card.prompt,
      options
    };
  });
}
