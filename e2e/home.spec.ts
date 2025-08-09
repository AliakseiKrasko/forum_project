import { test, expect } from "@playwright/test";

test("home shows list", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await expect(page.getByText("Все пользователи")).toBeVisible();
});