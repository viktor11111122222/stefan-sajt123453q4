// Zajedničke pomoćne funkcije za testove
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { test as osnova, expect } from "@playwright/test";

export const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function procitaj(relativno) {
    return fs.readFileSync(path.join(KOREN, relativno), "utf8");
}

// Baza proizvoda učitana isto kao u pregledaču (window.PW_PROIZVODI)
export const PROIZVODI = (function () {
    const kontekst = { window: {} };
    vm.runInNewContext(procitaj("js/proizvodi.js"), kontekst);
    return kontekst.window.PW_PROIZVODI;
})();

export const ID_JEVI = Object.keys(PROIZVODI);
export const CENA_DOSTAVE = 550;

export const STRANICE = [
    "/index.html",
    "/html/katalog.html",
    "/html/proizvod.html?id=nike-tech-fleece-joggers-komplet",
    "/html/korpa.html",
    "/html/checkout.html",
    "/html/kakonaruciti.html",
    "/html/kontakt.html",
    "/html/onama.html",
    "/html/zamenareklamacija.html",
    "/html/uslovikoriscenja.html",
    "/html/politikaprivatnosti.html",
    "/html/kolacici.html"
];

// Isti format kao PW.rsd u pregledaču (sr-RS: 13.490 RSD)
export function rsd(broj) {
    return String(broj).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " RSD";
}

export function popust(p) {
    return p.staraCena > p.cena ? Math.round((1 - p.cena / p.staraCena) * 100) : 0;
}

// Test sa automatskim praćenjem grešaka: svaka JS greška, console.error ili neuspeo
// zahtev (slika, skripta, css) obara test. Baner za kolačiće je podrazumevano sklonjen.
export const test = osnova.extend({
    greske: async ({ page }, use) => {
        const lista = [];
        page.on("pageerror", (e) => lista.push("pageerror: " + e.message));
        page.on("console", (m) => {
            if (m.type() !== "error") return;
            // "Failed to load resource" se već beleži kroz requestfailed/response sa tačnim URL-om
            if (m.text().startsWith("Failed to load resource")) return;
            lista.push("console: " + m.text());
        });
        page.on("requestfailed", (r) => {
            // Google Fonts nisu deo sajta – testovi ne zavise od interneta
            if (!r.url().includes("fonts.g")) lista.push("requestfailed: " + r.url());
        });
        page.on("response", (r) => {
            if (r.status() >= 400 && r.request().method() === "GET") lista.push("HTTP " + r.status() + ": " + r.url());
        });
        await use(lista);
        expect(lista, "Greške na stranici").toEqual([]);
    },
    kolacici: ["prihvaceno", { option: true }],
    page: async ({ page, kolacici }, use) => {
        // Spoljni fontovi se blokiraju da testovi budu brzi i stabilni
        await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
        if (kolacici) {
            await page.addInitScript((s) => {
                if (!sessionStorage.getItem("pw-test-init")) {
                    localStorage.setItem("statusKolacica", s);
                    sessionStorage.setItem("pw-test-init", "1");
                }
            }, kolacici);
        }
        await use(page);
    }
});

export { expect };

// Postavlja korpu pre učitavanja stranice (samo pri prvom učitavanju u tabu)
export async function postaviKorpu(page, stavke) {
    await page.addInitScript((s) => {
        if (!sessionStorage.getItem("pw-test-korpa")) {
            localStorage.setItem("prestigeKorpa", JSON.stringify(s));
            sessionStorage.setItem("pw-test-korpa", "1");
        }
    }, stavke);
}

export async function citajKorpu(page) {
    return page.evaluate(() => JSON.parse(localStorage.getItem("prestigeKorpa") || "[]"));
}

// Pretvara "13.490 RSD" u 13490
export function uBroj(tekst) {
    return Number(String(tekst).replace(/[^\d]/g, ""));
}
