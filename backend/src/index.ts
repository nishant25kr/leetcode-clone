import express from 'express'
import {createClient} from "redis"

const client = createClient()
client.connect()

const app = express()
app.use(express.json())

app.get("/",(req,res)=>{
    console.log('Hi there from server')
})

app.post("/submission",async(req,res)=>{
    const userId = req.body.userId
    const questionId = req.body.questionId
    const code = req.body.code
    const language= req.body.language
    
    //save the data in db
    
    client.LPUSH("problems",JSON.stringify({userId, questionId,code,language}))
        .then((e)=>console.log("done",e))
        .catch((e)=> console.log("error",e))

    res.send({
        message:"processing"
    })

})

app.get("/submission/:submissionId",async(req,res)=>{
    
})

app.listen(3000,()=>{
    console.log("server is up")
})