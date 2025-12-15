import type { TeamCapacityTableProps } from "@/types/analytics.types";

export default function TeamCapacityTable({
  teamMembers,
  weekEndings,
}: TeamCapacityTableProps) {
  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return "text-[#24a148]"; // Green
    if (utilization >= 60) return "text-[#f1c21b]"; // Amber
    return "text-[#da1e28]"; // Red
  };

  const getUtilizationEmoji = (utilization: number) => {
    if (utilization >= 80) return "🟢";
    if (utilization >= 60) return "🟡";
    return "🔴";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-[#e0e0e0]">
        <h2 className="text-xl font-semibold text-[#161616]">
          Team Capacity Overview
        </h2>
        <p className="text-sm text-[#525252] mt-1">
          Forecasted hours for the next {weekEndings.length} weeks
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#f4f4f4]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#161616] uppercase tracking-wider">
                Team Member
              </th>
              {weekEndings.map((week) => (
                <th
                  key={week.id}
                  className="px-6 py-3 text-center text-xs font-semibold text-[#161616] uppercase tracking-wider"
                >
                  {week.label}
                  <div className="text-[#525252] font-normal normal-case text-xs mt-1">
                    {new Date(week.week_ending).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-center text-xs font-semibold text-[#161616] uppercase tracking-wider">
                Avg Util.
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#e0e0e0]">
            {teamMembers.map((member) => (
              <tr
                key={member.id}
                className="hover:bg-[#f4f4f4] transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#161616]">
                    {member.name}
                  </div>
                  <div className="text-sm text-[#525252]">{member.email}</div>
                </td>
                {weekEndings.map((week) => {
                  const hours = member.weeklyHours[week.id] || 0;
                  const utilization = (hours / 40) * 100;
                  return (
                    <td
                      key={week.id}
                      className="px-6 py-4 whitespace-nowrap text-center"
                    >
                      <div className="text-sm font-semibold text-[#161616]">
                        {hours}h
                      </div>
                      <div
                        className={`text-xs ${getUtilizationColor(utilization)}`}
                      >
                        {utilization.toFixed(0)}%
                      </div>
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div
                    className={`text-sm font-semibold ${getUtilizationColor(member.averageUtilization)}`}
                  >
                    {member.averageUtilization.toFixed(0)}%{" "}
                    {getUtilizationEmoji(member.averageUtilization)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {teamMembers.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-[#525252]">No team members found</p>
        </div>
      )}
    </div>
  );
}
