import express from "express";
import { authenticate } from "../middleware/auth.js";
import { confirmStep1,confirmStep2,getSubmissionsForAssignment,getSubmissionsForGroup } from "../controller/submissionController.js";

const router = express.Router();

router.use(authenticate);

router.post('/:assignmentId/confirm', confirmStep1);
router.post('/:assignmentId/verify', confirmStep2);
router.get('/assignment/:id', getSubmissionsForAssignment);
router.get('/group/:id', getSubmissionsForGroup);

export default router;