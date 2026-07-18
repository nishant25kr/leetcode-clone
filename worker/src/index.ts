import { createClient } from "redis";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from "child_process";
import { prisma } from "./db";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = createClient()

client.connect().then(
    async()=>{
        while(true){
            const response = await client.RPOP("problems")
            if(!response){
                // console.log("no question")
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
                console.log("running client c++ code",code)
                const filePath = __dirname + "/code/a.cpp";
                fs.writeFileSync(filePath, code)
                spawn("g++", [filePath,"-o","./code/out"])
                await new Promise(resolve => setTimeout(resolve, 2000));
                const response = spawn("./code/out")
                response.stdout.on("data",(chunk: any)=>{
                    console.log(chunk.toString("Utf8"));
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