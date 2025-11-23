"use client";

import { createContext, useContext, useState } from "react";
import type { Code } from "@/types/timesheet.types";

type SelectedCodeContextType = {
  code: Code | null;
  setCode: (value: Code | null) => void;
};

const SelectedCodeContext = createContext<SelectedCodeContextType | undefined>(
  undefined,
);

export const CodeProvider = ({ children }: { children: React.ReactNode }) => {
  const [code, setCode] = useState<Code | null>(null);

  return (
    <SelectedCodeContext.Provider value={{ code, setCode }}>
      {children}
    </SelectedCodeContext.Provider>
  );
};

export function useSelectedCode() {
  const context = useContext(SelectedCodeContext);
  if (!context)
    throw new Error("useSelectedCode must be used within CodeProvider");
  return context;
}
