import { getUserDetails } from "../serveractions";

describe("getUserDetails server action", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    global.fetch = jest.fn();
  });

  afterEach(() => {
    (global.fetch as jest.Mock).mockRestore?.();
    process.env = ORIGINAL_ENV;
    jest.clearAllMocks();
  });

  it("fetches user details and returns parsed JSON when response is ok", async () => {
    process.env.BASE_URL = "https://api.example.com";
    const mockResponse = { user: { roles: ["admin"] } };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const email = "test+1@example.com";
    const data = await getUserDetails(email);

    expect(data).toEqual(mockResponse);

    const expectedUrl = `${process.env.BASE_URL}/api/user/${encodeURIComponent(
      email,
    )}`;

    expect(global.fetch).toHaveBeenCalledWith(
      expectedUrl,
      expect.objectContaining({
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }),
    );
  });

  it("throws when response.ok is false", async () => {
    process.env.BASE_URL = "https://api.example.com";
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(getUserDetails("u@x.com")).rejects.toThrow(
      "Failed to fetch user details",
    );
  });

  it("propagates network errors from fetch", async () => {
    process.env.BASE_URL = "https://api.example.com";
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("network down"),
    );

    await expect(getUserDetails("u@x.com")).rejects.toThrow("network down");
  });
});
