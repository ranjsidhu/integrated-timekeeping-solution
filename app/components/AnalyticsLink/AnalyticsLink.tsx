"use server";

import { HeaderMenuItem } from "@carbon/react";
import { headers } from "next/headers";
import { analyticsRoles } from "@/utils/analytics/analyticsRoles";
import { getSession } from "@/utils/auth/getSession";
import AuthWrapper from "../AuthWrapper/AuthWrapper";

export default async function AnalyticsLink() {
  const session = await getSession();
  const headersList = await headers();
  const pathname = headersList.get("x-current-pathname") ?? "";

  return (
    <AuthWrapper session={session} rolesRequired={analyticsRoles} noRedirect>
      <HeaderMenuItem
        href="/analytics"
        isActive={pathname.includes("/analytics")}
        data-testid="header-menu-item-analytics"
      >
        Analytics
      </HeaderMenuItem>
    </AuthWrapper>
  );
}
