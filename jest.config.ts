const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  preset: "ts-jest",
  coverageProvider: "v8",
  testTimeout: 10000,
  setupFilesAfterEnv: ["./jest.setup.ts"],
  testEnvironment: "jsdom",
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/generated/",
    "/index.ts$",
    "/index.tsx$",
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(lucide-react|@panva|next-auth|@auth)/)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  modulePathIgnorePatterns: [
    "<rootDir>/.next/standalone",
    "<rootDir>/generated/",
  ],
  globals: {
    fetch: global.fetch,
  },
  // Added to handle ES modules better
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  // Test file patterns
  testMatch: ["**/__tests__/**/*.(ts|tsx|js)", "**/*.(test|spec).(ts|tsx|js)"],
};

module.exports = createJestConfig(config);
