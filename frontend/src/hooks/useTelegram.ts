"use client";

import { useEffect, useMemo, useState } from "react";

import type { TelegramUser, TelegramWebApp } from "@/types/telegram";

interface UseTelegramResult {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  isReady: boolean;
}

export function useTelegram(): UseTelegramResult {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
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
      setIsReady(true);
    };

    initTelegram();

    return () => {
      isMounted = false;
    };
  }, []);

  const user = useMemo(() => webApp?.initDataUnsafe?.user ?? null, [webApp]);

  return { webApp, user, isReady };
}
