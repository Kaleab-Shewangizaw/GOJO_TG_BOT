"use client";

import { useCallback } from "react";

import { TelegramUserCard } from "@/components/TelegramUserCard";
import { useTelegram } from "@/hooks/useTelegram";
import { BOT_DATA_PAYLOAD } from "@/utils/telegram";

export default function Home() {
  const { webApp, user, isReady } = useTelegram();

  const handleSendData = useCallback(() => {
    if (!webApp) {
      return;
    }

    webApp.sendData(JSON.stringify(BOT_DATA_PAYLOAD));
  }, [webApp]);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_#fce7f3_0,_transparent_45%),radial-gradient(circle_at_bottom_right,_#cffafe_0,_transparent_35%),linear-gradient(145deg,_#f8fafc_0%,_#fff7ed_50%,_#eef2ff_100%)]" />

      <div className="mx-auto flex w-full max-w-md flex-col gap-5 pt-4 sm:pt-8">
        <header className="rounded-2xl border border-slate-200/80 bg-white/75 p-5 shadow-sm backdrop-blur">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">Mini App</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Telegram Mini App</h1>
          <p className="mt-2 text-sm text-slate-600">
            {isReady ? "Connected to Telegram WebApp SDK" : "Waiting for Telegram client..."}
          </p>
        </header>

        <TelegramUserCard user={user} />

        <button
          type="button"
          onClick={handleSendData}
          disabled={!webApp}
          className="w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-medium text-slate-50 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          Send Data to Bot
        </button>
      </div>
    </main>
  );
}
