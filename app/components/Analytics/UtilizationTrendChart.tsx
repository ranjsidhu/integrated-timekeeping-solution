"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

type UtilizationTrendChartProps = {
  teamMembers: Array<{
    id: number;
    name: string;
    weeklyHours: Record<number, number>;
  }>;
  weekEndings: Array<{ id: number; week_ending: Date; label: string }>;
};

export default function UtilizationTrendChart({
  teamMembers,
  weekEndings,
}: UtilizationTrendChartProps) {
  const chartData = useMemo(() => {
    // Calculate team-wide utilization for each week
    const utilizationByWeek = weekEndings.map((week) => {
      let totalHours = 0;
      teamMembers.forEach((member) => {
        totalHours += member.weeklyHours[week.id] || 0;
      });

      const maxPossibleHours = teamMembers.length * 40;
      const utilization =
        maxPossibleHours > 0 ? (totalHours / maxPossibleHours) * 100 : 0;
      return utilization;
    });

    return {
      labels: weekEndings.map(
        (week) =>
          `${week.label} (${new Date(week.week_ending).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
            },
          )})`,
      ),
      datasets: [
        {
          label: "Team Utilization",
          data: utilizationByWeek,
          borderColor: "#0f62fe",
          backgroundColor: "rgba(15, 98, 254, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: "#0f62fe",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
        {
          label: "Target (80%)",
          data: weekEndings.map(() => 80),
          borderColor: "#24a148",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          pointHoverRadius: 0,
        },
        {
          label: "Full Capacity (100%)",
          data: weekEndings.map(() => 100),
          borderColor: "#da1e28",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 0,
          pointHoverRadius: 0,
        },
      ],
    };
  }, [teamMembers, weekEndings]);

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
          label: (context: TooltipItem<"line">) => {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += `${context.parsed.y.toFixed(1)}%`;
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 120,
        ticks: {
          callback: (value: string | number) => {
            return `${value}%`;
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
            size: 12,
            family: "'IBM Plex Sans', sans-serif",
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#161616]">
          Utilization Trend
        </h2>
        <p className="text-sm text-[#525252] mt-1">
          Team-wide utilization over the next {weekEndings.length} weeks
        </p>
      </div>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
