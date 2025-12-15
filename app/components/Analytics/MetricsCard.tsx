import type { MetricsCardProps } from "@/types/analytics.types";

export default function MetricsCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: MetricsCardProps) {
  const colorClasses = {
    blue: "bg-[#0f62fe]",
    green: "bg-[#24a148]",
    purple: "bg-[#8a3ffc]",
    dark: "bg-[#161616]",
  };

  return (
    <div
      className={`${colorClasses[color]} rounded-lg p-6 text-white shadow-sm`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/10 rounded-lg">{icon}</div>
      </div>
      <div className="text-3xl font-semibold mb-1">{value}</div>
      <div className="text-white/80 text-sm">{title}</div>
      {subtitle && <div className="text-white/60 text-xs mt-1">{subtitle}</div>}
    </div>
  );
}
