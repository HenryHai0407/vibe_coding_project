import { ReviewCardType } from "@prisma/client";

type ReviewCardInput = {
  type: "word" | "phrase" | "grammar" | "note";
  finnishText: string;
  baseTranslation?: string | null;
  explanation?: string | null;
  examples: Array<{
    finnishSentence: string;
    englishTranslation?: string | null;
  }>;
};

type GeneratedReviewCard = {
  cardType: ReviewCardType;
  prompt: string;
  answer: string;
};

const CONTENT_FIELDS_FOR_REGEN = new Set(["type", "finnishText", "baseTranslation", "explanation", "usageNote", "sourceContext", "examples"]);

function sanitize(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function buildClozePrompt(input: ReviewCardInput): string {
  const example = input.examples.find((entry) => sanitize(entry.finnishSentence).length > 0);
  const finnishText = sanitize(input.finnishText);
  if (!example) {
    return finnishText ? `Complete: ${finnishText.replace(/\S+/, "____")}` : "";
  }

  const sentence = sanitize(example.finnishSentence);
  if (!sentence) {
    return "";
  }

  if (finnishText) {
    const escapedText = finnishText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedText, "i");
    if (regex.test(sentence)) {
      return `Fill the blank: ${sentence.replace(regex, "____")}`;
    }
  }

  return `Fill the blank: ${sentence.replace(/\S+/, "____")}`;
}

export function buildReviewCardsForItem(input: ReviewCardInput): GeneratedReviewCard[] {
  const finnishText = sanitize(input.finnishText);
  const baseTranslation = sanitize(input.baseTranslation);
  const explanation = sanitize(input.explanation);
  const primaryExample = input.examples.find((entry) => sanitize(entry.finnishSentence).length > 0);

  const recognitionAnswer = baseTranslation || explanation || finnishText;
  const recallPrompt = baseTranslation
    ? `What is the Finnish for: ${baseTranslation}?`
    : explanation
      ? `Which Finnish item matches this explanation: ${explanation}?`
      : `Recall the meaning of: ${finnishText}`;
  const sentencePrompt = primaryExample
    ? `Translate this sentence context: ${sanitize(primaryExample.finnishSentence)}`
    : `Use this item in a sentence: ${finnishText}`;
  const sentenceAnswer = sanitize(primaryExample?.englishTranslation) || baseTranslation || finnishText;
  const clozePrompt = buildClozePrompt(input);

  const candidates: GeneratedReviewCard[] = [
    {
      cardType: "recognition",
      prompt: `What does this mean: ${finnishText}?`,
      answer: recognitionAnswer
    },
    {
      cardType: "recall",
      prompt: recallPrompt,
      answer: finnishText
    },
    {
      cardType: "sentence_prompt",
      prompt: sentencePrompt,
      answer: sentenceAnswer
    },
    {
      cardType: "cloze",
      prompt: clozePrompt,
      answer: finnishText
    }
  ];

  const deduped = new Map<ReviewCardType, GeneratedReviewCard>();

  for (const card of candidates) {
    const prompt = sanitize(card.prompt);
    const answer = sanitize(card.answer);
    if (!prompt || !answer) {
      continue;
    }
    if (!deduped.has(card.cardType)) {
      deduped.set(card.cardType, { ...card, prompt, answer });
    }
  }

  return Array.from(deduped.values());
}

export function shouldRegenerateReviewCards(updatedFields: string[]): boolean {
  return updatedFields.some((field) => CONTENT_FIELDS_FOR_REGEN.has(field));
}
