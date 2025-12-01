"use client";

import { createContext, useContext, useState } from "react";
import type { WeekEnding } from "@/types/timesheet.types";

type WeekContextType = {
  selectedWeek: WeekEnding | null;
  setSelectedWeek: (week: WeekEnding) => void;
};

const WeekContext = createContext<WeekContextType | undefined>(undefined);

/**
 * Provides week context to its children.
 * @param children - React children nodes
 * @returns React element
 */
export const WeekProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedWeek, setSelectedWeek] = useState<WeekEnding | null>(null);

  return (
    <WeekContext.Provider value={{ selectedWeek, setSelectedWeek }}>
      {children}
    </WeekContext.Provider>
  );
};

/**
 * Custom hook to use week context.
 * @returns React context for selected week
 */
export function useSelectedWeek() {
  const context = useContext(WeekContext);
  if (!context)
    throw new Error("useSelectedWeek must be used within WeekProvider");
  return context;
}
