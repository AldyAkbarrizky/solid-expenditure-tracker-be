import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { transactions, transactionItems } from "../db/schema";
import { transactionSchema } from "../utils/validation";
import { eq, desc } from "drizzle-orm";

export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = transactionSchema.parse(req);

    const userId = req.user!.id;

    await db.transaction(async (tx) => {
      const [newTx] = await tx
        .insert(transactions)
        .values({
          userId: userId,
          totalAmount: body.totalAmount.toString(),
          type: body.type,
          imageUrl: body.imageUrl,
          rawOcrText: body.rawOcrText,
        })
        .$returningId();

      const transactionId = newTx.id;

      if (body.items && body.items.length > 0) {
        const itemsToInsert = body.items.map((item) => ({
          transactionId: transactionId,
          name: item.name,
          price: item.price.toString(),
          qty: item.qty,
          categoryId: item.categoryId || null,
        }));

        await tx.insert(transactionItems).values(itemsToInsert);
      }
    });

    res.status(201).json({
      status: "success",
      message: "Transaction created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;

    const data = await db.query.transactions.findMany({
      where: eq(transactions.userId, userId),
      orderBy: [desc(transactions.transactionDate)],
      limit: 20,
      with: {
        items: {
          with: {
            category: true,
          },
        },
      },
    });

    res.status(200).json({
      status: "succes",
      results: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};
