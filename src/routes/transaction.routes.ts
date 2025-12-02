import { Router } from "express";
import multer from "multer";
import {
  createTransaction,
  getTransactions,
  getRecentTransactions,
  getTransactionById,
  deleteTransaction,
  updateTransaction,
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
router.post("/", upload.single("image"), createTransaction);

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

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transactions]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction details
 *       404:
 *         description: Transaction not found
 */
router.get("/:id", getTransactionById);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaction deleted
 */
router.delete("/:id", deleteTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Update transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Transaction updated
 */
router.put("/:id", updateTransaction);

export default router;
