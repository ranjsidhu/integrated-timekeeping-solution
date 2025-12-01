import type { Account, User } from "next-auth";
import { prisma } from "@/prisma/prisma";

type SignInCallbackParams = {
  user: User;
  account: Account | null | undefined;
};

/**
 * Callback function to handle user sign-in.
 * @param param0 - Object containing user and account information
 * @returns Promise resolving to boolean indicating sign-in success
 */
export async function signInCallback({ user }: SignInCallbackParams) {
  try {
    if (!user?.email) {
      console.error("No email provided");
      return false;
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: {
        user_roles: {
          include: { role: true },
        },
      },
    });

    if (!dbUser) {
      return false;
    }

    const roles = dbUser.user_roles?.map((ur) => ur.role.name);
    console.log("Existing user found:", {
      id: dbUser.id,
      email: dbUser.email,
      roles,
    });
    return true;
  } catch (error) {
    console.error("Error in signInCallback:", error);
    return false;
  }
}
