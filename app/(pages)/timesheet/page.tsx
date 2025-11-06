import { AuthWrapper, Layout } from "@/app/components";
import TimesheetPageResponsive from "./Timesheet";

export default function TimesheetPage() {
  return (
    <AuthWrapper>
      <Layout>
        <TimesheetPageResponsive />
      </Layout>
    </AuthWrapper>
  );
}
