# Testovi za Prestige Wear

Automatski testovi celog sajta (Playwright, u pravom Chrome pregledaču – na računaru i na telefonu).
Nalaze se u posebnom folderu da ih Netlify ne bi dirao pri deploy-u.

## Pokretanje

```bash
cd testovi
npm install        # samo prvi put
npm test           # svi testovi (~30 s)
npm run test:ui    # isto, ali sa prozorom gde se vidi svaki korak
```

Testovi sami pokreću mali server na `http://localhost:5599`. Koriste instalirani Google Chrome;
ako ga nema: `npx playwright install chromium` i obriši `channel: "chrome"` iz `playwright.config.js`.

## Šta se proverava

| Fajl | Šta testira |
|---|---|
| `specs/podaci.spec.js` | Baza proizvoda (cene, boje, veličine), da sve slike postoje, linkovi, sitemap, robots, pravila za cene |
| `specs/logika.spec.js` | Funkcije iz `main.js`: format cene, popust, korpa (spajanje, maks. 10 kom, oštećen localStorage) |
| `specs/stranice.spec.js` | Svaka stranica se učitava bez JS grešaka i bez horizontalnog skrola na telefonu |
| `specs/katalog.spec.js` | Filteri, pretraga (bez kvačica, sivi = siva), sortiranje, adresa |
| `specs/proizvod.spec.js` | Svaki proizvod: cena, ušteda, galerija, boje, veličine, dodavanje u korpu, preporuke, SEO |
| `specs/korpa.spec.js` | Matematika korpe (međuzbir + dostava = ukupno), količine, uklanjanje |
| `specs/checkout.spec.js` | Validacija polja, tačni podaci u porudžbini, greška pri slanju, dupli klik |
| `specs/kontakt.spec.js` | Kontakt forma |
| `specs/zajednicko.spec.js` | Početna, header, mobilni meni, kolačići |

Slanje formi se u testovima presreće – nijedna prava porudžbina ni poruka se ne šalje.

Kada promeniš cene ili dodaš proizvod u `js/proizvodi.js`, pokreni `npm test` – testovi čitaju
podatke direktno iz baze, pa ih nije potrebno menjati.
