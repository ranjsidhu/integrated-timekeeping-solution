import { useEffect, useState } from "react";
import { getForecastPlan } from "@/app/actions";
import type { ForecastEntry } from "@/types/forecast.types";

export function useForecastData(setForecastStatus: (status: string) => void) {
  const [forecastEntries, setForecastEntries] = useState<ForecastEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadForecast() {
      setIsLoading(true);

      const result = await getForecastPlan();

      if (result.success) {
        setForecastEntries(result.entries || []);
        setForecastStatus(result.status || "Draft");
      }

      setIsLoading(false);
    }

    loadForecast();
  }, [setForecastStatus]);

  return {
    forecastEntries,
    isLoading,
    setForecastEntries,
  };
}
