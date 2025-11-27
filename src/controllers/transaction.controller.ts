import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { transactions, transactionItems, categories } from "../db/schema";
import { transactionSchema } from "../utils/validation";
import { eq, desc, inArray, and, gte, lte, sql } from "drizzle-orm";
import { uploadToCloudinary } from "../utils/cloudinary";

export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let bodyData = req.body;

    if (typeof req.body.items === "string") {
      bodyData = { ...req.body, items: JSON.parse(req.body.items) };
    }

    if (bodyData.totalAmount)
      bodyData.totalAmount = Number(bodyData.totalAmount);
    if (bodyData.items) {
      bodyData.items = bodyData.items.map((i: any) => ({
        ...i,
        price: Number(i.price),
        qty: Number(i.qty),
        categoryId: i.categoryId ? Number(i.categoryId) : null,
      }));
    }

    const { body } = transactionSchema.parse({ body: bodyData });
    const userId = req.user!.id;

    let imageUrl = body.imageUrl;

    if (req.file) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "receipts",
      );
      imageUrl = uploadResult.secure_url;
    }

    await db.transaction(async (tx) => {
      const [newTx] = await tx
        .insert(transactions)
        .values({
          userId: userId,
          totalAmount: body.totalAmount.toString(),
          type: body.type,
          imageUrl: imageUrl,
          rawOcrText: body.rawOcrText,
          transactionDate: new Date(),
        })
        .$returningId();

      if (body.items && body.items.length > 0) {
        const itemsToInsert = body.items.map((item) => ({
          transactionId: newTx.id,
          name: item.name,
          price: item.price.toString(),
          qty: item.qty,
          categoryId: item.categoryId || null,
        }));
        await tx.insert(transactionItems).values(itemsToInsert);
      }

      res.status(201).json({ status: "success", message: "Transaction saved" });
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

    const { startDate, endDate, categoryId, limit } = req.query;

    const conditions = [eq(transactions.userId, userId)];

    if (startDate) {
      conditions.push(
        gte(transactions.transactionDate, new Date(startDate as string)),
      );
    }
    if (endDate) {
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(transactions.transactionDate, end));
    }

    const limitNum = Number(limit) || 20;

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(and(...conditions))
      .orderBy(desc(transactions.transactionDate))
      .limit(limitNum);

    if (userTransactions.length === 0) {
      return res.status(200).json({ results: 0, data: [] });
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

    const finalData = userTransactions.map((tx) => ({
      ...tx,
      items: itemsData.filter((item) => item.transactionId === tx.id),
    }));

    res.status(200).json({
      status: "success",
      results: finalData.length,
      data: finalData,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;

    const recentTx = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.transactionDate))
      .limit(5);

    if (recentTx.length === 0) {
      return res.status(200).json({
        status: "success",
        data: [],
      });
    }

    const transactionIds = recentTx.map((tx) => tx.id);

    const itemsData = await db
      .select({
        itemId: transactionItems.id,
        transactionId: transactionItems.transactionId,
        name: transactionItems.name,
        price: transactionItems.price,
        qty: transactionItems.qty,
        category: {
          name: categories.name,
          icon: categories.icon,
          color: categories.color,
        },
      })
      .from(transactionItems)
      .leftJoin(categories, eq(transactionItems.categoryId, categories.id))
      .where(inArray(transactionItems.transactionId, transactionIds));

    const finalData = recentTx.map((tx) => ({
      ...tx,
      items: itemsData.filter((item) => item.transactionId === tx.id),
    }));

    res.status(200).json({
      status: "success",
      data: finalData,
    });
  } catch (error) {
    next(error);
  }
};
