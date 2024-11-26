import express from "express";
import { getAllDepartments } from "../controllers/department.controller.js";
const router = express.Router();


router.get("/all",getAllDepartments);

// Export the router
export default router;
