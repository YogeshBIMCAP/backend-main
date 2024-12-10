// const weeklyTimeElapsedFormatting = (data) => {
//     return data.reduce((acc, record) => {
//         const userId = record.USER_ID;
//         const taskId = record.TASK_ID;
//         const createdDate = record.CREATED_DATE
//         const duration = parseInt(record.SECONDS); // Convert seconds to an integer

//         // Initialize user object if not already present
//         if (!acc[userId]) {
//             acc[userId] = {};
//         }

//         // Initialize task duration if not already present
//         if (!acc[userId][taskId]) {
//             acc[userId][taskId] = {
//                 duration : 0,
//                 createdDate
//             };
//         }

//         // Add the duration to the task associated with the user
//         acc[userId][taskId].duration += duration;

//         return acc;
//     }, {});
// };

const weeklyTimeElapsedFormatting = (data) => {
    return data.reduce((acc, record) => {
        const userId = record.USER_ID;
        const taskId = record.TASK_ID;
        const createdDate = record.CREATED_DATE;
        const duration = parseInt(record.SECONDS, 10); // Convert seconds to an integer

        // Initialize user object if not already present
        if (!acc[userId]) {
            acc[userId] = {
                tasks: []  // Initialize tasks array
            };
        }

        // Check if task already exists in the user's task list
        const existingTask = acc[userId].tasks.find(task => task.taskId === taskId);

        if (existingTask) {
            // If task exists, sum the durations
            existingTask.duration += duration;
        } else {
            // If task doesn't exist, add a new task with the duration
            acc[userId].tasks.push({
                taskId: taskId,
                duration: duration,
                createdDate: createdDate
            });
        }

        return acc;
    }, {});
};


const dailyTimeElapsedFormatting = (data) => {
    return data.reduce((acc, record) => {
        const userId = record.USER_ID;
        const taskId = record.TASK_ID;
        const createdDate = record.CREATED_DATE;
        const duration = parseInt(record.SECONDS, 10); // Convert seconds to an integer

        // Initialize user object if not already present
        if (!acc[userId]) {
            acc[userId] = {
                tasks: []  // Initialize tasks array
            };
        }
            acc[userId].tasks.push({
                taskId: taskId,
                duration: duration,
                createdDate: createdDate
            });


        return acc;
    }, {});
};

export {weeklyTimeElapsedFormatting , dailyTimeElapsedFormatting}

