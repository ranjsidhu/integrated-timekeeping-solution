"use server";

import { prisma } from "@/prisma/prisma";
import { getSession } from "@/utils/auth/getSession";

const getUserDetails = async (email: string) => {
  try {
    const session = await getSession();

    if (session?.user?.email !== email) {
      return { error: "unauthorised-access-attempted" };
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        user_roles: { select: { role: { select: { id: true, name: true } } } },
      },
    });

    if (!user) {
      return { error: "user-not-found" };
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.user_roles.map((ur) => ur.role.name),
    };
  } catch (error: unknown) {
    console.error("Error fetching user details:", (error as Error).message);
    return null;
  }
};

export { getUserDetails };
