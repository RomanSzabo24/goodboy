import { z } from "zod";

/** Mirrors the response shapes in docs/input/openapi.json — parse every API response through these, never a type assertion. */

export const shelterSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const sheltersResponseSchema = z.object({
  shelters: z.array(shelterSchema),
});

export const resultsResponseSchema = z.object({
  contributors: z.number(),
  contribution: z.number().nullable(),
});

export const contributeMessageSchema = z.object({
  message: z.string(),
  type: z.enum(["ERROR", "WARNING", "INFO", "SUCCESS"]),
});

export const contributeResponseSchema = z.object({
  messages: z.array(contributeMessageSchema),
});

export type Shelter = z.infer<typeof shelterSchema>;
export type SheltersResponse = z.infer<typeof sheltersResponseSchema>;
export type ResultsResponse = z.infer<typeof resultsResponseSchema>;
export type ContributeMessage = z.infer<typeof contributeMessageSchema>;
export type ContributeResponse = z.infer<typeof contributeResponseSchema>;
