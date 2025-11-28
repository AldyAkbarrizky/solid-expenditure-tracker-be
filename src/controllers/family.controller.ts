import { Request, Response, NextFunction } from "express";
import { FamilyService } from "../services/family.service";
import { z } from "zod";

const familyService = new FamilyService();

export const createFamily = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      name: z.string().min(3),
    });
    const { name } = schema.parse(req.body);

    const family = await familyService.createFamily(req.user!.id, name);

    res.status(201).json({
      status: "success",
      data: family,
    });
  } catch (error) {
    next(error);
  }
};

export const joinFamily = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schema = z.object({
      inviteCode: z.string().length(10),
    });
    const { inviteCode } = schema.parse(req.body);

    const family = await familyService.joinFamily(req.user!.id, inviteCode);

    res.status(200).json({
      status: "success",
      message: "Joined family successfully",
      data: family,
    });
  } catch (error) {
    next(error);
  }
};

export const getFamilyMembers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user!.familyId) {
      return res.status(400).json({
        status: "fail",
        message: "User is not in a family",
      });
    }

    const members = await familyService.getFamilyMembers(req.user!.familyId);

    res.status(200).json({
      status: "success",
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFamilyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user!.familyId) {
      return res.status(400).json({
        status: "fail",
        message: "User is not in a family",
      });
    }

    const updatedFamily = await familyService.updateFamilyProfile(
      req.user!.id,
      req.user!.familyId,
      req.body,
      req.file,
    );

    res.status(200).json({
      status: "success",
      data: updatedFamily,
    });
  } catch (error) {
    next(error);
  }
};
