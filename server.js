import express from "express"
import { configDotenv } from "dotenv";
import cors from "cors"


const app = express()
configDotenv({
    path: './.env',
})
app.use(cors({
    origin : "*"
}))

app.use(express.json()); // Built-in JSON parser

// Optional: If you need to parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

import userRoutes from "./routes/user.routes.js"
import timeRoutes from "./routes/time.routes.js"
import taskRoutes from "./routes/task.routes.js"
import reportRoutes from "./routes/report.routes.js"



app.use("/user",userRoutes)
app.use("/time",timeRoutes)
app.use("/task", taskRoutes)
app.use("/report", reportRoutes)

app.listen(process.env.PORT||3000, ()=>{
    console.log(`Server is running on port ${process.env.PORT||3000}`)
})