import test from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit } from "../../src/lib/rate-limit.js";

test("checkRateLimit limits after maxRequests in window", () => {
  const key = `test-${Date.now()}`;

  const first = checkRateLimit({ key, windowMs: 60_000, maxRequests: 2 });
  const second = checkRateLimit({ key, windowMs: 60_000, maxRequests: 2 });
  const third = checkRateLimit({ key, windowMs: 60_000, maxRequests: 2 });

  assert.equal(first.limited, false);
  assert.equal(second.limited, false);
  assert.equal(third.limited, true);
});
