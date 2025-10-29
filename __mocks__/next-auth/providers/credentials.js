// Minimal mock for next-auth/providers/credentials used in server-side auth setup
function Credentials(options) {
  // Return a function or object that resembles the provider signature.
  // In our tests we only need it to be callable/instantiable.
  return function credentialsProvider() {
    return {
      id: "credentials",
      name: "Credentials",
      options,
    };
  };
}

module.exports = Credentials;
module.exports.default = Credentials;
