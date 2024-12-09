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

// const weeklyReport = async (req, res) => {
//   const { access_token, creator, tags, project } = req.body;
//   const weeklyData = req.timeElapsedWeekly; // The input data from request

//   console.log(weeklyData);
  

//     try {
//       // Extract task IDs for batch fetching
//       const taskIds = weeklyData.flatMap((user) => Object.keys(user.tasks))

//       console.log("Weekly Data Task IDs:", taskIds.length);

//       const taskBatches = taskIds.reduce((acc, taskId, index) => {
//         const batchIndex = Math.floor(index / 200);
//         if (!acc[batchIndex]) {
//           acc[batchIndex] = [];
//         }
//         acc[batchIndex].push(taskId);
//         return acc;
//       }, []);

//       const batchResponse = [];

//       await Promise.all(
//         taskBatches.map(async (batch) => {
//           try {
//             const response = await axios.get(
//               `${process.env.ROOT_URL}/tasks.task.list`,
//               {
//                 params: {
//                   auth: access_token,
//                   select: [
//                     "TITLE",
//                     "PARENT_ID",
//                     "GROUP_ID",
//                     "STATUS",
//                     "TAGS",
//                     "GROUP",
//                     "CREATED_BY",
//                   ],
//                   filter: {
//                     ID: batch,
//                     ...(creator ? { CREATED_BY: creator } : {}),
//                     ...(tags && tags.length > 0 ? { TAG: tags } : {}),
//                     ...(project && project.length > 0 ? { GROUP_ID: project } : {}),
//                   },
//                 },
//               }
//             );
      
//             // Add tasks to the result array
//             if (response?.data?.result?.tasks) {
//               batchResponse.push(...response.data.result.tasks);
//             }
//           } catch (error) {
//             console.error(`Error fetching tasks for batch ${batch}:`, error);
//           }
//         })
//       );

//       const tasksMap = batchResponse.reduce((acc, task) => {
//         acc[task.id] = task;
//         return acc;
//       }, {});

//       const finalData = weeklyData
//       .map((user) => {
//         // Extract and map tasks
//         const updatedTasks = Object.entries(user.tasks) // Convert tasks object to [key, value] pairs
//           .map(([taskId, task]) => {
//             const taskData = tasksMap?.[taskId];
//             return taskData
//               ? { taskId, ...task, ...taskData } // Merge task details if found in tasksMap
//               : null; // Exclude tasks not in tasksMap
//           })
//           .filter((task) => task !== null) // Remove null tasks
//           .sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate)); // Sort by createdDate
    
//         // Return updated user object if tasks exist
//         return updatedTasks.length > 0
//           ? { ...user, tasks: updatedTasks }
//           : null;
//       })
//       .filter((user) => user !== null); // Remove users without tasks

//       // Attach the results to `req` for further processing
//       req.weeklyTaskData = finalData;

//       res.status(200).send({finalData});
//     } catch (error) {
//       console.error("Error in fillTaskData:", error);
//       res.status(500).send("An error occurred while fetching task data.");
//     }
// };

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

  if(!project || project.length === 0){
    try {
      // Use the utility function to fetch paginated data
      const allProjects = await fetchPaginatedData(
        `${process.env.ROOT_URL}/sonet_group.get`,
        { access_token } // Pass the settings including the access token
      );
  
      project = allProjects.map((project) => project.id);
    } catch (error) {
      console.error("Error fetching projects:", error.message);
    }
  }

    try {
      // Extract task IDs for batch fetching
      const taskIds = dailyData.flatMap((user) =>
        user.tasks.map((task) => task.taskId)
      );

      console.log("Daily Data Task IDs:", taskIds.length);

      const taskBatches = taskIds.reduce((acc, taskId, index) => {
        const batchIndex = Math.floor(index / 200);
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
                    ID: batch,
                    ...(creator ? { CREATED_BY: creator } : {}),
                    ...(tags && tags.length > 0 ? { TAG: tags } : {}),
                    ...(project && project.length > 0 ? { GROUP_ID: project } : {}),
                  },
                },
              }
            );
      
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

      res.status(200).send({finalData});
    } catch (error) {
      console.error("Error in fillTaskData:", error);
      res.status(500).send("An error occurred while fetching task data.");
    }
};



export { normalReport, dailyReport, weeklyReport };
