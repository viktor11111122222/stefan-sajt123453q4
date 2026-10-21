// Korpa: prikaz stavki, matematika (međuzbir, dostava, ukupno), količine i uklanjanje.
import { test, expect, PROIZVODI, CENA_DOSTAVE, rsd, uBroj, postaviKorpu, citajKorpu } from "../helpers/sajt.js";

const STAVKE = [
    { id: "nike-tech-fleece-joggers-komplet", boja: "Teget", velicina: "M", kolicina: 2 },
    { id: "tech-fleece-crno-syna-donji-deo", boja: "Crno-Syna", velicina: "S", kolicina: 1 },
    { id: "tech-fleece-2023-sivi-gornji-deo", boja: "Siva", velicina: "XL", kolicina: 3 }
];
const zbir = (stavke) => stavke.reduce((z, s) => z + PROIZVODI[s.id].cena * s.kolicina, 0);
const redovi = (page) => page.locator("#korpa-lista .cart-item");

test.describe("korpa", () => {
    test("prazna korpa prikazuje poruku i link ka katalogu", async ({ page, greske }) => {
        await page.goto("/html/korpa.html");
        await expect(page.locator("#korpa-prazna")).toBeVisible();
        await expect(page.locator("#korpa-sadrzaj")).toBeHidden();
        await page.getByRole("link", { name: /Idi na katalog/ }).click();
        await expect(page).toHaveURL(/katalog\.html/);
    });

    test("stavke, cene po komadu i ukupne cene su tačne", async ({ page, greske }) => {
        await postaviKorpu(page, STAVKE);
        await page.goto("/html/korpa.html");
        await expect(redovi(page)).toHaveCount(3);
        for (const [i, s] of STAVKE.entries()) {
            const p = PROIZVODI[s.id];
            const red = redovi(page).nth(i);
            await expect(red.locator(".cart-item-name")).toHaveText(p.naziv);
            await expect(red.locator(".cart-item-meta")).toHaveText(s.boja + " · Veličina " + s.velicina);
            await expect(red.locator(".cart-item-unit")).toHaveText(rsd(p.cena) + (s.kolicina > 1 ? " / kom" : ""));
            await expect(red.locator("output")).toHaveText(String(s.kolicina));
            await expect(red.locator(".cart-item-total")).toHaveText(rsd(p.cena * s.kolicina));
            await expect(red.locator(".cart-item-name")).toHaveAttribute("href", "./proizvod.html?id=" + s.id + "&boja=" + s.boja.toLowerCase());
        }
        const medjuzbir = zbir(STAVKE);
        await expect(page.locator("#korpa-komada")).toHaveText("Artikli (6)");
        await expect(page.locator("#korpa-medjuzbir")).toHaveText(rsd(medjuzbir));
        await expect(page.locator("#korpa-dostava")).toHaveText(rsd(CENA_DOSTAVE));
        await expect(page.locator("#korpa-ukupno")).toHaveText(rsd(medjuzbir + CENA_DOSTAVE));
        // Ručna provera matematike: 2×13.490 + 4.990 + 3×7.490 + 550
        expect(medjuzbir + CENA_DOSTAVE).toBe(2 * 13490 + 4990 + 3 * 7490 + 550);
        await expect(page.locator("[data-cart-count]")).toHaveText("6");
    });

    test("plus i minus menjaju količinu i preračunavaju ukupno", async ({ page }) => {
        await postaviKorpu(page, [STAVKE[1]]);
        await page.goto("/html/korpa.html");
        const red = redovi(page).first();
        const cena = PROIZVODI[STAVKE[1].id].cena;
        await expect(red.locator('[data-akcija="minus"]')).toBeDisabled();
        await red.locator('[data-akcija="plus"]').click();
        await red.locator('[data-akcija="plus"]').click();
        await expect(red.locator("output")).toHaveText("3");
        await expect(red.locator(".cart-item-total")).toHaveText(rsd(3 * cena));
        await expect(page.locator("#korpa-ukupno")).toHaveText(rsd(3 * cena + CENA_DOSTAVE));
        await expect(page.locator("[data-cart-count]")).toHaveText("3");
        await red.locator('[data-akcija="minus"]').click();
        await expect(red.locator("output")).toHaveText("2");
        await expect(page.locator("#korpa-ukupno")).toHaveText(rsd(2 * cena + CENA_DOSTAVE));
        // Fokus ostaje na dugmetu posle ponovnog crtanja (tastatura)
        await expect(redovi(page).first().locator('[data-akcija="minus"]')).toBeFocused();
        expect(await citajKorpu(page)).toEqual([{ ...STAVKE[1], kolicina: 2 }]);
    });

    test("plus je onemogućen na 10 komada", async ({ page }) => {
        await postaviKorpu(page, [{ ...STAVKE[0], kolicina: 9 }]);
        await page.goto("/html/korpa.html");
        const plus = redovi(page).first().locator('[data-akcija="plus"]');
        await plus.click();
        await expect(redovi(page).first().locator("output")).toHaveText("10");
        await expect(redovi(page).first().locator('[data-akcija="plus"]')).toBeDisabled();
        await expect(page.locator("[data-cart-count]")).toHaveText("9+");
    });

    test("uklanjanje stavke preračunava ukupno; poslednja stavka prikazuje praznu korpu", async ({ page }) => {
        await postaviKorpu(page, STAVKE.slice(0, 2));
        await page.goto("/html/korpa.html");
        await redovi(page).first().locator('[data-akcija="ukloni"]').click();
        await expect(redovi(page)).toHaveCount(1);
        await expect(redovi(page).first().locator(".cart-item-name")).toHaveText(PROIZVODI[STAVKE[1].id].naziv);
        await expect(page.locator("#korpa-ukupno")).toHaveText(rsd(PROIZVODI[STAVKE[1].id].cena + CENA_DOSTAVE));
        await redovi(page).first().locator('[data-akcija="ukloni"]').click();
        await expect(page.locator("#korpa-prazna")).toBeVisible();
        await expect(page.locator("[data-cart-count]")).toHaveText("0");
        expect(await citajKorpu(page)).toEqual([]);
    });

    test("dupli klik na „Ukloni“ ne briše i sledeću stavku", async ({ page }) => {
        await postaviKorpu(page, STAVKE);
        await page.goto("/html/korpa.html");
        await redovi(page).first().locator('[data-akcija="ukloni"]').dblclick();
        await expect(redovi(page)).toHaveCount(2);
        expect((await citajKorpu(page)).map((s) => s.id)).toEqual([STAVKE[1].id, STAVKE[2].id]);
    });

    test("brzo uklanjanje dve različite stavke briše baš te dve", async ({ page }) => {
        await postaviKorpu(page, STAVKE);
        await page.goto("/html/korpa.html");
        // Klik na prvu, pa odmah (pre kraja animacije) na treću
        await redovi(page).nth(0).locator('[data-akcija="ukloni"]').click();
        await redovi(page).nth(2).locator('[data-akcija="ukloni"]').click();
        await expect(redovi(page)).toHaveCount(1);
        expect((await citajKorpu(page)).map((s) => s.id)).toEqual([STAVKE[1].id]);
    });

    test("izmena u drugom tabu se odmah vidi", async ({ page, context }) => {
        await postaviKorpu(page, [STAVKE[0]]);
        await page.goto("/html/korpa.html");
        const drugi = await context.newPage();
        await drugi.goto("/html/katalog.html");
        await drugi.evaluate(() => PW.korpa.dodaj("tech-fleece-2023-komplet", "Crna", "L", 1));
        await expect(redovi(page)).toHaveCount(2);
        const ukupno = uBroj(await page.locator("#korpa-ukupno").textContent());
        expect(ukupno).toBe(2 * 13490 + 12990 + CENA_DOSTAVE);
    });

    test("„Nastavi na poručivanje“ vodi na checkout", async ({ page }) => {
        await postaviKorpu(page, [STAVKE[0]]);
        await page.goto("/html/korpa.html");
        await page.getByRole("link", { name: /Nastavi na poručivanje/ }).click();
        await expect(page).toHaveURL(/checkout\.html/);
    });
});
