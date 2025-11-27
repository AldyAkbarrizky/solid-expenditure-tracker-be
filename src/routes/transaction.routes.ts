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

router.get("/recent", getRecentTransactions);
router.post("/", createTransaction);
router.get("/", getTransactions);

export default router;
