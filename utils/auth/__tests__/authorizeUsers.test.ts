import { authorizeUsers } from "../authorizeUsers";

// Mock prisma
jest.mock("@/prisma/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock verifyPassword
jest.mock("@/utils/auth/password", () => ({
  verifyPassword: jest.fn(),
}));

import { prisma } from "@/prisma/prisma";
import { verifyPassword } from "@/utils/auth/password";

describe("authorizeUsers", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns null when email or password missing", async () => {
    // call with undefined
    expect(
      await authorizeUsers(undefined as unknown as Record<string, unknown>),
    ).toBeNull();
    expect(await authorizeUsers({} as Record<string, unknown>)).toBeNull();
    expect(
      await authorizeUsers({ email: "a@b" } as Record<string, unknown>),
    ).toBeNull();
    expect(
      await authorizeUsers({ password: "p" } as Record<string, unknown>),
    ).toBeNull();
  });

  it("returns null when user is not found", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await authorizeUsers({ email: "not@found", password: "pw" });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "not@found" },
      include: { user_roles: { include: { role: true } } },
    });
    expect(result).toBeNull();
  });

  it("returns null when password verification fails", async () => {
    const dbUser = {
      id: 123,
      email: "u@e",
      name: "User",
      password_hash: "hash",
      user_roles: [{ role: { name: "member" } }],
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(dbUser);
    (verifyPassword as jest.Mock).mockResolvedValue(false);

    const result = await authorizeUsers({ email: "u@e", password: "wrong" });
    expect(verifyPassword).toHaveBeenCalledWith("wrong", "hash");
    expect(result).toBeNull();
  });

  it("returns user object when credentials valid", async () => {
    const dbUser = {
      id: 42,
      email: "ok@ex",
      name: "OK",
      password_hash: "ph",
      user_roles: [{ role: { name: "admin" } }, { role: { name: "editor" } }],
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(dbUser);
    (verifyPassword as jest.Mock).mockResolvedValue(true);

    const result = await authorizeUsers({ email: "ok@ex", password: "right" });
    expect(prisma.user.findUnique).toHaveBeenCalled();
    expect(verifyPassword).toHaveBeenCalledWith("right", "ph");
    expect(result).toEqual({
      id: "42",
      email: "ok@ex",
      name: "OK",
      roles: ["admin", "editor"],
    });
  });
});
