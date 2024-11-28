import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";
import axios from "axios";

const app = express();

configDotenv({
  path: "./.env",
});

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Directly add the new /code route
app.get("/", async(req, res) => {
  const code = req.query.code; // Extract the 'code' parameter
  console.log("Extracting code...");

  if (code) {
    console.log(`Extracted code: ${code}`);

    const result = await axios.get(
      `https://bimcap.bitrix24.com/oauth/token/?grant_type=authorization_code&client_id=local.674800c04736c3.51073976&client_secret=2SkIUBpq4Dml6UB5MHZhX1OJ12jhnSvwLk1q23ZLgyOjbvKXAc&code=${code}&scope=application_permissions&redirect_uri=application_URL`
    );

    res.send(`result: ${{...result.data}}`);
  } else {
    res.send("No code parameter found in the query string.");
  }
});

// Import existing routes
import userRoutes from "./routes/user.routes.js";
import timeRoutes from "./routes/time.routes.js";
import taskRoutes from "./routes/task.routes.js";
import reportRoutes from "./routes/report.routes.js";
import departmentRoutes from "./routes/department.routes.js";

// Add existing routes
app.use("/user", userRoutes);
app.use("/time", timeRoutes);
app.use("/task", taskRoutes);
app.use("/report", reportRoutes);
app.use("/department", departmentRoutes);

// Start the server
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
