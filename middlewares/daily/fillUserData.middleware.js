// import axios from "axios";
// import { timeElapsedDaily } from "./timeelapsed.middleware.js";

// const fillUserData = async (req, res, next) => {
//   const { access_token } = req.body;
//   let dailyData = req.timeElapsedDaily.data;

//   let new_daily_data = [];

//   try {
//     // Get an array of all user IDs (keys of the data object)
//     const userIds = Object.keys(dailyData);

//     // Use Promise.all to handle asynchronous requests
//     const promises = userIds.map(async (userId) => {
//       // Make the API request to get user details
//       const response = await axios.get(`${process.env.ROOT_URL}/user.get`, {
//         params: {
//           auth: access_token,
//           FILTER: { ID: userId },
//           SELECT: ["NAME", "LAST_NAME"],
//         },
//       });

//       const result = response.data.result;
//       if (result.length > 0) {
//         const userInfo = result[0];
//         const userName = `${userInfo.NAME} ${userInfo.LAST_NAME}`;
//         const userTasks = dailyData[userId];
//         // Push the result into new_data array
//         new_daily_data.push({
//           id: userId,
//           name: userName,
//           tasks: dailyData[userId].tasks,
//         });
//       }
//     });

//     // Wait for all promises to resolve
//     await Promise.all(promises);

//     // You can attach new_data to the req object for further processing in the middleware chain

//     new_daily_data.forEach(item => {
//       item.nameLower = item.name.toLowerCase();
//     });
    
//     // Step 2: Sort based on precomputed lowercase names using localeCompare for better string comparison
//     new_daily_data.sort((a, b) => {
//       return a.nameLower.localeCompare(b.nameLower);
//     });
//     req.timeElapsedDaily = new_daily_data;

//     next(); // Move to the next middleware
//   } catch (error) {
//     console.log("Error in fillUserData:", error.message);
//     res.status(500).send("An error occurred while filling user data.");
//   }
// };

// export { fillUserData };

import axios from "axios";

const fillUserData = async (req, res, next) => {
  const { access_token } = req.body;
  let dailyData = req.timeElapsedDaily.data;
  let new_daily_data = [];
  let batchRequests = [];

  try {
    // Prepare batch requests for fetching user details
    Object.keys(dailyData).forEach((userId) => {
      batchRequests.push({
        method: "user.get",
        params: {
          auth: access_token,
          FILTER: { ID: userId },
          SELECT: ["NAME", "LAST_NAME"]
        }
      });
    });

    // Send batch request when ready (limit 50 per batch)
    const batchSize = 50;
    for (let i = 0; i < batchRequests.length; i += batchSize) {
      const batchRequestChunk = batchRequests.slice(i, i + batchSize);
      const response = await axios.post(`${process.env.ROOT_URL}/batch`, {
        auth: access_token,
        cmd: batchRequestChunk
      });

      const batchResults = response.data.result.result;

      batchResults.forEach((userInfo, index) => {
        if (userInfo) {
          const userName = `${userInfo[0].NAME} ${userInfo[0].LAST_NAME}`;
          new_daily_data.push({
            id: Object.keys(dailyData)[i + index],
            name: userName,
            tasks: dailyData[Object.keys(dailyData)[i + index]].tasks
          });
        }
      });
    }

    // Sort users alphabetically by name
    new_daily_data.forEach(item => item.nameLower = item.name.toLowerCase());
    new_daily_data.sort((a, b) => a.nameLower.localeCompare(b.nameLower));

    req.timeElapsedDaily = new_daily_data;
    next();
  } catch (error) {
    console.log("Error in fillUserData:", error.message);
    res.status(500).send("An error occurred while fetching user data.");
  }
};

export { fillUserData };
