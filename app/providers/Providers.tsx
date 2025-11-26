"use client";

import { SessionProvider } from "next-auth/react";
import { CodeProvider } from "./CodeProvider";
import { NotificationProvider } from "./NotificationProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        <CodeProvider>{children}</CodeProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}
