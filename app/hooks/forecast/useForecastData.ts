import { useEffect, useState } from "react";
import type { ForecastEntry } from "@/types/forecast.types";

export function useForecastData(setForecastStatus: (status: string) => void) {
  const [forecastEntries, setForecastEntries] = useState<ForecastEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadForecast() {
      setIsLoading(true);

      // TODO: Implement actual API call
      // const result = await getForecastPlan(userId);

      // Mock data for now
      setTimeout(() => {
        setForecastEntries([]);
        setForecastStatus("Draft");
        setIsLoading(false);
      }, 500);
    }

    loadForecast();
  }, [setForecastStatus]);

  return {
    forecastEntries,
    isLoading,
    setForecastEntries,
  };
}
