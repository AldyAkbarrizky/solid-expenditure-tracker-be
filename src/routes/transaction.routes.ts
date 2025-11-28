import { Router } from "express";
import multer from "multer";
import {
  createTransaction,
  getTransactions,
  getRecentTransactions,
} from "../controllers/transaction.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

/**
 * @swagger
 * /api/transactions/recent:
 *   get:
 *     summary: Get recent transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recent transactions
 */
router.get("/recent", getRecentTransactions);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - totalAmount
 *               - type
 *             properties:
 *               totalAmount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [RECEIPT, QRIS, MANUAL]
 *               image:
 *                 type: string
 *                 format: binary
 *               items:
 *                 type: string
 *                 description: JSON string of items array
 *     responses:
 *       201:
 *         description: Transaction created
 */
router.post("/", createTransaction);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get transactions list
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: family
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get("/", getTransactions);

export default router;
