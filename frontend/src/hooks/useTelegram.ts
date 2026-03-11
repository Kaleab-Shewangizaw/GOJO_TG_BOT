"use client";

import { useEffect, useState } from "react";

import type { TelegramUser, TelegramWebApp } from "@/types/telegram";

interface UseTelegramResult {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  isReady: boolean;
}

export function useTelegram(): UseTelegramResult {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 30;
    let isMounted = true;

    const initTelegram = () => {
      if (!isMounted) {
        return;
      }

      const tg = window.Telegram?.WebApp;

      if (!tg) {
        attempts += 1;

        if (attempts >= maxAttempts) {
          return;
        }

        window.setTimeout(initTelegram, 100);
        return;
      }

      tg.ready();
      tg.expand();

      setWebApp(tg);

      // Verify initData server-side with the bot token, then set the user.
      if (tg.initData) {
        fetch("/api/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData: tg.initData }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (isMounted && data?.user) {
              setUser(data.user as TelegramUser);
            }
          })
          .catch(() => {
            // Fall back to unverified data if network fails
            if (isMounted) {
              setUser(tg.initDataUnsafe?.user ?? null);
            }
          })
          .finally(() => {
            if (isMounted) setIsReady(true);
          });
      } else {
        // No initData (e.g. browser dev environment) – use unverified fallback
        setUser(tg.initDataUnsafe?.user ?? null);
        setIsReady(true);
      }
    };

    initTelegram();

    return () => {
      isMounted = false;
    };
  }, []);

  return { webApp, user, isReady };
}
