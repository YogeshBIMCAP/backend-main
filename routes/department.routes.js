import express from "express";
import { getAllDepartments } from "../controllers/department.controller.js";
const router = express.Router();
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);


router.post("/all",getAllDepartments);

// Export the router
export default router;
