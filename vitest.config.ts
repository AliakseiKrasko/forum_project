import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
    test: {
        environment: "jsdom",
        setupFiles: ["./test/setup.ts"],
        globals: true,
        css: true,
        include: ["src/**/*.{test,spec}.{ts,tsx}"], // только unit/component
        exclude: ["e2e/**", "node_modules/**", ".next/**"], // исключаем e2e
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});