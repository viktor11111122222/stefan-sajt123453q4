// Stranica proizvoda: podaci, popust, galerija, boje, veličine, korpa, preporuke i SEO.
import { test, expect, PROIZVODI, ID_JEVI, popust, rsd, citajKorpu, postaviKorpu } from "../helpers/sajt.js";

const url = (id, boja) => "/html/proizvod.html?id=" + id + (boja ? "&boja=" + boja : "");

test.describe("svaki proizvod", () => {
    for (const id of ID_JEVI) {
        test(id + " – podaci, cena i ušteda", async ({ page, greske }) => {
            const p = PROIZVODI[id];
            await page.goto(url(id));
            await expect(page.locator("#pdp-naziv")).toHaveText(p.naziv);
            await expect(page).toHaveTitle(p.naziv + " | Prestige Wear");
            await expect(page.locator("#pdp-cena")).toHaveText(rsd(p.cena));
            await expect(page.locator("#pdp-stara")).toHaveText(rsd(p.staraCena));
            await expect(page.locator("#pdp-popust")).toHaveText("−" + popust(p) + "%");
            await expect(page.locator("#pdp-usteda")).toHaveText("Ušteda " + rsd(p.staraCena - p.cena) + " · PDV uračunat");
            await expect(page.locator("#pdp-opis")).toHaveText(p.opis);
            await expect(page.locator("#mrvica-naziv")).toHaveText(p.naziv);
            await expect(page.locator("#boje .swatch")).toHaveCount(p.boje.length);
            await expect(page.locator("#velicine .size")).toHaveText(p.velicine);
            await expect(page.locator("#galerija .gallery-slide")).toHaveCount(p.boje[0].slike.length);
            // Preporuke: 4 druga proizvoda, nikad isti
            const preporuke = await page.locator("#preporuke-grid .card").evaluateAll((k) => k.map((x) => x.dataset.id));
            expect(preporuke).toHaveLength(4);
            expect(preporuke).not.toContain(id);
            expect(new Set(preporuke).size).toBe(4);
            await page.waitForLoadState("networkidle");
        });
    }
});

test.describe("stranica proizvoda", () => {
    const ID = "nike-tech-fleece-joggers-komplet";
    const P = PROIZVODI[ID];

    test("nepostojeći proizvod prikazuje poruku i noindex", async ({ page, greske }) => {
        await page.goto(url("ne-postoji"));
        await expect(page.getByRole("heading", { name: "Proizvod nije pronađen" })).toBeVisible();
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
        await expect(page.locator("#preporuke")).toHaveCount(0);
        await expect(page.locator(".buy-bar")).toHaveCount(0);
        await page.getByRole("link", { name: /Nazad na katalog/ }).click();
        await expect(page).toHaveURL(/katalog\.html/);
    });

    test("stranica bez ?id prikazuje poruku", async ({ page, greske }) => {
        await page.goto("/html/proizvod.html");
        await expect(page.getByRole("heading", { name: "Proizvod nije pronađen" })).toBeVisible();
    });

    test("boja iz adrese se bira odmah", async ({ page }) => {
        await page.goto(url(ID, "crno-siva"));
        await expect(page.locator("#izabrana-boja")).toHaveText("Crno-Siva");
        await expect(page.locator('#boje .swatch[data-boja="Crno-Siva"]')).toHaveAttribute("aria-checked", "true");
        await expect(page.locator("#galerija .gallery-slide")).toHaveCount(P.boje[1].slike.length);
    });

    test("promena boje menja galeriju i adresu", async ({ page }) => {
        await page.goto(url(ID));
        await page.locator('#boje .swatch[data-boja="Crna"]').click();
        await expect(page.locator("#izabrana-boja")).toHaveText("Crna");
        await expect(page).toHaveURL(/boja=crna/);
        const crna = P.boje.find((b) => b.ime === "Crna");
        await expect(page.locator("#galerija .gallery-slide")).toHaveCount(crna.slike.length);
        await expect(page.locator("#galerija-broj")).toHaveText("1 / " + crna.slike.length);
        // Strelice na tastaturi
        await page.locator('#boje .swatch[data-boja="Crna"]').press("ArrowRight");
        await expect(page.locator("#izabrana-boja")).toHaveText(P.boje[0].ime);
    });

    test("galerija: strelice, sličice i brojač", async ({ page }) => {
        await page.goto(url(ID));
        const n = P.boje[0].slike.length;
        const prev = page.locator(".gallery-nav--prev");
        const next = page.locator(".gallery-nav--next");
        await expect(page.locator("#galerija-broj")).toHaveText("1 / " + n);
        await expect(prev).toBeDisabled();
        await next.click();
        await expect(page.locator("#galerija-broj")).toHaveText("2 / " + n);
        await expect(page.locator(".thumb").nth(1)).toHaveAttribute("aria-current", "true");
        await page.locator(".thumb").nth(n - 1).click();
        await expect(page.locator("#galerija-broj")).toHaveText(n + " / " + n);
        await expect(next).toBeDisabled();
        // Slajd je stvarno skrolovan (ne samo brojač)
        await expect.poll(() => page.locator("#galerija").evaluate((t) => Math.round(t.scrollLeft / t.clientWidth))).toBe(n - 1);
        await page.locator("#galerija").press("ArrowLeft");
        await expect(page.locator("#galerija-broj")).toHaveText(n - 1 + " / " + n);
    });

    test("proizvod sa jednom slikom nema brojač", async ({ page }) => {
        await page.goto(url("tech-fleece-2023-donji-deo"));
        await expect(page.locator("#galerija-broj")).toBeHidden();
        await expect(page.locator(".gallery-nav--next")).toBeDisabled();
    });

    test("bez izabrane veličine ne može u korpu", async ({ page }) => {
        await page.goto(url(ID));
        await page.locator("#dodaj-u-korpu").click();
        await expect(page.locator("#greska-velicina")).toHaveText("Izaberite veličinu");
        await expect(page.locator("#velicine")).toHaveAttribute("data-invalid", "");
        await expect(page.locator("#velicine .size").first()).toBeFocused();
        expect(await citajKorpu(page)).toEqual([]);
        await page.locator("#poruci-odmah").click();
        await expect(page).toHaveURL(/proizvod\.html/);
        // Izbor veličine briše grešku
        await page.locator('#velicine .size[data-velicina="L"]').click();
        await expect(page.locator("#greska-velicina")).toHaveText("");
        await expect(page.locator("#izabrana-velicina")).toHaveText("L");
        await expect(page.locator('#velicine .size[data-velicina="L"]')).toHaveAttribute("aria-checked", "true");
    });

    test("dodavanje u korpu: toast, bedž i sadržaj korpe", async ({ page, greske }) => {
        await page.goto(url(ID, "siva"));
        await page.locator('#velicine .size[data-velicina="XL"]').click();
        await page.locator("#dodaj-u-korpu").click();
        const toast = page.locator(".toast");
        await expect(toast).toHaveAttribute("data-visible", "");
        await expect(toast).toContainText("Dodato u korpu");
        await expect(toast).toContainText(P.naziv + " · Siva · XL");
        await expect(page.locator("[data-cart-count]")).toHaveText("1");
        await page.locator("#dodaj-u-korpu").click();
        await expect(page.locator("[data-cart-count]")).toHaveText("2");
        expect(await citajKorpu(page)).toEqual([{ id: ID, boja: "Siva", velicina: "XL", kolicina: 2 }]);
        await toast.getByRole("link", { name: "Korpa" }).click();
        await expect(page).toHaveURL(/korpa\.html/);
    });

    test("na 10 komada ne piše „Dodato u korpu“", async ({ page }) => {
        await postaviKorpu(page, [{ id: ID, boja: "Teget", velicina: "M", kolicina: 10 }]);
        await page.goto(url(ID));
        await page.locator('#velicine .size[data-velicina="M"]').click();
        await page.locator("#dodaj-u-korpu").click();
        await expect(page.locator(".toast")).toContainText("Već imate 10 komada u korpi");
        expect((await citajKorpu(page))[0].kolicina).toBe(10);
    });

    test("„Poruči odmah“ dodaje u korpu i vodi na checkout", async ({ page }) => {
        await page.goto(url(ID));
        await page.locator('#velicine .size[data-velicina="S"]').click();
        await page.locator("#poruci-odmah").click();
        await expect(page).toHaveURL(/checkout\.html/);
        await expect(page.locator("#checkout-stavke li")).toHaveCount(1);
        await expect(page.locator("#checkout-stavke")).toContainText("Teget · S");
    });

    test("kada korpa ne može da se sačuva (blokiran localStorage) prikazuje se upozorenje", async ({ page }) => {
        await page.addInitScript(() => {
            Storage.prototype.setItem = function () { throw new Error("QuotaExceededError"); };
        });
        await page.goto(url(ID));
        await page.locator('#velicine .size[data-velicina="M"]').click();
        await page.locator("#dodaj-u-korpu").click();
        await expect(page.locator(".toast")).toContainText("Korpa nije sačuvana");
    });

    test("SEO: canonical, og i schema.org Product sa tačnom cenom", async ({ page }) => {
        await page.goto(url(ID, "crna"));
        const kanonski = "https://prestigewearr.netlify.app/html/proizvod.html?id=" + ID;
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", kanonski);
        await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", kanonski);
        await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", P.naziv + " | Prestige Wear");
        const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
        expect(schema["@type"]).toBe("Product");
        expect(schema.name).toBe(P.naziv);
        expect(schema.offers.price).toBe(String(P.cena));
        expect(schema.offers.priceCurrency).toBe("RSD");
        expect(schema.image).toBe("https://prestigewearr.netlify.app/img/" + encodeURI(P.boje[0].slike[0]));
    });

    test("preporuke prvo nude ostale delove iste linije", async ({ page }) => {
        await page.goto(url("tech-fleece-2023-sivi-komplet"));
        const preporuke = await page.locator("#preporuke-grid .card").evaluateAll((k) => k.map((x) => x.dataset.id));
        // Prvo gornji i donji deo istog modela (Sivi) – da kupac može da složi komplet
        expect(preporuke.slice(0, 2).sort()).toEqual(["tech-fleece-2023-sivi-donji-deo", "tech-fleece-2023-sivi-gornji-deo"]);
        // Zatim ostali iz iste 2023 kolekcije
        for (const id of preporuke) expect(PROIZVODI[id].naziv).toContain("2023");
    });

    test("preporuke za gornji deo počinju odgovarajućim donjim delom i kompletom", async ({ page }) => {
        await page.goto(url("tech-fleece-crno-syna-gornji-deo"));
        const preporuke = await page.locator("#preporuke-grid .card").evaluateAll((k) => k.map((x) => x.dataset.id));
        expect(preporuke.slice(0, 2).sort()).toEqual(["tech-fleece-crno-syna", "tech-fleece-crno-syna-donji-deo"]);
    });
});

test.describe("telefon", () => {
    test("traka za kupovinu se pojavljuje kada se skroluje ispod dugmeta @telefon", async ({ page }) => {
        const ID = "tech-fleece-2023-komplet";
        await page.goto(url(ID));
        const traka = page.locator(".buy-bar");
        await expect(traka).not.toHaveAttribute("data-visible", "");
        await expect(traka.locator("strong")).toHaveText(rsd(PROIZVODI[ID].cena));
        await page.locator("#pdp-opis").scrollIntoViewIfNeeded();
        await page.mouse.wheel(0, 600);
        await expect(traka).toHaveAttribute("data-visible", "");
        await traka.getByRole("button").click();
        // Bez veličine – vraća na izbor veličine
        await expect(page.locator("#greska-velicina")).toHaveText("Izaberite veličinu");
    });

    test("prevlačenje galerije menja brojač @telefon", async ({ page }) => {
        await page.goto(url("nike-tech-fleece-joggers-komplet"));
        await page.locator("#galerija").evaluate((t) => t.scrollTo({ left: t.clientWidth * 2 }));
        await expect(page.locator("#galerija-broj")).toHaveText("3 / " + PROIZVODI["nike-tech-fleece-joggers-komplet"].boje[0].slike.length);
    });
});
