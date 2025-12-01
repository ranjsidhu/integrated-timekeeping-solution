// biome-ignore assist/source/organizeImports: Unit tests
import { getUserDetails } from "../serveractions";

// Mocks
jest.mock("@/utils/auth/getSession", () => ({
  getSession: jest.fn(),
}));

jest.mock("@/prisma/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

import { getSession } from "@/utils/auth/getSession";
import { prisma } from "@/prisma/prisma";

describe("getUserDetails server action", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns user details when session matches and user exists", async () => {
    const email = "test+1@example.com";
    // mock session
    (getSession as jest.Mock).mockResolvedValue({ user: { email, id: "1" } });

    // mock prisma response
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      name: "Test User",
      email,
      user_roles: [{ role: { id: 1, name: "admin" } }],
    });

    const data = await getUserDetails(email);

    expect(data).toEqual({
      id: 1,
      name: "Test User",
      email,
      roles: ["admin"],
    });

    expect(getSession).toHaveBeenCalled();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        user_roles: { select: { role: { select: { id: true, name: true } } } },
      },
    });
  });

  it("returns unauthorised error when session email doesn't match", async () => {
    (getSession as jest.Mock).mockResolvedValue({
      user: { email: "other@example.com" },
    });
    const result = await getUserDetails("user@example.com");
    expect(result).toEqual({ error: "unauthorised-access-attempted" });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns user-not-found when prisma returns null", async () => {
    const email = "missing@example.com";
    (getSession as jest.Mock).mockResolvedValue({ user: { email } });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await getUserDetails(email);
    expect(result).toEqual({ error: "user-not-found" });
  });

  it("returns null on unexpected errors", async () => {
    const email = "err@example.com";
    (getSession as jest.Mock).mockResolvedValue({ user: { email } });
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new Error("db down"),
    );

    const result = await getUserDetails(email);
    expect(result).toBeNull();
  });
});
