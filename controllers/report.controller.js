import axios from "axios";
import {
  fetchElapsedTimeData,
  fetchPaginatedData,
} from "../utils/pagination.js";
import { getAllProjects } from "./task.controller.js";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const weeklyReport = async (req, res) => {

  const { weeklyTaskData } = req;
  console.log(weeklyTaskData);

  const data = {
    weeklyTaskData,
  };

  res.status(200).send(data);
};

  
const dailyReport = async (req, res) => {
  const { dailyTaskData } = req;
  console.log(dailyTaskData);

  const data = {
    dailyTaskData,
  };

  res.status(200).send(data);
};

const normalReport = async (req, res) => {
  let { access_token, creator, tags, project } = req.body;

  const dailyData = req.timeElapsedDaily; // The input data from request
  
    try {
      // Extract task IDs for batch fetching
      const taskIds = dailyData.flatMap((user) =>
        user.tasks.map((task) => task.taskId)
      );

      console.log("Daily Data Task IDs:", taskIds.length);

      const taskBatches = taskIds.reduce((acc, taskId, index) => {
        const batchIndex = Math.floor(index / 100);
        if (!acc[batchIndex]) {
          acc[batchIndex] = [];
        }
        acc[batchIndex].push(taskId);
        return acc;
      }, []);

      const batchResponse = [];

      await Promise.all(
        taskBatches.map(async (batch) => {
          try {
            const response = await axios.get(
              `${process.env.ROOT_URL}/tasks.task.list`,
              {
                params: {
                  auth: access_token,
                  select: [
                    "TITLE",
                    "PARENT_ID",
                    "GROUP_ID",
                    "STATUS",
                    "TAGS",
                    "GROUP",
                    "CREATED_BY",
                  ],
                  filter: {
                    ID: batch, /////////
                    ...(creator ? { CREATED_BY: creator } : {}),
                    ...(tags && tags.length > 0 ? { TAG: tags } : {}),
                    ...(project && project.length > 0 ? { GROUP_ID: project } : {}),
                  },
                },
              }
            );
            console.log(batch);
            
      
            // Add tasks to the result array
            if (response?.data?.result?.tasks) {
              batchResponse.push(...response.data.result.tasks);
            }
          } catch (error) {
            console.error(`Error fetching tasks for batch ${batch}:`, error);
          }
        })
      );

      const tasksMap = batchResponse.reduce((acc, task) => {
        acc[task.id] = task;
        return acc;
      }, {});

      const finalData = dailyData.map((user) => {
        return {
          ...user,
          tasks: user.tasks
            .map((task) => {
              const taskData = tasksMap[task.taskId];
              if (taskData) {
                return {
                  ...task,
                  ...taskData, // Merge task data with the existing task structure
                };
              }
              return null; // Explicitly return null for tasks without matching data
            })
            .filter((task) => task !== null ).sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate)), // Remove null values
        };
      }).filter((user) => user.tasks.length > 0);

      // Attach the results to `req` for further processing
      req.dailyTaskData = finalData;

      res.status(200).send({batchResponse});
    } catch (error) {
      console.error("Error in fillTaskData:", error);
      res.status(500).send("An error occurred while fetching task data.");
    }
};



export { normalReport, dailyReport, weeklyReport };
