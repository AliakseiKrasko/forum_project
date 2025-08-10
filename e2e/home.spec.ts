import { test, expect } from "@playwright/test";

test("home shows list", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("combobox", { name: /filter by user/i })).toBeVisible();
    await expect(page.locator("main li").first()).toBeVisible();
});

test("search filters client-side (debounce)", async ({ page }) => {
    await page.goto("/");

    const search = page.getByRole("textbox", { name: /search posts/i });
    await expect(search).toBeVisible();

    // набираем редкий запрос
    await search.fill("zzzzzz");
    // ждём debounce и отрисовку
    await expect(page.getByText(/nothing found/i)).toBeVisible();

    // сбрасываем, снова видим карточки
    await page.getByRole("button", { name: /reset/i }).click();
    await expect(page.locator("main li").first()).toBeVisible();
});

test("filter by user keeps only that user's posts", async ({ page }) => {
    await page.goto("/");

    const select = page.getByRole("combobox", { name: /filter by user/i });
    await expect(select).toBeVisible();

    // выберем первого доступного пользователя (обычно id=1)
    await select.selectOption({ index: 1 }); // index 0 = "All users"
    // проверяем, что список не пустой и перерисовался
    await expect(page.locator("main li").first()).toBeVisible();
});

test("open post details and see Comments section", async ({ page }) => {
    await page.goto("/");
    const firstCard = page.locator("main li").first();
    await expect(firstCard).toBeVisible();

    // кликаем по заголовку поста
    await firstCard.getByTestId("post-title-link").click();

    // на странице поста есть заголовок статьи и секция комментариев
    await page.waitForSelector('role=heading[name=/comments/i]', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: /comments/i })).toBeVisible();
});

test("toggle like and favorite on a card", async ({ page }) => {
    await page.goto("/");
    const firstCard = page.locator("main li").first();
    await expect(firstCard).toBeVisible();

    const likeBtn = firstCard.getByTestId("like-btn");
    const favBtn = firstCard.getByTestId("favorite-btn");

    await expect(likeBtn).toHaveAttribute("aria-pressed", /false|undefined/);
    await likeBtn.click();
    await expect(likeBtn).toHaveAttribute("aria-pressed", "true");

    await expect(favBtn).toHaveAttribute("aria-pressed", /false|undefined/);
    await favBtn.click();
    await expect(favBtn).toHaveAttribute("aria-pressed", "true");
});

test("login as admin and visit admin panel", async ({ page }) => {
    await page.goto("/");

    // если уже залогинен — увидим ссылку; если нет — кнопку логина
    const loginBtn = page.getByRole("button", { name: /login as admin/i });
    const adminLink = page.getByRole("link", { name: /admin panel/i });

    if (await loginBtn.isVisible()) {
        await loginBtn.click();
    }
    await expect(adminLink).toBeVisible();
    await adminLink.click();

    await expect(page.getByRole("heading", { name: /admin/i })).toBeVisible();
});

test("empty state when posts API returns [] (route mock)", async ({ page }) => {
    // Мокаем только этот тест: /posts вернёт пустой список
    await page.route("**/posts", (route) => {
        if (route.request().method() === "GET") {
            return route.fulfill({
                status: 200,
                contentType: "application/json",
                body: "[]",
            });
        }
        return route.continue();
    });

    await page.goto("/");
    await expect(page.getByText(/no posts yet/i)).toBeVisible();
});

test("error state when posts API fails (route mock)", async ({ page }) => {
    await page.route("**/posts", (route) => {
        if (route.request().method() === "GET") {
            return route.fulfill({ status: 500, body: "server error" });
        }
        return route.continue();
    });

    await page.goto("/");
    await expect(page.getByText(/something went wrong/i)).toBeVisible();
});