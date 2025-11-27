import { Router } from "express";
import {
  createTransaction,
  getTransactions,
} from "../controllers/transaction.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.post("/", createTransaction);
router.get("/", getTransactions);

export default router;
