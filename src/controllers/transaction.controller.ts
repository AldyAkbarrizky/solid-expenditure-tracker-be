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
    if (typeof req.body.taxes === "string") {
      bodyData = { ...bodyData, taxes: JSON.parse(req.body.taxes) };
    }
    if (typeof req.body.fees === "string") {
      bodyData = { ...bodyData, fees: JSON.parse(req.body.fees) };
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
    if (bodyData.taxes) {
      bodyData.taxes = bodyData.taxes.map((t: any) => ({
        ...t,
        amount: Number(t.amount),
        value: Number(t.value),
      }));
    }
    if (bodyData.fees) {
      bodyData.fees = bodyData.fees.map((f: any) => ({
        ...f,
        amount: Number(f.amount),
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
    const { startDate, endDate, limit, family, filterUserId } = req.query;

    const result = await transactionService.getTransactions(req.user!.id, {
      startDate: startDate as string,
      endDate: endDate as string,
      limit: limit ? Number(limit) : undefined,
      familyId: family === "true" ? req.user!.familyId || undefined : undefined,
      itemName: req.query.itemName as string,
      categoryId: req.query.categoryId ? Number(req.query.categoryId) : undefined,
      filterUserId: filterUserId ? Number(filterUserId) : undefined,
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
export const getTransactionById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const transaction = await transactionService.getTransactionById(
      Number(id),
      req.user!.id,
      req.user!.familyId || undefined
    );

    if (!transaction) {
      return res.status(404).json({
        status: "fail",
        message: "Transaction not found or access denied",
      });
    }

    res.status(200).json({
      status: "success",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    await transactionService.deleteTransaction(Number(id), req.user!.id);

    res.status(200).json({
      status: "success",
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    let bodyData = req.body;

    // Handle stringified items if coming from multipart/form-data (though update might be JSON)
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

    // Validate body
    const { body } = transactionSchema.parse({ body: bodyData });

    const updatedTransaction = await transactionService.updateTransaction(
      Number(id),
      req.user!.id,
      body
    );

    res.status(200).json({
      status: "success",
      message: "Transaction updated successfully",
      data: updatedTransaction,
    });
  } catch (error) {
    next(error);
  }
};
