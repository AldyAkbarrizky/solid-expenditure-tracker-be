import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: number;
      };

      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.id));

      if (userResult.length === 0) {
        return res.status(401).json({
          status: "fail",
          message: "The user belonging to this token no longer does exist.",
        });
      }

      req.user = userResult[0];

      next();
    } catch (error) {
      return res.status(401).json({
        status: "fail",
        message: "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "Not authorized, no token",
    });
  }
};
