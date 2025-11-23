"use client";

import { SessionProvider } from "next-auth/react";
import { CodeProvider } from "./CodeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CodeProvider>{children}</CodeProvider>
    </SessionProvider>
  );
}
