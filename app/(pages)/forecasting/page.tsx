import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getForecastWeekEndings } from "@/app/actions";
import { AuthWrapper, Layout } from "@/app/components";
import { getSession } from "@/utils/auth/getSession";
import { withSessionProtection } from "@/utils/auth/routeProtection";
import Forecast from "./Forecast";

export const metadata: Metadata = {
  title: "Forecast",
};

export default async function ForecastPage() {
  const session = await getSession();

  try {
    const weekEndings = await withSessionProtection(getForecastWeekEndings);

    return (
      <AuthWrapper session={session}>
        <Layout>
          <Forecast weekEndings={weekEndings} />
        </Layout>
      </AuthWrapper>
    );
  } catch (error: unknown) {
    console.error("Error in ForecastPage:", (error as Error).message);
    redirect("/error");
  }
}
