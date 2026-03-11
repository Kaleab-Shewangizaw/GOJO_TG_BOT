"use client";

import { useState } from "react";

import { BottomNav } from "@/components/BottomNav";
import { BlogScreen } from "@/components/screens/BlogScreen";
import { ChatScreen } from "@/components/screens/ChatScreen";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { SettingsScreen } from "@/components/screens/SettingsScreen";
import { useTelegram } from "@/hooks/useTelegram";
import type { Tab } from "@/types/navigation";

export function AppShell() {
  const { webApp, user, isReady } = useTelegram();
  const [activeTab, setActiveTab] = useState<Tab>("home");

  return (
    <div className="relative min-h-screen overflow-hidden">
      <main className="mx-auto w-full max-w-md px-4 pt-6 pb-28 sm:px-6">
        {activeTab === "home" && (
          <HomeScreen webApp={webApp} user={user} isReady={isReady} />
        )}
        {activeTab === "chat" && <ChatScreen />}
        {activeTab === "blog" && <BlogScreen />}
        {activeTab === "settings" && <SettingsScreen user={user} />}
      </main>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}