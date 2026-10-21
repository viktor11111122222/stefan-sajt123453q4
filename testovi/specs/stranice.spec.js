// Svaka stranica se učitava bez JS grešaka i bez neispravnih slika/linkova,
// na računaru i na telefonu, bez horizontalnog skrola.
import { test, expect, STRANICE, postaviKorpu } from "../helpers/sajt.js";

for (const url of STRANICE) {
    test.describe(url, () => {
        test("učitava se bez grešaka @telefon", async ({ page, greske }) => {
            await postaviKorpu(page, [{ id: "tech-fleece-2023-komplet", boja: "Crna", velicina: "M", kolicina: 1 }]);
            await page.goto(url);
            await page.waitForLoadState("networkidle");
            await expect(page.locator("h1").first()).toBeVisible();
            // Sve slike koje su se učitale imaju stvarne dimenzije (nisu "polomljene")
            const polomljene = await page.$$eval("img", (slike) =>
                slike.filter((s) => s.complete && s.naturalWidth === 0 && s.loading !== "lazy").map((s) => s.src)
            );
            expect(polomljene).toEqual([]);
            expect(greske).toEqual([]);
        });

        test("nema horizontalnog skrola @telefon", async ({ page }) => {
            await page.goto(url);
            await page.waitForLoadState("networkidle");
            const sirina = await page.evaluate(() => ({
                dokument: document.documentElement.scrollWidth,
                prozor: window.innerWidth
            }));
            expect(sirina.dokument).toBeLessThanOrEqual(sirina.prozor);
        });

        test("ima naslov, opis i jedan h1", async ({ page }) => {
            await page.goto(url);
            await expect(page).toHaveTitle(/Prestige Wear/);
            const opis = await page.locator('meta[name="description"]').getAttribute("content");
            expect(opis && opis.length).toBeGreaterThan(30);
            await expect(page.locator("h1:visible")).toHaveCount(1);
        });
    });
}
