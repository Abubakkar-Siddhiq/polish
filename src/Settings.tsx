import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

export default function Settings({ setShowSettings }: {
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>
}) {

  const [apiKey, setApiKey] = useState<string>("");
  const [apiKeyExists, setApiKeyExists] = useState<boolean>(false);

  useEffect(() => {
    chrome.storage.local.get("apiKey", (data) => {
      if (data.apiKey) {
        console.log("API Key already exists:", data.apiKey);
        setApiKeyExists(true);
        setApiKey(data.apiKey);
      } else {
        console.log("No API Key found.");
      }
    });
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Button Clicked!")
   chrome.runtime.sendMessage({ type: "saveApiKey", apiKey }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Runtime error:", chrome.runtime.lastError.message);
      } else {
        console.log("API Key saved?", response?.success);
      }
    });
  };

  return (
    <div className="h-full flex flex-col items-center gap-4">
      <form className="flex w-full max-w-sm items-center flex-col gap-2.5" onSubmit={handleSubmit}>
        <Label htmlFor="key" className="self-start">
          Enter your Groq API Key
        </Label>
        <Input 
          type="password"
          id="key"
          placeholder="Groq API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <p className="text-muted-foreground text-sm text-left self-start">
          API key for model: <br />
          <code>meta-llama/llama-4-scout-17b-16e-instruct</code>
        </p>
        {
          apiKeyExists && <p className="text-green-500">API Key already exists.</p>
        }
        <div className="w-full flex items-center justify-between mt-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowSettings(false)}
          >
            Back
          </Button>
          <Button type="submit" className="self-end">Submit</Button>
        </div>
      </form>
    </div>
  )
}
