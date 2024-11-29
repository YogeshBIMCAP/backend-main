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
    const {normalTaskData} = req
    console.log(normalTaskData);
}

export {normalReport, dailyReport , weeklyReport}