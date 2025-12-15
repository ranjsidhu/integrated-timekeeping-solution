import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getIndividualAnalytics } from "@/app/actions";
import { AuthWrapper, Layout } from "@/app/components";
import type { IndividualAnalyticsPageProps } from "@/types/analytics.types";
import { analyticsRoles } from "@/utils/analytics/analyticsRoles";
import { getSession } from "@/utils/auth/getSession";
import { withRoleProtection } from "@/utils/auth/routeProtection";
import IndividualAnalytics from "./IndividualAnalytics";

export const metadata: Metadata = {
  title: "Team Member Analytics",
};

export default async function IndividualAnalyticsPage({
  params,
}: IndividualAnalyticsPageProps) {
  const session = await getSession();
  const { userId } = await params;

  if (Number.isNaN(userId)) {
    redirect("/analytics");
  }

  try {
    const analytics = await withRoleProtection(
      getIndividualAnalytics,
      analyticsRoles,
      Number(userId),
      4,
    );

    if (!analytics) {
      redirect("/analytics");
    }

    return (
      <AuthWrapper session={session} rolesRequired={analyticsRoles}>
        <Layout>
          <IndividualAnalytics
            initialData={analytics}
            userId={Number(userId)}
          />
        </Layout>
      </AuthWrapper>
    );
  } catch (error: unknown) {
    console.error(
      "Error in IndividualAnalyticsPage:",
      (error as Error).message,
    );
    redirect("/error");
  }
}
