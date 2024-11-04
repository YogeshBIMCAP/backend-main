import axios from "axios";

const fillTaskData = async (req, res, next) => {
  const { access_token } = req.body;
  const dailyData = req.timeElapsedDaily; // The input data from request

  let dailyResult = [];

  try {
    // Create another for loop for daily reports here
    for (const user of dailyData) {
      const userTasks = [];

      // Iterate through each task for the current user
      for (const task of user.tasks) {
        // Fetch task details for each task
        const response = await axios.get(`${process.env.ROOT_URL}/tasks.task.get`, {
          params: {
            auth: access_token,
            taskId: task.taskId, // Use taskId from daily tasks
            select: ['TITLE', 'PARENT_ID', 'GROUP_ID', 'STATUS', 'TAGS', 'GROUP', 'CREATED_BY'], // Replace with actual fields
          },
        });
        const taskData = response.data.result.task;

        // Add task details to the userTasks array
        userTasks.push({
          id: task.taskId,
          ...taskData, // Spread task details like title, description, etc.
          duration: task.duration, // Add the task duration from the original data
          createdDate: task.createdDate, // Add the created date from the original data
        });
      }

      // Add the processed user and tasks to the daily result array
      dailyResult.push({
        id: user.id,
        name: user.name,
        tasks: userTasks, // The tasks array for this user
      });
    }

    // Attach the results to req for further processing or send it as a response
    req.dailyTaskData = dailyResult; // Add daily task data
    

    next(); // Proceed to the next middleware
  } catch (error) {
    console.log("Error in fillTaskData:", error);
    res.status(500).send("An error occurred while fetching task data.");
  }
};


export { fillTaskData };


// import axios from "axios";

// // Utility function to introduce delay
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// const fillTaskData = async (req, res, next) => {
//   const { access_token } = req.body;
//   const dailyData = req.timeElapsedDaily; // The input data from request

//   let dailyResult = [];
//   const rateLimit = 5; // Max 5 requests per second
//   const delayBetweenRequests = 1000 / rateLimit; // Delay between requests in ms

//   try {
//     // Iterate through each user in daily data
//     for (const user of dailyData) {
//       const userTasks = [];

//       // Iterate through each task for the current user
//       for (let i = 0; i < user.tasks.length; i++) {
//         const task = user.tasks[i];

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

//         // Introduce a delay to maintain the rate limit
//         if (i < user.tasks.length - 1) {
//           await delay(delayBetweenRequests);
//         }
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
