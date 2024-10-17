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

const fillTaskData = async (req, res, next) => {
  const { access_token } = req.body;
  const dailyData = req.timeElapsedDaily;

  let dailyResult = [];
  let batchRequests = [];
  
  try {
    // Prepare batch requests for fetching task details
    for (const user of dailyData) {
      for (const task of user.tasks) {
        batchRequests.push({
          method: "tasks.task.get",
          params: {
            auth: access_token,
            taskId: task.taskId, // Use taskId from daily tasks
            select: ['TITLE', 'PARENT_ID', 'GROUP_ID', 'STATUS', 'TAGS', 'GROUP', 'CREATED_BY'], // Replace with actual fields
          }
        });
      }
    }

    // Send batch request when the batch is ready (limit 50 per batch)
    const batchSize = 50;
    for (let i = 0; i < batchRequests.length; i += batchSize) {
      const batchRequestChunk = batchRequests.slice(i, i + batchSize);

      // Perform the batch request
      const response = await axios.post(`${process.env.ROOT_URL}/batch`, {
        auth: access_token,
        cmd: batchRequestChunk
      });

      // Handle batch response and append to daily result
      const batchResults = response.data.result.result;
      let taskIndex = 0;

      for (const user of dailyData) {
        const userTasks = [];
        for (let j = 0; j < user.tasks.length; j++) {
          const taskData = batchResults[taskIndex++];
          if (taskData) {
            userTasks.push({
              id: user.tasks[j].taskId,
              ...taskData,
              duration: user.tasks[j].duration,
              createdDate: user.tasks[j].createdDate,
            });
          }
        }
        dailyResult.push({
          id: user.id,
          name: user.name,
          tasks: userTasks,
        });
      }
    }

    req.dailyTaskData = dailyResult;
    next();
  } catch (error) {
    console.log("Error in fillTaskData:", error);
    res.status(500).send("An error occurred while fetching task data.");
  }
};

export { fillTaskData };
