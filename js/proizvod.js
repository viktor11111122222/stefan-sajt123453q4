// =====================================================
// STRANICA PROIZVODA
// Podaci o proizvodima su u js/proizvodi.js
// =====================================================

(function () {
    "use strict";

    const PW = window.PW;
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const p = PW.proizvod(id);
    const smanjenoKretanje = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sadrzaj = document.getElementById("pdp");
    if (!sadrzaj) return;

    // ---------- Proizvod ne postoji ----------
    if (!p) {
        document.title = "Proizvod nije pronađen | Prestige Wear";
        const robots = document.querySelector('meta[name="robots"]');
        if (robots) robots.content = "noindex, follow";
        sadrzaj.outerHTML =
            '<div class="section--tight"><div class="empty-state">' +
            '<span class="perk-icon">' + PW.ikonica("search", "icon--lg") + "</span>" +
            "<h2>Proizvod nije pronađen</h2>" +
            "<p>Moguće je da model više nije u ponudi ili da je link neispravan. Pogledajte ostale modele u katalogu.</p>" +
            '<a class="btn btn--primary" href="./katalog.html">Nazad na katalog ' + PW.ikonica("arrow-right", "icon--arrow") + "</a>" +
            "</div></div>";
        document.getElementById("preporuke")?.remove();
        document.querySelector(".buy-bar")?.remove();
        return;
    }

    // ---------- Stanje ----------
    let boja = PW.bojaPoSlugu(p, params.get("boja"));
    let velicina = "";
    let slajd = 0;

    const el = function (sel) { return sadrzaj.querySelector(sel); };
    const track = el("#galerija");
    const thumbs = el("#thumbs");
    const brojac = el("#galerija-broj");
    const prev = el(".gallery-nav--prev");
    const next = el(".gallery-nav--next");
    const velicineEl = el("#velicine");
    const greskaVelicina = el("#greska-velicina");
    const popust = PW.popust(p);

    // ---------- Osnovni podaci ----------
    el("#pdp-kategorija").textContent = PW.nazivKategorije[p.kategorija];
    el("#pdp-naziv").textContent = p.naziv;
    el("#pdp-cena").textContent = PW.rsd(p.cena);
    el("#pdp-stara").textContent = p.staraCena > p.cena ? PW.rsd(p.staraCena) : "";
    el("#pdp-popust").textContent = popust ? "−" + popust + "%" : "";
    el("#pdp-popust").hidden = !popust;
    el("#pdp-usteda").textContent = popust ? "Ušteda " + PW.rsd(p.staraCena - p.cena) + " · PDV uračunat" : "PDV uračunat";
    el("#pdp-opis").textContent = p.opis;
    document.getElementById("mrvica-naziv").textContent = p.naziv;

    // ---------- Galerija ----------
    function prikaziGaleriju(animiraj) {
        const crtaj = function () {
            track.innerHTML = boja.slike.map(function (s, i) {
                return '<div class="gallery-slide" role="group" aria-roledescription="slika" aria-label="' + (i + 1) + " od " + boja.slike.length + '">' +
                    PW.imgHTML(s, 1200, p.naziv + " – " + boja.ime + ", slika " + (i + 1), i === 0 ? 'fetchpriority="high" decoding="async"' : null) +
                    "</div>";
            }).join("");
            thumbs.innerHTML = boja.slike.map(function (s, i) {
                return '<button type="button" class="thumb" aria-label="Prikaži sliku ' + (i + 1) + '" aria-current="' + (i === 0) + '" data-index="' + i + '">' +
                    PW.imgHTML(s, 640, "") + "</button>";
            }).join("");
            track.scrollLeft = 0;
            slajd = 0;
            osveziGaleriju();
            track.classList.remove("is-switching");
        };

        if (animiraj && !smanjenoKretanje.matches) {
            track.classList.add("is-switching");
            setTimeout(crtaj, 120);
        } else {
            crtaj();
        }
    }

    function osveziGaleriju() {
        const n = boja.slike.length;
        brojac.textContent = slajd + 1 + " / " + n;
        brojac.hidden = n < 2;
        prev.disabled = slajd === 0;
        next.disabled = slajd >= n - 1;
        thumbs.querySelectorAll(".thumb").forEach(function (t, i) {
            t.setAttribute("aria-current", String(i === slajd));
        });
    }

    function idiNaSlajd(i) {
        const n = boja.slike.length;
        slajd = Math.max(0, Math.min(n - 1, i));
        track.scrollTo({ left: slajd * track.clientWidth, behavior: smanjenoKretanje.matches ? "auto" : "smooth" });
        osveziGaleriju();
    }

    // Prevlačenje prstom je prirodno (scroll-snap); ovde samo pratimo trenutni slajd
    let skrolTajmer;
    track.addEventListener("scroll", function () {
        clearTimeout(skrolTajmer);
        skrolTajmer = setTimeout(function () {
            const i = Math.round(track.scrollLeft / track.clientWidth);
            if (i !== slajd) { slajd = i; osveziGaleriju(); }
        }, 60);
    }, { passive: true });

    prev.addEventListener("click", function () { idiNaSlajd(slajd - 1); });
    next.addEventListener("click", function () { idiNaSlajd(slajd + 1); });
    thumbs.addEventListener("click", function (e) {
        const t = e.target.closest(".thumb");
        if (t) idiNaSlajd(Number(t.dataset.index));
    });
    track.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { idiNaSlajd(slajd + 1); e.preventDefault(); }
        if (e.key === "ArrowLeft") { idiNaSlajd(slajd - 1); e.preventDefault(); }
    });

    // ---------- Boje ----------
    const bojeEl = el("#boje");
    const bojaNaziv = el("#izabrana-boja");

    bojeEl.innerHTML = p.boje.map(function (b) {
        return '<button type="button" class="swatch" role="radio" aria-checked="' + (b === boja) + '" ' +
            'aria-label="' + PW.esc(b.ime) + '" title="' + PW.esc(b.ime) + '" data-boja="' + PW.esc(b.ime) + '" ' +
            'style="--c1:' + b.hex + (b.hex2 ? ";--c2:" + b.hex2 : "") + '"></button>';
    }).join("");
    bojaNaziv.textContent = boja.ime;

    function izaberiBoju(ime) {
        const nova = p.boje.find(function (b) { return b.ime === ime; });
        if (!nova || nova === boja) return;
        boja = nova;
        bojaNaziv.textContent = boja.ime;
        bojeEl.querySelectorAll(".swatch").forEach(function (s) {
            s.setAttribute("aria-checked", String(s.dataset.boja === ime));
        });
        prikaziGaleriju(true);
        const novi = new URLSearchParams(location.search);
        novi.set("boja", PW.slug(boja.ime));
        history.replaceState(null, "", location.pathname + "?" + novi);
    }

    bojeEl.addEventListener("click", function (e) {
        const s = e.target.closest(".swatch");
        if (s) izaberiBoju(s.dataset.boja);
    });
    bojeEl.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const sve = Array.from(bojeEl.children);
        const i = sve.findIndex(function (s) { return s.dataset.boja === boja.ime; });
        const sl = sve[(i + (e.key === "ArrowRight" ? 1 : -1) + sve.length) % sve.length];
        sl.focus();
        izaberiBoju(sl.dataset.boja);
        e.preventDefault();
    });

    // ---------- Veličine ----------
    // Veličina nije unapred izabrana – kupac mora svesno da je izabere.
    velicineEl.innerHTML = p.velicine.map(function (v) {
        return '<button type="button" class="size" role="radio" aria-checked="false" data-velicina="' + v + '">' + v + "</button>";
    }).join("");

    function izaberiVelicinu(v) {
        velicina = v;
        velicineEl.querySelectorAll(".size").forEach(function (b) {
            b.setAttribute("aria-checked", String(b.dataset.velicina === v));
        });
        el("#izabrana-velicina").textContent = v;
        velicineEl.removeAttribute("data-invalid");
        greskaVelicina.textContent = "";
    }

    velicineEl.addEventListener("click", function (e) {
        const b = e.target.closest(".size");
        if (b) izaberiVelicinu(b.dataset.velicina);
    });

    // ---------- Korpa ----------
    function proveriVelicinu() {
        if (velicina) return true;
        velicineEl.setAttribute("data-invalid", "");
        greskaVelicina.innerHTML = PW.ikonica("help", "icon--sm") + "Izaberite veličinu";
        velicineEl.scrollIntoView({ block: "center", behavior: smanjenoKretanje.matches ? "auto" : "smooth" });
        const prvo = velicineEl.querySelector(".size");
        if (prvo) prvo.focus({ preventScroll: true });
        if (!smanjenoKretanje.matches && velicineEl.animate) {
            velicineEl.animate(
                [{ transform: "translateX(0)" }, { transform: "translateX(-5px)" }, { transform: "translateX(5px)" }, { transform: "translateX(-3px)" }, { transform: "translateX(0)" }],
                { duration: 320, easing: "ease-out" }
            );
        }
        return false;
    }

    function dodaj(odmah) {
        if (!proveriVelicinu()) return;
        if (!PW.korpa.dodaj(id, boja.ime, velicina, 1)) {
            PW.toast({ naslov: "Korpa nije sačuvana", tekst: "Pregledač blokira skladištenje. Pokušajte u drugom pregledaču." });
            return;
        }
        if (odmah) {
            location.href = "./checkout.html";
            return;
        }
        PW.toast({
            naslov: "Dodato u korpu",
            tekst: p.naziv + " · " + boja.ime + " · " + velicina,
            slika: boja.slike[0],
            akcija: { tekst: "Korpa", href: "./korpa.html" }
        });
    }

    el("#dodaj-u-korpu").addEventListener("click", function () { dodaj(false); });
    el("#poruci-odmah").addEventListener("click", function () { dodaj(true); });

    // ---------- Traka za kupovinu na telefonu ----------
    const traka = document.querySelector(".buy-bar");
    if (traka) {
        traka.querySelector("small").textContent = p.naziv;
        traka.querySelector("strong").textContent = PW.rsd(p.cena);
        traka.querySelector("button").addEventListener("click", function () { dodaj(false); });
        document.body.classList.add("has-buy-bar");

        if ("IntersectionObserver" in window) {
            const akcije = el(".pdp-actions");
            let vidljiveAkcije = true;
            let ispodAkcija = false;
            new IntersectionObserver(function (u) {
                vidljiveAkcije = u[0].isIntersecting;
                ispodAkcija = u[0].boundingClientRect.top < 0;
                traka.toggleAttribute("data-visible", !vidljiveAkcije && ispodAkcija);
            }).observe(akcije);
        }
    }

    // ---------- Preporuke ----------
    // Prvo isti model (ista linija), zatim ostali – bez nasumičnog mešanja.
    const preporukeGrid = document.getElementById("preporuke-grid");
    if (preporukeGrid) {
        const linija = function (x) { return x.includes("2025") ? "2025" : x.includes("Syna") ? "syna" : "2023"; };
        const mojaLinija = linija(p.naziv);
        const ostali = Object.keys(window.PW_PROIZVODI).filter(function (k) { return k !== id; });
        ostali.sort(function (a, b) {
            const pa = PW.proizvod(a), pb = PW.proizvod(b);
            return (linija(pb.naziv) === mojaLinija) - (linija(pa.naziv) === mojaLinija) ||
                (pb.kategorija !== p.kategorija) - (pa.kategorija !== p.kategorija);
        });
        preporukeGrid.innerHTML = ostali.slice(0, 4).map(function (k) {
            return PW.karticaHTML(k, { reveal: true });
        }).join("");
        PW.reveal(preporukeGrid);
    }

    // ---------- SEO ----------
    const urlStranice = PW.DOMEN + "/html/proizvod.html?id=" + encodeURIComponent(id);
    const prvaSlika = PW.DOMEN + "/img/" + encodeURI(p.boje[0].slike[0]);
    document.title = p.naziv + " | Prestige Wear";
    const meta = function (sel, vrednost) {
        const m = document.querySelector(sel);
        if (m) m.setAttribute(m.hasAttribute("href") ? "href" : "content", vrednost);
    };
    meta('meta[name="description"]', p.opis.slice(0, 155));
    meta('meta[property="og:title"]', p.naziv + " | Prestige Wear");
    meta('meta[property="og:description"]', p.opis.slice(0, 155));
    meta('meta[property="og:url"]', urlStranice);
    meta('meta[property="og:image"]', prvaSlika);
    meta('link[rel="canonical"]', urlStranice);

    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.textContent = JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Product",
        name: p.naziv,
        image: prvaSlika,
        description: p.opis,
        offers: {
            "@type": "Offer",
            url: urlStranice,
            priceCurrency: "RSD",
            price: String(p.cena),
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition"
        }
    });
    document.head.appendChild(schema);

    prikaziGaleriju(false);
})();
