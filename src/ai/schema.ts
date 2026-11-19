import { z } from 'zod';

export const AiExplanationSchema = z.object({
  summary: z.string().min(5).max(400),
  highlights: z.array(z.string().min(3).max(150)).min(1).max(5),
});

export const AiAnswerSchema = z.object({
  text: z.string().min(5).max(500),
  suggestedActionId: z.string().optional(),
});
