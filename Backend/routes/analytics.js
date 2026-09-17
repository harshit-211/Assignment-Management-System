import express from "express";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";
import { getSummary } from "../controller/analyticsController.js";

const router = express.Router();

router.use(authenticate,requireRole('admin'));

router.get("/summary",getSummary);

export default router;