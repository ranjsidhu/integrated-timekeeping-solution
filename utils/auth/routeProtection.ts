import { NextResponse } from "next/server";
import type { RouteHandler } from "@/types/auth.types";
import { getSession } from "@/utils/auth/getSession";
import { checkUserRole } from "@/utils/auth/userAuth";

/**
 * Checks if the user has the required roles to access a resource.
 * @param handler API code in route.ts
 * @param allowedRoles Roles allowed to access endpoint
 * @returns Either a 4xx error or the result of the handler
 */
export function withRoleProtection(
  handler: RouteHandler,
  allowedRoles: string[],
): RouteHandler {
  return async (req, context) => {
    const { isAuthorized, response } = await checkUserRole(allowedRoles);
    if (!isAuthorized && response) {
      return response;
    }
    return handler(req, context);
  };
}

/**
 * Checks if the user is authenticated.
 * @param handler API code in route.ts
 * @returns Either a 4xx error or the result of the handler
 */
export function withSessionProtection(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    const session = await getSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { isAuthorized: false, error: "Unauthorized: No session found" },
        { status: 401 },
      );
    }

    return handler(req, context);
  };
}

/**
 * Verifies that a role name environment variable is set.
 * @param roleName Env variable to be verified
 * @returns Either a unhandled 5xx error (application code should not run if env vars are not set) or the roleName parameter
 */
export function verifyRoleEnvVariable(roleName: string | undefined) {
  // Skip validation during build time
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return roleName || "BUILD_TIME_PLACEHOLDER";
  }

  if (!roleName) {
    throw new Error("Required role name environment variable is not set");
  }
  return roleName;
}
