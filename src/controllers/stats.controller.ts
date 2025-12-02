import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { transactions, transactionItems, categories, users } from "../db/schema";
import { eq, and, sql, gte, lte, inArray } from "drizzle-orm";

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { family } = req.query;
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const conditions = [
      gte(transactions.transactionDate, startOfMonth),
      lte(transactions.transactionDate, endOfMonth),
    ];

    if (family === "true" && req.user!.familyId) {
      const familyMembers = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.familyId, req.user!.familyId));
      
      const memberIds = familyMembers.map((m) => m.id);
      conditions.push(inArray(transactions.userId, memberIds));
    } else {
      conditions.push(eq(transactions.userId, userId));
    }

    const [monthlyTotal] = await db
      .select({
        total: sql<number>`sum(${transactions.totalAmount})`.mapWith(Number),
      })
      .from(transactions)
      .where(and(...conditions));

    const categoryStats = await db
      .select({
        categoryName: categories.name,
        color: categories.color,
        icon: categories.icon,
        total:
          sql<number>`sum(${transactionItems.price} * ${transactionItems.qty})`.mapWith(
            Number,
          ),
      })
      .from(transactionItems)
      .innerJoin(
        transactions,
        eq(transactionItems.transactionId, transactions.id),
      )
      .leftJoin(categories, eq(transactionItems.categoryId, categories.id))
      .where(and(...conditions))
      .groupBy(
        categories.id,
        categories.name,
        categories.color,
        categories.icon,
      )
      .orderBy(
        sql`sum(${transactionItems.price} * ${transactionItems.qty}) desc`,
      );

    const dailyStats = await db
      .select({
        date: sql<string>`DATE_FORMAT(${transactions.transactionDate}, '%Y-%m-%d')`,
        total: sql<number>`sum(${transactions.totalAmount})`.mapWith(Number),
      })
      .from(transactions)
      .where(and(...conditions))
      .groupBy(sql`DATE_FORMAT(${transactions.transactionDate}, '%Y-%m-%d')`)
      .orderBy(sql`DATE_FORMAT(${transactions.transactionDate}, '%Y-%m-%d')`);

    res.status(200).json({
      status: "success",
      data: {
        month: startOfMonth.toLocaleString("default", { month: "long" }),
        totalExpense: monthlyTotal?.total || 0,
        pieChart: categoryStats,
        lineChart: dailyStats,
      },
    });
  } catch (error) {
    next(error);
  }
};
