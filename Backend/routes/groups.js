import express from "express";
import { authenticate } from "../middleware/auth.js";
import { createGroup,addMember,getMyGroups,getGroupById } from "../controller/groupController.js";

const router = express.Router();

router.use(authenticate);

router.post("/",createGroup);
router.post("/:id/members",addMember);
router.get("/mine",getMyGroups);
router.get("/:id",getGroupById);

export default router;