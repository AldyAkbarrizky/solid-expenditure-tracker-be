import { Router } from "express";
import { getDashboardStats } from "../controllers/stats.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.get("/dashboard", protect, getDashboardStats);

export default router;
