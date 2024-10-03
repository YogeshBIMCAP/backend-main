const weeklyTimeElapsedFormatting = (data) => {
    return data.reduce((acc, record) => {
        const userId = record.USER_ID;
        const taskId = record.TASK_ID;
        const createdDate = record.CREATED_DATE
        const duration = parseInt(record.SECONDS, 10); // Convert seconds to an integer

        // Initialize user object if not already present
        if (!acc[userId]) {
            acc[userId] = {};
        }

        // Initialize task duration if not already present
        if (!acc[userId][taskId]) {
            acc[userId][taskId] = {
                duration : 0,
                createdDate
            };
        }

        // Add the duration to the task associated with the user
        acc[userId][taskId].duration += duration;

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

