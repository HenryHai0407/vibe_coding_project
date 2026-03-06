import test from "node:test";
import assert from "node:assert/strict";
import { calculateNextInterval } from "../../src/server/services/review.service.js";

test("initial mapping intervals", () => {
  assert.equal(calculateNextInterval(0, "hard"), 1);
  assert.equal(calculateNextInterval(0, "good"), 2);
  assert.equal(calculateNextInterval(0, "easy"), 4);
});

test("multiplier intervals", () => {
  assert.equal(calculateNextInterval(2, "hard"), 2);
  assert.equal(calculateNextInterval(2, "good"), 4);
  assert.equal(calculateNextInterval(2, "easy"), 6);
});
