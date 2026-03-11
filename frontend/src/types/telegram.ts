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
}

export interface TelegramNamespace {
  WebApp: TelegramWebApp;
}

declare global {
  interface Window {
    Telegram?: TelegramNamespace;
  }
}
