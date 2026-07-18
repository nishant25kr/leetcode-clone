import axios from "axios"
import { useEffect, useState } from "react"

function App() {
  const [code, setCode] = useState<string>('')
  const [polling, setpolling] = useState<boolean>(false)
  const [result, setResult] = useState<string>("")
  const [submissionId, setSubmissionId] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [language, setLanguage] = useState<string>('')
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

  useEffect(() => {
    try {
      if (!polling || !submissionId) return;
      async function Polling() {
        const response = await axios.get(`${backendUrl}/submission/${submissionId}`)

        if (response.data.submission.output) {
          setResult(response.data.submission.output)
          setpolling(false)
          setLoading(false)
        }
      }
      const intervalId = setInterval(() => {
        Polling()
      }, 2000);

      return () => {
        clearInterval(intervalId);
      };
    } catch (error) {
      console.error('Polling error:', error);

    }
  }, [polling, submissionId, backendUrl])

  async function handleSubmit() {
    console.log(backendUrl)
    if(!language || !code){
      alert("please select language and writ code")
      return
    }
    setLoading(true)
    const response = await axios.post(`${backendUrl}/submission`,{
      userId: "1",
      problemId: "1",
      code,
      language
    })

    if (response.status === 200) {
      setSubmissionId(response.data.submissionId)
      setpolling(true)
    } else {
      alert("error")
    }
  }

  return (
    <div className="h-screen w-screen flex bg-gray-100 text-gray-900">
      <div className="flex-1 h-screen p-6">

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">Editor</span>
            <div className="flex items-center gap-2">
              <button className={`m-1 px-3 py-1 rounded border ${language==="js"? 'bg-blue-600 text-white' : 'bg-white'}`} onClick={() => setLanguage("js")}>JS</button>
              <button className={`m-1 px-3 py-1 rounded border ${language==="cpp"? 'bg-blue-600 text-white' : 'bg-white'}`} onClick={() => setLanguage("cpp")}>CPP</button>
            </div>
            {language && <span className="ml-3 px-2 py-1 text-sm bg-gray-200 rounded">{language.toUpperCase()}</span>}
          </div>

          <div>
            <button
              className="m-1 px-4 py-2 bg-gray-800 border rounded text-white disabled:opacity-50"
              onClick={handleSubmit}
              disabled={loading}
            >{loading ? `Submitting...` : "SUBMIT"}</button>
          </div>

        </div>
        <div className="overflow-scroll">
          <textarea
            className="h-[72vh] w-full border p-4 font-mono text-sm rounded shadow-sm"
            rows={20}
            name="inputcode"
            id="code"
            value={code}
            placeholder={'// Write your code here...'}
            onChange={(e) => { setCode(e.target.value) }}
          />
        </div>

      </div>

      <div className="flex-1 h-screen p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="m-1 p-2 text-lg font-semibold">Output</h3>
        </div>
        <div className="p-4 border bg-white h-[84vh] rounded shadow-sm overflow-auto font-mono text-sm">
          {result ? <pre className="whitespace-pre-wrap">{result}</pre> : <div className="text-gray-400">No output yet.</div>}
        </div>
      </div>

    </div>
  )
}

export default App
