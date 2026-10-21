// Checkout: pregled i matematika, validacija svakog polja, slanje porudžbine (Netlify Forms),
// uspeh, greška pri slanju i zaštita od duplog slanja.
import { test, expect, PROIZVODI, CENA_DOSTAVE, rsd, procitaj, postaviKorpu, citajKorpu } from "../helpers/sajt.js";

const STAVKE = [
    { id: "tech-fleece-2023-crno-sivi-komplet", boja: "Crno-Siva", velicina: "L", kolicina: 2 },
    { id: "nike-tech-fleece-joggers--gornji-deo", boja: "Teget", velicina: "M", kolicina: 1 }
];
const MEDJUZBIR = STAVKE.reduce((z, s) => z + PROIZVODI[s.id].cena * s.kolicina, 0);
const UKUPNO = MEDJUZBIR + CENA_DOSTAVE;

const ISPRAVNO = {
    ime: "Đorđe",
    prezime: "Petrović",
    telefon: "064 123 4567",
    email: "djordje@primer.rs",
    adresa: "Bulevar Nemanjića 12/4",
    grad: "Niš",
    postanski_broj: "18000",
    napomena: "Zvati pre dostave"
};

async function popuni(page, podaci) {
    for (const [ime, vrednost] of Object.entries(podaci)) await page.locator("#" + ime).fill(vrednost);
}

// Presreće POST na "/" (Netlify Forms) i vraća poslata polja
function presretni(page, status = 200, kasnjenje = 0) {
    const zahtevi = [];
    return page.route((u) => u.pathname === "/", async (route) => {
        if (route.request().method() !== "POST") return route.continue();
        zahtevi.push(Object.fromEntries(new URLSearchParams(route.request().postData())));
        if (kasnjenje) await new Promise((r) => setTimeout(r, kasnjenje));
        await route.fulfill({ status, body: "ok" });
    }).then(() => zahtevi);
}

test.describe("checkout", () => {
    test("prazna korpa – nema forme", async ({ page, greske }) => {
        await page.goto("/html/checkout.html");
        await expect(page.locator("#checkout-prazno")).toBeVisible();
        await expect(page.locator("#checkout-sadrzaj")).toBeHidden();
    });

    test("pregled porudžbine i iznosi su tačni", async ({ page, greske }) => {
        await postaviKorpu(page, STAVKE);
        await page.goto("/html/checkout.html");
        const stavke = page.locator("#checkout-stavke li");
        await expect(stavke).toHaveCount(2);
        for (const [i, s] of STAVKE.entries()) {
            const p = PROIZVODI[s.id];
            await expect(stavke.nth(i)).toContainText(p.naziv);
            await expect(stavke.nth(i)).toContainText(s.boja + " · " + s.velicina);
            await expect(stavke.nth(i).locator(".mini-item-qty")).toHaveText(String(s.kolicina));
            await expect(stavke.nth(i).locator(".price")).toHaveText(rsd(p.cena * s.kolicina));
        }
        await expect(page.locator("#checkout-medjuzbir")).toHaveText(rsd(MEDJUZBIR));
        await expect(page.locator("#checkout-dostava")).toHaveText(rsd(CENA_DOSTAVE));
        await expect(page.locator("#checkout-ukupno")).toHaveText(rsd(UKUPNO));
        await expect(page.locator("#potvrdi-iznos")).toHaveText(rsd(UKUPNO));
        expect(UKUPNO).toBe(2 * 11490 + 7490 + 550);
    });

    test("prazna forma prikazuje greške za sva obavezna polja i fokusira prvo", async ({ page }) => {
        await postaviKorpu(page, STAVKE);
        const zahtevi = await presretni(page);
        await page.goto("/html/checkout.html");
        await page.locator("#potvrdi").click();
        for (const ime of ["ime", "prezime", "telefon", "email", "adresa", "grad", "postanski_broj"]) {
            await expect(page.locator("#greska-" + ime), ime).not.toBeEmpty();
            await expect(page.locator("#" + ime)).toHaveAttribute("aria-invalid", "true");
        }
        await expect(page.locator("#ime")).toBeFocused();
        expect(zahtevi).toEqual([]);
    });

    test("greška se ne prikazuje dok se kuca, a nestaje čim se polje ispravi", async ({ page }) => {
        await postaviKorpu(page, STAVKE);
        await page.goto("/html/checkout.html");
        await page.locator("#email").fill("pogresno");
        await expect(page.locator("#greska-email")).toBeEmpty();
        await page.locator("#email").blur();
        await expect(page.locator("#greska-email")).toHaveText("Unesite ispravnu email adresu.");
        await page.locator("#email").fill("dobro@primer.rs");
        await expect(page.locator("#greska-email")).toBeEmpty();
        await expect(page.locator("#email")).toHaveAttribute("aria-invalid", "false");
    });

    const SLUCAJEVI = {
        telefon: {
            ispravni: ["064 123 4567", "0641234567", "+381 64 123 4567", "+381641234567", "00381 64 1234567",
                "011 123 4567", "064/123-45-67", "(064) 123 4567", "060 123 456", "+381 (0)64 123 4567"],
            neispravni: ["123", "abc", "064 12", "6412345678", "0641234567890", "+1 555 123 4567", "064 123 456a"]
        },
        email: {
            ispravni: ["ime@primer.rs", "ime.prezime+tag@primer.co.rs", "A@B.COM"],
            neispravni: ["ime@", "ime@primer", "ime primer@x.rs", "@primer.rs", "ime@primer.r"]
        },
        postanski_broj: {
            ispravni: ["18000", "11000", "21000"],
            neispravni: ["1800", "abcde", "18-00"]
        },
        adresa: {
            ispravni: ["Bulevar Nemanjića 12/4", "Kneza Miloša 7", "Kneza Miloša bb", "Selo Donje Polje BB"],
            neispravni: ["Niš", "Ulica bez broja", "bb"]
        },
        ime: { ispravni: ["Đo", "Ana"], neispravni: ["A", "  "] },
        grad: { ispravni: ["Niš", "Novi Sad"], neispravni: ["N"] }
    };
    for (const [polje, { ispravni, neispravni }] of Object.entries(SLUCAJEVI)) {
        test("validacija polja „" + polje + "“", async ({ page }) => {
            await postaviKorpu(page, STAVKE);
            await page.goto("/html/checkout.html");
            const ulaz = page.locator("#" + polje);
            for (const v of ispravni) {
                await ulaz.fill(v);
                await page.locator("#potvrdi").click();
                await expect(ulaz, "„" + v + "“ treba da prođe").toHaveAttribute("aria-invalid", "false");
            }
            for (const v of neispravni) {
                await ulaz.fill(v);
                await page.locator("#potvrdi").click();
                await expect(ulaz, "„" + v + "“ ne sme da prođe").toHaveAttribute("aria-invalid", "true");
            }
        });
    }

    test("uspešna porudžbina šalje tačne podatke, prazni korpu i prikazuje potvrdu", async ({ page, greske }) => {
        await postaviKorpu(page, STAVKE);
        const zahtevi = await presretni(page);
        await page.goto("/html/checkout.html");
        await popuni(page, ISPRAVNO);
        await page.locator("#potvrdi").click();

        await expect(page.locator("#checkout-uspeh")).toBeVisible();
        await expect(page.locator("#checkout-sadrzaj")).toBeHidden();
        await expect(page.locator("#checkout-prazno")).toBeHidden();
        await expect(page.locator(".page-hero")).toBeHidden();
        await expect(page.locator("#uspeh-ime")).toHaveText("Đorđe");
        await expect(page.locator("#uspeh-telefon")).toHaveText("064 123 4567");
        await expect(page.locator("#checkout-uspeh h1")).toBeFocused();
        await expect(page.locator("[data-cart-count]")).toHaveText("0");
        expect(await citajKorpu(page)).toEqual([]);

        expect(zahtevi).toHaveLength(1);
        const z = zahtevi[0];
        expect(z["form-name"]).toBe("porudzbina");
        expect(z.broj_porudzbine).toMatch(/^PW-[0-9A-Z]{6}$/);
        await expect(page.locator("#uspeh-broj")).toHaveText(z.broj_porudzbine);
        expect(z.subject).toBe("Nova porudžbina " + z.broj_porudzbine + " – " + rsd(UKUPNO));
        for (const [k, v] of Object.entries(ISPRAVNO)) expect(z[k], k).toBe(v);
        expect(z.placanje).toBe("Pouzećem (gotovina pri preuzimanju)");
        expect(z.artikli.split("\n")).toEqual(STAVKE.map((s) => {
            const p = PROIZVODI[s.id];
            return s.kolicina + " × " + p.naziv + " | Boja: " + s.boja + " | Veličina: " + s.velicina + " | " + rsd(p.cena * s.kolicina);
        }));
        expect(z.medjuzbir).toBe(rsd(MEDJUZBIR));
        expect(z.dostava).toBe(rsd(CENA_DOSTAVE));
        expect(z.ukupno).toBe(rsd(UKUPNO));
        expect(z["bot-field"]).toBe("");
    });

    test("sva polja koja se šalju postoje u HTML formi (inače ih Netlify odbacuje)", async ({ page }) => {
        await postaviKorpu(page, STAVKE);
        const zahtevi = await presretni(page);
        await page.goto("/html/checkout.html");
        await popuni(page, ISPRAVNO);
        await page.locator("#potvrdi").click();
        await expect(page.locator("#checkout-uspeh")).toBeVisible();
        const html = procitaj("html/checkout.html").match(/<form id="checkout-forma"[\s\S]*?<\/form>/)[0];
        const imena = new Set([...html.matchAll(/\sname="([^"]+)"/g)].map((m) => m[1]));
        for (const k of Object.keys(zahtevi[0])) expect(imena, "polje „" + k + "“ nije u formi").toContain(k);
    });

    test("greška servera: poruka, korpa ostaje, dugme ponovo radi", async ({ page }) => {
        await postaviKorpu(page, STAVKE);
        await presretni(page, 500);
        await page.goto("/html/checkout.html");
        await popuni(page, ISPRAVNO);
        await page.locator("#potvrdi").click();
        await expect(page.locator("#greska-slanja")).toBeVisible();
        await expect(page.locator("#greska-slanja")).toBeFocused();
        await expect(page.locator("#potvrdi")).toBeEnabled();
        await expect(page.locator("#checkout-uspeh")).toBeHidden();
        expect(await citajKorpu(page)).toHaveLength(2);
        // Podaci iz forme nisu izgubljeni
        await expect(page.locator("#adresa")).toHaveValue(ISPRAVNO.adresa);
    });

    test("bez interneta: poruka o grešci", async ({ page }) => {
        await postaviKorpu(page, STAVKE);
        await page.route((u) => u.pathname === "/", (r) => (r.request().method() === "POST" ? r.abort() : r.continue()));
        await page.goto("/html/checkout.html");
        await popuni(page, ISPRAVNO);
        await page.locator("#potvrdi").click();
        await expect(page.locator("#greska-slanja")).toBeVisible();
    });

    test("dupli klik ili Enter tokom slanja šalje samo jednu porudžbinu", async ({ page }) => {
        await postaviKorpu(page, STAVKE);
        const zahtevi = await presretni(page, 200, 800);
        await page.goto("/html/checkout.html");
        await popuni(page, ISPRAVNO);
        await page.locator("#potvrdi").click();
        await expect(page.locator("#potvrdi")).toBeDisabled();
        await expect(page.locator("#potvrdi")).toHaveAttribute("aria-busy", "true");
        await page.locator("#potvrdi").click({ force: true });
        await page.locator("#napomena").press("Control+Enter");
        await page.locator("#grad").press("Enter");
        await expect(page.locator("#checkout-uspeh")).toBeVisible();
        expect(zahtevi).toHaveLength(1);
    });

    test("izmena korpe u drugom tabu osvežava pregled i iznos", async ({ page, context }) => {
        await postaviKorpu(page, STAVKE);
        await page.goto("/html/checkout.html");
        const drugi = await context.newPage();
        await drugi.goto("/html/korpa.html");
        await drugi.evaluate(() => PW.korpa.ukloni(1));
        await expect(page.locator("#checkout-stavke li")).toHaveCount(1);
        await expect(page.locator("#potvrdi-iznos")).toHaveText(rsd(2 * 11490 + CENA_DOSTAVE));
    });

    test("forma na telefonu: polja imaju odgovarajuću tastaturu i autofill @telefon", async ({ page }) => {
        await postaviKorpu(page, STAVKE);
        await page.goto("/html/checkout.html");
        await expect(page.locator("#telefon")).toHaveAttribute("type", "tel");
        await expect(page.locator("#email")).toHaveAttribute("type", "email");
        await expect(page.locator("#postanski_broj")).toHaveAttribute("inputmode", "numeric");
        await expect(page.locator("#adresa")).toHaveAttribute("autocomplete", "street-address");
        const sirina = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
        expect(sirina).toBe(true);
    });
});
