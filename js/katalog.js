// =====================================================
// KATALOG – prikaz, pretraga, filter po kategoriji i sortiranje
// Proizvodi se čitaju iz js/proizvodi.js
// =====================================================

(function () {
    "use strict";

    const PW = window.PW;
    const proizvodi = window.PW_PROIZVODI || {};
    const grid = document.getElementById("katalog-grid");
    if (!grid) return;

    const pretraga = document.getElementById("pretraga");
    const sortiranje = document.getElementById("sortiranje");
    const brojEl = document.getElementById("broj-proizvoda");
    const prazno = document.getElementById("nema-rezultata");
    const resetuj = document.querySelectorAll("[data-reset]");
    const cipovi = Array.from(document.querySelectorAll("[data-kategorija]"));

    const params = new URLSearchParams(location.search);
    let kategorija = ["komplet", "gornji", "donji"].includes(params.get("kategorija")) ? params.get("kategorija") : "sve";
    pretraga.value = params.get("q") || "";
    if (["rastuce", "opadajuce", "popust"].includes(params.get("sort"))) sortiranje.value = params.get("sort");

    // Pretraga bez obzira na kvačice, redosled reči i rod/broj (crni = crna = crno, sivi = siva,
    // "crno-sivi" = "sivi crno"). Svaka reč iz upita mora da se nađe u nazivu, kategoriji ili boji.
    const reci = function (t) { return PW.slug(t).split("-").filter(Boolean); };
    const koren = function (r) { return r.length > 3 ? r.replace(/[aeiou]$/, "") : r; };

    // Reči koje kupci često kucaju, a nisu u nazivu proizvoda
    const SINONIMI = { komplet: "trenerka kompleti", gornji: "duks dukserica jakna gornji delovi", donji: "donji delovi pantalone" };

    const sviIdjevi = Object.keys(proizvodi);
    const indeks = {};
    sviIdjevi.forEach(function (id) {
        const p = proizvodi[id];
        indeks[id] = reci([
            p.naziv,
            PW.nazivKategorije[p.kategorija],
            SINONIMI[p.kategorija],
            p.boje.map(function (b) { return b.ime; }).join(" ")
        ].join(" ")).map(koren);
    });

    function odgovara(id, upit) {
        return upit.every(function (r) {
            return indeks[id].some(function (x) { return x.startsWith(r); });
        });
    }

    // Broj proizvoda po kategoriji na čipovima
    cipovi.forEach(function (c) {
        const k = c.dataset.kategorija;
        const n = k === "sve" ? sviIdjevi.length : sviIdjevi.filter(function (id) { return proizvodi[id].kategorija === k; }).length;
        c.insertAdjacentHTML("beforeend", '<span class="count">' + n + "</span>");
    });

    function oblikReci(n) {
        return n % 10 === 1 && n % 100 !== 11 ? "proizvod" : "proizvoda";
    }

    let prviPrikaz = true;

    function prikazi() {
        const upit = reci(pretraga.value).map(koren);
        let lista = sviIdjevi.filter(function (id) {
            const p = proizvodi[id];
            return (kategorija === "sve" || p.kategorija === kategorija) && odgovara(id, upit);
        });

        if (sortiranje.value === "rastuce") lista.sort(function (a, b) { return proizvodi[a].cena - proizvodi[b].cena; });
        if (sortiranje.value === "opadajuce") lista.sort(function (a, b) { return proizvodi[b].cena - proizvodi[a].cena; });
        if (sortiranje.value === "popust") lista.sort(function (a, b) { return PW.popust(proizvodi[b]) - PW.popust(proizvodi[a]); });

        // Filtriranje se koristi često – zato se rezultati menjaju odmah, bez animacije.
        // Animacija pojavljivanja ide samo pri prvom učitavanju stranice.
        grid.innerHTML = lista.map(function (id, i) {
            return PW.karticaHTML(id, { reveal: prviPrikaz, prioritet: i < 4 });
        }).join("");
        if (prviPrikaz) PW.reveal(grid);
        prviPrikaz = false;

        brojEl.textContent = lista.length + " " + oblikReci(lista.length);
        prazno.hidden = lista.length > 0;
        grid.hidden = lista.length === 0;

        cipovi.forEach(function (c) {
            c.setAttribute("aria-pressed", String(c.dataset.kategorija === kategorija));
        });

        // Filter ostaje u adresi – može da se podeli link ili vrati nazad
        const novi = new URLSearchParams();
        if (kategorija !== "sve") novi.set("kategorija", kategorija);
        if (pretraga.value.trim()) novi.set("q", pretraga.value.trim());
        if (sortiranje.value !== "preporuceno") novi.set("sort", sortiranje.value);
        history.replaceState(null, "", location.pathname + (novi.toString() ? "?" + novi : ""));
    }

    cipovi.forEach(function (c) {
        c.addEventListener("click", function () {
            kategorija = c.dataset.kategorija;
            prikazi();
        });
    });

    pretraga.addEventListener("input", prikazi);
    sortiranje.addEventListener("change", prikazi);
    resetuj.forEach(function (d) {
        d.addEventListener("click", function () {
            kategorija = "sve";
            pretraga.value = "";
            sortiranje.value = "preporuceno";
            prikazi();
            pretraga.focus();
        });
    });

    prikazi();
})();
