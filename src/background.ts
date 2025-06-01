// chrome.runtime.onInstalled.addListener(() => {
//   chrome.contextMenus.create({
//     id: "send-to-openai",
//     title: "Polish this text",
//     contexts: ["selection"]
//   });
// });

// chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
//   if (message.type === "saveApiKey") {
//     const apiKey = message.apiKey;
//     // Optionally: encrypt here before saving (for extra security)
//     chrome.storage.local.set({ openaiApiKey: apiKey }, () => {
//       sendResponse({ success: true });
//     });
//     return true;
//   }
// });

// chrome.runtime.onMessage.addListener((msg, sendResponse) => {
//   if (msg.type === "call-openai" && msg.prompt) {
//     chrome.storage.local.get("openaiApiKey", async (result) => {
//       const apiKey = result.openaiApiKey;
//       const res = await fetch("https://api.openai.com/v1/chat/completions", {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${apiKey}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           model: "gpt-3.5-turbo",
//           messages: [{ role: "user", content: msg.prompt }],
//         }),
//       });
//       const data = await res.json();
//       sendResponse(data);
//     });

//     return true; // Required for async sendResponse
//   }
// });
import { Groq } from 'groq-sdk';

const prompts: { [key: string]: string } = {
  "neutral": "You are a world-class Proofreader, Copywriter, and English Literature expert. Your task is to revise the user's text for grammar, clarity, and style while maintaining a natural, professional tone. Do not include commentary or engage in conversation—respond only with the corrected text. Emojis are allowed where they naturally enhance expression.",
  "sarcastic": "You are a world-class Proofreader, Copywriter, and English Literature expert with a sharp, sarcastic wit. Rewrite the user's text with a strong sarcastic tone while keeping correct grammar and flow. Do not include commentary or explanation—just the edited text. Emojis are encouraged when they add to the sarcasm.",
  "formal": "You are a highly professional Proofreader and English Literature expert specializing in formal academic writing. Revise the user's text to ensure grammatical precision, academic tone, and formal style. Avoid casual expressions. Do not engage in conversation—respond only with the corrected version. Emojis should not be used unless explicitly requested.",
  "poetic": "You are a literary expert and poet with a gift for lyrical expression. Rewrite the user's text with poetic rhythm and vivid imagery while preserving the original meaning. Respond only with the reworded version—no extra comments. Emojis are welcome when they enrich the emotional tone.",
  "casual": "You are a laid-back but skilled Proofreader and Copywriter. Your task is to revise the user's text into a casual, conversational tone—like a friendly chat. Keep grammar clean but relaxed. Reply only with the updated text. Emojis are totally fine where they add flavor.",
  "witty": "You're a clever, quick-witted language expert. Revise the user's text with subtle humor, clever phrasing, and clean grammar. Maintain readability while adding personality. Only output the edited version, no commentary. Emojis are allowed where they highlight the wit.",
  "funny": "You are a creative Copywriter with a playful, humorous tone. Rewrite the user's text to make it light-hearted and funny while keeping the meaning intact. Respond only with the edited text—no side comments. Feel free to use emojis to add a fun twist."
};

let tone: string = "neutral";

chrome.runtime.onInstalled.addListener(() => {
  if (chrome.contextMenus) {
    chrome.contextMenus.create({
      id: "send-to-groq",
      title: "Polish this",
      contexts: ["selection"],
    });
  } else {
    console.error("chrome.contextMenus is undefined");
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "saveApiKey") {
    chrome.storage.local.set({ apiKey: message.apiKey }, () => {
      sendResponse({ success: true });
    });
    return true; // Required for async sendResponse
  }
});

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.type === "SET_FORMAT") {
    const selectedFormat = message.format;
    console.log("Tone format received:", selectedFormat);
    tone = selectedFormat;
  }
});

chrome.contextMenus.onClicked.addListener((info, _tab) => {
  if (info.menuItemId === "send-to-groq" && info.selectionText) {
    console.log("Selected text:", info.selectionText);
    sendToGroq(info.selectionText);
  }
});



function sendToGroq(selectedText: string) {
  chrome.storage.local.get("apiKey", ({ apiKey }) => {
    if (!apiKey) {
      console.error("No API key stored.");
      return;
    }

    callGroq(selectedText, apiKey);
  });
}

async function callGroq(selectedText: string, apiKey: string) {
  const groq = new Groq({
    apiKey: apiKey
  });

  console.log(tone)
  const chatCompletion: any = await groq.chat.completions.create({
    "messages": [
      { 
        "role": 'system', 
        "content": prompts[tone]
      },
      {
        "role": "user",
        "content": `Proof read this text. Act like a formatter. Only give the output and nothing else:\n\n${selectedText}`
      }
    ],
    "model": "meta-llama/llama-4-scout-17b-16e-instruct",
    "temperature": 1,
    "max_completion_tokens": 1024,
    "top_p": 1,
    "stream": true,
    "stop": null
  });


  let result = "";

  for await (const chunk of chatCompletion) {
    result += chunk.choices[0]?.delta?.content || '';
  }

  console.log(result);

  chrome.storage.local.set({ llmResult: result });
}