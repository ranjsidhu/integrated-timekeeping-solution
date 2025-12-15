import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAnalyticsMetrics, getTeamUtilization } from "@/app/actions";
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
    const [metrics, utilization] = await Promise.all([
      withSessionProtection(getAnalyticsMetrics, 4),
      withSessionProtection(getTeamUtilization, 4),
    ]);

    return (
      <AuthWrapper session={session}>
        <Layout>
          <Analytics
            metrics={metrics}
            teamMembers={utilization.teamMembers}
            weekEndings={utilization.weekEndings}
          />
        </Layout>
      </AuthWrapper>
    );
  } catch (error: unknown) {
    console.error("Error in AnalyticsPage:", (error as Error).message);
    redirect("/error");
  }
}
