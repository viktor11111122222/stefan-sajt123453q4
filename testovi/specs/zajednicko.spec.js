// Početna strana i delovi zajednički za sve stranice: header, mobilni meni, kolačići, footer.
import { test, expect, PROIZVODI, ID_JEVI, rsd, procitaj } from "../helpers/sajt.js";

const RASPRODAJA = [...procitaj("js/pocetna.js").match(/RASPRODAJA = \[([\s\S]*?)\]/)[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);

test.describe("početna", () => {
    test("rasprodaja prikazuje izabrane proizvode tim redom", async ({ page, greske }) => {
        await page.goto("/index.html");
        const idjevi = await page.locator("#rasprodaja-grid .card").evaluateAll((k) => k.map((x) => x.dataset.id));
        expect(idjevi).toEqual(RASPRODAJA);
        // Linkovi sa početne vode u html/ folder
        await expect(page.locator("#rasprodaja-grid .card-title a").first()).toHaveAttribute("href", "./html/proizvod.html?id=" + RASPRODAJA[0]);
        await page.locator("#rasprodaja-grid .card-title a").first().click();
        await expect(page.locator("#pdp-naziv")).toHaveText(PROIZVODI[RASPRODAJA[0]].naziv);
    });

    test("broj modela po kategoriji je tačan i u pravom obliku reči", async ({ page }) => {
        await page.goto("/index.html");
        for (const k of ["komplet", "gornji", "donji"]) {
            const n = ID_JEVI.filter((id) => PROIZVODI[id].kategorija === k).length;
            const rec = n % 10 === 1 && n % 100 !== 11 ? " model" : " modela";
            await expect(page.locator('[data-cat-count="' + k + '"]')).toHaveText(n + rec);
        }
    });

    test("cena u hero sekciji dolazi iz baze", async ({ page }) => {
        await page.goto("/index.html");
        await expect(page.locator('.hero-chip [data-cena]')).toHaveText(rsd(PROIZVODI["nike-tech-fleece-joggers-komplet"].cena));
        await page.locator(".hero-chip").click();
        await expect(page).toHaveURL(/id=nike-tech-fleece-joggers-komplet&boja=teget/);
        await expect(page.locator("#izabrana-boja")).toHaveText("Teget");
    });

    test("pločice kategorija vode na filtriran katalog", async ({ page }) => {
        await page.goto("/index.html");
        await page.locator('.cat-tile[href*="kategorija=gornji"]').click();
        await expect(page.locator('[data-kategorija="gornji"]')).toHaveAttribute("aria-pressed", "true");
    });

    test("strelice recenzija skroluju i gase se na krajevima", async ({ page }) => {
        await page.goto("/index.html");
        const nazad = page.locator("#reviews-prev");
        const napred = page.locator("#reviews-next");
        await expect(nazad).toBeDisabled();
        await expect(napred).toBeEnabled();
        await napred.click();
        await expect(nazad).toBeEnabled();
        for (let i = 0; i < 10 && (await napred.isEnabled()); i++) await napred.click();
        await expect(napred).toBeDisabled();
    });
});

test.describe("header i navigacija", () => {
    test("godina u footeru je tekuća", async ({ page }) => {
        await page.goto("/html/onama.html");
        await expect(page.locator("[data-year]")).toHaveText(String(new Date().getFullYear()));
    });

    test("aktivna stavka menija odgovara stranici", async ({ page }) => {
        for (const [url, naziv] of [["/index.html", "Početna"], ["/html/katalog.html", "Katalog"], ["/html/kontakt.html", "Kontakt"], ["/html/onama.html", "O nama"], ["/html/kakonaruciti.html", "Kako naručiti"]]) {
            await page.goto(url);
            await expect(page.locator('.main-nav [aria-current="page"]'), url).toHaveText(naziv);
        }
    });

    test("mobilni meni: otvaranje, Escape, fokus i zaključan skrol @telefon", async ({ page }) => {
        await page.goto("/html/katalog.html");
        const dugme = page.locator("[data-menu-open]");
        const meni = page.locator("#meni");
        await dugme.click();
        await expect(meni).toHaveAttribute("data-open", "");
        await expect(dugme).toHaveAttribute("aria-expanded", "true");
        await expect(page.locator(".drawer-top [data-menu-close]")).toBeFocused();
        expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
        // Tab ne izlazi iz menija
        for (let i = 0; i < 12; i++) await page.keyboard.press("Tab");
        expect(await page.evaluate(() => !!document.activeElement.closest(".drawer-panel"))).toBe(true);
        await page.keyboard.press("Escape");
        await expect(meni).not.toHaveAttribute("data-open", "");
        await expect(dugme).toBeFocused();
        expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
        // Klik na pozadinu zatvara meni, klik na link vodi na stranicu
        await dugme.click();
        await page.locator(".drawer-nav a", { hasText: "Kontakt" }).click();
        await expect(page).toHaveURL(/kontakt\.html/);
    });

    test("korpa i meni su uz desnu ivicu headera @telefon", async ({ page }) => {
        for (const url of ["/index.html", "/html/katalog.html", "/html/korpa.html"]) {
            await page.goto(url);
            const kontejner = await page.locator(".header-inner").boundingBox();
            const meni = await page.locator("[data-menu-open]").boundingBox();
            expect(Math.abs(kontejner.x + kontejner.width - (meni.x + meni.width)), url).toBeLessThan(2);
        }
    });

    test("na računaru je navigacija vidljiva, a dugme za meni nije", async ({ page }) => {
        await page.goto("/index.html");
        await expect(page.locator(".main-nav")).toBeVisible();
        await expect(page.locator("[data-menu-open]")).toBeHidden();
        const kontejner = await page.locator(".header-inner").boundingBox();
        const korpa = await page.locator(".cart-btn").boundingBox();
        expect(Math.abs(kontejner.x + kontejner.width - (korpa.x + korpa.width))).toBeLessThan(2);
    });

    test("bedž korpe je isti na svim stranicama @telefon", async ({ page }) => {
        await page.goto("/html/katalog.html");
        await page.evaluate(() => PW.korpa.dodaj("tech-fleece-2023-komplet", "Crna", "M", 2));
        for (const url of ["/index.html", "/html/kontakt.html", "/html/onama.html", "/html/korpa.html"]) {
            await page.goto(url);
            await expect(page.locator("[data-cart-count]"), url).toHaveText("2");
        }
    });
});

test.describe("kolačići", () => {
    test.use({ kolacici: null });

    test("baner se pojavljuje pri prvoj poseti i pamti izbor", async ({ page }) => {
        await page.goto("/index.html");
        const baner = page.locator("#cookie-banner");
        await expect(baner).toHaveAttribute("data-visible", "");
        await baner.getByRole("button", { name: "Prihvati" }).click();
        await expect(baner).toBeHidden();
        expect(await page.evaluate(() => localStorage.getItem("statusKolacica"))).toBe("prihvaceno");
        await page.reload();
        await page.waitForTimeout(1200);
        await expect(baner).toBeHidden();
    });

    test("„Odbij“ takođe sklanja baner trajno", async ({ page }) => {
        await page.goto("/html/katalog.html");
        await page.locator("#cookie-banner").getByRole("button", { name: "Odbij" }).click();
        await page.goto("/html/kontakt.html");
        await page.waitForTimeout(1200);
        await expect(page.locator("#cookie-banner")).toBeHidden();
        expect(await page.evaluate(() => localStorage.getItem("statusKolacica"))).toBe("odbijeno");
    });

    test("baner ne prekriva dugme za kupovinu na telefonu @telefon", async ({ page }) => {
        await page.goto("/html/proizvod.html?id=tech-fleece-2023-komplet");
        await expect(page.locator("#cookie-banner")).toHaveAttribute("data-visible", "");
        await page.locator('#velicine .size[data-velicina="M"]').click();
        await page.locator("#dodaj-u-korpu").click();
        await expect(page.locator("[data-cart-count]")).toHaveText("1");
    });
});
