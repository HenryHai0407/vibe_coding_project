export function calculateNextInterval(previousInterval, result) {
  if (result === "again") return 1;
  if (previousInterval <= 0) {
    if (result === "hard") return 1;
    if (result === "good") return 2;
    return 4;
  }

  if (result === "hard") return Math.max(1, Math.round(previousInterval * 1.2));
  if (result === "good") return Math.max(2, Math.round(previousInterval * 2));
  return Math.max(4, Math.round(previousInterval * 3));
}

export function calculateNextReviewAt(fromDate, intervalDays) {
  return new Date(fromDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);
}
