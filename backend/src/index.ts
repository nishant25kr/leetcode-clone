import express from 'express'
import {createClient} from "redis"
import { prisma } from './db.js'
import cors from "cors"
const client = createClient()
client.connect()

const app = express()
app.use(cors())
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
    const response = await prisma.submissions.create({
        data:{
            code,
            language,
            status:"Processing"
        }
    })

    client.LPUSH("problems",JSON.stringify({userId, questionId,code,language, submissionId: response.id}))
        .then((e)=>console.log("done",e))
        .catch((e)=> console.log("error",e))

    res.send({
        message:"processing",
        submissionId: response.id
    })

})

app.get("/submission/:submissionId",async(req,res)=>{
    const response = await prisma.submissions.findFirst({
        where:{
            id: req.params.submissionId
        }
    })

    console.log("res",response);

    res.send({
        submission: response
    })
})

app.listen(3000,()=>{
    console.log("server is up")
})