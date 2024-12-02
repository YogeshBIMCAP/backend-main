import axios from "axios";
import {
  fetchElapsedTimeData,
  fetchPaginatedData,
} from "../utils/pagination.js";

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
    try {
      const {
        access_token,
        creator,
        endDate,
        startDate,
        project,
        responsible,
        tags,
      } = req.body;
  
      const data = await fetchPaginatedData(
        `${process.env.ROOT_URL}/tasks.task.list`,
        {
          access_token,
        },
        {
          GROUP_ID: project,
          CREATED_BY: creator,
          TAGS: tags,
          ACCOMPICE: responsible,
        },
        ["ID"]
      );
  
      const taskIds = data[0].tasks.reduce((acc, task) => {
        acc.push(task.id);
        return acc;
      }, []);
  
      console.log(taskIds);
  
      const time = await fetchElapsedTimeData(
        `${process.env.ROOT_URL}/task.elapseditem.getlist`,
        {
          auth: access_token,
          ORDER: { ID: "desc" },
          SELECT: ["ID", "TASK_ID", "SECONDS", "CREATED_DATE", "USER_ID"],
          FILTER: {
            TASK_ID: taskIds,
            ">=CREATED_DATE": startDate,
            "<=CREATED_DATE": `${endDate} 23:59:59`,
          },
        }
      );
  
      // Fetch user names and add to `time`
      let finalData = await Promise.all(
        time.map(async (item) => {
          try {
            const response = await axios.get(`${process.env.ROOT_URL}/user.get`, {
              params: {
                auth: access_token,
                FILTER: { ID: item.USER_ID },
                SELECT: ["NAME", "LAST_NAME"],
              },
            });
  
            const result = response.data.result;
            if (result.length > 0) {
              const user = result[0];
              const name = `${user.NAME} ${user.LAST_NAME}`;
              return { ...item, name };
            } else {
              return { ...item, name: null }; // Handle empty result gracefully
            }
          } catch (error) {
            console.error(
              `Error fetching user data for USER_ID: ${item.USER_ID}`,
              error
            );
            return { ...item, name: "Error fetching user" }; // Handle errors gracefully
          }
        })
      );
  
      // Fetch task details and add to `finalData`
      finalData = await Promise.all(
        finalData.map(async (item) => {
          try {
            const response = await axios.get(
              `${process.env.ROOT_URL}/tasks.task.get`,
              {
                params: {
                  auth: access_token,
                  taskId: item.TASK_ID,
                  select: [
                    "TITLE",
                    "GROUP_ID",
                    "STATUS",
                    "GROUP",
                    "CREATED_BY",
                    "TAGS",
                  ],
                },
              }
            );
  
            const result = response.data.result?.task;
  
            if (result) {
              return {
                id : item.ID,
                name :item.name,
                tasks: {
                  ...result,
                  duration : item.SECONDS,
                  createdDate : item.CREATED_DATE,
                },
              };
            } else {
              return { ...item, tasks: null }; // Handle case where task is null or undefined
            }
          } catch (error) {
            console.error(
              `Error fetching task data for TASK_ID: ${item.TASK_ID}`,
              error
            );
            return { ...item, task: { error: "Error fetching task data" } }; // Graceful error handling
          }
        })
      );
  
      res.status(200).json({reportData : finalData});
    } catch (error) {
      console.log(error.message);
      res.status(500).send(error);
    }
  };
  

export { normalReport, dailyReport, weeklyReport };
