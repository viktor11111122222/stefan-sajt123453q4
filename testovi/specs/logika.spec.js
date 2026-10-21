// Jedinični testovi za js/main.js (PW.*) – izvršavaju se u pravom pregledaču.
import { test, expect, PROIZVODI, ID_JEVI, popust } from "../helpers/sajt.js";

test.beforeEach(async ({ page }) => {
    await page.goto("/html/korpa.html");
    await page.evaluate(() => localStorage.removeItem("prestigeKorpa"));
});

test.describe("formatiranje i pomoćne funkcije", () => {
    test("PW.rsd formatira dinare sa tačkom za hiljade", async ({ page }) => {
        const r = await page.evaluate(() => [0, 550, 4990, 13490, 22990, 134900, null, undefined].map(PW.rsd));
        expect(r).toEqual(["0 RSD", "550 RSD", "4.990 RSD", "13.490 RSD", "22.990 RSD", "134.900 RSD", "0 RSD", "0 RSD"]);
    });

    test("PW.esc sprečava ubacivanje HTML-a", async ({ page }) => {
        const r = await page.evaluate(() => PW.esc(`<img src=x onerror="alert(1)">&'`));
        expect(r).toBe("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;&amp;&#39;");
        expect(await page.evaluate(() => [PW.esc(null), PW.esc(undefined), PW.esc(0)])).toEqual(["", "", "0"]);
    });

    test("PW.slug uklanja kvačice i pravi URL-prijateljski tekst", async ({ page }) => {
        const r = await page.evaluate(() => ["Crno-Siva", "Teget", "Crno-Syna", "Đurđevak Šćž", "  Siva  ", "ČĆ--x"].map(PW.slug));
        expect(r).toEqual(["crno-siva", "teget", "crno-syna", "djurdjevak-scz", "siva", "cc-x"]);
    });

    test("PW.popust se računa ispravno za svaki proizvod", async ({ page }) => {
        const izPregledaca = await page.evaluate(() =>
            Object.fromEntries(Object.keys(PW_PROIZVODI).map((id) => [id, PW.popust(PW_PROIZVODI[id])]))
        );
        for (const id of ID_JEVI) expect(izPregledaca[id], id).toBe(popust(PROIZVODI[id]));
        // Bez stare cene ili kada je stara cena manja – nema popusta
        expect(await page.evaluate(() => [PW.popust({ cena: 100 }), PW.popust({ cena: 100, staraCena: 90 }), PW.popust({ cena: 50, staraCena: 100 })]))
            .toEqual([0, 0, 50]);
    });

    test("PW.bojaPoSlugu nalazi boju iz URL-a, a za nepoznatu vraća prvu", async ({ page }) => {
        const r = await page.evaluate(() => {
            const p = PW_PROIZVODI["nike-tech-fleece-joggers-komplet"];
            return [PW.bojaPoSlugu(p, "crno-siva").ime, PW.bojaPoSlugu(p, "nepostoji").ime, PW.bojaPoSlugu(p, null).ime];
        });
        expect(r).toEqual(["Crno-Siva", "Teget", "Teget"]);
    });

    test("PW.urlProizvoda pravi ispravan link", async ({ page }) => {
        expect(await page.evaluate(() => PW.urlProizvoda("tech-fleece-2023-komplet", "Crno-Siva")))
            .toBe("./proizvod.html?id=tech-fleece-2023-komplet&boja=crno-siva");
        expect(await page.evaluate(() => PW.urlProizvoda("tech-fleece-2023-komplet"))).toBe("./proizvod.html?id=tech-fleece-2023-komplet");
    });

    test("PW.slika koristi optimizovanu .webp verziju i kodira razmake", async ({ page }) => {
        const r = await page.evaluate(() => [
            PW.slika("proizvodi slike/techlfleeceeteget2025_8.jpg", 640),
            PW.slika("proizvodi slike/techlfleeceeteget2025_8.jpg")
        ]);
        expect(r).toEqual([
            "../img/opt/640/proizvodi%20slike/techlfleeceeteget2025_8.webp",
            "../img/proizvodi%20slike/techlfleeceeteget2025_8.jpg"
        ]);
    });
});

test.describe("slike", () => {
    test("ako optimizovana slika ne postoji, prikazuje se original", async ({ page }) => {
        await page.route(/img\/opt\/640\/.*techlfleececrni2025_6\.webp/, (r) => r.fulfill({ status: 404 }));
        await page.goto("/html/katalog.html?q=2025%20donji");
        const slika = page.locator('.card[data-id="nike-tech-fleece-joggers--donji-deo"] .card-media img');
        await page.locator('.card[data-id="nike-tech-fleece-joggers--donji-deo"] .swatch[data-boja="Crna"]').click();
        await expect(slika).toHaveAttribute("src", "../img/proizvodi%20slike/techlfleececrni2025_6.webp");
        await expect.poll(() => slika.evaluate((s) => s.complete && s.naturalWidth > 0)).toBe(true);
    });
});

test.describe("korpa (localStorage)", () => {
    test("dodavanje iste stavke povećava količinu umesto novog reda", async ({ page }) => {
        const r = await page.evaluate(() => {
            PW.korpa.dodaj("tech-fleece-2023-komplet", "Crna", "M", 1);
            PW.korpa.dodaj("tech-fleece-2023-komplet", "Crna", "M", 1);
            PW.korpa.dodaj("tech-fleece-2023-komplet", "Crna", "L", 1);
            return { stavke: PW.korpa.stavke(), broj: PW.korpa.broj() };
        });
        expect(r.stavke).toEqual([
            { id: "tech-fleece-2023-komplet", boja: "Crna", velicina: "M", kolicina: 2 },
            { id: "tech-fleece-2023-komplet", boja: "Crna", velicina: "L", kolicina: 1 }
        ]);
        expect(r.broj).toBe(3);
    });

    test("količina je ograničena na 1–10", async ({ page }) => {
        const r = await page.evaluate(() => {
            for (let i = 0; i < 15; i++) PW.korpa.dodaj("tech-fleece-2023-komplet", "Crna", "M", 1);
            const posleDodavanja = PW.korpa.stavke()[0].kolicina;
            PW.korpa.postaviKolicinu(0, 0);
            const minimum = PW.korpa.stavke()[0].kolicina;
            PW.korpa.postaviKolicinu(0, 99);
            const maksimum = PW.korpa.stavke()[0].kolicina;
            PW.korpa.postaviKolicinu(0, 4);
            return [posleDodavanja, minimum, maksimum, PW.korpa.stavke()[0].kolicina];
        });
        expect(r).toEqual([10, 1, 10, 4]);
    });

    test("PW.korpa.kolicina vraća koliko komada iste stavke već ima u korpi", async ({ page }) => {
        const r = await page.evaluate(() => {
            PW.korpa.dodaj("tech-fleece-2023-komplet", "Crna", "M", 4);
            return [
                PW.korpa.kolicina("tech-fleece-2023-komplet", "Crna", "M"),
                PW.korpa.kolicina("tech-fleece-2023-komplet", "Crna", "L"),
                PW.korpa.MAKS
            ];
        });
        expect(r).toEqual([4, 0, 10]);
    });

    test("uklanjanje i pražnjenje", async ({ page }) => {
        const r = await page.evaluate(() => {
            PW.korpa.dodaj("tech-fleece-2023-komplet", "Crna", "M", 1);
            PW.korpa.dodaj("tech-fleece-crno-syna", "Crno-Syna", "S", 2);
            PW.korpa.dodaj("tech-fleece-2023-donji-deo", "Crna", "XL", 1);
            PW.korpa.ukloni(1);
            const posle = PW.korpa.stavke().map((s) => s.id);
            PW.korpa.ukloni(99); // nepostojeći indeks ne sme ništa da obriše
            const posleNepostojeceg = PW.korpa.stavke().length;
            PW.korpa.isprazni();
            return { posle, posleNepostojeceg, prazno: PW.korpa.stavke().length, broj: PW.korpa.broj() };
        });
        expect(r).toEqual({ posle: ["tech-fleece-2023-komplet", "tech-fleece-2023-donji-deo"], posleNepostojeceg: 2, prazno: 0, broj: 0 });
    });

    test("linije računaju cenu iz baze, a ne iz localStorage", async ({ page }) => {
        const linije = await page.evaluate(() => {
            localStorage.setItem("prestigeKorpa", JSON.stringify([
                { id: "tech-fleece-2023-komplet", boja: "Crna", velicina: "M", kolicina: 3, cena: 1 }
            ]));
            return PW.korpa.linije().map((l) => ({ cena: l.cena, ukupno: l.ukupno }));
        });
        expect(linije).toEqual([{ cena: 12990, ukupno: 38970 }]);
    });

    test("oštećen ili čudan sadržaj korpe ne ruši sajt", async ({ page }) => {
        const r = await page.evaluate(() => {
            const rezultati = [];
            for (const sirovo of ["{neispravan json", '{"a":1}', "null", "42", '[null, 5, {"x":1}]']) {
                localStorage.setItem("prestigeKorpa", sirovo);
                rezultati.push(PW.korpa.stavke().length);
            }
            return rezultati;
        });
        expect(r).toEqual([0, 0, 0, 0, 0]);
    });

    test("proizvod koji više ne postoji se izbacuje iz korpe", async ({ page }) => {
        const r = await page.evaluate(() => {
            localStorage.setItem("prestigeKorpa", JSON.stringify([
                { id: "stari-model", boja: "Crna", velicina: "M", kolicina: 1 },
                { id: "tech-fleece-2023-komplet", boja: "Crna", velicina: "M", kolicina: 1 }
            ]));
            return PW.korpa.stavke().map((s) => s.id);
        });
        expect(r).toEqual(["tech-fleece-2023-komplet"]);
    });

    test("stari format korpe (svaki klik poseban red) se spaja, a neispravne količine se ispravljaju", async ({ page }) => {
        const r = await page.evaluate(() => {
            localStorage.setItem("prestigeKorpa", JSON.stringify([
                { id: "tech-fleece-2023-komplet", boja: "Crna", velicina: "M" },
                { id: "tech-fleece-2023-komplet", boja: "Crna", velicina: "M" },
                { id: "tech-fleece-2023-komplet", boja: "Crna", velicina: "M", kolicina: "abc" },
                { id: "tech-fleece-2023-komplet", boja: "Crna", velicina: "S", kolicina: -5 },
                { id: "tech-fleece-2023-komplet", boja: "Crna", velicina: "L", kolicina: 500 }
            ]));
            return PW.korpa.stavke().map((s) => s.velicina + ":" + s.kolicina);
        });
        expect(r).toEqual(["M:3", "S:1", "L:10"]);
    });

    test("stavka sa nepostojećom veličinom ili bojom se ne može poručiti", async ({ page }) => {
        const r = await page.evaluate(() => {
            localStorage.setItem("prestigeKorpa", JSON.stringify([
                { id: "tech-fleece-2023-komplet", boja: "Crna", velicina: "", kolicina: 1 },
                { id: "tech-fleece-2023-komplet", boja: "Crna", velicina: "XXXL", kolicina: 1 },
                { id: "tech-fleece-2023-komplet", boja: "Ljubičasta", velicina: "M", kolicina: 1 },
                { id: "tech-fleece-2023-komplet", boja: "Crna", velicina: "M", kolicina: 1 }
            ]));
            return PW.korpa.stavke().map((s) => s.boja + ":" + s.velicina);
        });
        expect(r).toEqual(["Crna:M"]);
    });

    test("bedž u headeru prikazuje broj artikala (9+ iznad 9)", async ({ page }) => {
        const bedz = page.locator("[data-cart-count]");
        await expect(bedz).toHaveText("0");
        await expect(bedz).toHaveAttribute("data-empty", "");
        await page.evaluate(() => PW.korpa.dodaj("tech-fleece-2023-komplet", "Crna", "M", 3));
        await expect(bedz).toHaveText("3");
        await expect(bedz).not.toHaveAttribute("data-empty", "");
        await expect(page.locator(".cart-btn")).toHaveAttribute("aria-label", "Korpa, artikala: 3");
        await page.evaluate(() => PW.korpa.dodaj("tech-fleece-2023-donji-deo", "Crna", "M", 7));
        await expect(bedz).toHaveText("9+");
    });

    test("korpa se usklađuje između dva otvorena taba", async ({ page, context }) => {
        const drugi = await context.newPage();
        await drugi.goto("/html/katalog.html");
        await page.evaluate(() => PW.korpa.dodaj("tech-fleece-2023-komplet", "Crna", "M", 2));
        await expect(drugi.locator("[data-cart-count]")).toHaveText("2");
    });
});
