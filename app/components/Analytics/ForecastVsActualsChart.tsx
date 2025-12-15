"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import type { ForecastVsActualsChartProps } from "@/types/analytics.types";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function ForecastVsActualsChart({
  weekEndings,
  forecastHours,
  actualHours,
  variance,
}: ForecastVsActualsChartProps) {
  const chartData = useMemo(() => {
    return {
      labels: weekEndings.map(
        (week) =>
          `${week.label}\n${new Date(week.week_ending).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
            },
          )}`,
      ),
      datasets: [
        {
          label: "Forecast",
          data: forecastHours,
          backgroundColor: "rgba(15, 98, 254, 0.8)",
          borderColor: "#0f62fe",
          borderWidth: 2,
          borderRadius: 4,
        },
        {
          label: "Actual",
          data: actualHours,
          backgroundColor: "rgba(36, 161, 72, 0.8)",
          borderColor: "#24a148",
          borderWidth: 2,
          borderRadius: 4,
        },
      ],
    };
  }, [weekEndings, forecastHours, actualHours]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: "'IBM Plex Sans', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: "#161616",
        titleFont: {
          size: 14,
          family: "'IBM Plex Sans', sans-serif",
        },
        bodyFont: {
          size: 13,
          family: "'IBM Plex Sans', sans-serif",
        },
        padding: 12,
        displayColors: true,
        callbacks: {
          afterBody: (context: TooltipItem<"bar">[]) => {
            if (context[0].datasetIndex === 0) {
              const index = context[0].dataIndex;
              const varianceValue = variance[index];
              const sign = varianceValue >= 0 ? "+" : "";
              return `Variance: ${sign}${varianceValue}h`;
            }
            return "";
          },
          label: (context: TooltipItem<"bar">) => {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += `${context.parsed.y}h`;
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => {
            return `${value}h`;
          },
          font: {
            size: 12,
            family: "'IBM Plex Sans', sans-serif",
          },
        },
        grid: {
          color: "#e0e0e0",
        },
      },
      x: {
        ticks: {
          font: {
            size: 11,
            family: "'IBM Plex Sans', sans-serif",
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  // Calculate summary stats
  const totalForecast = forecastHours.reduce((sum, h) => sum + h, 0);
  const totalActual = actualHours.reduce((sum, h) => sum + h, 0);
  const totalVariance = totalActual - totalForecast;
  const accuracy =
    totalForecast > 0
      ? 100 - Math.abs((totalVariance / totalForecast) * 100)
      : 100;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#161616]">
          Forecast vs Actuals
        </h2>
        <p className="text-sm text-[#525252] mt-1">
          Comparison of forecasted vs actual hours worked
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-[#f4f4f4] rounded-lg">
        <div>
          <div className="text-xs text-[#525252] uppercase tracking-wide mb-1">
            Total Forecast
          </div>
          <div className="text-2xl font-semibold text-[#0f62fe]">
            {totalForecast}h
          </div>
        </div>
        <div>
          <div className="text-xs text-[#525252] uppercase tracking-wide mb-1">
            Total Actual
          </div>
          <div className="text-2xl font-semibold text-[#24a148]">
            {totalActual}h
          </div>
        </div>
        <div>
          <div className="text-xs text-[#525252] uppercase tracking-wide mb-1">
            Variance
          </div>
          <div
            className={`text-2xl font-semibold ${
              totalVariance >= 0 ? "text-[#24a148]" : "text-[#da1e28]"
            }`}
          >
            {totalVariance >= 0 ? "+" : ""}
            {totalVariance}h
          </div>
        </div>
        <div>
          <div className="text-xs text-[#525252] uppercase tracking-wide mb-1">
            Accuracy
          </div>
          <div className="text-2xl font-semibold text-[#8a3ffc]">
            {accuracy.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>

      {weekEndings.length === 0 && (
        <div className="h-80 flex items-center justify-center">
          <p className="text-[#525252]">
            No historical data available. Submit timesheets to see comparisons.
          </p>
        </div>
      )}
    </div>
  );
}
