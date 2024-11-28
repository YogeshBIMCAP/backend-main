import axios from "axios";
import { timeElapsedDaily } from "./timeelapsed.middleware.js";

const fillUserData = async (req, res, next) => {
  const { access_token, departments } = req.body;
  let dailyData = req.timeElapsedDaily.data;

  let new_daily_data = [];

  try {
    // Get an array of all user IDs (keys of the data object)
    const userIds = Object.keys(dailyData);

    // Use Promise.all to handle asynchronous requests
    const promises = userIds.map(async (userId) => {
      // Make the API request to get user details
      const response = await axios.get(`${process.env.ROOT_URL}/user.get`, {
        params: {
          auth: access_token,
          FILTER: { ID: userId, UF_DEPARTMENT: departments },
          SELECT: ["NAME", "LAST_NAME"],
        },
      });

      const result = response.data.result;
      if (result.length > 0) {
        const userInfo = result[0];
        const userName = `${userInfo.NAME} ${userInfo.LAST_NAME}`;
        const userTasks = dailyData[userId];
        // Push the result into new_data array
          new_daily_data.push({
            id: userId,
            name: userName,
            tasks: dailyData[userId].tasks,
          });
      }
    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    // You can attach new_data to the req object for further processing in the middleware chain

    new_daily_data.forEach(item => {
      item.nameLower = item.name.toLowerCase();
    });
    
    // Step 2: Sort based on precomputed lowercase names using localeCompare for better string comparison
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

// import axios from "axios";
// import { timeElapsedDaily } from "./timeelapsed.middleware.js";

// // Utility function to introduce delay
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// const fillUserData = async (req, res, next) => {
//   const { access_token } = req.body;
//   let dailyData = req.timeElapsedDaily.data;
//   let new_daily_data = [];
//   const rateLimit = 5; // Max 5 requests per second
//   const delayBetweenRequests = 1000 / rateLimit; // Delay between requests in ms

//   try {
//     // Get an array of all user IDs (keys of the data object)
//     const userIds = Object.keys(dailyData);

//     // Use Promise.all to handle asynchronous requests with rate limiting
//     for (let i = 0; i < userIds.length; i++) {
//       const userId = userIds[i];

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
//         console.log(userName);
        

//         // Push the result into new_data array
//         new_daily_data.push({
//           id: userId,
//           name: userName,
//           tasks: dailyData[userId].tasks,
//         });
//       }

//       // Introduce a delay to maintain the rate limit
//       if (i < userIds.length - 1) {
//         await delay(delayBetweenRequests);
//       }
//     }

//     // Process the new data and sort by name
//     new_daily_data.forEach(item => {
//       item.nameLower = item.name.toLowerCase();
//     });

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

