import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { transactions, transactionItems, categories } from "../db/schema";
import { transactionSchema } from "../utils/validation";
import { eq, desc, inArray } from "drizzle-orm";

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

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.transactionDate))
      .limit(20);

    if (userTransactions.length === 0) {
      return res.status(200).json({
        status: "success",
        results: 0,
        data: [],
      });
    }

    const transactionIds = userTransactions.map((tx) => tx.id);

    const itemsData = await db
      .select({
        itemId: transactionItems.id,
        transactionId: transactionItems.transactionId,
        name: transactionItems.name,
        price: transactionItems.price,
        qty: transactionItems.qty,
        category: {
          id: categories.id,
          name: categories.name,
          icon: categories.icon,
          color: categories.color,
        },
      })
      .from(transactionItems)
      .leftJoin(categories, eq(transactionItems.categoryId, categories.id))
      .where(inArray(transactionItems.transactionId, transactionIds));

    const finalData = userTransactions.map((tx) => {
      const myItems = itemsData.filter((item) => item.transactionId === tx.id);

      return {
        ...tx,
        items: myItems,
      };
    });

    res.status(200).json({
      status: "success",
      results: finalData.length,
      data: finalData,
    });
  } catch (error) {
    next(error);
  }
};
