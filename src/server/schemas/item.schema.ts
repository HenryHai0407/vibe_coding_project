import { z } from "zod";

const itemTypeSchema = z.enum(["word", "phrase", "grammar", "note"]);

const exampleSchema = z.object({
  finnishSentence: z.string().min(1),
  englishTranslation: z.string().optional(),
  note: z.string().optional()
});

export const createItemSchema = z.object({
  type: itemTypeSchema,
  finnishText: z.string().min(1),
  baseTranslation: z.string().optional(),
  explanation: z.string().optional(),
  usageNote: z.string().optional(),
  sourceContext: z.string().optional(),
  difficulty: z.number().int().min(1).max(5).default(2),
  tagIds: z.array(z.string()).default([]),
  examples: z.array(exampleSchema).default([])
});

export const updateItemSchema = z
  .object({
    type: itemTypeSchema.optional(),
    finnishText: z.string().min(1).optional(),
    baseTranslation: z.string().optional(),
    explanation: z.string().optional(),
    usageNote: z.string().optional(),
    sourceContext: z.string().optional(),
    difficulty: z.number().int().min(1).max(5).optional(),
    examples: z.array(exampleSchema).optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided for update."
  });
