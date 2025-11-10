/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    preset: 'ts-jest',
    testEnvironment: 'jsdom', // ✅ use jsdom for React components
    transform: {
        '^.+\\.(t|j)sx?$': ['ts-jest', { useESM: true }], // ✅ enable ESM mode for ts-jest
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx'], // ✅ treat TS files as ESM
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    transformIgnorePatterns: [
        'node_modules/(?!(msw|until-async)/)', // ✅ allow Jest to transform MSW's ESM dependencies
    ],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
    ],
};
