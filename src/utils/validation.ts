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
  price: z.number(), // Allow negative for legacy support or manual adjustments
  qty: z.number().default(1),
  unit: z.string().optional(),
  categoryId: z.number().int().optional().nullable(),
  basePrice: z.number().optional().nullable(),
  discountType: z.enum(["PERCENT", "NOMINAL"]).optional().nullable(),
  discountValue: z.number().optional().nullable(),
});

const feeSchema = z.object({
  name: z.string().min(1),
  amount: z.number(),
});

const taxSchema = z.object({
  name: z.string().min(1),
  amount: z.number(),
  type: z.enum(["PERCENT", "NOMINAL"]),
  value: z.number(),
});

const discountSchema = z.object({
  name: z.string().min(1),
  amount: z.number(),
  type: z.enum(["PERCENT", "NOMINAL"]),
  value: z.number(),
});

export const transactionSchema = z.object({
  body: z.object({
    totalAmount: z.number().positive(),
    type: z.enum(["RECEIPT", "QRIS", "MANUAL"]),
    transactionDate: z.string().or(z.date()).optional(),
    imageUrl: z.url().optional().nullable(),
    rawOcrText: z.string().optional().nullable(),
    items: z.array(transactionItemSchema).optional(),
    fees: z.array(feeSchema).optional(),
    taxes: z.array(taxSchema).optional(),
    discounts: z.array(discountSchema).optional(),
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

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
