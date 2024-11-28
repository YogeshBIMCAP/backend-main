import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();

configDotenv({
    path: './.env',
});

app.use(cors({
    origin: "*"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Directly add the new /code route
app.get("/", (req, res) => {
    const code = req.query.code; // Extract the 'code' parameter
    console.log("Extracting code...");

    if (code) {
        console.log(`Extracted code: ${code}`);
        
        const filePath = path.join(process.cwd(), "extracted_code.txt");
        
        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            // Create the file and write the code
            fs.writeFileSync(filePath, code, "utf8");
            console.log("New file created and code written to it.");
        } else {
            console.log("File already exists. Appending code to it.");
            fs.appendFileSync(filePath, `\n${code}`, "utf8"); // Append the code
        }

        res.send(`Extracted code: ${code} and written to file.`);
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
