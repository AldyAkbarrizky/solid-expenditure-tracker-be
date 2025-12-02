import { Router } from "express";
import multer from "multer";
import { scanReceipt } from "../controllers/ocr.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * @swagger
 * /api/ocr/scan:
 *   post:
 *     summary: Scan receipt image
 *     tags: [OCR]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Extracted receipt data
 *       400:
 *         description: No image provided
 */
router.post("/scan", protect, upload.array("images", 5), scanReceipt);

export default router;
