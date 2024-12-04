// import axios from "axios";

// const fillUserData = async (req, res, next) => {
//   const { access_token } = req.body;
//   let weeklyData = req.timeElapsedWeekly.data; // Data with user and task info
  

//   let new_weekly_data = [];

//   try {
//     // Get an array of all user IDs (keys of the data object)
//     const userIds = Object.keys(weeklyData);

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
//         const userTasks = weeklyData[userId];
//         // Push the result into new_data array
//         new_weekly_data.push({
//           id: userId,
//           name: userName,
//           tasks: userTasks,
//         });
//       }
//     });

//     // Wait for all promises to resolve
//     await Promise.all(promises);
//     new_weekly_data.forEach(item => {
//       item.nameLower = item.name.toLowerCase();
//     });
    
//     // Step 2: Sort based on precomputed lowercase names using localeCompare for better string comparison
//     new_weekly_data.sort((a, b) => {
//       return a.nameLower.localeCompare(b.nameLower);
//     });
    
//     // You can attach new_data to the req object for further processing in the middleware chain
      
//       req.timeElapsedWeekly = new_weekly_data;
      
      
//       next(); // Move to the next middleware


    

//   } catch (error) {
//     console.log("Error in fillUserData:", error.message);
//     res.status(500).send("An error occurred while filling user data.");
//   }
// };

// export { fillUserData };

import axios from "axios";

// Utility function to introduce delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fillUserData = async (req, res, next) => {
  const { access_token,departments } = req.body;
  let weeklyData = req.timeElapsedWeekly.data; // Data with user and task info
  let new_weekly_data = [];
  const rateLimit = 12; // Max 5 requests per second
  const delayBetweenRequests = 1000 / rateLimit; // Delay between requests in ms

  try {
    // Get an array of all user IDs (keys of the data object)
    const userIds = Object.keys(weeklyData);

    // Iterate through each user with a delay to maintain the rate limit
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];

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
        const userTasks = weeklyData[userId];

        // Push the result into new_weekly_data array
        new_weekly_data.push({
          id: userId,
          name: userName,
          photo : userInfo.PERSONAL_PHOTO,
          tasks: userTasks,
        });
      }

      // Introduce a delay between requests to maintain rate limit
      if (i < userIds.length - 1) {
        await delay(delayBetweenRequests);
      }
    }

    // Sort based on lowercase names for better string comparison
    new_weekly_data.forEach((item) => {
      item.nameLower = item.name.toLowerCase();
    });

    new_weekly_data.sort((a, b) => {
      return a.nameLower.localeCompare(b.nameLower);
    });

    // Attach the sorted data to req for further processing in the middleware chain
    req.timeElapsedWeekly = new_weekly_data;
    next(); // Move to the next middleware
  } catch (error) {
    console.log("Error in fillUserData:", error.message);
    res.status(500).send("An error occurred while filling user data.");
  }
};

export { fillUserData };

