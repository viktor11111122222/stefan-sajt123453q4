// =====================================================
// KONTAKT FORMA
// Poruke se šalju preko Netlify Forms (forma "kontakt").
// Obaveštenje na email: Netlify → Site → Forms → Form notifications.
// =====================================================

(function () {
    "use strict";

    const PW = window.PW;
    const forma = document.getElementById("kontakt-forma");
    if (!forma) return;

    const dugme = document.getElementById("posalji");
    const greskaSlanja = document.getElementById("greska-slanja");
    const uspeh = document.getElementById("kontakt-uspeh");

    const pravila = {
        ime: { test: function (v) { return v.length >= 2; }, poruka: "Unesite ime." },
        email: { test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }, poruka: "Unesite ispravnu email adresu." },
        poruka: { test: function (v) { return v.length >= 10; }, poruka: "Poruka treba da ima bar 10 karaktera." }
    };

    function proveri(ime) {
        const polje = forma.elements[ime];
        const ok = pravila[ime].test(polje.value.trim());
        polje.setAttribute("aria-invalid", String(!ok));
        document.getElementById("greska-" + ime).textContent = ok ? "" : pravila[ime].poruka;
        return ok;
    }

    Object.keys(pravila).forEach(function (ime) {
        const polje = forma.elements[ime];
        polje.addEventListener("blur", function () { if (polje.value.trim()) proveri(ime); });
        polje.addEventListener("input", function () {
            if (polje.getAttribute("aria-invalid") === "true") proveri(ime);
        });
    });

    forma.addEventListener("submit", function (e) {
        e.preventDefault();
        greskaSlanja.hidden = true;

        const neispravna = Object.keys(pravila).filter(function (ime) { return !proveri(ime); });
        if (neispravna.length) {
            forma.elements[neispravna[0]].focus();
            return;
        }

        const razlog = forma.querySelector('input[name="razlog"]:checked');
        const podaci = {
            subject: "Kontakt forma: " + (razlog ? razlog.value : "Poruka sa sajta"),
            razlog: razlog ? razlog.value : "Nije izabrano",
            ime: forma.elements.ime.value.trim(),
            email: forma.elements.email.value.trim(),
            broj_porudzbine: forma.elements.broj_porudzbine.value.trim(),
            poruka: forma.elements.poruka.value.trim(),
            "bot-field": forma.elements["bot-field"].value
        };

        PW.ucitavanje(dugme, true);
        PW.posaljiFormu("kontakt", podaci)
            .then(function () {
                forma.hidden = true;
                uspeh.hidden = false;
                uspeh.querySelector("h2").focus();
            })
            .catch(function () {
                greskaSlanja.hidden = false;
                greskaSlanja.focus();
            })
            .finally(function () {
                PW.ucitavanje(dugme, false);
            });
    });
})();
