import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { UserService } from "../services/user.service";
import { registerSchema, loginSchema } from "../utils/validation";
import { z } from "zod";

const authService = new AuthService();
const userService = new UserService();

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = registerSchema.parse(req);
    const result = await authService.register(body);

    res.status(201).json({
      status: "success",
      ...result,
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
    const result = await authService.login(body);

    res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      name: z.string().min(3).optional(),
    });
    const { name } = schema.parse(req.body);

    const updatedUser = await userService.updateProfile(
      req.user!.id,
      { name },
      req.file,
    );

    res.status(200).json({
      status: "success",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await userService.getUserById(req.user!.id);
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
