jest.mock("next-auth", () => {
  // create a jest function that records the config passed and returns
  // a predictable object exported by `auth.ts` (handlers, signIn, signOut, auth)
  const fn: jest.Mock = jest.fn((config) => {
    // attach captured config to the mock so tests can inspect it
    (fn as unknown as { _config?: unknown })._config = config;
    return {
      handlers: "MOCK_HANDLERS",
      signIn: async () => "MOCK_SIGNIN",
      signOut: async () => "MOCK_SIGNOUT",
      auth: "MOCK_AUTH",
    };
  });
  return fn;
});

jest.mock("next-auth/providers/credentials", () => {
  return jest.fn((opts) => ({ __mockCredentials: true, opts }));
});

jest.mock("@/utils/auth/signInCallback", () => ({
  signInCallback: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/utils/auth/authorizeUsers", () => ({
  authorizeUsers: jest.fn().mockResolvedValue({ id: "1", email: "a@b" }),
}));

describe("auth module initialization", () => {
  // import after mocks set up
  const authModule = require("@/auth");
  const NextAuth = require("next-auth");
  const { signInCallback } = require("@/utils/auth/signInCallback");

  it("calls NextAuth and exports handlers, signIn, signOut and auth", () => {
    expect(NextAuth).toHaveBeenCalled();
    expect(authModule.handlers).toBe("MOCK_HANDLERS");
    expect(typeof authModule.signIn).toBe("function");
    expect(typeof authModule.signOut).toBe("function");
    expect(authModule.auth).toBe("MOCK_AUTH");
  });

  it("registers a credentials provider via Credentials()", () => {
    const config = NextAuth._config;
    expect(Array.isArray(config.providers)).toBe(true);
    expect(config.providers.length).toBeGreaterThan(0);
    // our mock Credentials returns an identifiable object
    expect(config.providers[0]).toEqual({
      __mockCredentials: true,
      opts: expect.any(Object),
    });
  });

  it("delegates signIn callback to signInCallback", async () => {
    const config = NextAuth._config;
    await config.callbacks.signIn({ user: { email: "a@b" }, account: null });
    expect(signInCallback).toHaveBeenCalledWith({
      user: { email: "a@b" },
      account: null,
    });
  });

  it("credentials provider authorize() delegates to authorizeUsers", async () => {
    const { authorizeUsers } = require("@/utils/auth/authorizeUsers");
    const config = NextAuth._config;
    // provider object is what our Credentials mock returned: { __mockCredentials: true, opts }
    const provider = config.providers[0];
    // ensure opts.authorize exists and calls authorizeUsers
    expect(typeof provider.opts.authorize).toBe("function");
    const creds = { email: "x@y", password: "p" };
    const out = await provider.opts.authorize(creds);
    expect(authorizeUsers).toHaveBeenCalledWith(creds);
    expect(out).toEqual({ id: "1", email: "a@b" });
  });

  it("session callback attaches token.sub to session.user.id when present", async () => {
    const config = NextAuth._config;
    const session = { user: { name: "Test", email: "t@t" } };
    const token = { sub: "user-123" };
    const out = await config.callbacks.session({ session, token });
    expect(out.user.id).toBe("user-123");
  });

  it("jwt callback returns the token unchanged", async () => {
    const config = NextAuth._config;
    const token = { foo: "bar" };
    const out = await config.callbacks.jwt({ token });
    expect(out).toBe(token);
  });
});
