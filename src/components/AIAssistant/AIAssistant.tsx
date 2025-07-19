"use client";
import { useState, useRef, useEffect } from "react";

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Hi! I’m your assistant. How can I help you navigate or use the app?",
    },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Replace this with your real AI API call
  async function sendToAI(message: string) {
    // For demo, just echo
    // You can call your backend or OpenAI API here
    return "I'm here to help! (This is a demo response.)";
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { from: "user", text: input }]);
    setInput("");
    const aiReply = await sendToAI(input);
    setMessages((msgs) => [...msgs, { from: "ai", text: aiReply }]);
  };

  return (
    <>
      <button
        className="fixed bottom-6 right-6 z-50 bg-gray-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition animate-bounce"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI Assistant"
      >
        🤖
      </button>
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-white rounded-xl shadow-xl flex flex-col">
          <div className="p-4 border-b font-bold text-blue-700 flex justify-between items-center">
            AI Assistant
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div
            className="flex-1 overflow-y-auto p-4 space-y-2"
            style={{ maxHeight: 300 }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={msg.from === "ai" ? "text-left" : "text-right"}
              >
                <span
                  className={
                    msg.from === "ai"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }
                  style={{
                    borderRadius: 8,
                    padding: "4px 8px",
                    display: "inline-block",
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="flex border-t">
            <input
              ref={inputRef}
              className="flex-1 px-3 py-2 outline-none"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="px-4 text-blue-600 font-bold">
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
