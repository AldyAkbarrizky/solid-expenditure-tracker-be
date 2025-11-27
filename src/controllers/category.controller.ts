import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { categories } from "../db/schema";
import { categorySchema } from "../utils/validation";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await db.select().from(categories);
    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = categorySchema.parse(req);

    await db.insert(categories).values({
      name: body.name,
      icon: body.icon,
      color: body.color,
      isDefault: body.isDefault || false,
    });

    res.status(201).json({ status: "success", message: "Category created" });
  } catch (error) {
    next(error);
  }
};
