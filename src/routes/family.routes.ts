import express from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  createFamily,
  joinFamily,
  getFamilyMembers,
  updateFamilyProfile,
} from "../controllers/family.controller";
import multer from "multer";

const router = express.Router();
const upload = multer();

router.use(protect);

/**
 * @swagger
 * /api/families:
 *   post:
 *     summary: Create a new family
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Family created
 */
router.post("/", createFamily);

/**
 * @swagger
 * /api/families/join:
 *   post:
 *     summary: Join a family
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inviteCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Joined family
 */
router.post("/join", joinFamily);
router.get("/members", getFamilyMembers);
router.put("/profile", upload.single("avatar"), updateFamilyProfile);

export default router;
