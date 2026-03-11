"use client";

import { useCallback } from "react";

import { TelegramUserCard } from "@/components/TelegramUserCard";
import { BOT_DATA_PAYLOAD } from "@/utils/telegram";
import type { TelegramUser, TelegramWebApp } from "@/types/telegram";

interface HomeScreenProps {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  isReady: boolean;
}

export function HomeScreen({ webApp, user, isReady }: HomeScreenProps) {
  const handleSendData = useCallback(() => {
    if (!webApp) return;
    webApp.sendData(JSON.stringify(BOT_DATA_PAYLOAD));
  }, [webApp]);

  return (
    <div className="flex flex-col gap-5">
      <header className="rounded-2xl border border-slate-200/80 bg-white/75 p-5 shadow-sm backdrop-blur">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500">
          GojoHost
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Welcome 👋
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          {isReady
            ? "Connected to Telegram WebApp SDK"
            : "Waiting for Telegram client..."}
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

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Quick Links</h2>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {[
            { label: "cPanel Hosting", sub: "from 3,540 ETB/yr" },
            { label: "VPS Hosting", sub: "from 1,025 ETB/mo" },
            { label: "SSL Certificates", sub: "from 2,500 ETB/yr" },
            { label: "Reseller Hosting", sub: "from 1,060 ETB/mo" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
            >
              <p className="text-xs font-semibold text-slate-800">{item.label}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
