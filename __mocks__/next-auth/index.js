// Manual Jest mock for next-auth to avoid ESM parsing issues in tests
// This mock provides a minimal NextAuth function that returns expected named
// exports used by the app: handlers, signIn, signOut, auth.
function NextAuth(/* config */) {
  return {
    handlers: {},
    signIn: async () => {},
    signOut: async () => {},
    auth: {},
  };
}

module.exports = NextAuth;
module.exports.default = NextAuth;
