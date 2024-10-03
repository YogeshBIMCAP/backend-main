import express from "express";
import {getTaskList, getTask} from "../controllers/task.controller.js";

const router = express.Router();

router.post("/get", getTask);
router.post("/list/get", getTaskList);

// Export the router
export default router;
