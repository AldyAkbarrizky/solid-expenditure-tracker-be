import { Router } from "express";
import { getDashboardStats } from "../controllers/stats.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/stats/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get("/dashboard", protect, getDashboardStats);

export default router;
