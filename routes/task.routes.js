import express from "express";
import {getTaskList, getTask, getAllProjects} from "../controllers/task.controller.js";

const router = express.Router();

router.post("/get", getTask);
router.post("/list/get", getTaskList);
router.post("/projects", getAllProjects)

// Export the router
export default router;
