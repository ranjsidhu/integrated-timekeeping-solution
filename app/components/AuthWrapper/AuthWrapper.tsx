import { redirect } from "next/navigation";
import type { AuthWrapperProps, Role } from "@/types/login.types";
import { getUserDetails } from "./serveractions";

export default async function AuthWrapper({
  children,
  session,
  rolesRequired,
}: AuthWrapperProps) {
  if (!session?.user) {
    redirect("/");
  }

  const userDetails = await getUserDetails(session.user.email);
  if (!userDetails) {
    redirect("/error");
  }

  if (userDetails.error) {
    redirect("/error");
  }

  const userRoles = userDetails?.roles as Role[];

  if (!userRoles) {
    redirect("/error");
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
