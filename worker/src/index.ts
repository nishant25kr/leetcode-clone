import { createClient } from "redis";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from "child_process";
import { prisma } from "./db";
let count = 1;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

client.connect().then(
    async()=>{
        while(true){
            const response = await client.RPOP(SUBMISSION_QUEUE)
            if(!response){
                count = count+1;
                console.log(count)
                await new Promise(resolve => {
                    setTimeout(resolve, 2000)
                });
                continue;
            }
            
            const parsedData = JSON.parse(response);
            const code = parsedData.code;
            const language = parsedData.language;
            const submissionId = parsedData.submissionId
            if(language === "cpp"){
                console.log("running client c++ code", code)
                const codeDir = path.join(__dirname, "code")
                fs.mkdirSync(codeDir, { recursive: true })
                const filePath = path.join(codeDir, "a.cpp")
                const outPath = path.join(codeDir, "out")
                fs.writeFileSync(filePath, code)

                // compile
                await new Promise<void>((resolve, reject) => {
                    const compile = spawn("g++", [filePath, "-o", outPath])
                    let stderr = ""
                    compile.stderr.on("data", (chunk: any) => { stderr += chunk.toString() })
                    compile.on("close", (code) => {
                        if(code === 0) return resolve()
                        return reject(new Error(stderr || `g++ exited with code ${code}`))
                    })
                    compile.on("error", reject)
                })

                // run binary
                const run = spawn(outPath)
                let finalOutput = ""
                let finalErr = ""
                run.stdout.on("data", (chunk: any) => { finalOutput += chunk.toString() })
                run.stderr.on("data", (chunk: any) => { finalErr += chunk.toString() })

                await new Promise<void>((resolve, reject) => {
                    run.on("close", async (code) => {
                        const output = finalOutput + (finalErr ? `\n${finalErr}` : "")
                        console.log("finaloutput:", output)
                        await prisma.submissions.update({
                            where: { id: submissionId },
                            data: { output, status: code === 0 ? "Success" : "Failed" }
                        })
                        resolve()
                    })
                    run.on("error", reject)
                })
            }
            
            if(language === "js"){
                console.log("running client js code",code)
                const filePath = __dirname + "/code/a.js";
                fs.writeFileSync(filePath, code)
                const response = spawn("node",[filePath])
                let finalOutput = "";
                response.stdout.on("data",(chunk: string) => {
                    finalOutput += chunk.toString()
                })
                await new Promise<void>((resolve, reject)=>{
                    response.on("close", async (code) => {
                        console.log("finaloutput:",finalOutput)
                        await prisma.submissions.update({
                            where:{
                                id: submissionId
                            },
                            data: {
                                output: finalOutput,
                                status: "Success" 
                            }
                        })
                        resolve()
                    })
                    response.on("error", reject)
                })
            }
        }
    }
)