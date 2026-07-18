import express from 'express'
import {createClient} from "redis"
import { prisma } from './db.js'
import cors from "cors"
const PORT = process.env.PORT || 3000;

const SUBMISSION_QUEUE = process.env.SUBMISSION_QUEUE || "submission_queue";
const username = process.env.REDIS_USERNAME
const password = process.env.REDIS_PASSWORD
const host = process.env.REDIS_HOST 
const port = parseInt(process.env.REDIS_PORT || "", 10);

const client = createClient({
   username,
    password,
    socket: {
        host,
        port
    }
});


client.connect()

setInterval(async()=>{
    console.log("checking redis connection")
}, 10000)

const app = express()
app.use(cors({
    origin: "*"
}))
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

    client.LPUSH(SUBMISSION_QUEUE, JSON.stringify({userId, questionId,code,language, submissionId: response.id}))
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

app.listen(PORT,()=>{
    console.log("server is up")
})