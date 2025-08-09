import { test, expect } from "@playwright/test";

test("home shows list", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("combobox")).toBeVisible(); // сам select виден
    // убеждаемся, что лента отрисована
    await expect(page.locator("main li").first()).toBeVisible();
});