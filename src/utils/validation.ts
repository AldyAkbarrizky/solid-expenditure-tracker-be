import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    email: z.email(),
    password: z.string().min(6),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(1),
  }),
});

const transactionItemSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  qty: z.number().int().positive().default(1),
  categoryId: z.number().int().optional().nullable(),
});

export const transactionSchema = z.object({
  body: z.object({
    totalAmount: z.number().positive(),
    type: z.enum(["RECEIPT", "QRIS", "MANUAL"]),
    imageUrl: z.url().optional().nullable(),
    rawOcrText: z.string().optional().nullable(),
    items: z.array(transactionItemSchema).optional(),
  }),
});

export const categorySchema = z.object({
  body: z.object({
    name: z.string().min(2),
    icon: z.string().optional(),
    color: z
      .string()
      .regex(/^#[0-9A-F]{6}$/i)
      .optional(),
    isDefault: z.boolean().optional(),
  }),
});
