import type { ProjectAnalyticsTableProps } from "@/types/analytics.types";

export default function ProjectAnalyticsTable({
  projects,
}: ProjectAnalyticsTableProps) {
  const getVarianceColor = (variance: number) => {
    if (Math.abs(variance) < 5) return "text-[#525252]"; // Neutral
    if (variance > 0) return "text-[#da1e28]"; // Over forecast (red)
    return "text-[#24a148]"; // Under forecast (green)
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return "text-[#24a148]"; // Green
    if (utilization >= 60) return "text-[#f1c21b]"; // Amber
    return "text-[#da1e28]"; // Red
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-[#e0e0e0]">
        <h2 className="text-xl font-semibold text-[#161616]">
          Project Analytics
        </h2>
        <p className="text-sm text-[#525252] mt-1">
          Resource allocation and utilization by project
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#f4f4f4]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#161616] uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-[#161616] uppercase tracking-wider">
                Team Size
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-[#161616] uppercase tracking-wider">
                Forecast
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-[#161616] uppercase tracking-wider">
                Actual
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-[#161616] uppercase tracking-wider">
                Variance
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-[#161616] uppercase tracking-wider">
                Billable
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-[#161616] uppercase tracking-wider">
                Non-Billable
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-[#161616] uppercase tracking-wider">
                Utilization
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#e0e0e0]">
            {projects.map((project) => (
              <tr
                key={project.projectId}
                className="hover:bg-[#f4f4f4] transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#161616]">
                    {project.projectName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-[#161616]">
                    {project.teamMemberCount}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-semibold text-[#0f62fe]">
                    {project.forecastHours}h
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm font-semibold text-[#24a148]">
                    {project.actualHours}h
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div
                    className={`text-sm font-semibold ${getVarianceColor(project.variance)}`}
                  >
                    {project.variance > 0 ? "+" : ""}
                    {project.variance}h
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-[#161616]">
                    {project.billableHours}h
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-[#525252]">
                    {project.nonBillableHours}h
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div
                    className={`text-sm font-semibold ${getUtilizationColor(project.utilizationRate)}`}
                  >
                    {project.utilizationRate}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {projects.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-[#525252]">No project data available</p>
        </div>
      )}
    </div>
  );
}
