import { fetchElapsedTimeData } from "../../utils/pagination.js";
import { weeklyTimeElapsedFormatting, dailyTimeElapsedFormatting } from "../../utils/timeElapsedFormatting.js";

const timeElapsedDaily = async(req , res , next)=>{
    const {access_token, startDate, endDate, responsible} = req.body
    try {

        // Use only valid sorting keys in the ORDER parameter
        const params = {
          auth: access_token,
          ORDER: { ID: 'desc' },
          SELECT : ["TASK_ID" , "USER_ID" , "SECONDS", "ID" , "CREATED_DATE"],
          FILTER: { "USER_ID" : responsible || [], '>=CREATED_DATE': startDate , '<=CREATED_DATE': `${endDate} 23:59:59`  }
        };
    
        // Fetch all paginated data using the pagination utility
        const allResults = await fetchElapsedTimeData(
          `${process.env.ROOT_URL}/task.elapseditem.getlist`,
          params
        );
        
        const weekResult = weeklyTimeElapsedFormatting(allResults)

        
        
        req.timeElapsedWeekly ={ data : weekResult, count: weekResult.length };
        next()
      } catch (error) {
        console.error('Error fetching elapsed time entries:', error);
        res.status(500).json({ error: `Error in timeElapsed Middleware : ${error.message}` });
      }
}

export {timeElapsedDaily}