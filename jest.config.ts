const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  preset: "ts-jest",
  coverageProvider: "v8",
  setupFilesAfterEnv: ["./jest.setup.ts"],
  testEnvironment: "jsdom",
  collectCoverage: true,
  coveragePathIgnorePatterns: ["/node_modules/"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  // Updated to include next-auth and related packages
  transformIgnorePatterns: ["/node_modules/(?!(lucide-react|@panva)/)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  modulePathIgnorePatterns: ["<rootDir>/.next/standalone"],
  globals: {
    fetch: global.fetch,
  },
  // Added to handle ES modules better
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  // Test file patterns
  testMatch: ["**/__tests__/**/*.(ts|tsx|js)", "**/*.(test|spec).(ts|tsx|js)"],
};

module.exports = createJestConfig(config);
