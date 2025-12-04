import { Router } from "express";
import { getDashboardStats, getReport } from "../controllers/stats.controller";
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

/**
 * @swagger
 * /api/stats/report:
 *   get:
 *     summary: Get monthly report
 *     tags: [Stats]
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
 *         name: family
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Report data
 */
router.get("/report", protect, getReport);

export default router;
