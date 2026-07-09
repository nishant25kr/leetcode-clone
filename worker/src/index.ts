import { createClient } from "redis";

const client = createClient()

client.connect().then(
    async()=>{
        while(true){
            const response = await client.RPOP("problems")
            if(!response){
                console.log("no question")
                await new Promise(resolve => {
                    setTimeout(resolve, 2000)
                });
                continue;
            }
            const parsedData = JSON.parse(response);
            const code = parsedData.code;
            const language = parsedData.language;
            if(language === "c++"){
                console.log("running client c++ code",code)
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
            if(language === "js"){
                console.log("running client js code",code)
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
)