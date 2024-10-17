// import axios from "axios";

// const fillTaskData = async (req, res, next) => {
//   const { access_token } = req.body;
//   const dailyData = req.timeElapsedDaily; // The input data from request

//   let dailyResult = [];

//   try {
//     // Create another for loop for daily reports here
//     for (const user of dailyData) {
//       const userTasks = [];

//       // Iterate through each task for the current user
//       for (const task of user.tasks) {
//         // Fetch task details for each task
//         const response = await axios.get(`${process.env.ROOT_URL}/tasks.task.get`, {
//           params: {
//             auth: access_token,
//             taskId: task.taskId, // Use taskId from daily tasks
//             select: ['TITLE', 'PARENT_ID', 'GROUP_ID', 'STATUS', 'TAGS', 'GROUP', 'CREATED_BY'], // Replace with actual fields
//           },
//         });
//         const taskData = response.data.result.task;

//         // Add task details to the userTasks array
//         userTasks.push({
//           id: task.taskId,
//           ...taskData, // Spread task details like title, description, etc.
//           duration: task.duration, // Add the task duration from the original data
//           createdDate: task.createdDate, // Add the created date from the original data
//         });
//       }

//       // Add the processed user and tasks to the daily result array
//       dailyResult.push({
//         id: user.id,
//         name: user.name,
//         tasks: userTasks, // The tasks array for this user
//       });
//     }

//     // Attach the results to req for further processing or send it as a response
//     req.dailyTaskData = dailyResult; // Add daily task data
    

//     next(); // Proceed to the next middleware
//   } catch (error) {
//     console.log("Error in fillTaskData:", error);
//     res.status(500).send("An error occurred while fetching task data.");
//   }
// };


// export { fillTaskData };


import axios from "axios";
import { timeElapsedDaily } from "./timeelapsed.middleware.js";

// Utility function to introduce delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fillUserData = async (req, res, next) => {
  const { access_token } = req.body;
  let dailyData = req.timeElapsedDaily.data;
  let new_daily_data = [];
  const rateLimit = 5; // Max 5 requests per second
  const delayBetweenRequests = 1000 / rateLimit; // Delay between requests in ms

  try {
    // Get an array of all user IDs (keys of the data object)
    const userIds = Object.keys(dailyData);

    // Use Promise.all to handle asynchronous requests with rate limiting
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];

      // Make the API request to get user details
      const response = await axios.get(`${process.env.ROOT_URL}/user.get`, {
        params: {
          auth: access_token,
          FILTER: { ID: userId },
          SELECT: ["NAME", "LAST_NAME"],
        },
      });

      const result = response.data.result;
      if (result.length > 0) {
        const userInfo = result[0];
        const userName = `${userInfo.NAME} ${userInfo.LAST_NAME}`;
        const userTasks = dailyData[userId];
        console.log(userName);
        

        // Push the result into new_data array
        new_daily_data.push({
          id: userId,
          name: userName,
          tasks: dailyData[userId].tasks,
        });
      }

      // Introduce a delay to maintain the rate limit
      if (i < userIds.length - 1) {
        await delay(delayBetweenRequests);
      }
    }

    // Process the new data and sort by name
    new_daily_data.forEach(item => {
      item.nameLower = item.name.toLowerCase();
    });

    new_daily_data.sort((a, b) => {
      return a.nameLower.localeCompare(b.nameLower);
    });

    req.timeElapsedDaily = new_daily_data;
    next(); // Move to the next middleware
  } catch (error) {
    console.log("Error in fillUserData:", error.message);
    res.status(500).send("An error occurred while filling user data.");
  }
};

export { fillUserData };
