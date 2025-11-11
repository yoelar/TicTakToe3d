// frontend/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 30_000,
    expect: { timeout: 5_000 },
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
        port: 5173,             // ✅ Must match your baseURL
        reuseExistingServer: true, // ✅ Don’t restart if already running
        timeout: 120000,
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
