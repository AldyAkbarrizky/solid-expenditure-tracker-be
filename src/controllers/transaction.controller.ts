import { Request, Response, NextFunction } from "express";
import { TransactionService } from "../services/transaction.service";
import { transactionSchema } from "../utils/validation";

const transactionService = new TransactionService();

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

    const transaction = await transactionService.createTransaction(
      req.user!.id,
      body,
      req.file,
    );

    res.status(201).json({
      status: "success",
      message: "Transaction saved",
      data: transaction,
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
    const { startDate, endDate, limit, family } = req.query;

    const result = await transactionService.getTransactions(req.user!.id, {
      startDate: startDate as string,
      endDate: endDate as string,
      limit: limit ? Number(limit) : undefined,
      familyId: family === "true" ? req.user!.familyId || undefined : undefined,
      itemName: req.query.itemName as string,
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
    });

    res.status(200).json({
      status: "success",
      ...result,
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
    const result = await transactionService.getTransactions(req.user!.id, {
      limit: 5,
    });

    res.status(200).json({
      status: "success",
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};
