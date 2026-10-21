// Katalog: filter po kategoriji, pretraga, sortiranje, adresa (URL) i prazno stanje.
import { test, expect, PROIZVODI, ID_JEVI, popust, uBroj } from "../helpers/sajt.js";

const kartice = (page) => page.locator("#katalog-grid .card");
const idjeviNaStrani = (page) => kartice(page).evaluateAll((k) => k.map((x) => x.dataset.id));
const poKategoriji = (k) => ID_JEVI.filter((id) => PROIZVODI[id].kategorija === k);

test.describe("katalog", () => {
    test("prikazuje sve proizvode sa ispravnim cenama i popustima", async ({ page, greske }) => {
        await page.goto("/html/katalog.html");
        await expect(kartice(page)).toHaveCount(ID_JEVI.length);
        await expect(page.locator("#broj-proizvoda")).toHaveText(ID_JEVI.length + " proizvoda");
        for (const id of ID_JEVI) {
            const p = PROIZVODI[id];
            const k = page.locator('.card[data-id="' + id + '"]');
            await expect(k.locator(".card-title")).toHaveText(p.naziv);
            expect(uBroj(await k.locator(".card-price strong").textContent())).toBe(p.cena);
            if (popust(p)) {
                await expect(k.locator(".tag--sale")).toHaveText("−" + popust(p) + "%");
                expect(uBroj(await k.locator(".card-price s").textContent())).toBe(p.staraCena);
            }
            // Kartica vodi na pravi proizvod
            await expect(k.locator(".card-title a")).toHaveAttribute("href", "./proizvod.html?id=" + id);
            // Kružići boja: samo kada proizvod ima više od jedne boje
            await expect(k.locator(".swatch")).toHaveCount(p.boje.length > 1 ? p.boje.length : 0);
        }
    });

    test("brojevi na čipovima kategorija su tačni", async ({ page }) => {
        await page.goto("/html/katalog.html");
        await expect(page.locator('[data-kategorija="sve"] .count')).toHaveText(String(ID_JEVI.length));
        for (const k of ["komplet", "gornji", "donji"]) {
            await expect(page.locator('[data-kategorija="' + k + '"] .count')).toHaveText(String(poKategoriji(k).length));
        }
    });

    for (const k of ["komplet", "gornji", "donji"]) {
        test("filter „" + k + "“ prikazuje samo tu kategoriju i pamti se u adresi", async ({ page }) => {
            await page.goto("/html/katalog.html");
            await page.locator('[data-kategorija="' + k + '"]').click();
            expect((await idjeviNaStrani(page)).sort()).toEqual(poKategoriji(k).sort());
            await expect(page.locator('[data-kategorija="' + k + '"]')).toHaveAttribute("aria-pressed", "true");
            await expect(page.locator('[data-kategorija="sve"]')).toHaveAttribute("aria-pressed", "false");
            await expect(page).toHaveURL(new RegExp("kategorija=" + k));
            // Ponovno otvaranje linka zadržava filter
            await page.reload();
            expect((await idjeviNaStrani(page)).sort()).toEqual(poKategoriji(k).sort());
        });
    }

    test("nepoznata kategorija u adresi prikazuje sve", async ({ page }) => {
        await page.goto("/html/katalog.html?kategorija=jakne&sort=xyz");
        await expect(kartice(page)).toHaveCount(ID_JEVI.length);
        await expect(page.locator("#sortiranje")).toHaveValue("preporuceno");
    });

    const PRETRAGE = [
        ["syna", (p) => p.naziv.includes("Syna")],
        ["SYNA", (p) => p.naziv.includes("Syna")],
        ["2025", (p) => p.naziv.includes("2025")],
        // bez kvačica i bez crtice
        ["crno sivi", (p) => /crno-sivi/i.test(p.naziv) || p.boje.some((b) => b.ime === "Crno-Siva")],
        ["teget", (p) => p.boje.some((b) => b.ime === "Teget")],
        ["donji deo", (p) => p.kategorija === "donji"],
        ["komplet", (p) => p.kategorija === "komplet"],
        // rod i broj ne smeju da menjaju rezultat: sivi = siva, kompleti = komplet
        ["sivi", (p) => /siv/i.test(p.naziv) || p.boje.some((b) => /Siva/.test(b.ime))],
        ["siva", (p) => /siv/i.test(p.naziv) || p.boje.some((b) => /Siva/.test(b.ime))],
        ["kompleti", (p) => p.kategorija === "komplet"],
        // redosled reči nije bitan
        ["komplet sivi 2023", (p) => p.kategorija === "komplet" && p.naziv.includes("2023") && /siv/i.test(p.naziv)],
        ["  Đ ", () => false],
        // reči koje kupci kucaju
        ["trenerka", (p) => p.kategorija === "komplet"],
        ["duks", (p) => p.kategorija === "gornji"],
        ["Crno-Syna gornji", (p) => p.kategorija === "gornji" && p.naziv.includes("Syna")]
    ];
    for (const [upit, ocekivano] of PRETRAGE) {
        test("pretraga „" + upit + "“", async ({ page }) => {
            await page.goto("/html/katalog.html");
            await page.locator("#pretraga").fill(upit);
            const ocekivani = ID_JEVI.filter((id) => ocekivano(PROIZVODI[id]));
            expect((await idjeviNaStrani(page)).sort()).toEqual(ocekivani.sort());
        });
    }

    test("pretraga i filter rade zajedno", async ({ page }) => {
        await page.goto("/html/katalog.html?kategorija=gornji&q=syna");
        expect(await idjeviNaStrani(page)).toEqual(["tech-fleece-crno-syna-gornji-deo"]);
        await expect(page.locator("#pretraga")).toHaveValue("syna");
        await expect(page.locator("#broj-proizvoda")).toHaveText("1 proizvod");
    });

    test("bez rezultata prikazuje poruku, a dugme vraća sve", async ({ page }) => {
        await page.goto("/html/katalog.html");
        await page.locator("#pretraga").fill("adidas");
        await expect(page.locator("#nema-rezultata")).toBeVisible();
        await expect(page.locator("#katalog-grid")).toBeHidden();
        await expect(page.locator("#broj-proizvoda")).toHaveText("0 proizvoda");
        await page.locator("[data-reset]").click();
        await expect(kartice(page)).toHaveCount(ID_JEVI.length);
        await expect(page.locator("#pretraga")).toHaveValue("");
        await expect(page.locator("#pretraga")).toBeFocused();
        await expect(page).toHaveURL(/katalog\.html$/);
    });

    test("sortiranje po ceni rastuće", async ({ page }) => {
        await page.goto("/html/katalog.html");
        await page.locator("#sortiranje").selectOption("rastuce");
        const cene = (await idjeviNaStrani(page)).map((id) => PROIZVODI[id].cena);
        expect(cene).toEqual([...cene].sort((a, b) => a - b));
        expect(cene.length).toBe(ID_JEVI.length);
        await expect(page).toHaveURL(/sort=rastuce/);
    });

    test("sortiranje po ceni opadajuće", async ({ page }) => {
        await page.goto("/html/katalog.html?sort=opadajuce");
        const cene = (await idjeviNaStrani(page)).map((id) => PROIZVODI[id].cena);
        expect(cene).toEqual([...cene].sort((a, b) => b - a));
    });

    test("sortiranje po najvećem popustu", async ({ page }) => {
        await page.goto("/html/katalog.html");
        await page.locator("#sortiranje").selectOption("popust");
        const popusti = (await idjeviNaStrani(page)).map((id) => popust(PROIZVODI[id]));
        expect(popusti).toEqual([...popusti].sort((a, b) => b - a));
    });

    test("klik na boju na kartici menja sliku i link", async ({ page, greske }) => {
        await page.goto("/html/katalog.html");
        const id = "nike-tech-fleece-joggers-komplet";
        const k = page.locator('.card[data-id="' + id + '"]');
        await k.locator('.swatch[data-boja="Crna"]').click();
        await expect(k.locator('.swatch[data-boja="Crna"]')).toHaveAttribute("aria-checked", "true");
        await expect(k.locator('.swatch[data-boja="Teget"]')).toHaveAttribute("aria-checked", "false");
        await expect(k.locator(".card-title a")).toHaveAttribute("href", "./proizvod.html?id=" + id + "&boja=crna");
        await expect(k.locator(".card-media img")).toHaveAttribute("src", /techlfleececrni2025_1\.webp/);
        await expect(k.locator(".card-media img")).toHaveAttribute("alt", PROIZVODI[id].naziv + " – Crna");
        // Strelice na tastaturi prelaze na sledeću boju
        await k.locator('.swatch[data-boja="Crna"]').press("ArrowRight");
        await expect(k.locator('.swatch[data-boja="Teget"]')).toHaveAttribute("aria-checked", "true");
    });

    test("oblik reči: 1 proizvod / 2–4 proizvoda / 5+ proizvoda", async ({ page }) => {
        await page.goto("/html/katalog.html?q=crno%20syna%20gornji");
        await expect(page.locator("#broj-proizvoda")).toHaveText("1 proizvod");
        await page.locator("#pretraga").fill("syna");
        await expect(page.locator("#broj-proizvoda")).toHaveText("3 proizvoda");
    });
});
