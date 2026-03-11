"use client";

import { FormEvent, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

export function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      const reply: string = res.ok
        ? data.reply
        : data.error ?? "Something went wrong.";

      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  };

  return (
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/90 shadow-lg backdrop-blur flex flex-col overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">GojoHost Assistant</h2>
        <p className="text-xs text-slate-500 mt-0.5">Ask about hosting plans, pricing, or support</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[220px] max-h-[340px]">
        {messages.length === 0 && (
          <p className="text-xs text-slate-400 text-center pt-6">
            Start a conversation with GojoHost assistant...
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-slate-900 text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-800 rounded-bl-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-2.5">
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 px-4 py-3 border-t border-slate-100">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
          className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || input.trim().length === 0}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </section>
  );
}
