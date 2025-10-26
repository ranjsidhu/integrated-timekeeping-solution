// Mock NextResponse.json to return a simple object
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init: { status: number }) => ({
      body,
      status: init?.status,
    })),
  },
}));

jest.mock("@/utils/auth/getSession", () => ({
  getSession: jest.fn(),
}));

jest.mock("@/utils/auth/userAuth", () => ({
  checkUserRole: jest.fn(),
}));

import { type NextRequest, NextResponse } from "next/server";
import type { RouteHandler } from "@/types/auth.types";
import { getSession } from "@/utils/auth/getSession";
import { checkUserRole } from "@/utils/auth/userAuth";
import {
  verifyRoleEnvVariable,
  withRoleProtection,
  withSessionProtection,
} from "../routeProtection";

describe("routeProtection wrappers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("withRoleProtection", () => {
    it("returns the response when not authorized", async () => {
      // simulate checkUserRole returning a 403-like response
      (checkUserRole as jest.Mock).mockResolvedValue({
        isAuthorized: false,
        response: NextResponse.json({ error: "no" }, { status: 403 }),
      });

      const handler = jest
        .fn()
        .mockResolvedValue({ ok: true }) as unknown as RouteHandler;
      const wrapper = withRoleProtection(handler, ["admin"]);

      const result = await wrapper({} as unknown as NextRequest, {});

      expect(checkUserRole).toHaveBeenCalledWith(["admin"]);
      expect(handler).not.toHaveBeenCalled();
      expect(result).toEqual({ body: { error: "no" }, status: 403 });
    });

    it("calls handler when authorized", async () => {
      (checkUserRole as jest.Mock).mockResolvedValue({
        isAuthorized: true,
        response: null,
      });

      const handler = jest
        .fn()
        .mockResolvedValue({ success: true }) as unknown as RouteHandler;
      const wrapper = withRoleProtection(handler, ["admin"]);

      const res = await wrapper({} as unknown as NextRequest, {});
      expect(checkUserRole).toHaveBeenCalledWith(["admin"]);
      expect(handler).toHaveBeenCalled();
      expect(res).toEqual({ success: true });
    });
  });

  describe("withSessionProtection", () => {
    it("returns 401 when no session", async () => {
      (getSession as jest.Mock).mockResolvedValue(null);

      const handler = jest
        .fn()
        .mockResolvedValue({}) as unknown as RouteHandler;
      const wrapper = withSessionProtection(handler);

      const res = await wrapper({} as unknown as NextRequest, {});

      expect(getSession).toHaveBeenCalled();
      expect(handler).not.toHaveBeenCalled();
      expect(res).toEqual({
        body: { isAuthorized: false, error: "Unauthorized: No session found" },
        status: 401,
      });
    });

    it("calls handler when session exists", async () => {
      (getSession as jest.Mock).mockResolvedValue({ user: { email: "a@b" } });

      const handler = jest
        .fn()
        .mockResolvedValue({ ok: true }) as unknown as RouteHandler;
      const wrapper = withSessionProtection(handler);

      const res = await wrapper({} as unknown as NextRequest, {});

      expect(getSession).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();
      expect(res).toEqual({ ok: true });
    });
  });

  describe("verifyRoleEnvVariable", () => {
    it("throws when env var is missing", () => {
      expect(() => verifyRoleEnvVariable(undefined)).toThrow(
        "Required role name environment variable is not set",
      );
    });

    it("returns the role name when set", () => {
      expect(verifyRoleEnvVariable("ADMIN_ROLE")).toBe("ADMIN_ROLE");
    });

    it("returns BUILD_TIME_PLACEHOLDER during build phase when roleName is undefined", () => {
      const prev = process.env.NEXT_PHASE;
      process.env.NEXT_PHASE = "phase-production-build";
      try {
        expect(verifyRoleEnvVariable(undefined)).toBe("BUILD_TIME_PLACEHOLDER");
      } finally {
        process.env.NEXT_PHASE = prev;
      }
    });

    it("returns provided roleName during build phase when set", () => {
      const prev = process.env.NEXT_PHASE;
      process.env.NEXT_PHASE = "phase-production-build";
      try {
        expect(verifyRoleEnvVariable("ADMIN_BUILD")).toBe("ADMIN_BUILD");
      } finally {
        process.env.NEXT_PHASE = prev;
      }
    });
  });
});
