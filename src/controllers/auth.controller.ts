import { Request, Response, NextFunction } from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { registerSchema, loginSchema } from "../utils/validation";

const signToken = (id: number) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "90d",
  });
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = registerSchema.parse(req);
    const { name, email, password } = body;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      return res.status(400).json({
        status: "fail",
        message: "Email is already in use",
      });
    }

    const passwordHash = await argon2.hash(password);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: passwordHash,
      })
      .$returningId();

    const token = signToken(newUser.id);

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: {
          id: newUser.id,
          name,
          email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = loginSchema.parse(req);
    const { email, password } = body;

    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (userResult.length === 0) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    const user = userResult[0];

    const validPassword = await argon2.verify(user.password, password);

    if (!validPassword) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });
    }

    const token = signToken(user.id);

    const { password: _, ...userData } = user;

    res.status(200).json({
      status: "success",
      token,
      data: {
        user: userData,
      },
    });
  } catch (error) {
    next(error);
  }
};
