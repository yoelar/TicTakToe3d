"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// frontend/playwright.config.ts
const test_1 = require("@playwright/test");
exports.default = (0, test_1.defineConfig)({
    testDir: './tests/e2e',
    timeout: 30000,
    expect: { timeout: 5000 },
    fullyParallel: true,
    retries: 0,
    workers: 1,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:5173', // ✅ Match your Vite dev server port
        headless: true,
        ignoreHTTPSErrors: true,
        video: 'retain-on-failure',
    },
    webServer: {
        command: 'npm run dev', // ✅ Starts Vite
        port: 5173, // ✅ Must match your baseURL
        reuseExistingServer: true, // ✅ Don’t restart if already running
        timeout: 120000,
    },
    projects: [
        {
            name: 'chromium',
            use: { ...test_1.devices['Desktop Chrome'] },
        },
    ],
});
