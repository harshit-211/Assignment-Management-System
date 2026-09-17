import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "../routes/auth.js";
import groupRoutes from "../routes/groups.js";
import assignmentRoutes from "../routes/assignments.js";
import submissionRoutes from "../routes/submissions.js";
import analyticsRoutes from "../routes/analytics.js";

dotenv.config({
    path : "../.env"
});

const PORT = 3000;
const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/auth",authRoutes);
app.use("/api/groups",groupRoutes);
app.use("/api/assignments",assignmentRoutes);
app.use("/api/submissions",submissionRoutes);
app.use("/api/analytics",analyticsRoutes);

app.listen(PORT,() => {
    console.log(`Server is listening on port ${PORT}`);
});