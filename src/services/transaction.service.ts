import { eq, desc, and, gte, lte, inArray, sql } from "drizzle-orm";
import { db } from "../db";
import { transactions, transactionItems, transactionFees, transactionDiscounts, transactionTaxes, categories, users } from "../db/schema";
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
          transactionDate: data.transactionDate ? new Date(data.transactionDate) : new Date(),
        })
        .$returningId();

      if (data.items && data.items.length > 0) {
        const itemsToInsert = data.items.map((item: any) => ({
          transactionId: newTx.id,
          name: item.name,
          price: item.price.toString(),
          qty: item.qty,
          unit: item.unit || "pcs",
          categoryId: item.categoryId || null,
          basePrice: item.basePrice ? item.basePrice.toString() : null,
          discountType: item.discountType || null,
          discountValue: item.discountValue ? item.discountValue.toString() : null,
        }));
        await tx.insert(transactionItems).values(itemsToInsert);
      }

      if (data.fees && data.fees.length > 0) {
        const feesToInsert = data.fees.map((fee: any) => ({
          transactionId: newTx.id,
          name: fee.name,
          amount: fee.amount.toString(),
        }));
        await tx.insert(transactionFees).values(feesToInsert);
      }

      if (data.taxes && data.taxes.length > 0) {
        const taxesToInsert = data.taxes.map((tax: any) => ({
          transactionId: newTx.id,
          name: tax.name,
          amount: tax.amount.toString(),
          type: tax.type,
          value: tax.value.toString(),
        }));
        await tx.insert(transactionTaxes).values(taxesToInsert);
      }

      if (data.discounts && data.discounts.length > 0) {
        const discountsToInsert = data.discounts.map((discount: any) => ({
          transactionId: newTx.id,
          name: discount.name,
          amount: discount.amount.toString(),
          type: discount.type,
          value: discount.value.toString(),
        }));
        await tx.insert(transactionDiscounts).values(discountsToInsert);
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
      filterUserId?: number;
    },
  ) {
    const { startDate, endDate, limit, familyId, itemName, categoryId, filterUserId } = query;
    const conditions = [];

    if (familyId) {
      if (filterUserId) {
        // Verify the filtered user is in the same family
        const [targetUser] = await db
          .select({ familyId: users.familyId })
          .from(users)
          .where(eq(users.id, filterUserId));
        
        if (targetUser && targetUser.familyId === familyId) {
          conditions.push(eq(transactions.userId, filterUserId));
        } else {
          // Fallback to all family members if user not found or not in family
          // Or strictly return empty? Let's stick to safe fallback or just ignore the filter
          // For now, let's just ignore the filter if invalid, and show all family
           const familyMembers = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.familyId, familyId));
          
          const memberIds = familyMembers.map((m) => m.id);
          conditions.push(inArray(transactions.userId, memberIds));
        }
      } else {
        const familyMembers = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.familyId, familyId));
        
        const memberIds = familyMembers.map((m) => m.id);
        conditions.push(inArray(transactions.userId, memberIds));
      }
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
  async getTransactionById(transactionId: number, userId: number, familyId?: number) {
    const [transaction] = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        totalAmount: transactions.totalAmount,
        type: transactions.type,
        transactionDate: transactions.transactionDate,
        imageUrl: transactions.imageUrl,
        rawOcrText: transactions.rawOcrText,
        user: {
          id: users.id,
          name: users.name,
          avatarUrl: users.avatarUrl,
        }
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(eq(transactions.id, transactionId));

    if (!transaction) {
      return null;
    }

    // Check access rights
    if (transaction.userId !== userId) {
      // If not owner, check if in same family
      if (!familyId) {
        // If user not in family, strict check fails
        return null;
      }
      
      // Check if transaction owner is in same family
      const [txOwner] = await db
        .select({ familyId: users.familyId })
        .from(users)
        .where(eq(users.id, transaction.userId));
        
      if (!txOwner || txOwner.familyId !== familyId) {
        return null;
      }
    }

    const itemsData = await db
      .select({
        itemId: transactionItems.id,
        transactionId: transactionItems.transactionId,
        name: transactionItems.name,
        price: transactionItems.price,
        qty: transactionItems.qty,
        basePrice: transactionItems.basePrice,
        discountType: transactionItems.discountType,
        discountValue: transactionItems.discountValue,
        category: {
          id: categories.id,
          name: categories.name,
          icon: categories.icon,
          color: categories.color,
        },
      })
      .from(transactionItems)
      .leftJoin(categories, eq(transactionItems.categoryId, categories.id))
      .where(eq(transactionItems.transactionId, transactionId));

    const feesData = await db
      .select()
      .from(transactionFees)
      .where(eq(transactionFees.transactionId, transactionId));

    const discountsData = await db
      .select()
      .from(transactionDiscounts)
      .where(eq(transactionDiscounts.transactionId, transactionId));

    return {
      ...transaction,
      items: itemsData,
      fees: feesData,
      discounts: discountsData,
    };
  }
  async deleteTransaction(transactionId: number, userId: number) {
    // Verify ownership
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)));

    if (!transaction) {
      throw new Error("Transaction not found or access denied");
    }

    // Delete transaction (cascade will handle items)
    await db.delete(transactions).where(eq(transactions.id, transactionId));
    
    return true;
  }

  async updateTransaction(
    transactionId: number,
    userId: number,
    data: TransactionInput["body"]
  ) {
    // Verify ownership
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)));

    if (!transaction) {
      throw new Error("Transaction not found or access denied");
    }

    return await db.transaction(async (tx) => {
      // Update main transaction details
      await tx
        .update(transactions)
        .set({
          totalAmount: data.totalAmount.toString(),
          rawOcrText: data.rawOcrText,
          type: data.type,
          transactionDate: data.transactionDate ? new Date(data.transactionDate) : undefined,
          // We don't update imageUrl here usually, unless re-upload logic is added
        })
        .where(eq(transactions.id, transactionId));

      // Update items: Strategy -> Delete all and re-insert
      await tx.delete(transactionItems).where(eq(transactionItems.transactionId, transactionId));
      await tx.delete(transactionFees).where(eq(transactionFees.transactionId, transactionId));
      await tx.delete(transactionTaxes).where(eq(transactionTaxes.transactionId, transactionId));
      await tx.delete(transactionDiscounts).where(eq(transactionDiscounts.transactionId, transactionId));

      if (data.items && data.items.length > 0) {
        const itemsToInsert = data.items.map((item: any) => ({
          transactionId: transactionId,
          name: item.name,
          price: item.price.toString(),
          qty: item.qty,
          unit: item.unit || "pcs",
          categoryId: item.categoryId || null,
          basePrice: item.basePrice ? item.basePrice.toString() : null,
          discountType: item.discountType || null,
          discountValue: item.discountValue ? item.discountValue.toString() : null,
        }));
        await tx.insert(transactionItems).values(itemsToInsert);
      }

      if (data.fees && data.fees.length > 0) {
        const feesToInsert = data.fees.map((fee: any) => ({
          transactionId: transactionId,
          name: fee.name,
          amount: fee.amount.toString(),
        }));
        await tx.insert(transactionFees).values(feesToInsert);
      }

      if (data.taxes && data.taxes.length > 0) {
        const taxesToInsert = data.taxes.map((tax: any) => ({
          transactionId: transactionId,
          name: tax.name,
          amount: tax.amount.toString(),
          type: tax.type,
          value: tax.value.toString(),
        }));
        await tx.insert(transactionTaxes).values(taxesToInsert);
      }

      if (data.discounts && data.discounts.length > 0) {
        const discountsToInsert = data.discounts.map((discount: any) => ({
          transactionId: transactionId,
          name: discount.name,
          amount: discount.amount.toString(),
          type: discount.type,
          value: discount.value.toString(),
        }));
        await tx.insert(transactionDiscounts).values(discountsToInsert);
      }

      return { id: transactionId, ...data };
    });
  }
}
