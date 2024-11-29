import express from "express";
import { getUserName, getActiveUsers } from "../controllers/user.controller.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);
const router = express.Router();

// Route to fetch a specific user's name by ID
router.post("/get/:id", getUserName);

// Route to fetch all active users
router.post("/active/get", getActiveUsers);

// Test route to check if server is working
router.post("/", (req, res) => {
  res.send("working");
});

export default router;
