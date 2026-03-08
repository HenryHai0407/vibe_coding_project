import test from "node:test";
import assert from "node:assert/strict";
import { __internalRateLimitReset, checkRateLimit } from "../../src/lib/rate-limit.js";

test("checkRateLimit limits after maxRequests in window", () => {
  __internalRateLimitReset();
  const key = `test-${Date.now()}`;

  const first = checkRateLimit({ key, windowMs: 60_000, maxRequests: 2 });
  const second = checkRateLimit({ key, windowMs: 60_000, maxRequests: 2 });
  const third = checkRateLimit({ key, windowMs: 60_000, maxRequests: 2 });

  assert.equal(first.limited, false);
  assert.equal(second.limited, false);
  assert.equal(third.limited, true);
});

test("checkRateLimit resets after window passes", async () => {
  __internalRateLimitReset();
  const key = `window-reset-${Date.now()}`;

  const first = checkRateLimit({ key, windowMs: 20, maxRequests: 1 });
  const second = checkRateLimit({ key, windowMs: 20, maxRequests: 1 });
  assert.equal(first.limited, false);
  assert.equal(second.limited, true);

  await new Promise((resolve) => setTimeout(resolve, 30));

  const third = checkRateLimit({ key, windowMs: 20, maxRequests: 1 });
  assert.equal(third.limited, false);
});
