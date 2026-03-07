import { z } from "zod";

export const startQuizSchema = z.object({
  limit: z.number().int().min(1).max(50).default(10)
});

export const submitQuizSchema = z.object({
  reviewSessionId: z.string().min(1),
  answers: z
    .array(
      z.object({
        reviewCardId: z.string().min(1),
        selectedAnswer: z.string().min(1),
        responseMs: z.number().int().min(0).max(120000).optional()
      })
    )
    .min(1)
});
