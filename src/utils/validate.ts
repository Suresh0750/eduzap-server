import { z } from "zod";

export const userRequestSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, "Name cannot be empty"),

  phone: z
    .string({ required_error: "Phone is required" })
    .regex(/^[0-9]{10}$/, "Phone number must be a 10-digit number"),

  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title cannot be empty"),

  image: z.string().url("Invalid image URL").optional().nullable(),

  timestamp: z
    .union([z.date(), z.string().datetime()])
    .optional()
    .default(() => new Date()), 
});


export type UserRequestInput = z.infer<typeof userRequestSchema>;
