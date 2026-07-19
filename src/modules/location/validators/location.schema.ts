import { z } from "zod";

export const updateProvinceSchema = z.object({
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateCitySchema = z.object({
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export type UpdateProvinceInput = z.infer<typeof updateProvinceSchema>;
export type UpdateCityInput = z.infer<typeof updateCitySchema>;
