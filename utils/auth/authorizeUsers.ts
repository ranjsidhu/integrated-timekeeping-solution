"use server";

import { prisma } from "@/prisma/prisma";
import { verifyPassword } from "@/utils/auth/password";

interface Credentials {
  email: string;
  password: string;
}

/**
 * Authorizes a user based on provided credentials.
 * @param credentials - Partial record containing email and password
 * @returns User object if authorized, otherwise null
 */
const authorizeUsers = async (
  credentials: Partial<Record<"email" | "password", unknown>>,
) => {
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  const typedCredentials = credentials as Credentials;

  const user = await prisma.user.findUnique({
    where: {
      email: typedCredentials.email,
    },
    include: {
      user_roles: {
        include: { role: true },
      },
    },
  });

  if (!user) {
    return null;
  }

  const isPasswordValid = await verifyPassword(
    typedCredentials.password,
    user.password_hash,
  );

  if (!isPasswordValid) {
    return null;
  }

  return {
    id: user.id.toString(),
    email: user.email,
    name: user.name,
    roles: user.user_roles.map((ur) => ur.role.name),
  };
};

export { authorizeUsers };
