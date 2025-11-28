import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { config } from "../config";
import { AppError } from "../utils/AppError";
import { RegisterInput, LoginInput } from "../utils/validation";

export class AuthService {
  private signToken(id: number) {
    return jwt.sign({ id }, config.jwtSecret as string, {
      expiresIn: config.jwtExpiresIn as any,
    });
  }

  async register(data: RegisterInput["body"]) {
    const { name, email, password } = data;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      throw new AppError("Email is already in use", 400);
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

    const token = this.signToken(newUser.id);

    return {
      token,
      user: {
        id: newUser.id,
        name,
        email,
      },
    };
  }

  async login(data: LoginInput["body"]) {
    const { email, password } = data;

    const userResult = await db.select().from(users).where(eq(users.email, email));

    if (userResult.length === 0) {
      throw new AppError("Incorrect email or password", 401);
    }

    const user = userResult[0];

    const validPassword = await argon2.verify(user.password, password);

    if (!validPassword) {
      throw new AppError("Incorrect email or password", 401);
    }

    const token = this.signToken(user.id);

    const { password: _, ...userData } = user;

    return {
      token,
      user: userData,
    };
  }
}
