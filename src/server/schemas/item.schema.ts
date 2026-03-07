import { z } from "zod";

export const createItemSchema = z.object({
  type: z.enum(["word", "phrase", "grammar", "note"]),
  finnishText: z.string().min(1),
  baseTranslation: z.string().optional(),
  explanation: z.string().optional(),
  usageNote: z.string().optional(),
  sourceContext: z.string().optional(),
  difficulty: z.number().int().min(1).max(5).default(2),
  tagIds: z.array(z.string()).default([]),
  examples: z
    .array(
      z.object({
        finnishSentence: z.string().min(1),
        englishTranslation: z.string().optional(),
        note: z.string().optional()
      })
    )
    .default([])
});
