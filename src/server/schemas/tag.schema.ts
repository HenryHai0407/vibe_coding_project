import { z } from "zod";

export const createTagSchema = z.object({
  name: z.string().min(1).max(40),
  color: z.string().min(4).max(20).optional()
});

export const updateTagSchema = z
  .object({
    name: z.string().min(1).max(40).optional(),
    color: z.string().min(4).max(20).nullable().optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one field must be provided for update."
  });
