import { useState, useEffect } from 'react';
import './App.css';
import TopBar from './TopBar';
import Settings from './Settings';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function App() {
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    chrome.storage.local.get("llmResult", (data) => {
      if (data.llmResult) setResult(data.llmResult);
    });
  }, []);


  return (
    <main className="h-full p-4 flex flex-col gap-6">
      <TopBar showSettings={showSettings} setShowSettings={setShowSettings} result={result} setResult={setResult} />
      {
        showSettings ? (
          <Settings setShowSettings={setShowSettings} />
        ) : (
          <div className="flex flex-col w-full gap-3 h-full justify-start">
            <Label htmlFor="result">Result</Label>
            <Textarea className='h-full' placeholder="Polished text appears here." id="result" value={result} />
          </div>
        )
      }
    </main>
  )
}

export default App
