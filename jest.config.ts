// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

import type { JestConfigWithTsJest } from "ts-jest";

const jestConfig: JestConfigWithTsJest = {
	
	// Automatically clear mock calls and instances between every test
	clearMocks: true,
	
	// Indicates whether the coverage information should be collected while executing the test
	collectCoverage: true,
	
	// The directory where Jest should output its coverage files
	coverageDirectory: "ts/tests/coverage",
	
	// A list of paths to directories that Jest should use to search for files in
	roots: [
		
		"<rootDir>/ts/tests",
		
	],
	
	// The test environment that will be used for testing
	testEnvironment: "node",
	
	extensionsToTreatAsEsm: [".ts"],
	
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	
	transform: {
		
		"^.+\\.m?[tj]sx?$": ["ts-jest", {
			useESM: true,
		}],
		
	},
	
};

export default jestConfig;
