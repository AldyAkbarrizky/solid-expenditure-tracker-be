import { eq, desc, and, gte, lte, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import { transactions, transactionItems, categories, users } from "../db/schema";
import { uploadToCloudinary } from "../utils/cloudinary";
import { TransactionInput } from "../utils/validation";

export class TransactionService {
  async createTransaction(
    userId: number,
    data: TransactionInput["body"],
    file?: Express.Multer.File,
  ) {
    let imageUrl = data.imageUrl;

    if (file) {
      const uploadResult = await uploadToCloudinary(file.buffer, "receipts");
      imageUrl = uploadResult.secure_url;
    }

    return await db.transaction(async (tx) => {
      const [newTx] = await tx
        .insert(transactions)
        .values({
          userId: userId,
          totalAmount: data.totalAmount.toString(),
          type: data.type,
          imageUrl: imageUrl,
          rawOcrText: data.rawOcrText,
          transactionDate: new Date(),
        })
        .$returningId();

      if (data.items && data.items.length > 0) {
        const itemsToInsert = data.items.map((item: any) => ({
          transactionId: newTx.id,
          name: item.name,
          price: item.price.toString(),
          qty: item.qty,
          categoryId: item.categoryId || null,
        }));
        await tx.insert(transactionItems).values(itemsToInsert);
      }

      return newTx;
    });
  }

  async getTransactions(
    userId: number,
    query: {
      startDate?: string;
      endDate?: string;
      limit?: number;
      familyId?: number;
      itemName?: string;
      categoryId?: number;
    },
  ) {
    const { startDate, endDate, limit, familyId, itemName, categoryId } = query;
    const conditions = [];

    if (familyId) {
      const familyMembers = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.familyId, familyId));
      
      const memberIds = familyMembers.map((m) => m.id);
      conditions.push(inArray(transactions.userId, memberIds));
    } else {
      conditions.push(eq(transactions.userId, userId));
    }

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

    if (itemName || categoryId) {
      const itemConditions = [];
      if (itemName) {
        itemConditions.push(sql`${transactionItems.name} LIKE ${`%${itemName}%`}`);
      }
      if (categoryId) {
        itemConditions.push(eq(transactionItems.categoryId, Number(categoryId)));
      }

      const matchingTxIds = await db
        .selectDistinct({ id: transactionItems.transactionId })
        .from(transactionItems)
        .where(and(...itemConditions));

      if (matchingTxIds.length === 0) {
        return { results: 0, data: [] };
      }

      const ids = matchingTxIds.map((t) => t.id);
      conditions.push(inArray(transactions.id, ids));
    }

    const limitNum = Number(limit) || 20;

    const txList = await db
      .select({
        id: transactions.id,
        totalAmount: transactions.totalAmount,
        type: transactions.type,
        transactionDate: transactions.transactionDate,
        imageUrl: transactions.imageUrl,
        user: {
          id: users.id,
          name: users.name,
          avatarUrl: users.avatarUrl,
        }
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(transactions.transactionDate))
      .limit(limitNum);

    if (txList.length === 0) {
      return { results: 0, data: [] };
    }

    const transactionIds = txList.map((tx) => tx.id);
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

    const finalData = txList.map((tx) => ({
      ...tx,
      items: itemsData.filter((item) => item.transactionId === tx.id),
    }));

    return {
      results: finalData.length,
      data: finalData,
    };
  }
}
