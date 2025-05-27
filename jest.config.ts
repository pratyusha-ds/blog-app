import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });
const customJestConfig: Config = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": [
      "babel-jest",
      { configFile: "./babel.config.js" },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  testEnvironment: "jest-environment-jsdom",

  transformIgnorePatterns: [
    "/node_modules/",
    "^.+\\.module\\.(css|sass|scss)$",
  ],

  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/pages/_app.tsx",
    "!src/pages/_document.tsx",
  ],

  coverageReporters: ["json", "lcov", "text", "clover"],
};

const jestConfig = async () => {
  const config = await createJestConfig(customJestConfig)();
  return {
    ...config,

    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node", "mjs"],
  };
};

export default jestConfig;
