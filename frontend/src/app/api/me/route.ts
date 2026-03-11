import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import type { TelegramUser } from "@/types/telegram";

/**
 * Verifies Telegram initData using the bot token.
 * Algorithm: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
function verifyTelegramInitData(
  rawInitData: string,
  botToken: string
): TelegramUser | null {
  const params = new URLSearchParams(rawInitData);
  const hash = params.get("hash");

  if (!hash) {
    return null;
  }

  params.delete("hash");

  // Sort params alphabetically and build the data-check string
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  // secret_key = HMAC-SHA256("WebAppData", bot_token)
  const secretKey = createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  // computed_hash = HMAC-SHA256(secret_key, data_check_string)
  const computedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computedHash !== hash) {
    return null;
  }

  const userJson = params.get("user");
  if (!userJson) {
    return null;
  }

  try {
    return JSON.parse(userJson) as TelegramUser;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const botToken = process.env.BOT_TOKEN?.trim();

  if (!botToken) {
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  let body: { initData?: unknown };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const rawInitData = body?.initData;

  if (typeof rawInitData !== "string" || rawInitData.trim().length === 0) {
    return NextResponse.json(
      { error: "initData is required." },
      { status: 400 }
    );
  }

  const user = verifyTelegramInitData(rawInitData, botToken);

  if (!user) {
    return NextResponse.json(
      { error: "Invalid initData. Verification failed." },
      { status: 401 }
    );
  }

  return NextResponse.json({ user });
}
