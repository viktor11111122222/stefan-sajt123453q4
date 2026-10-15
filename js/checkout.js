// =====================================================
// ZAVRŠETAK KUPOVINE (checkout)
// Porudžbina se šalje preko Netlify Forms (forma "porudzbina").
// Da bi admin dobijao mejl: Netlify → Site → Forms → Form notifications
// → Add notification → Email notification → forma "porudzbina".
// =====================================================

(function () {
    "use strict";

    const PW = window.PW;
    const forma = document.getElementById("checkout-forma");
    if (!forma) return;

    const sadrzaj = document.getElementById("checkout-sadrzaj");
    const prazno = document.getElementById("checkout-prazno");
    const uspeh = document.getElementById("checkout-uspeh");
    const greskaSlanja = document.getElementById("greska-slanja");
    const dugme = document.getElementById("potvrdi");

    // ---------- Pregled porudžbine ----------
    function obracun() {
        const linije = PW.korpa.linije();
        const medjuzbir = linije.reduce(function (z, l) { return z + l.ukupno; }, 0);
        return { linije: linije, medjuzbir: medjuzbir, ukupno: medjuzbir + PW.CENA_DOSTAVE };
    }

    function prikaziPregled() {
        const o = obracun();
        if (!o.linije.length) {
            sadrzaj.hidden = true;
            prazno.hidden = false;
            return o;
        }
        sadrzaj.hidden = false;
        prazno.hidden = true;

        document.getElementById("checkout-stavke").innerHTML = o.linije.map(function (l) {
            return (
                '<li class="mini-item">' +
                    '<div class="mini-item-media">' + PW.imgHTML(l.slika, 640, "") +
                        '<span class="mini-item-qty" aria-label="Količina">' + l.kolicina + "</span>" +
                    "</div>" +
                    "<div>" + PW.esc(l.proizvod.naziv) + "<small>" + PW.esc(l.boja) + " · " + PW.esc(l.velicina) + "</small></div>" +
                    '<span class="price">' + PW.rsd(l.ukupno) + "</span>" +
                "</li>"
            );
        }).join("");
        document.getElementById("checkout-medjuzbir").textContent = PW.rsd(o.medjuzbir);
        document.getElementById("checkout-dostava").textContent = PW.rsd(PW.CENA_DOSTAVE);
        document.getElementById("checkout-ukupno").textContent = PW.rsd(o.ukupno);
        document.getElementById("potvrdi-iznos").textContent = PW.rsd(o.ukupno);
        return o;
    }

    // ---------- Validacija ----------
    const pravila = {
        ime: { test: function (v) { return v.length >= 2; }, poruka: "Unesite ime." },
        prezime: { test: function (v) { return v.length >= 2; }, poruka: "Unesite prezime." },
        telefon: {
            test: function (v) { return /^(\+381|00381|0)[1-9]\d{6,9}$/.test(v.replace(/[\s\-/()]/g, "")); },
            poruka: "Unesite ispravan broj telefona, npr. 064 123 4567."
        },
        email: {
            test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); },
            poruka: "Unesite ispravnu email adresu."
        },
        adresa: { test: function (v) { return v.length >= 4 && /\d/.test(v); }, poruka: "Unesite ulicu i kućni broj." },
        grad: { test: function (v) { return v.length >= 2; }, poruka: "Unesite grad." },
        postanski_broj: { test: function (v) { return /^\d{5}$/.test(v); }, poruka: "Poštanski broj ima 5 cifara, npr. 18000." }
    };

    function proveriPolje(ime) {
        const polje = forma.elements[ime];
        const pravilo = pravila[ime];
        if (!polje || !pravilo) return true;
        const ok = pravilo.test(polje.value.trim());
        polje.setAttribute("aria-invalid", String(!ok));
        document.getElementById("greska-" + ime).textContent = ok ? "" : pravilo.poruka;
        return ok;
    }

    Object.keys(pravila).forEach(function (ime) {
        const polje = forma.elements[ime];
        // Greška se prikazuje tek kada korisnik napusti polje, a nestaje čim je ispravi
        polje.addEventListener("blur", function () { if (polje.value.trim()) proveriPolje(ime); });
        polje.addEventListener("input", function () {
            if (polje.getAttribute("aria-invalid") === "true") proveriPolje(ime);
        });
    });

    // ---------- Slanje ----------
    function brojPorudzbine() {
        return "PW-" + Date.now().toString(36).toUpperCase().slice(-6);
    }

    forma.addEventListener("submit", function (e) {
        e.preventDefault();
        greskaSlanja.hidden = true;

        const neispravna = Object.keys(pravila).filter(function (ime) { return !proveriPolje(ime); });
        if (neispravna.length) {
            forma.elements[neispravna[0]].focus();
            return;
        }

        const o = obracun();
        if (!o.linije.length) {
            prikaziPregled();
            return;
        }

        const broj = brojPorudzbine();
        const stavkeTekst = o.linije.map(function (l) {
            return l.kolicina + " × " + l.proizvod.naziv + " | Boja: " + l.boja + " | Veličina: " + l.velicina + " | " + PW.rsd(l.ukupno);
        }).join("\n");

        const v = function (ime) { return forma.elements[ime].value.trim(); };
        const podaci = {
            subject: "Nova porudžbina " + broj + " – " + PW.rsd(o.ukupno),
            broj_porudzbine: broj,
            ime: v("ime"),
            prezime: v("prezime"),
            telefon: v("telefon"),
            email: v("email"),
            adresa: v("adresa"),
            grad: v("grad"),
            postanski_broj: v("postanski_broj"),
            napomena: v("napomena"),
            placanje: "Pouzećem (gotovina pri preuzimanju)",
            artikli: stavkeTekst,
            medjuzbir: PW.rsd(o.medjuzbir),
            dostava: PW.rsd(PW.CENA_DOSTAVE),
            ukupno: PW.rsd(o.ukupno),
            "bot-field": forma.elements["bot-field"].value
        };

        PW.ucitavanje(dugme, true);

        PW.posaljiFormu("porudzbina", podaci)
            .then(function () {
                zavrseno = true;
                PW.korpa.isprazni();
                prazno.hidden = true;
                document.getElementById("uspeh-ime").textContent = podaci.ime;
                document.getElementById("uspeh-broj").textContent = broj;
                document.getElementById("uspeh-telefon").textContent = podaci.telefon;
                sadrzaj.hidden = true;
                uspeh.hidden = false;
                document.querySelector(".page-hero").hidden = true;
                window.scrollTo(0, 0);
                uspeh.querySelector("h1").focus();
            })
            .catch(function () {
                // Korpa ostaje sačuvana – ništa se ne gubi ako slanje ne uspe
                greskaSlanja.hidden = false;
                greskaSlanja.focus();
            })
            .finally(function () {
                PW.ucitavanje(dugme, false);
            });
    });

    // Posle uspešne porudžbine pregled se više ne crta (korpa je namerno ispražnjena)
    let zavrseno = false;
    document.addEventListener("pw:korpa", function () {
        if (!zavrseno) prikaziPregled();
    });

    prikaziPregled();
})();
