import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
 testDir: './tests/e2e',
 timeout:30_000,
 expect: { timeout:5000 },
 fullyParallel: true,
 retries:0,
 workers:1,
 reporter: 'list',
 use: {
 baseURL: process.env.VITE_API_BASE || 'http://localhost:5173',
 headless: true,
 ignoreHTTPSErrors: true,
 video: 'retain-on-failure',
 },
 webServer: {
 // run the root dev:all script from the repository root
 command: 'npm --prefix .. run dev:all',
 url: 'http://localhost:5173',
 reuseExistingServer: false,
 timeout:120000,
 },
 projects: [
 { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
 ],
});
