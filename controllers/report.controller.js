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
      let {
        access_token,
        creator,
        endDate,
        startDate,
        project,
        responsible,
        tags,
      } = req.body;

      // Convert comma-separated strings to arrays
      creator = creator && creator.length > 0 ? creator.split(",") : [];
      tags = tags && tags.length > 0 ? tags.split(",") : [];
      responsible = responsible && responsible.length > 0 ? responsible.split(",") : [];
      project = project && project.length > 0 ? project.split(",") : [];

      // Fetch task list
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
  
      // Fetch elapsed time data
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
  
      // Fetch user names and add to time data
      const timeWithUserNames = await Promise.all(
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
              return { ...item, name: null };
            }
          } catch (error) {
            console.error(
              `Error fetching user data for USER_ID: ${item.USER_ID}`,
              error
            );
            return { ...item, name: "Error fetching user" };
          }
        })
      );
  
      // Fetch task details and add to final data
      const finalData = await Promise.all(
        timeWithUserNames.map(async (item) => {
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
                id: item.ID,
                name: item.name,
                tasks: {
                  ...result,
                  duration: item.SECONDS,
                  createdDate: item.CREATED_DATE,
                },
              };
            } else {
              return { ...item, tasks: null };
            }
          } catch (error) {
            console.error(
              `Error fetching task data for TASK_ID: ${item.TASK_ID}`,
              error
            );
            return { ...item, tasks: { error: "Error fetching task data" } };
          }
        })
      );
  
      // Send response only after all data processing is complete
      res.status(200).send({finalData});
    } catch (error) {
      console.error('Error in normalReport:', error);
      res.status(500).json({ 
        message: 'An error occurred while processing the report', 
        error: error.message 
      });
    }
  };
  

export { normalReport, dailyReport, weeklyReport };
