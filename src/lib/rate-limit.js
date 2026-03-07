const buckets = new Map();

export function checkRateLimit(config) {
  const now = Date.now();
  const existing = buckets.get(config.key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(config.key, {
      count: 1,
      resetAt: now + config.windowMs
    });

    return {
      limited: false,
      retryAfterSeconds: Math.ceil(config.windowMs / 1000)
    };
  }

  existing.count += 1;

  if (existing.count > config.maxRequests) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
    };
  }

  return {
    limited: false,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
  };
}
