"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { CodeWithWorkItems } from "@/types/timesheet.types";

type SelectedCodeContextType = {
  code: CodeWithWorkItems | null;
  setCode: (value: CodeWithWorkItems | null) => void;
  workItems: CodeWithWorkItems["work_items"];
  addWorkItems: (items: CodeWithWorkItems["work_items"]) => void;
  clearWorkItems: () => void;
};

const SelectedCodeContext = createContext<SelectedCodeContextType | undefined>(
  undefined,
);

export const CodeProvider = ({ children }: { children: React.ReactNode }) => {
  const [code, setCode] = useState<CodeWithWorkItems | null>(null);
  const [workItems, setWorkItems] = useState<CodeWithWorkItems["work_items"]>(
    [],
  );

  const addWorkItems = useCallback((items: CodeWithWorkItems["work_items"]) => {
    setWorkItems((prev) => {
      const next = prev.slice();
      for (const w of items) {
        if (!next.some((existing) => existing.id === w.id)) {
          next.push(w);
        }
      }
      return next;
    });
  }, []);

  const clearWorkItems = useCallback(() => setWorkItems([]), []);

  return (
    <SelectedCodeContext.Provider
      value={{ code, setCode, workItems, addWorkItems, clearWorkItems }}
    >
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
