// =====================================================
// KORPA
// =====================================================

(function () {
    "use strict";

    const PW = window.PW;
    const lista = document.getElementById("korpa-lista");
    const sadrzaj = document.getElementById("korpa-sadrzaj");
    const prazno = document.getElementById("korpa-prazna");
    if (!lista) return;

    const smanjenoKretanje = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Stavke koje upravo nestaju (animacija). Pamte se po sadržaju, ne po poziciji –
    // pozicija se pomeri čim se ukloni neka stavka iznad.
    const kljuc = function (s) { return s.id + "|" + s.boja + "|" + s.velicina; };
    const uklanjanje = new Set();

    function prikazi() {
        const linije = PW.korpa.linije();
        const imaStavki = linije.length > 0;
        sadrzaj.hidden = !imaStavki;
        prazno.hidden = imaStavki;
        if (!imaStavki) return;

        lista.innerHTML = linije.map(function (l) {
            const url = PW.urlProizvoda(l.id, l.boja);
            return (
                '<li class="cart-item' + (uklanjanje.has(kljuc(l)) ? " is-removing" : "") + '" data-index="' + l.index + '">' +
                    '<a class="cart-item-media" href="' + url + '" tabindex="-1" aria-hidden="true">' + PW.imgHTML(l.slika, 640, "") + "</a>" +
                    '<div class="cart-item-info">' +
                        '<a class="cart-item-name" href="' + url + '">' + PW.esc(l.proizvod.naziv) + "</a>" +
                        '<p class="cart-item-meta">' + PW.esc(l.boja) + " · Veličina " + PW.esc(l.velicina || "–") + "</p>" +
                        '<p class="cart-item-unit price">' + PW.rsd(l.cena) + (l.kolicina > 1 ? " / kom" : "") + "</p>" +
                    "</div>" +
                    '<div class="cart-item-side">' +
                        '<div class="qty" role="group" aria-label="Količina">' +
                            '<button type="button" data-akcija="minus" aria-label="Smanji količinu"' + (l.kolicina <= 1 ? " disabled" : "") + ">" + PW.ikonica("minus", "icon--sm") + "</button>" +
                            '<output aria-live="polite">' + l.kolicina + "</output>" +
                            '<button type="button" data-akcija="plus" aria-label="Povećaj količinu"' + (l.kolicina >= PW.korpa.MAKS ? " disabled" : "") + ">" + PW.ikonica("plus", "icon--sm") + "</button>" +
                        "</div>" +
                        '<strong class="cart-item-total price">' + PW.rsd(l.ukupno) + "</strong>" +
                        '<button type="button" class="remove-btn" data-akcija="ukloni" aria-label="Ukloni ' + PW.esc(l.proizvod.naziv) + ' iz korpe">' + PW.ikonica("trash", "icon--sm") + '<span class="remove-label">Ukloni</span></button>' +
                    "</div>" +
                "</li>"
            );
        }).join("");

        const medjuzbir = linije.reduce(function (z, l) { return z + l.ukupno; }, 0);
        const komada = linije.reduce(function (z, l) { return z + l.kolicina; }, 0);
        document.getElementById("korpa-medjuzbir").textContent = PW.rsd(medjuzbir);
        document.getElementById("korpa-komada").textContent = "Artikli (" + komada + ")";
        document.getElementById("korpa-dostava").textContent = PW.rsd(PW.CENA_DOSTAVE);
        document.getElementById("korpa-ukupno").textContent = PW.rsd(medjuzbir + PW.CENA_DOSTAVE);
    }

    lista.addEventListener("click", function (e) {
        const dugme = e.target.closest("[data-akcija]");
        if (!dugme) return;
        const red = dugme.closest(".cart-item");
        // Red koji već nestaje se ne dira – dupli klik bi obrisao i sledeću stavku
        if (red.classList.contains("is-removing")) return;
        const index = Number(red.dataset.index);
        const stavka = PW.korpa.stavke()[index];
        if (!stavka) return;

        if (dugme.dataset.akcija === "plus") PW.korpa.postaviKolicinu(index, stavka.kolicina + 1);
        if (dugme.dataset.akcija === "minus") PW.korpa.postaviKolicinu(index, stavka.kolicina - 1);
        if (dugme.dataset.akcija === "ukloni") {
            // Kratko izbledi pa nestane (brže od ulaska – sistem odgovara)
            const k = kljuc(stavka);
            uklanjanje.add(k);
            red.classList.add("is-removing");
            setTimeout(function () {
                uklanjanje.delete(k);
                const trenutni = PW.korpa.stavke().findIndex(function (s) { return kljuc(s) === k; });
                if (trenutni > -1) PW.korpa.ukloni(trenutni);
            }, smanjenoKretanje.matches ? 0 : 180);
        }
    });

    // pw:korpa se okida posle svake izmene (i iz drugog taba)
    document.addEventListener("pw:korpa", function () {
        const fokus = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.akcija : null;
        const fokusRed = document.activeElement && document.activeElement.closest ? document.activeElement.closest(".cart-item") : null;
        const fokusIndex = fokusRed ? fokusRed.dataset.index : null;
        prikazi();
        // Fokus ostaje na istom dugmetu posle ponovnog crtanja (tastatura)
        if (fokus && fokusIndex !== null && fokus !== "ukloni") {
            const isto = lista.querySelector('.cart-item[data-index="' + fokusIndex + '"] [data-akcija="' + fokus + '"]');
            if (isto && !isto.disabled) isto.focus();
        }
    });

    prikazi();
})();
