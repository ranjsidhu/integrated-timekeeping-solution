import { redirect } from "next/navigation";
import type { AuthWrapperProps, Role } from "@/types/login.types";
import { getUserDetails } from "./serveractions";

export default async function AuthWrapper({
  children,
  session,
  rolesRequired,
  noRedirect = false,
}: AuthWrapperProps) {
  if (!session?.user) {
    if (noRedirect) return null;
    redirect("/");
  }

  const userDetails = await getUserDetails(session.user.email);
  if (!userDetails) {
    if (noRedirect) return null;
    redirect("/error");
  }

  if (userDetails.error) {
    if (noRedirect) return null;
    redirect("/error");
  }

  const userRoles = userDetails?.roles as Role[];

  if (!userRoles) {
    if (noRedirect) return null;
    redirect("/error");
  }

  // Compare the user roles with the required roles
  if (
    rolesRequired &&
    !userRoles.some((role) => rolesRequired.includes(role as Role))
  ) {
    if (noRedirect) return null;
    redirect("/timesheet");
  }

  return <>{children}</>;
}
