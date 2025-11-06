import type { User } from "next-auth";
import { signInCallback } from "../signInCallback";

jest.mock("@/prisma/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from "@/prisma/prisma";

describe("signInCallback", () => {
  const consoleErrorSpy = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});
  const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it("returns false and logs when user has no email", async () => {
    const result = await signInCallback({
      user: {} as unknown as User,
      account: null,
    });
    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith("No email provided");
    expect((prisma.user.findUnique as jest.Mock).mock.calls.length).toBe(0);
  });

  it("returns false when no db user is found", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await signInCallback({
      user: { email: "missing@example.com" } as unknown as User,
      account: null,
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "missing@example.com" },
      include: { user_roles: { include: { role: true } } },
    });
    expect(result).toBe(false);
  });

  it("returns true when db user exists and logs user info", async () => {
    const dbUser = {
      id: "user-1",
      email: "found@example.com",
      user_roles: [{ role: { name: "admin" } }, { role: { name: "editor" } }],
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(dbUser);

    const result = await signInCallback({
      user: { email: "found@example.com" } as unknown as User,
      account: null,
    });
    expect(result).toBe(true);
    expect(consoleLogSpy).toHaveBeenCalledWith("Existing user found:", {
      id: dbUser.id,
      email: dbUser.email,
      roles: ["admin", "editor"],
    });
  });

  it("returns false and logs error when prisma throws", async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new Error("DB down"),
    );
    const result = await signInCallback({
      user: { email: "err@example.com" } as unknown as User,
      account: null,
    });
    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
