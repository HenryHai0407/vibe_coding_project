import { z } from "zod";

export const createReviewSessionSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20)
});

export const submitReviewAttemptSchema = z.object({
  reviewSessionId: z.string().min(1),
  reviewCardId: z.string().min(1),
  result: z.enum(["again", "hard", "good", "easy"]),
  responseMs: z.number().int().min(0).max(120000).optional(),
  responseText: z.string().max(2000).optional()
});

export const dueReviewQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
