import { Request, Response, NextFunction } from "express";
import { ocrService } from "../services/ocr.service";

export const scanReceipt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({
        status: "fail",
        message: "No image files provided",
      });
    }

    const result = await ocrService.scanReceipt(files);

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
