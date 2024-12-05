import axios from "axios";
import {
  fetchElapsedTimeData,
  fetchPaginatedData,
} from "../utils/pagination.js";
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
  const { access_token, creator, tags, responsible, project } = req.body;
  const dailyData = req.timeElapsedDaily; // The input data from request

  if (responsible && responsible.length > 0) {
    try {
      // Extract task IDs for batch fetching
      const taskIds = dailyData.flatMap((user) =>
        user.tasks.map((task) => task.taskId)
      );

      console.log("Daily Data Task IDs:", taskIds);

      // Batch fetch all tasks matching the criteria
      const batchResponse = await axios.get(
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
            ], // Replace with actual fields
            filter: {
              ID: taskIds,
              CREATED_BY: creator || null,
              TAG: tags || [],
              GROUP_ID: project || [],
            },
          },
        }
      );

      const tasksMap = batchResponse.data.result.tasks.reduce((acc, task) => {
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
            .filter((task) => task !== null), // Remove null values
        };
      });

      // Attach the results to `req` for further processing
      req.dailyTaskData = finalData;

      res.status(200).send({ finalData });
    } catch (error) {
      console.error("Error in fillTaskData:", error);
      res.status(500).send("An error occurred while fetching task data.");
    }
  } else {
    let dailyResult = [];
    const rateLimit = 12; // Max 5 requests per second
    const delayBetweenRequests = 1000 / rateLimit; // Delay between requests in ms

    try {
      const dailyResult = [];
    
      // Iterate through each user in daily data
      for (const user of dailyData) {
        let userTasks = [];
        const taskList = user.tasks;
    
        // Iterate through each task for the current user
        for (let i = 0; i < taskList.length; i++) {
          const task = taskList[i];
    
          // Fetch task details for each task
          const response = await axios.get(
            `${process.env.ROOT_URL}/tasks.task.get`,
            {
              params: {
                auth: access_token,
                taskId: task.taskId,
                select: [
                  "TITLE",
                  "PARENT_ID",
                  "GROUP_ID",
                  "STATUS",
                  "TAGS",
                  "GROUP",
                  "CREATED_BY",
                ],
              },
            }
          );
    
          const taskData = response.data.result.task;
    
          // Apply dynamic filtering logic
          const matchesProject =
            project && project.length > 0 && project.includes(taskData?.groupId);
          const matchesTags =
            tags &&
            tags.length > 0 &&
            tags.some((tag) =>
              Object.values(taskData.tags || {}).some(
                (taskTag) => taskTag.title.toLowerCase() === tag.toLowerCase()
              )
            );
          const matchesCreator = creator && taskData?.createdBy === creator;
    
          const matches = (() => {
            let match = true;
    
            // Check creator
            if (creator &&  creator.length > 0) {
              console.log(creator,taskData?.createdBy);
              match = match && creator.includes(taskData?.createdBy);
              
            }
    
            // Check tags
            if (tags && tags.length > 0) {
              const taskTags = Object.values(taskData?.tags || {}).map(
                (t) => t.title
              )     
              console.log(tags ,taskTags);
                       
              match =
                match &&
                tags.every((tag) => {
                  return taskTags.includes(tag);
                });                
            }
    
            // Check project
            if (project && project.length > 0) {
              match = match && project.includes(taskData.groupId);
            }
            console.log(match);
            
            return match;
          })();
    
          // If task matches, add to userTasks
          if (matches) {
            userTasks.push({
              id: task.taskId,
              ...taskData,
              duration: task.duration,
              createdDate: task.createdDate,
            });
          }
    
          // Introduce a delay to maintain the rate limit
          if (i < taskList.length - 1) {
            await delay(delayBetweenRequests);
          }
        }
    
        // Sort userTasks by createdDate
        userTasks.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
    
        // Add the processed user and tasks to the daily result array
        if (userTasks.length > 0) {
          dailyResult.push({
            id: user.id,
            name: user.name,
            tasks: userTasks,
          });
        }
      }
    
      // Attach the results to req for further processing or send it as a response
      req.dailyTaskData = dailyResult; // Add daily task data
    
      res.send({ finalData: dailyResult });
    } catch (error) {
      console.error("Error processing tasks:", error);
      res.status(500).send({ error: "Failed to process daily task data." });
    }
    
  }
};

export { normalReport, dailyReport, weeklyReport };
