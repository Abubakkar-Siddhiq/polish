import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KeySquare } from "lucide-react";
import { Button } from "./components/ui/button";
import { useState, useEffect } from "react";

type OpBarProps = {
  showSettings: boolean;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  result: string;
  setResult: React.Dispatch<React.SetStateAction<string>>;
};

export default function TopBar({
    showSettings,
    setShowSettings,
    result,
    setResult
} : OpBarProps) {
    const [format, setFormat] = useState<string>("neutral");

    const sendFormatToBackground = (format: string) => {
        chrome.runtime.sendMessage({ type: "SET_FORMAT", format });
    };

    useEffect(() => {
        chrome.storage.local.get("format", (result) => {
        if (result.format) {
            setFormat(result.format);
            sendFormatToBackground(result.format);
        } else {
            sendFormatToBackground("neutral");
        }
        });
    }, []);

    useEffect(() => {
        chrome.storage.local.set({ format });
        sendFormatToBackground(format);
    }, [format]);

    const handleValueChange = (value: any) => {
        setFormat(value);
    }

    return (
        <div className="w-full flex items-center justify-between gap-3">
            <Select onValueChange={handleValueChange} value={format}>
                <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a format" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="funny">Funny</SelectItem>
                    <SelectItem value="sarcastic">Sarcastic</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="poetic">Poetic</SelectItem>
                    <SelectItem value="witty">Witty</SelectItem>
                </SelectContent>
            </Select>
            <Button
                size="sm"
                onClick={() => navigator.clipboard.writeText(result)}
            >
                Copy
            </Button>
            <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                    chrome.storage.local.set({ llmResult: "" }, () => {
                        setResult("");
                    });
                }}
            >
                clear
            </Button>
            <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowSettings(!showSettings)}
            >
                <KeySquare />
            </Button>
        </div>
    )
}
