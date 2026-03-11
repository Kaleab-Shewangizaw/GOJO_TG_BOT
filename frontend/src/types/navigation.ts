export const tabs = ["home", "chat", "blog", "settings"] as const;

export type Tab = (typeof tabs)[number];
