// import axios from "axios";

// const fillTaskData = async (req, res, next) => {
//   const { access_token } = req.body;
//   const weeklyData = req.timeElapsedWeekly; // The input data from request

//   let weeklyResult = [];

//   try {
//     // Iterate through each user in the weekly data
//     for (const user of weeklyData) {
//       const userTasks = [];

//       // Iterate through each taskId for the current user
//       for (const taskId of Object.keys(user.tasks)) {
//         // Fetch task details for each task
//         const response = await axios.get(`${process.env.ROOT_URL}/tasks.task.get`, {
//           params: {
//             auth: access_token,
//             taskId: taskId,
//             select: ['TITLE', 'PARENT_ID', 'GROUP_ID', 'STATUS', 'TAGS', 'GROUP', 'CREATED_BY'], // Replace with actual fields
//           },
//         });
//         const taskData = response.data.result.task;

//         // Add task details to the userTasks array
//         userTasks.push({
//           id: taskId,
//           ...taskData, // Spread task details like title, description, etc.
//           duration: user.tasks[taskId].duration, // Add the task duration from the original data
//           createdDate: user.tasks[taskId].createdDate, // Add the created date from the original data
//         });
//       }

//       // Add the processed user and tasks to the weekly result array
//       weeklyResult.push({
//         id: user.id,
//         name: user.name,
//         tasks: userTasks, // The tasks array for this user
//       });
//     }

//     // Attach the results to req for further processing or send it as a response
//     req.weeklyTaskData = weeklyResult;
    

//     next(); // Proceed to the next middleware
//   } catch (error) {
//     console.log("Error in fillTaskData:", error);
//     res.status(500).send("An error occurred while fetching task data.");
//   }
// };

// export { fillTaskData };


import axios from "axios";

// Utility function to introduce delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fillTaskData = async (req, res, next) => {
  const { access_token } = req.body;
  const weeklyData = req.timeElapsedWeekly; // The input data from request
  let weeklyResult = [];
  const rateLimit = 12; // Max 5 requests per second
  const delayBetweenRequests = 1000 / rateLimit; // Delay between requests in ms

  try {
    // Iterate through each user in the weekly data
    for (const user of weeklyData) {
      let userTasks = [];

      // Iterate through each taskId for the current user
      const taskIds = Object.keys(user.tasks);
      for (let i = 0; i < taskIds.length; i++) {
        const taskId = taskIds[i];

        // Fetch task details for each task
        const response = await axios.get(`${process.env.ROOT_URL}/tasks.task.get`, {
          params: {
            auth: access_token,
            taskId: taskId,
            select: ["TITLE", "PARENT_ID", "GROUP_ID", "STATUS", "TAGS", "GROUP", "CREATED_BY"],
          }, 
        });
        const taskData = response.data.result.task;

        // Add task details to the userTasks array
        userTasks.push({
          id: taskId,
          ...taskData, // Spread task details like title, description, etc.
          duration: user.tasks[taskId].duration, // Add the task duration from the original data
          createdDate: user.tasks[taskId].createdDate, // Add the created date from the original data
        });

        // Introduce delay to maintain rate limit
        if (i < taskIds.length - 1) {
          await delay(delayBetweenRequests);
        }
      }

      userTasks.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));


      // Add the processed user and tasks to the weekly result array
      weeklyResult.push({
        id: user.id,
        name: user.name,
        tasks: userTasks, // The tasks array for this user
      });
    }

    // Attach the results to req for further processing or send it as a response
    req.weeklyTaskData = weeklyResult;
    next(); // Proceed to the next middleware
  } catch (error) {
    console.log("Error in fillTaskData:", error);
    res.status(500).send("An error occurred while fetching task data.");
  }
};

export { fillTaskData };
