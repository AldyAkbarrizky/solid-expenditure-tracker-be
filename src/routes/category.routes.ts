import { Router } from "express";
import {
  getCategories,
  createCategory,
} from "../controllers/category.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", protect, getCategories);
router.post("/", protect, createCategory);

export default router;
