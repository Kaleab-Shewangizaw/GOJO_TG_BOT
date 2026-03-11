import type { TelegramUser } from "@/types/telegram";

interface TelegramUserCardProps {
  user: TelegramUser | null;
}

export function TelegramUserCard({ user }: TelegramUserCardProps) {
  return (
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg backdrop-blur">
      <h2 className="text-lg font-semibold text-slate-900">Telegram User</h2>
      <div className="mt-4 space-y-2 text-sm text-slate-700">
        <p>
          <span className="font-medium text-slate-900">First name:</span>{" "}
          {user?.first_name ?? "Not available"}
        </p>
        <p>
          <span className="font-medium text-slate-900">Username:</span>{" "}
          {user?.username ? `@${user.username}` : "Not available"}
        </p>
        <p>
          <span className="font-medium text-slate-900">ID:</span> {user?.id ?? "Not available"}
        </p>
      </div>
    </section>
  );
}
