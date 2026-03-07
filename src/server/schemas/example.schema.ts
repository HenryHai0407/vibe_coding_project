import { z } from "zod";

export const createExampleSchema = z.object({
  finnishSentence: z.string().min(1),
  englishTranslation: z.string().optional(),
  note: z.string().optional()
});

export const updateExampleSchema = z
  .object({
    finnishSentence: z.string().min(1).optional(),
    englishTranslation: z.string().optional(),
    note: z.string().optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided for update."
  });
