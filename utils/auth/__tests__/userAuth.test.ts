// Mock NextResponse.json to return a simple object
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init: { status: number }) => ({
      body,
      status: init?.status,
    })),
  },
}));

jest.mock("@/prisma/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/utils/auth/getSession", () => ({
  getSession: jest.fn(),
}));

import { prisma } from "@/prisma/prisma";
import { getSession } from "@/utils/auth/getSession";
import { checkUserRole, validateUserIdMatch } from "../userAuth";

describe("userAuth helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("checkUserRole", () => {
    it("returns 401 when no session", async () => {
      (getSession as jest.Mock).mockResolvedValue(null);

      const res = await checkUserRole(["admin"]);
      expect(res.isAuthorized).toBe(false);
      expect(res.response).toEqual({
        body: { error: "Unauthorized: No session found" },
        status: 401,
      });
    });

    it("returns 401 when user not found or has no role", async () => {
      (getSession as jest.Mock).mockResolvedValue({ user: { email: "a@b" } });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await checkUserRole(["admin"]);
      expect(res.isAuthorized).toBe(false);
      expect(res.response).toEqual({
        body: { error: "Unauthorized: User not found or has no role" },
        status: 401,
      });
    });

    it("returns 403 when roles not allowed", async () => {
      (getSession as jest.Mock).mockResolvedValue({ user: { email: "a@b" } });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        user_roles: [{ role: { name: "user" } }],
      });

      const res = await checkUserRole(["admin"]);
      expect(res.isAuthorized).toBe(false);
      expect(res.response).toEqual({
        body: { error: "Unauthorized: admin access required" },
        status: 403,
      });
    });

    it("returns user when allowed", async () => {
      (getSession as jest.Mock).mockResolvedValue({ user: { email: "a@b" } });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 7,
        user_roles: [{ role: { name: "admin" } }],
      });

      const res = await checkUserRole(["admin"]);
      expect(res.isAuthorized).toBe(true);
      expect(res.user).toEqual({ id: 7, roles: ["admin"] });
      expect(res.response).toBeNull();
    });

    it("returns 500 when prisma throws (internal error)", async () => {
      (getSession as jest.Mock).mockResolvedValue({ user: { email: "a@b" } });
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("db down"),
      );

      const res = await checkUserRole(["admin"]);
      expect(res.isAuthorized).toBe(false);
      expect(res.response).toEqual({
        body: { error: "Internal server error" },
        status: 500,
      });
    });

    it("returns 500 when allowedRoles.some throws (checks outer catch)", async () => {
      (getSession as jest.Mock).mockResolvedValue({ user: { email: "a@b" } });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 7,
        user_roles: [{ role: { name: "admin" } }],
      });

      // craft an object that throws when .some is invoked
      const badAllowed = {
        some: () => {
          throw new Error("boom");
        },
      } as unknown as string[];

      const res = await checkUserRole(badAllowed);
      expect(res.isAuthorized).toBe(false);
      expect(res.response).toEqual({
        body: { error: "Internal server error" },
        status: 500,
      });
    });
  });

  describe("validateUserIdMatch", () => {
    it("propagates unauth when getAuthenticatedUser fails", async () => {
      (getSession as jest.Mock).mockResolvedValue(null);

      const res = await validateUserIdMatch("1");
      expect(res.isAuthorized).toBe(false);
      expect(res.response).toEqual({
        body: { error: "Unauthorized: No session found" },
        status: 401,
      });
    });

    it("returns 400 when userId missing", async () => {
      (getSession as jest.Mock).mockResolvedValue({ user: { email: "a@b" } });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 42,
        user_roles: [{ role: { name: "user" } }],
      });

      const res = await validateUserIdMatch(undefined);
      expect(res.isAuthorized).toBe(false);
      expect(res.response).toEqual({
        body: { error: "User ID parameter is required" },
        status: 400,
      });
    });

    it("returns 403 when id does not match", async () => {
      (getSession as jest.Mock).mockResolvedValue({ user: { email: "a@b" } });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 42,
        user_roles: [{ role: { name: "user" } }],
      });

      const res = await validateUserIdMatch("10");
      expect(res.isAuthorized).toBe(false);
      expect(res.response).toEqual({
        body: { error: "Unauthorized: User ID does not match session" },
        status: 403,
      });
    });

    it("returns success when id matches", async () => {
      (getSession as jest.Mock).mockResolvedValue({ user: { email: "a@b" } });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 42,
        user_roles: [{ role: { name: "user" } }],
      });

      const res = await validateUserIdMatch("42");
      expect(res.isAuthorized).toBe(true);
      expect(res.response).toBeNull();
      expect(res.userId).toBe(42);
    });

    it("handles non-Error thrown values in catch (string)", async () => {
      (getSession as jest.Mock).mockResolvedValue({ user: { email: "a@b" } });
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        "service unavailable",
      );

      const res = await checkUserRole(["admin"]);
      expect(res.isAuthorized).toBe(false);
      expect(res.response).toEqual({
        body: { error: "Internal server error" },
        status: 500,
      });
    });

    it("returns 500 when getAuthenticatedUser has internal error (prisma throws)", async () => {
      (getSession as jest.Mock).mockResolvedValue({ user: { email: "a@b" } });
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("db down"),
      );

      const res = await validateUserIdMatch("1");
      expect(res.isAuthorized).toBe(false);
      expect(res.response).toEqual({
        body: { error: "Internal server error" },
        status: 500,
      });
    });
  });
});
