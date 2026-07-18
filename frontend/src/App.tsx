import axios from "axios"
import { useEffect, useState } from "react"

function App() {
  const [code, setCode] = useState<string>('')
  const [polling, setpolling] = useState<boolean>(false)
  const [result, setResult] = useState<string>("")
  const [submissionId, setSubmissionId] = useState<string>("")

  useEffect(()=>{
    try {
      
      if(!polling || !submissionId) return;
      async function Polling(){
        // const response = await axios.get(`${import.meta.env.DATABASE_URL}/submission/${submissionId}`)      
        const response = await axios.get(`http://localhost:3000/submission/${submissionId}`)      
        
        if(response.data.submission.output){
          setResult(response.data.submission.output)
          setpolling(false)
        }

      }
      
      const intervalId = setInterval(() => {
        Polling()
      }, 2000);
      
      return () => {
          // cancelled = true;
          clearInterval(intervalId);
      };
    } catch (error) {
      console.error('Polling error:', error);

    }
  },[polling])

  async function handleSubmit(){
    // const response = await axios.post(`${import.meta.env.DATABASE_URL}/submission`,{
    const response = await axios.post(`http://localhost:3000/submission`,{
        userId:"10",
        problemId:"10",
        code,
        language:"js"
    })

    if(response.status === 200){
      setSubmissionId(response.data.submissionId)
      setpolling(true)
    }else{
      alert("error")
    }
  }

  return (
    <>
      <input type="text" onChange={(e)=>{ setCode(e.target.value)}}/>
      <button onClick={handleSubmit}>submit</button>
      
      <br /><br /><br />

        <div>
          Result
          <div>{result ? `${result}`:"polling"}</div>
        
        </div>
    </>
  )
}

export default App
