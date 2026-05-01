export interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
}

export interface TelegramWebAppInitDataUnsafe {
  user?: TelegramUser;
  [key: string]: unknown;
}

export interface TelegramWebApp {
  /** Raw URL-encoded string used to verify the user server-side. */
  initData: string;
  initDataUnsafe: TelegramWebAppInitDataUnsafe;
  ready: () => void;
  expand: () => void;
  sendData: (data: string) => void;
  /** Opens a t.me / tg:// link inside Telegram (Mini App SDK 6.1+ when available). */
  openTelegramLink?: (url: string) => void;
  /** Optional haptics when running inside Telegram. */
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy") => void;
  };
}

export interface TelegramNamespace {
  WebApp: TelegramWebApp;
}

declare global {
  interface Window {
    Telegram?: TelegramNamespace;
  }
}
