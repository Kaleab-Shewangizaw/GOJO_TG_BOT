# Telegram Mini App Frontend

Production-ready Telegram Mini App frontend built with Next.js 14, App Router, React, TypeScript, and Tailwind CSS.

## Features

- Next.js 14 with App Router + TypeScript
- Telegram Web Apps SDK loaded from `https://telegram.org/js/telegram-web-app.js`
- Custom `useTelegram()` hook that initializes `Telegram.WebApp`, calls `ready()`, and expands the mini app
- Typed Telegram objects in `src/types/telegram.ts`
- `TelegramUserCard` component to display Telegram user info:
	- `first_name`
	- `username`
	- `id`
- "Send Data to Bot" action via `Telegram.WebApp.sendData()`
- Static-compatible frontend with no server-side runtime dependencies

## Project Structure

```text
src/
	app/
		globals.css
		layout.tsx
		page.tsx
	components/
		TelegramUserCard.tsx
	hooks/
		useTelegram.ts
	types/
		telegram.ts
	utils/
		telegram.ts
```

## Run Locally

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open `http://localhost:3000`.

Note: Telegram-specific APIs are only fully available inside the Telegram client webview.

## Test In Telegram

1. Expose your local app to HTTPS using a tunnel (for example: `ngrok http 3000`).
2. In your bot flow, open the Mini App URL that points to your tunnel HTTPS URL.
3. Launch from Telegram mobile or desktop and verify:
	 - User data appears in the card.
	 - Tapping "Send Data to Bot" sends JSON via `sendData()`.

The current payload is:

```json
{
	"action": "test_action",
	"message": "Hello from the mini app"
}
```

## Deploy To Vercel

1. Push the repository to GitHub.
2. Import the repo in Vercel.
3. Set project root to `frontend`.
4. Keep defaults:
	 - Build command: `npm run build`
	 - Output: Next.js default
5. Deploy and use the generated HTTPS URL as your Telegram Mini App URL.

This app is static-compatible and does not require custom server infrastructure.
