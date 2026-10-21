// Provere bez pregledača: baza proizvoda, slike, linkovi, sitemap i cene.
import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { KOREN, PROIZVODI, ID_JEVI, CENA_DOSTAVE, procitaj, rsd } from "../helpers/sajt.js";

const HTML_FAJLOVI = ["index.html", ...fs.readdirSync(path.join(KOREN, "html")).filter((f) => f.endsWith(".html")).map((f) => "html/" + f)];
const postoji = (relativno) => fs.existsSync(path.join(KOREN, relativno));
const optimizovana = (slika, sirina) => "img/opt/" + sirina + "/" + slika.replace(/\.(jpe?g|png|webp)$/i, ".webp");

test.describe("baza proizvoda (js/proizvodi.js)", () => {
    test("ima proizvode u sve tri kategorije", () => {
        const kategorije = new Set(Object.values(PROIZVODI).map((p) => p.kategorija));
        expect([...kategorije].sort()).toEqual(["donji", "gornji", "komplet"]);
    });

    for (const id of ID_JEVI) {
        test("proizvod " + id + " ima ispravne podatke", () => {
            const p = PROIZVODI[id];
            expect(id).toMatch(/^[a-z0-9-]+$/);
            expect(p.naziv.length).toBeGreaterThan(5);
            expect(["komplet", "gornji", "donji"]).toContain(p.kategorija);
            expect(Number.isInteger(p.cena) && p.cena > 0, "cena mora biti ceo pozitivan broj").toBe(true);
            if (p.staraCena != null) {
                expect(Number.isInteger(p.staraCena)).toBe(true);
                expect(p.staraCena, "stara cena mora biti veća od nove").toBeGreaterThan(p.cena);
            }
            expect(p.velicine.length).toBeGreaterThan(0);
            expect(new Set(p.velicine).size, "duple veličine").toBe(p.velicine.length);
            expect(p.boje.length).toBeGreaterThan(0);
            expect(new Set(p.boje.map((b) => b.ime)).size, "duple boje").toBe(p.boje.length);
            expect(p.opis.length).toBeGreaterThan(100);
            for (const b of p.boje) {
                expect(b.hex).toMatch(/^#[0-9a-f]{6}$/i);
                if (b.hex2) expect(b.hex2).toMatch(/^#[0-9a-f]{6}$/i);
                expect(b.slike.length, b.ime + " nema slika").toBeGreaterThan(0);
                expect(new Set(b.slike).size, b.ime + " ima duple slike").toBe(b.slike.length);
            }
        });

        test("proizvod " + id + " – sve slike postoje (original, 640 i 1200)", () => {
            const nedostaju = [];
            for (const b of PROIZVODI[id].boje) {
                for (const s of b.slike) {
                    for (const f of ["img/" + s, optimizovana(s, 640), optimizovana(s, 1200)]) {
                        if (!postoji(f)) nedostaju.push(b.ime + ": " + f);
                    }
                }
            }
            expect(nedostaju).toEqual([]);
        });
    }

    test("nazivi proizvoda su jedinstveni", () => {
        const nazivi = Object.values(PROIZVODI).map((p) => p.naziv);
        expect(new Set(nazivi).size).toBe(nazivi.length);
    });

    test("proizvodi na početnoj (RASPRODAJA u pocetna.js) postoje", () => {
        const blok = procitaj("js/pocetna.js").match(/RASPRODAJA = \[([\s\S]*?)\]/)[1];
        const idjevi = [...blok.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
        expect(idjevi.length).toBeGreaterThan(0);
        for (const id of idjevi) expect(ID_JEVI, id).toContain(id);
        expect(new Set(idjevi).size, "dupli proizvod na početnoj").toBe(idjevi.length);
    });
});

test.describe("cene – pravila prodavnice", () => {
    // Komplet, gornji i donji deo iste linije (npr. "Nike Tech Fleece 2023 Crni")
    const linije = {};
    for (const p of Object.values(PROIZVODI)) {
        const linija = p.naziv.split(" – ")[0];
        (linije[linija] = linije[linija] || {})[p.kategorija] = p;
    }

    for (const [linija, delovi] of Object.entries(linije)) {
        if (!delovi.komplet || !delovi.gornji || !delovi.donji) continue;
        test("komplet „" + linija + "“ nije skuplji od gornjeg + donjeg dela", () => {
            const zbir = delovi.gornji.cena + delovi.donji.cena;
            expect(delovi.komplet.cena, "komplet " + rsd(delovi.komplet.cena) + " > delovi zasebno " + rsd(zbir)).toBeLessThanOrEqual(zbir);
        });
    }

    // Iz To do.txt: "Kompleti da idu od 12-14.5k, gornji i donji delovi da idu od 6-8k"
    const OPSEG = { komplet: [12000, 14500], gornji: [6000, 8000], donji: [6000, 8000] };
    for (const id of ID_JEVI) {
        const p = PROIZVODI[id];
        const [od, doo] = OPSEG[p.kategorija];
        test("cena " + id + " je u dogovorenom opsegu " + od + "–" + doo, () => {
            expect(p.cena, p.naziv + ": " + rsd(p.cena)).toBeGreaterThanOrEqual(od);
            expect(p.cena, p.naziv + ": " + rsd(p.cena)).toBeLessThanOrEqual(doo);
        });
    }

    test("cena dostave u tekstu stranica je ista kao u main.js", () => {
        const izJs = Number(procitaj("js/main.js").match(/CENA_DOSTAVE = (\d+)/)[1]);
        expect(izJs).toBe(CENA_DOSTAVE);
        for (const f of HTML_FAJLOVI) {
            const tekst = procitaj(f);
            for (const m of tekst.matchAll(/(?:dostav[a-z]*)[^<.]{0,60}?(\d[\d.]*)\s*RSD/gi)) {
                expect(Number(m[1].replace(/\./g, "")), f + ": „" + m[0] + "“").toBe(izJs);
            }
        }
    });

    test("cene upisane direktno u HTML (data-cena) odgovaraju bazi", () => {
        for (const f of HTML_FAJLOVI) {
            for (const m of procitaj(f).matchAll(/data-cena="([^"]+)">([^<]*)</g)) {
                expect(ID_JEVI, f).toContain(m[1]);
                expect(m[2], f + " – cena pre učitavanja JS-a").toBe(rsd(PROIZVODI[m[1]].cena));
            }
        }
    });
});

test.describe("HTML struktura", () => {
    for (const f of HTML_FAJLOVI) {
        test(f + " – svi lokalni linkovi i slike postoje", () => {
            const html = procitaj(f);
            const folder = path.dirname(f);
            const neispravni = [];
            for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
                const url = m[1].replace(/&amp;/g, "&");
                if (/^(https?:|mailto:|tel:|#|data:)/.test(url)) continue;
                const fajl = path.join(folder, decodeURI(url.split(/[?#]/)[0]));
                if (!postoji(fajl)) neispravni.push(url);
            }
            expect(neispravni).toEqual([]);
        });

        test(f + " – sidra (#...) i SVG ikonice postoje", () => {
            const html = procitaj(f);
            const nedostaju = [];
            for (const m of html.matchAll(/href="#([^"]+)"/g)) {
                if (!html.includes('id="' + m[1] + '"')) nedostaju.push("#" + m[1]);
            }
            expect(nedostaju).toEqual([]);
        });

        test(f + " – ID-jevi su jedinstveni", () => {
            const idjevi = [...procitaj(f).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
            const dupli = idjevi.filter((id, i) => idjevi.indexOf(id) !== i);
            expect(dupli).toEqual([]);
        });

        test(f + " – osnovni SEO i pristupačnost", () => {
            const html = procitaj(f);
            expect(html).toMatch(/<html lang="sr"/);
            expect(html).toMatch(/<meta name="viewport"/);
            expect(html).toMatch(/<link rel="canonical" href="https:\/\/prestigewearr\.netlify\.app\//);
            // Svaka <img> ima alt (prazan alt je u redu za dekorativne slike)
            const bezAlt = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]).filter((t) => !/\salt=/.test(t));
            expect(bezAlt).toEqual([]);
            // Linkovi koji otvaraju novi tab imaju rel="noopener"
            const nesigurni = [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].map((m) => m[0]).filter((t) => !/noopener/.test(t));
            expect(nesigurni).toEqual([]);
        });
    }

    // Elementi koje skripte traže preko getElementById moraju postojati na stranici koja ih učitava
    const SKRIPTE = {
        "js/katalog.js": "html/katalog.html",
        "js/proizvod.js": "html/proizvod.html",
        "js/korpa.js": "html/korpa.html",
        "js/checkout.js": "html/checkout.html",
        "js/kontakt.js": "html/kontakt.html",
        "js/pocetna.js": "index.html"
    };
    for (const [skripta, stranica] of Object.entries(SKRIPTE)) {
        test(skripta + " – svi elementi koje koristi postoje u " + stranica, () => {
            const js = procitaj(skripta);
            const html = procitaj(stranica);
            const idjevi = new Set([
                ...[...js.matchAll(/getElementById\("([^"]+)"\)/g)].map((m) => m[1]),
                ...[...js.matchAll(/el\("#([\w-]+)"\)/g)].map((m) => m[1])
            ]);
            // greska-<polje> se pravi dinamički iz imena polja
            if (/"greska-" \+ ime/.test(js)) {
                for (const m of js.matchAll(/^\s{8}(\w+): \{ test/gm)) idjevi.add("greska-" + m[1]);
            }
            const nedostaju = [...idjevi].filter((id) => !html.includes('id="' + id + '"'));
            expect(nedostaju).toEqual([]);
            expect(html, "stranica ne učitava skriptu").toContain(skripta.replace("js/", "js/"));
        });
    }
});

test.describe("SEO fajlovi", () => {
    const sitemap = procitaj("sitemap.xml");
    const adrese = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

    test("sitemap sadrži sve proizvode i nema zastarelih", () => {
        const uSitemapu = adrese.map((u) => (u.match(/[?&]id=([^&]+)/) || [])[1]).filter(Boolean);
        expect(uSitemapu.sort()).toEqual([...ID_JEVI].sort());
    });

    test("sitemap sadrži sve javne stranice, a ne korpu i checkout", () => {
        const javne = HTML_FAJLOVI.filter((f) => !/korpa|checkout|proizvod/.test(f));
        for (const f of javne) {
            const url = "https://prestigewearr.netlify.app/" + (f === "index.html" ? "" : f);
            expect(adrese, f).toContain(url);
        }
        expect(adrese.some((u) => /korpa|checkout/.test(u))).toBe(false);
    });

    test("robots.txt blokira korpu i checkout i pokazuje na sitemap", () => {
        const robots = procitaj("robots.txt");
        expect(robots).toContain("Disallow: /html/korpa.html");
        expect(robots).toContain("Disallow: /html/checkout.html");
        expect(robots).toContain("Sitemap: https://prestigewearr.netlify.app/sitemap.xml");
    });

    test("korpa i checkout imaju noindex", () => {
        for (const f of ["html/korpa.html", "html/checkout.html"]) {
            expect(procitaj(f), f).toMatch(/<meta name="robots" content="noindex/);
        }
    });

    test("web manifest je ispravan JSON sa ikonicama koje postoje", () => {
        const manifest = JSON.parse(procitaj("img/favicon_io/site.webmanifest"));
        for (const ikonica of manifest.icons || []) {
            expect(postoji(path.join("img/favicon_io", ikonica.src)), ikonica.src).toBe(true);
        }
    });
});
