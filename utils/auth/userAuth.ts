import { NextResponse } from "next/server";
import { prisma } from "@/prisma/prisma";
import type { AuthResult, UserValidationResult } from "@/types/auth.types";
import { getSession } from "./getSession";

/**
 * Fetches the authenticated user based on the current session.
 * @returns Either a 4xx error or the authenticated user info
 */
async function getAuthenticatedUser(): Promise<AuthResult> {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return {
        isAuthorized: false,
        response: NextResponse.json(
          { error: "Unauthorized: No session found" },
          { status: 401 },
        ),
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        user_roles: { select: { role: true } },
      },
    });

    if (!user?.user_roles?.[0]?.role) {
      return {
        isAuthorized: false,
        response: NextResponse.json(
          { error: "Unauthorized: User not found or has no role" },
          { status: 401 },
        ),
      };
    }

    return {
      isAuthorized: true,
      response: null,
      user: { id: user.id, roles: user.user_roles.map((ur) => ur.role.name) },
    };
  } catch (error: unknown) {
    console.error(
      "Auth check error:",
      error instanceof Error ? error.message : error,
    );
    return {
      isAuthorized: false,
      response: NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      ),
    };
  }
}

/**
 * Checks if the user has the required roles to access a resource.
 * @param allowedRoles Roles allowed to access resource
 * @returns Either a 4xx error or the result of the handler
 */
export async function checkUserRole(
  allowedRoles: string[],
): Promise<AuthResult> {
  try {
    const authResult = await getAuthenticatedUser();

    if (!authResult.isAuthorized || !authResult.user) {
      return authResult;
    }

    const isAuthorized = allowedRoles.some((role) =>
      authResult.user.roles.includes(role),
    );
    if (isAuthorized) {
      return {
        isAuthorized: true as const,
        user: authResult.user,
        response: null,
      };
    } else {
      return {
        isAuthorized: false as const,
        response: NextResponse.json(
          {
            error: `Unauthorized: ${allowedRoles.join(" or ")} access required`,
          },
          { status: 403 },
        ),
      };
    }
  } catch (error) {
    console.error("Auth check error:", error);
    return {
      isAuthorized: false,
      response: NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      ),
    };
  }
}

/**
 * Validates that the provided userId matches the authenticated user's ID.
 * @param userId User ID to validate against authenticated user
 * @returns Either a 4xx error or the result of the handler
 */
export async function validateUserIdMatch(
  userId: string | undefined,
): Promise<UserValidationResult> {
  const authResult = await getAuthenticatedUser();

  if (!authResult.isAuthorized || !authResult.user) {
    return {
      isAuthorized: false,
      response: authResult.response,
    };
  }

  if (!userId) {
    return {
      isAuthorized: false,
      response: NextResponse.json(
        { error: "User ID parameter is required" },
        { status: 400 },
      ),
    };
  }

  const userIdNumber = Number(userId);
  if (Number.isNaN(userIdNumber)) {
    return {
      isAuthorized: false,
      response: NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 },
      ),
    };
  }

  if (userIdNumber !== authResult.user.id) {
    return {
      isAuthorized: false,
      response: NextResponse.json(
        { error: "Unauthorized: User ID does not match session" },
        { status: 403 },
      ),
    };
  }

  return {
    isAuthorized: true,
    response: null,
    userId: userIdNumber,
  };
}
