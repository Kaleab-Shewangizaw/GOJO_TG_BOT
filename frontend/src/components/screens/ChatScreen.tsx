import { ChatBox } from "@/components/ChatBox";

export function ChatScreen() {
  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">AI Assistant</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ask anything about GojoHost plans, pricing, or support.
        </p>
      </header>
      <ChatBox />
    </div>
  );
}
