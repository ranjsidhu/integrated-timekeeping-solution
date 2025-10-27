// Mock the auth module
/** biome-ignore-all lint/suspicious/noExplicitAny: Unit tests */
jest.mock("../auth", () => ({
  auth: jest.fn(),
}));

import { auth } from "../auth";
import { getSession } from "../getSession";

// Define the session type for better type safety
type MockSession =
  | {
      user?: {
        id?: string;
        email?: string;
        name?: string;
        roles?: string[];
        [key: string]: any;
      };
      expires?: string;
      [key: string]: any;
    }
  | null
  | undefined;

// Get the mocked auth function using a simpler approach
const mockAuth = auth as unknown as jest.MockedFunction<
  () => Promise<MockSession>
>;

describe("session utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSession", () => {
    it("should return session when auth returns a valid session", async () => {
      const mockSession = {
        user: {
          id: "1",
          email: "test@example.com",
          name: "Test User",
        },
        expires: "2024-12-31T23:59:59Z",
      };

      mockAuth.mockResolvedValue(mockSession);

      const result = await getSession();

      expect(mockAuth).toHaveBeenCalledTimes(1);
      expect(mockAuth).toHaveBeenCalledWith();
      expect(result).toEqual(mockSession);
    });

    it("should return null when auth returns null", async () => {
      mockAuth.mockResolvedValue(null);

      const result = await getSession();

      expect(mockAuth).toHaveBeenCalledTimes(1);
      expect(mockAuth).toHaveBeenCalledWith();
      expect(result).toBeNull();
    });

    it("should return undefined when auth returns undefined", async () => {
      mockAuth.mockResolvedValue(undefined);

      const result = await getSession();

      expect(mockAuth).toHaveBeenCalledTimes(1);
      expect(mockAuth).toHaveBeenCalledWith();
      expect(result).toBeUndefined();
    });

    it("should handle session with partial user data", async () => {
      const mockSession = {
        user: {
          id: "2",
          email: "partial@example.com",
          // Missing name field
        },
        expires: "2024-12-31T23:59:59Z",
      };

      mockAuth.mockResolvedValue(mockSession);

      const result = await getSession();

      expect(result).toEqual(mockSession);
      expect(result?.user?.id).toBe("2");
      expect(result?.user?.email).toBe("partial@example.com");
      expect(result?.user?.name).toBeUndefined();
    });

    it("should handle session with no user", async () => {
      const mockSession = {
        expires: "2024-12-31T23:59:59Z",
        // No user field
      };

      mockAuth.mockResolvedValue(mockSession as any);

      const result = await getSession();

      expect(result).toEqual(mockSession);
      expect(result?.user).toBeUndefined();
    });

    it("should handle session with empty user object", async () => {
      const mockSession = {
        user: {},
        expires: "2024-12-31T23:59:59Z",
      };

      mockAuth.mockResolvedValue(mockSession);

      const result = await getSession();

      expect(result).toEqual(mockSession);
      expect(result?.user).toEqual({});
    });

    it("should handle expired session", async () => {
      const mockSession = {
        user: {
          id: "3",
          email: "expired@example.com",
          name: "Expired User",
        },
        expires: "2020-01-01T00:00:00Z", // Expired date
      };

      mockAuth.mockResolvedValue(mockSession);

      const result = await getSession();

      expect(result).toEqual(mockSession);
      expect(result?.expires).toBe("2020-01-01T00:00:00Z");
    });

    it("should handle session with additional properties", async () => {
      const mockSession = {
        user: {
          id: "4",
          email: "extended@example.com",
          name: "Extended User",
          image: "https://example.com/avatar.jpg",
          role: "admin",
        },
        expires: "2024-12-31T23:59:59Z",
        accessToken: "access-token-123",
        refreshToken: "refresh-token-456",
        customProperty: "custom-value",
      };

      mockAuth.mockResolvedValue(mockSession);

      const result = await getSession();

      expect(result).toEqual(mockSession);
      expect((result as any)?.accessToken).toBe("access-token-123");
      expect((result as any)?.refreshToken).toBe("refresh-token-456");
      expect((result as any)?.customProperty).toBe("custom-value");
    });

    it("should propagate errors from auth function", async () => {
      const authError = new Error("Authentication failed");
      mockAuth.mockRejectedValue(authError);

      await expect(getSession()).rejects.toThrow("Authentication failed");
      expect(mockAuth).toHaveBeenCalledTimes(1);
    });

    it("should handle network errors", async () => {
      const networkError = new Error("Network request failed");
      mockAuth.mockRejectedValue(networkError);

      await expect(getSession()).rejects.toThrow("Network request failed");
      expect(mockAuth).toHaveBeenCalledTimes(1);
    });

    it("should handle timeout errors", async () => {
      const timeoutError = new Error("Request timeout");
      mockAuth.mockRejectedValue(timeoutError);

      await expect(getSession()).rejects.toThrow("Request timeout");
      expect(mockAuth).toHaveBeenCalledTimes(1);
    });

    it("should handle auth function throwing synchronously", async () => {
      mockAuth.mockImplementation(() => {
        throw new Error("Synchronous auth error");
      });

      await expect(getSession()).rejects.toThrow("Synchronous auth error");
      expect(mockAuth).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple consecutive calls", async () => {
      const mockSession1 = {
        user: { id: "1", email: "user1@example.com" },
        expires: "2024-12-31T23:59:59Z",
      };
      const mockSession2 = {
        user: { id: "2", email: "user2@example.com" },
        expires: "2024-12-31T23:59:59Z",
      };

      mockAuth
        .mockResolvedValueOnce(mockSession1)
        .mockResolvedValueOnce(mockSession2)
        .mockResolvedValueOnce(null);

      const result1 = await getSession();
      const result2 = await getSession();
      const result3 = await getSession();

      expect(mockAuth).toHaveBeenCalledTimes(3);
      expect(result1).toEqual(mockSession1);
      expect(result2).toEqual(mockSession2);
      expect(result3).toBeNull();
    });

    it("should handle concurrent calls", async () => {
      const mockSession = {
        user: { id: "concurrent", email: "concurrent@example.com" },
        expires: "2024-12-31T23:59:59Z",
      };

      mockAuth.mockResolvedValue(mockSession);

      // Make multiple concurrent calls
      const promises = [getSession(), getSession(), getSession()];
      const results = await Promise.all(promises);

      expect(mockAuth).toHaveBeenCalledTimes(3);
      results.forEach((result) => {
        expect(result).toEqual(mockSession);
      });
    });

    it("should handle auth returning different data types", async () => {
      // Test with different return types
      const testCases = [
        null,
        undefined,
        { user: null, expires: "2024-12-31T23:59:59Z" },
        { user: { id: "string-id" }, expires: "2024-12-31T23:59:59Z" },
        { user: { id: 123 }, expires: "2024-12-31T23:59:59Z" }, // numeric id
        { user: { id: "test", email: "" }, expires: "2024-12-31T23:59:59Z" }, // empty email
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        mockAuth.mockResolvedValue(testCase as any);

        const result = await getSession();

        expect(mockAuth).toHaveBeenCalledTimes(1);
        expect(result).toEqual(testCase);
      }
    });

    it("should maintain referential integrity", async () => {
      const userObject = { id: "ref-test", email: "ref@example.com" };
      const mockSession = {
        user: userObject,
        expires: "2024-12-31T23:59:59Z",
      };

      mockAuth.mockResolvedValue(mockSession);

      const result = await getSession();

      expect(result?.user).toBe(userObject); // Same reference
      expect(result).toBe(mockSession); // Same reference
    });

    it("should handle very long session data", async () => {
      const mockSession = {
        user: {
          id: "a".repeat(1000), // Very long ID
          email: "long@example.com",
          name: "b".repeat(500), // Very long name
          description: "c".repeat(2000), // Very long description
        },
        expires: "2024-12-31T23:59:59Z",
        metadata: "d".repeat(5000), // Very long metadata
      };

      mockAuth.mockResolvedValue(mockSession);

      const result = await getSession();

      expect(result).toEqual(mockSession);
      expect(result?.user?.id).toBe("a".repeat(1000));
      expect((result as any)?.metadata).toBe("d".repeat(5000));
    });
  });
});
