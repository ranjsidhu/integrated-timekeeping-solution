"use client";

import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "./NotificationProvider";
import { WeekProvider } from "./WeekProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        <WeekProvider>{children}</WeekProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}
