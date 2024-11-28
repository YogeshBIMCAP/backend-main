import express from "express";
const router = express.Router();
import {timeElapsedDaily as timeElapsedWeekly } from "../middlewares/weekly/timeelapsed.middleware.js"
import {fillUserData as fillUserDataWeekly} from "../middlewares/weekly/fillUserData.middleware.js"
import { fillTaskData as fillTaskDataWeekly } from "../middlewares/weekly/fillTaskData.middleware.js";
import {timeElapsedDaily as timeElapsedDaily } from "../middlewares/daily/timeelapsed.middleware.js"
import {fillUserData as fillUserDataDaily} from "../middlewares/daily/fillUserData.middleware.js"
import { fillTaskData as fillTaskDataDaily } from "../middlewares/daily/fillTaskData.middleware.js";
import {dailyReport, weeklyReport } from "../controllers/report.controller.js";
router.get("/", (req, res) => {
    res.send("working");
})
router.post("/daily", timeElapsedDaily , fillUserDataDaily, fillTaskDataDaily, dailyReport);
router.post("/weekly", timeElapsedWeekly , fillUserDataWeekly, fillTaskDataWeekly, weeklyReport );

// Export the router
export default router;
