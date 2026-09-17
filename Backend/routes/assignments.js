import express from "express";
import { createAssignment,updateAssignment,getAssignments } from "../controller/assignmentController.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/roleCheck.js";

const router = express.Router();

router.use(authenticate);

router.post('/', requireRole('admin'), createAssignment);
router.put('/:id', requireRole('admin'), updateAssignment);
router.get('/', getAssignments);

export default router;