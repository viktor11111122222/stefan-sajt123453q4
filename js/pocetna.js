// =====================================================
// POČETNA STRANA
// Ovde biraš koji proizvodi se prikazuju u sekciji "Rasprodaja".
// Upisuješ samo ID proizvoda iz js/proizvodi.js – cena i slika se čitaju automatski.
// =====================================================

const RASPRODAJA = [
    "tech-fleece-crno-syna",
    "nike-tech-fleece-joggers--donji-deo",
    "nike-tech-fleece-joggers--gornji-deo",
    "nike-tech-fleece-joggers-komplet",
    "tech-fleece-2023-crno-sivi-komplet",
    "tech-fleece-2023-sivi-donji-deo",
    "tech-fleece-2023-donji-deo",
    "tech-fleece-2023-sivi-gornji-deo"
];

(function () {
    "use strict";

    const PW = window.PW;
    const grid = document.getElementById("rasprodaja-grid");

    if (grid) {
        grid.innerHTML = RASPRODAJA.map(function (id) {
            return PW.karticaHTML(id, { reveal: true });
        }).join("");
        PW.reveal(grid);
    }

    // Broj modela po kategoriji na pločicama
    const svi = Object.values(window.PW_PROIZVODI || {});
    document.querySelectorAll("[data-cat-count]").forEach(function (el) {
        const n = svi.filter(function (p) { return p.kategorija === el.dataset.catCount; }).length;
        el.textContent = n + (n % 10 === 1 && n % 100 !== 11 ? " model" : " modela");
    });

    // Recenzije – strelice skroluju po jednu "stranu"
    const rail = document.getElementById("reviews-rail");
    const nazad = document.getElementById("reviews-prev");
    const napred = document.getElementById("reviews-next");

    if (rail && nazad && napred) {
        const osveziStrelice = function () {
            const max = rail.scrollWidth - rail.clientWidth - 2;
            nazad.disabled = rail.scrollLeft <= 2;
            napred.disabled = rail.scrollLeft >= max;
        };
        nazad.addEventListener("click", function () { rail.scrollBy({ left: -rail.clientWidth, behavior: "smooth" }); });
        napred.addEventListener("click", function () { rail.scrollBy({ left: rail.clientWidth, behavior: "smooth" }); });
        rail.addEventListener("scroll", osveziStrelice, { passive: true });
        window.addEventListener("resize", osveziStrelice);
        osveziStrelice();
    }
})();
