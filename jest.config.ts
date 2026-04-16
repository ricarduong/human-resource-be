import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.spec.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  clearMocks: true,
  transformIgnorePatterns: [
    "/node_modules/(?!(inversify|@inversifyjs)/)",
  ],
  moduleNameMapper: {
    "^inversify$": "<rootDir>/src/__mocks__/inversify.ts",
  },
};

export default config;
