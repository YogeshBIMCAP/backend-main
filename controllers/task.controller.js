import axios from 'axios';
import { fetchPaginatedData } from '../utils/pagination.js';

const getTaskList = async (req, res) => {
    const {access_token, accomplence , created_by , group_id} = req.body
  try {
    // Define the query parameters for the Bitrix24 API request
    const params = {
      auth: access_token, // Auth token
      'filter[ACCOMPLICE]': accomplence,   // ACCOMPLICE ID
      'filter[CREATED_BY]': created_by,    // Creator ID
      'filter[GROUP_ID]': group_id      // Group ID
    };

    // Make the GET request to the Bitrix24 API
    const response = await axios.get('https://bimcap.bitrix24.com/rest/tasks.task.list.xml', {
      params: params
    });

    // Log and send back the response data
    console.log('Bitrix24 Task List:', response.data);
    res.json(response.data); // Send the response data back to the client
  } catch (error) {
    console.error('Error fetching tasks from Bitrix24:', error);
    res.status(500).json({ error: 'Failed to fetch tasks from Bitrix24' });
  }
};

const getTask = async(req , res)=>{
  const {access_token, taskId} = req.body
  try {
    const response = await axios.get(`${process.env.ROOT_URL}/tasks.task.get`, {
      params: {
        auth: access_token,
        taskId: taskId,
        select : ['TITLE', 'PARENT_ID', 'GROUP_ID', 'STATUS', 'GROUP', 'CREATED_BY'], // Replace with actual fields
      },
    });
    res.send(response.data)
  }catch(e){
    console.log(e)
  }
}

const getAllProjects = async (req, res) => {
  const { access_token } = req.body;

  try {
    // Use the utility function to fetch paginated data
    const allProjects = await fetchPaginatedData(
      `${process.env.ROOT_URL}/sonet_group.get`,
      { access_token } // Pass the settings including the access token
    );

    res.status(200).json(allProjects);
  } catch (error) {
    console.error("Error fetching projects:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch projects", details: error.message });
  }
};


export {getTaskList , getTask, getAllProjects};
