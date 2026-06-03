import { z } from "zod";

const aiTextTaskSchema = z.enum([
  "improve",
  "generate",
  "translate",
  "shorten",
  "expand",
]);

const aiTextFieldSchema = z.enum([
  "name",
  "description",
  "activationDetails",
  "regionalLimitations",
  "systemRequirementLines",
]);

const aiProductContextSchema = z.object({
  name: z.string().min(1).max(500),
  platform: z.string().min(1).max(200),
  originalName: z.string().max(500).nullable().optional(),
  regionalLimitations: z.string().max(2000).nullable().optional(),
  developers: z.array(z.string().max(200)).max(50).optional(),
  publishers: z.array(z.string().max(200)).max(50).optional(),
  languages: z.array(z.string().max(100)).max(50).optional(),
  isPreorder: z.boolean().optional(),
});

const aiSystemRequirementBlockInputSchema = z.object({
  system: z.string().max(100),
  requirement: z.array(z.string().max(500)).max(40),
});

const aiSystemRequirementBlockOutputSchema = z.object({
  system: z.string().trim().min(1).max(100),
  requirement: z.array(z.string().trim().min(1).max(500)).min(1).max(40),
});

export const aiSystemRequirementsResponseSchema = z.object({
  requirements: z.array(aiSystemRequirementBlockOutputSchema).min(1).max(12),
});

export const aiSystemRequirementsAssistInputSchema = z.object({
  task: aiTextTaskSchema,
  productContext: aiProductContextSchema,
  currentBlocks: z.array(aiSystemRequirementBlockInputSchema).max(12),
});

export const aiSystemRequirementBlockAssistInputSchema = z.object({
  task: aiTextTaskSchema,
  productContext: aiProductContextSchema,
  systemName: z.string().max(100),
  requirementLines: z.string().max(20_000),
});

export const aiTextAssistInputSchema = z.object({
  task: aiTextTaskSchema,
  field: aiTextFieldSchema,
  currentText: z.string().max(50_000),
  productContext: aiProductContextSchema,
});
