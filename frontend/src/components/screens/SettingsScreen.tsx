import type { TelegramUser } from "@/types/telegram";

interface SettingsScreenProps {
  user: TelegramUser | null;
}

const LINKS = [
  { label: "Visit GojoHost Website", href: "https://gojohost.net" },
//   { label: "Live Chat Support", href: "https://gojohost.net/support" },
//   { label: "Email: support@gojohost.net", href: "mailto:support@gojohost.net" },
  { label: "Phone: +251940248788", href: "tel:+251940248788" },
];

export function SettingsScreen({ user }: SettingsScreenProps) {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">App info and support links.</p>
      </header>

      {/* Account */}
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
          Account
        </h2>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center text-white font-semibold text-base shrink-0">
            {user?.first_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {user?.first_name ?? "Not signed in"}
            </p>
            <p className="text-xs text-slate-500">
              {user?.username ? `@${user.username}` : "No username set"}
            </p>
            {user?.id && (
              <p className="text-[11px] text-slate-400 mt-0.5">ID: {user.id}</p>
            )}
          </div>
        </div>
      </section>

      {/* Support & Links */}
      <section className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm backdrop-blur overflow-hidden">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 px-5 pt-4 pb-2">
          Support
        </h2>
        {LINKS.map((link, i) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between px-5 py-3.5 text-sm text-slate-800 hover:bg-slate-50 transition-colors ${
              i < LINKS.length - 1 ? "border-b border-slate-100" : ""
            }`}
          >
            <span>{link.label}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-slate-400 shrink-0"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </a>
        ))}
      </section>

      {/* App info */}
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
          About
        </h2>
        {/* <p className="text-sm text-slate-600">
          GojoHost Mini App — built with Next.js 14 & Telegram Web Apps SDK.
        </p> */}
        <p className="text-xs text-slate-400 mt-1.5">Version 1.0.0</p>
      </section>
    </div>
  );
}
