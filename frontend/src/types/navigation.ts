export const tabs = ["home", "chat", "support", "blog", "settings"] as const;

export type Tab = (typeof tabs)[number];
