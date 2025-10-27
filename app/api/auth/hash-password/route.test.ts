describe("hash-password route", () => {
  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  const mockNextResponse = () =>
    jest.mock("next/server", () => ({
      NextResponse: {
        json: (body: unknown, opts?: { status?: number }) => ({
          status: opts?.status ?? 200,
          body,
        }),
      },
    }));

  const mockRouteProtection = () =>
    jest.mock("@/utils/auth/routeProtection", () => ({
      verifyRoleEnvVariable: jest.fn(() => "admin"),
      withRoleProtection: (handler: (...args: unknown[]) => unknown) => handler,
    }));

  const mockPassword = (impl: jest.Mock) =>
    jest.mock("@/utils/auth/password", () => ({ hashPassword: impl }));

  it("returns hashedPassword when password is provided", async () => {
    jest.isolateModules(() => {
      mockNextResponse();
      mockRouteProtection();
      const hashPasswordMock = jest.fn(async (p: string) => `hashed-${p}`);
      mockPassword(hashPasswordMock);

      const route = require("./route");

      type MockRequest = { json: () => Promise<Record<string, unknown>> };
      const req = {
        json: async () => ({ password: "secret" }),
      } as unknown as MockRequest;

      return route.POST(req).then((res: { status: number; body: unknown }) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ hashedPassword: "hashed-secret" });
        expect(hashPasswordMock).toHaveBeenCalledWith("secret");
      });
    });
  });

  it("returns 400 when password is missing", async () => {
    jest.isolateModules(() => {
      mockNextResponse();
      mockRouteProtection();
      mockPassword(jest.fn());

      const route = require("./route");

      type MockRequest = { json: () => Promise<Record<string, unknown>> };
      const req = { json: async () => ({}) } as unknown as MockRequest;

      return route.POST(req).then((res: { status: number; body: unknown }) => {
        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: "Password is required" });
      });
    });
  });

  it("returns 500 when hashing fails", async () => {
    jest.isolateModules(() => {
      mockNextResponse();
      mockRouteProtection();
      const hashPasswordMock = jest.fn(async () => {
        throw new Error("boom");
      });
      mockPassword(hashPasswordMock);

      jest.spyOn(console, "error").mockImplementation(() => {});

      const route = require("./route");

      type MockRequest = { json: () => Promise<Record<string, unknown>> };
      const req = {
        json: async () => ({ password: "bad" }),
      } as unknown as MockRequest;

      return route.POST(req).then((res: { status: number; body: unknown }) => {
        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: "boom" });
        expect(hashPasswordMock).toHaveBeenCalledWith("bad");
      });
    });
  });
});
