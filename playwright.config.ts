import { defineConfig } from "@playwright/test";
export default defineConfig({
    use: { baseURL: "http://localhost:3000" },
    webServer: { command: "pnpm dev", port: 3000, reuseExistingServer: !process.env.CI },
    testDir: "e2e",
});