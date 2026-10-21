import { defineConfig, devices } from "@playwright/test";

const PORT = 5599;

export default defineConfig({
    testDir: "./specs",
    fullyParallel: true,
    reporter: [["list"]],
    use: {
        baseURL: "http://localhost:" + PORT,
        // Koristi instalirani Google Chrome. Bez njega: npx playwright install chromium i obriši "channel".
        channel: "chrome",
        locale: "sr-RS",
        trace: "retain-on-failure"
    },
    projects: [
        { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome" }, grepInvert: /@telefon/ },
        { name: "telefon", use: { ...devices["Pixel 7"], channel: "chrome" }, grep: /@telefon/ }
    ],
    webServer: {
        command: "node server.mjs",
        url: "http://localhost:" + PORT + "/index.html",
        reuseExistingServer: true,
        env: { PORT: String(PORT) }
    }
});
