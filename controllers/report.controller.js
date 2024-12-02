import axios from "axios";
import { fetchElapsedTimeData } from "../utils/pagination.js";

const weeklyReport = async(req , res)=>{
    const {weeklyTaskData} = req
    console.log(weeklyTaskData);

    const data = {
        weeklyTaskData
    }
    
    res.status(200).send(data)
}
const dailyReport = async(req , res)=>{
    const {dailyTaskData} = req
    console.log(dailyTaskData);

    const data = {
        dailyTaskData 
    }
    
    res.status(200).send(data)
}

const normalReport = async(req , res)=>{
    try {
        
    
    const {
        access_token,
        creator,
        dateFinish,
        dateStart,
        project,
        responsible,
        tags} = req.body


        let taskIds = await axios.get(`${process.env.ROOT_URL}/tasks.task.list`, {
            params : {
                auth : access_token,
                ORDER : {ID : 'desc'},
                select : ["ID"],
                filter : {
                    "GROUP_ID" : project,
                    "CREATED_BY" : creator,
                    "TAGS" : tags, 
                    "RESPONSIBLE_ID" : responsible,
                },

            }

        })

        taskIds = taskIds.data.result.tasks.reduce((acc , task)=>{
            acc.push(task.id)
            return acc
        },[])

        let time = await fetchElapsedTimeData(`${process.env.ROOT_URL}/task.elapseditem.getlist`, {
            auth: access_token,
            ORDER: { ID: "desc" },
            SELECT: ["ID" , "TASK_ID" , "*"],
            FILTER: {

              ">=CREATED_DATE": startDate,
              "<=CREATED_DATE": `${endDate} 23:59:59`,
            },
          })
        
        // await axios.get(`${process.env.ROOT_URL}/task.elapseditem.getlist`, {
        //     params :{
        //         auth : access_token,
        //         ORDER : {ID : 'desc'},
        //         // select : ["TASK_ID"],
        //         filter : {
        //             "ID" : taskIds,
        //             ">=CREATED_DATE" : dateStart,
        //             "<=CREATED_DATE" : `${dateFinish} 23:59:59`
        //         }
        //     }
        // })

        res.status(200).json(time)
    } catch (error) {
        console.log(error.message);
        res.status(500).send(error)
        
    }
}

export {normalReport, dailyReport , weeklyReport}