"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @type {import('ts-jest').JestConfigWithTsJest} */
exports.default = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    testTimeout: 10000,
    testEnvironmentOptions: {
        resources: 'usable', // This allows loading of cross-origin resources
        url: 'http://localhost:4000', // Set the base URL to match your backend's origin
    },
    transform: {
        '^.+\\.(t|j)sx?$': ['ts-jest', { useESM: true }],
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    moduleNameMapper: {
        // Mock CSS imports so Jest doesn’t choke on them
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    moduleDirectories: ['node_modules', 'src'],
    transformIgnorePatterns: [
        // Let Jest transform ESM dependencies like MSW
        'node_modules/(?!(msw|until-async)/)',
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/tests/e2e/', // ✅ Ignore Playwright tests
    ],
    // 👇 Prevent React’s internal scheduler “MESSAGEPORT” warning from polluting output
    reporters: [
        'default',
        [
            'jest-silent-reporter',
            {
                useDots: true,
                showWarnings: false,
            },
        ],
    ],
    // ✅ Explicitly silence Jest console noise in watch mode
    silent: false,
    forceExit: true,
    // ✅ Clear mocks automatically between tests (keeps state clean)
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
};
