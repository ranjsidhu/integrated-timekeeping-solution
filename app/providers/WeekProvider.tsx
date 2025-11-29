"use client";

import { createContext, useContext, useState } from "react";
import type { WeekEnding } from "@/types/timesheet.types";

type WeekContextType = {
  selectedWeek: WeekEnding | null;
  setSelectedWeek: (week: WeekEnding) => void;
};

const WeekContext = createContext<WeekContextType | undefined>(undefined);

export const WeekProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedWeek, setSelectedWeek] = useState<WeekEnding | null>(null);

  return (
    <WeekContext.Provider value={{ selectedWeek, setSelectedWeek }}>
      {children}
    </WeekContext.Provider>
  );
};

export function useSelectedWeek() {
  const context = useContext(WeekContext);
  if (!context)
    throw new Error("useSelectedWeek must be used within WeekProvider");
  return context;
}
