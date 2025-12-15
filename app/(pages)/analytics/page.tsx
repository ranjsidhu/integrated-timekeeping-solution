import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  getAnalyticsMetrics,
  getForecastVsActuals,
  getProjectAnalytics,
  getTeamUtilization,
} from "@/app/actions";
import { AuthWrapper, Layout } from "@/app/components";
import { getSession } from "@/utils/auth/getSession";
import { withSessionProtection } from "@/utils/auth/routeProtection";
import Analytics from "./Analytics";

export const metadata: Metadata = {
  title: "Analytics",
};

export default async function AnalyticsPage() {
  const session = await getSession();

  try {
    const [metrics, utilization, forecastVsActuals, projects] =
      await Promise.all([
        withSessionProtection(getAnalyticsMetrics, 4),
        withSessionProtection(getTeamUtilization, 4),
        withSessionProtection(getForecastVsActuals, 4),
        withSessionProtection(getProjectAnalytics, 4),
      ]);

    return (
      <AuthWrapper session={session}>
        <Layout>
          <Analytics
            initialMetrics={metrics}
            initialTeamMembers={utilization.teamMembers}
            initialWeekEndings={utilization.weekEndings}
            initialForecastVsActuals={forecastVsActuals}
            initialProjects={projects}
          />
        </Layout>
      </AuthWrapper>
    );
  } catch (error: unknown) {
    console.error("Error in AnalyticsPage:", (error as Error).message);
    redirect("/error");
  }
}
