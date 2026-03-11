import type { TelegramUser, TelegramWebApp } from "@/types/telegram";

function normalizeTelegramUser(value: unknown): TelegramUser | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const id = candidate.id;
  const firstName = candidate.first_name;
  const username = candidate.username;

  if (typeof id !== "number" || typeof firstName !== "string") {
    return null;
  }

  return {
    id,
    first_name: firstName,
    username: typeof username === "string" ? username : undefined,
  };
}

export function getTelegramUserFromWebApp(webApp: TelegramWebApp): TelegramUser | null {
  const unsafeUser = normalizeTelegramUser(webApp.initDataUnsafe?.user);

  if (unsafeUser) {
    return unsafeUser;
  }

  if (!webApp.initData) {
    return null;
  }

  const params = new URLSearchParams(webApp.initData);
  const rawUser = params.get("user");

  if (!rawUser) {
    return null;
  }

  try {
    return normalizeTelegramUser(JSON.parse(rawUser));
  } catch {
    return null;
  }
}