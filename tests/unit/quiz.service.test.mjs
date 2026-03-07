import test from "node:test";
import assert from "node:assert/strict";
import { buildQuizQuestions, isQuizAnswerCorrect } from "../../src/server/services/quiz.service.js";

test("isQuizAnswerCorrect ignores case and spaces", () => {
  assert.equal(isQuizAnswerCorrect("Kissa", "  kissa "), true);
  assert.equal(isQuizAnswerCorrect("Kissa", "koira"), false);
});

test("buildQuizQuestions includes prompt and correct answer in options", () => {
  const questions = buildQuizQuestions([
    { id: "1", prompt: "What does kissa mean?", answer: "cat" },
    { id: "2", prompt: "What does koira mean?", answer: "dog" },
    { id: "3", prompt: "What does talo mean?", answer: "house" },
    { id: "4", prompt: "What does kirja mean?", answer: "book" }
  ]);

  assert.equal(questions.length, 4);
  const q1 = questions.find((question) => question.reviewCardId === "1");
  assert.ok(q1);
  assert.equal(q1.prompt, "What does kissa mean?");
  assert.equal(q1.options.includes("cat"), true);
  assert.equal(q1.options.length >= 2, true);
});
