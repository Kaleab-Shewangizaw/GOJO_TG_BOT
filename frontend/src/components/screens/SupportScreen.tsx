"use client";

import { useCallback, useState } from "react";

import { SUPPORT_CATEGORY_TITLES } from "@/data/support-categories";
import type { TelegramWebApp } from "@/types/telegram";

interface SupportScreenProps {
  webApp: TelegramWebApp | null;
}

function IconMenu({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 5h16M4 12h16M4 19h10" />
    </svg>
  );
}

function IconChat({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconCopy({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

const COMMAND_CARDS: { cmd: string; title: string; detail: string }[] = [
  {
    cmd: "/dns",
    title: "DNS lookup",
    detail: "A, MX, NS, TXT, CNAME from the bot’s server",
  },
  {
    cmd: "/ticket",
    title: "Ticket draft",
    detail: "Step-by-step text you can send to support",
  },
  {
    cmd: "/verify",
    title: "Ownership",
    detail: "Checklist before sensitive account changes",
  },
];

export function SupportScreen({ webApp }: SupportScreenProps) {
  const rawBot = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim().replace(/^@/, "");
  const hasUsername = Boolean(rawBot?.length);
  const canDeepLink = Boolean(webApp?.openTelegramLink && hasUsername);
  const [copied, setCopied] = useState(false);

  const haptic = useCallback(
    (style: "light" | "medium") => {
      const fb = webApp?.HapticFeedback;
      if (fb && typeof fb.impactOccurred === "function") {
        fb.impactOccurred(style);
      }
    },
    [webApp]
  );

  const openBotMenuHub = useCallback((): void => {
    if (!webApp?.openTelegramLink || !rawBot) return;
    haptic("medium");
    webApp.openTelegramLink(`https://t.me/${rawBot}?start=menu`);
  }, [webApp, rawBot, haptic]);

  const openBotChat = useCallback((): void => {
    if (!webApp?.openTelegramLink || !rawBot) return;
    haptic("light");
    webApp.openTelegramLink(`https://t.me/${rawBot}`);
  }, [webApp, rawBot, haptic]);

  const copyBotLink = useCallback(async (): Promise<void> => {
    if (!rawBot) return;
    const url = `https://t.me/${rawBot}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      haptic("light");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [rawBot, haptic]);

  return (
    <div className="flex flex-col gap-5 pb-8">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/95 via-white to-slate-50 p-5 shadow-[0_1px_0_rgba(16,185,129,0.12),0_18px_50px_-24px_rgba(15,23,42,0.18)]">
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-600/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
              Support hub
            </span>
            {hasUsername && (
              <span className="rounded-full border border-slate-200/80 bg-white/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                @{rawBot}
              </span>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 text-balance">
            Hosting help, one tap away
          </h1>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-slate-600">
            Interactive guides (passwords, DNS, email, cPanel, billing, VPS, tickets) live in the
            bot. Open the menu here, or type{" "}
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
              /menu
            </span>{" "}
            in chat.
          </p>

          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              disabled={!canDeepLink}
              onClick={openBotMenuHub}
              className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
            >
              <IconMenu className="h-5 w-5 opacity-90" />
              Open full menu in bot
              <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[11px] font-normal text-white/90">
                /menu
              </span>
            </button>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                disabled={!canDeepLink}
                onClick={openBotChat}
                className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200/90 bg-white/90 px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-white active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <IconChat className="h-[18px] w-[18px] text-slate-600" />
                Open bot chat
              </button>
              <button
                type="button"
                disabled={!hasUsername}
                onClick={() => void copyBotLink()}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45 ${
                  copied
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : "border-slate-200/90 bg-white/90 text-slate-800 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <IconCopy className="h-[18px] w-[18px] text-slate-600" />
                {copied ? "Link copied" : "Copy t.me link"}
              </button>
            </div>
          </div>

          {!hasUsername && (
            <div className="mt-5 rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-xs leading-relaxed text-amber-950">
              <strong className="font-semibold">Setup:</strong> add{" "}
              <code className="rounded bg-amber-100/80 px-1 py-0.5 font-mono text-[11px]">
                NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=YourBot
              </code>{" "}
              (no @) to <span className="font-mono">frontend/.env</span>, redeploy / restart{" "}
              <span className="font-mono">npm run dev</span>.
            </div>
          )}

          {hasUsername && !canDeepLink && (
            <p className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/90 px-4 py-3 text-[11px] leading-relaxed text-sky-950">
              <strong className="font-semibold">Tip:</strong> one-tap needs Telegram’s Mini App SDK
              (inside Telegram). If you’re testing in a normal browser, use{" "}
              <strong>Copy t.me link</strong> — or paste your bot username in Telegram search.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/90 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">What’s inside /menu</h2>
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            12 areas
          </span>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {SUPPORT_CATEGORY_TITLES.map((title, index) => (
            <li
              key={title}
              className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-800 transition hover:border-slate-200/80 hover:bg-white"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10 text-[11px] font-bold text-emerald-800">
                {index + 1}
              </span>
              <span className="leading-snug">{title}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 px-0.5 text-sm font-semibold text-slate-900">Shortcuts in chat</h2>
        <div className="grid gap-3">
          {COMMAND_CARDS.map((item) => (
            <div
              key={item.cmd}
              className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-slate-900 px-2 py-0.5 font-mono text-xs font-medium text-white">
                  {item.cmd}
                </span>
                <span className="text-sm font-semibold text-slate-900">{item.title}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
