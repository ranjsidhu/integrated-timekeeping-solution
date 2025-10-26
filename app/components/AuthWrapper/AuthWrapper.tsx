import { redirect } from "next/navigation";
import type { AuthWrapperProps, Role } from "@/types/login.types";
import { getSession } from "@/utils/auth/getSession";
import { getUserDetails } from "./serveractions";

export default async function AuthWrapper({
  children,
  rolesRequired,
}: AuthWrapperProps) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/");
  }

  const userDetails = await getUserDetails(session.user.email);
  const userRoles: string[] = userDetails?.user?.roles || [];

  if (!userRoles) {
    redirect("/");
  }

  // Compare the user roles with the required roles
  if (
    rolesRequired &&
    !userRoles.some((role) => rolesRequired.includes(role as Role))
  ) {
    redirect("/timesheet");
  }

  return <>{children}</>;
}
