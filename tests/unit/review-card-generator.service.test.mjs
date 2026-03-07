import test from "node:test";
import assert from "node:assert/strict";
import { buildReviewCardsForItem, shouldRegenerateReviewCards } from "../../src/server/services/review-card-generator.service.js";

test("buildReviewCardsForItem generates core card types", () => {
  const cards = buildReviewCardsForItem({
    type: "word",
    finnishText: "kissa",
    baseTranslation: "cat",
    explanation: "domestic feline",
    examples: [{ finnishSentence: "Minulla on kissa", englishTranslation: "I have a cat" }]
  });

  assert.deepEqual(
    cards.map((card) => card.cardType).sort(),
    ["cloze", "recall", "recognition", "sentence_prompt"].sort()
  );
  assert.equal(cards.find((card) => card.cardType === "recognition")?.answer, "cat");
});

test("buildReviewCardsForItem falls back when translation is missing", () => {
  const cards = buildReviewCardsForItem({
    type: "grammar",
    finnishText: "partitiivi",
    explanation: "used for partial objects",
    examples: []
  });

  assert.equal(cards.length, 4);
  assert.match(cards.find((card) => card.cardType === "recall")?.prompt ?? "", /explanation/i);
});

test("shouldRegenerateReviewCards returns true when content fields changed", () => {
  assert.equal(shouldRegenerateReviewCards(["difficulty", "finnishText"]), true);
  assert.equal(shouldRegenerateReviewCards(["difficulty", "archivedAt"]), false);
});
