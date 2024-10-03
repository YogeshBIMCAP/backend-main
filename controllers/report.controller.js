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

export {dailyReport , weeklyReport}