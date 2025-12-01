import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getWeekEndings } from "@/app/actions";
import { AuthWrapper, Layout } from "@/app/components";
import { getSession } from "@/utils/auth/getSession";
import { withSessionProtection } from "@/utils/auth/routeProtection";
import Timesheet from "./Timesheet";

export const metadata: Metadata = {
  title: "Timesheet",
};

export default async function TimesheetPage() {
  const session = await getSession();

  try {
    const weekEndings = await withSessionProtection(getWeekEndings);

    return (
      <AuthWrapper session={session}>
        <Layout>
          <Timesheet weekEndings={weekEndings} />
        </Layout>
      </AuthWrapper>
    );
  } catch (error: unknown) {
    console.error("Error in TimesheetPage:", (error as Error).message);
    redirect("/error");
  }
}
