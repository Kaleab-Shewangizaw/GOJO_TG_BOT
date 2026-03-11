"use client";

import { useEffect, useState } from "react";

import type { TelegramUser, TelegramWebApp } from "@/types/telegram";
import { getTelegramUserFromWebApp } from "@/utils/telegram-user";

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
      setUser(getTelegramUserFromWebApp(tg));

      // Verify initData server-side with the bot token, then set the user.
      if (tg.initData) {
        fetch("/api/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData: tg.initData }),
        })
          .then(async (res) => {
            const data = await res.json();

            if (!res.ok) {
              return null;
            }

            return data;
          })
          .then((data) => {
            if (isMounted && data?.user) {
              setUser(data.user as TelegramUser);
            }
          })
          .catch(() => {
            // Keep the client-provided fallback when verification request fails.
          })
          .finally(() => {
            if (isMounted) setIsReady(true);
          });
      } else {
        // No initData (e.g. browser dev environment) – keep the client fallback.
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
