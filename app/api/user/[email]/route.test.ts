describe("user by email route", () => {
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

  const mockPrisma = (findUniqueImpl: jest.Mock) =>
    jest.mock("@/prisma/prisma", () => ({
      prisma: { user: { findUnique: findUniqueImpl } },
    }));

  it("returns user when found", async () => {
    jest.isolateModules(() => {
      mockNextResponse();

      const findUnique = jest.fn(async () => ({
        id: 1,
        name: "Bob",
        email: "bob@example.com",
        user_roles: [{ role: { id: 2, name: "admin" } }],
      }));

      mockPrisma(findUnique);

      const route = require("./route");

      const params = {
        params: Promise.resolve({
          email: encodeURIComponent("bob@example.com"),
        }),
      } as {
        params: Promise<{ email: string }>;
      };

      return route
        .GET({} as unknown, params)
        .then((res: { status: number; body: unknown }) => {
          expect(res.status).toBe(200);
          expect(res.body).toEqual({
            success: true,
            user: {
              id: 1,
              name: "Bob",
              email: "bob@example.com",
              roles: ["admin"],
            },
          });
          expect(findUnique).toHaveBeenCalledWith({
            where: { email: "bob@example.com" },
            select: expect.any(Object),
          });
        });
    });
  });

  it("returns 404 when user not found", async () => {
    jest.isolateModules(() => {
      mockNextResponse();

      const findUnique = jest.fn(async () => null);
      mockPrisma(findUnique);

      const route = require("./route");

      const params = {
        params: Promise.resolve({
          email: encodeURIComponent("noone@example.com"),
        }),
      } as {
        params: Promise<{ email: string }>;
      };

      return route
        .GET({} as unknown, params)
        .then((res: { status: number; body: unknown }) => {
          expect(res.status).toBe(404);
          expect(res.body).toEqual({
            success: false,
            message: "User not found",
          });
        });
    });
  });

  it("returns 500 when prisma throws", async () => {
    jest.isolateModules(() => {
      mockNextResponse();

      const findUnique = jest.fn(async () => {
        throw new Error("boom");
      });

      mockPrisma(findUnique);

      jest.spyOn(console, "error").mockImplementation(() => {});

      const route = require("./route");

      const params = {
        params: Promise.resolve({
          email: encodeURIComponent("bad@example.com"),
        }),
      } as {
        params: Promise<{ email: string }>;
      };

      return route
        .GET({} as unknown, params)
        .then((res: { status: number; body: unknown }) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({ success: false, message: "boom" });
          expect(findUnique).toHaveBeenCalled();
        });
    });
  });

  it("returns 500 with generic message when thrown value is not an Error", async () => {
    jest.isolateModules(() => {
      mockNextResponse();

      const findUnique = jest.fn(async () => {
        // throw a non-Error value to exercise the alternate branch
        throw "not-an-error";
      });

      mockPrisma(findUnique);

      jest.spyOn(console, "error").mockImplementation(() => {});

      const route = require("./route");

      const params = {
        params: Promise.resolve({
          email: encodeURIComponent("weird@example.com"),
        }),
      } as {
        params: Promise<{ email: string }>;
      };

      return route
        .GET({} as unknown, params)
        .then((res: { status: number; body: unknown }) => {
          expect(res.status).toBe(500);
          expect(res.body).toEqual({
            success: false,
            message: "Internal Server Error",
          });
          expect(findUnique).toHaveBeenCalled();
        });
    });
  });
});
