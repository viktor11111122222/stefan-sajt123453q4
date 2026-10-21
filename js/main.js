// =====================================================
// PRESTIGE WEAR – ZAJEDNIČKA SKRIPTA (učitava se na svim stranicama)
// Korpa, header, mobilni meni, toast poruke, kolačići,
// kartice proizvoda i slanje formi (Netlify Forms).
// =====================================================

(function () {
    "use strict";

    const PW = (window.PW = window.PW || {});
    const root = document.documentElement.dataset.root || "./";

    PW.root = root;
    PW.htmlDir = root === "./" ? "./html/" : "./";
    PW.DOMEN = "https://prestigewearr.netlify.app";
    PW.EMAIL = "kontakt@prestigewear.rs";
    PW.CENA_DOSTAVE = 550;

    const smanjenoKretanje = window.matchMedia("(prefers-reduced-motion: reduce)");

    // ---------- Pomoćne funkcije ----------

    PW.rsd = function (broj) {
        return Number(broj || 0).toLocaleString("sr-RS") + " RSD";
    };

    PW.esc = function (tekst) {
        return String(tekst ?? "").replace(/[&<>"']/g, function (z) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[z];
        });
    };

    PW.slug = function (tekst) {
        return String(tekst)
            .toLowerCase()
            .replace(/đ/g, "dj")
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    };

    PW.popust = function (p) {
        return p.staraCena > p.cena ? Math.round((1 - p.cena / p.staraCena) * 100) : 0;
    };

    PW.nazivKategorije = { komplet: "Komplet", gornji: "Gornji deo", donji: "Donji deo" };

    // Putanja do slike. Ako postoji optimizovana verzija (img/opt/640 ili 1200) koristi nju.
    PW.slika = function (putanja, sirina) {
        const original = root + "img/" + putanja;
        if (!sirina) return encodeURI(original);
        return encodeURI(root + "img/opt/" + sirina + "/" + putanja.replace(/\.(jpe?g|png|webp)$/i, ".webp"));
    };

    // <img> sa rezervnom originalnom slikom ako optimizovana ne postoji.
    PW.imgHTML = function (putanja, sirina, alt, dodatno) {
        const rezerva = PW.slika(putanja);
        return '<img src="' + PW.slika(putanja, sirina) + '" alt="' + PW.esc(alt) + '" ' +
            (dodatno || 'loading="lazy" decoding="async"') +
            " onerror=\"this.onerror=null;this.src='" + rezerva + "'\">";
    };

    PW.ikonica = function (ime, klasa) {
        return '<svg class="icon' + (klasa ? " " + klasa : "") + '" aria-hidden="true"><use href="#i-' + ime + '"></use></svg>';
    };

    PW.proizvod = function (id) {
        return (window.PW_PROIZVODI || {})[id] || null;
    };

    PW.urlProizvoda = function (id, boja) {
        return PW.htmlDir + "proizvod.html?id=" + encodeURIComponent(id) + (boja ? "&boja=" + PW.slug(boja) : "");
    };

    PW.bojaPoSlugu = function (p, slug) {
        return (slug && p.boje.find(function (b) { return PW.slug(b.ime) === slug; })) || p.boje[0];
    };

    // ---------- Korpa (localStorage) ----------
    // Čuvamo samo id, boju, veličinu i količinu. Cena se uvek čita iz baze proizvoda,
    // pa korpa ne može da sadrži staru ili izmenjenu cenu.

    const KLJUC_KORPE = "prestigeKorpa";
    const MAKS_KOLICINA = 10;

    // Stavka mora imati boju i veličinu koje proizvod stvarno ima – inače bi porudžbina
    // stigla bez veličine ili sa bojom koju kupac nije izabrao.
    function ispravnaStavka(s) {
        const p = window.PW_PROIZVODI[s.id];
        return Boolean(p) &&
            p.velicine.includes(s.velicina) &&
            p.boje.some(function (b) { return b.ime === s.boja; });
    }

    function citajKorpu() {
        let sirovo;
        try {
            sirovo = JSON.parse(localStorage.getItem(KLJUC_KORPE) || "[]");
        } catch (e) {
            sirovo = [];
        }
        if (!Array.isArray(sirovo)) return [];

        // Spajamo iste stavke (i stari format korpe gde je svaki klik bio poseban red).
        const spojeno = [];
        sirovo.forEach(function (s) {
            if (!s || !s.id) return;
            // Proizvod (ili boja/veličina) koji je u međuvremenu uklonjen iz ponude se izbacuje iz korpe
            if (window.PW_PROIZVODI && !ispravnaStavka(s)) return;
            const kolicina = Math.max(1, Math.min(MAKS_KOLICINA, parseInt(s.kolicina, 10) || 1));
            const postojeca = spojeno.find(function (x) {
                return x.id === s.id && x.boja === s.boja && x.velicina === s.velicina;
            });
            if (postojeca) postojeca.kolicina = Math.min(MAKS_KOLICINA, postojeca.kolicina + kolicina);
            else spojeno.push({ id: s.id, boja: s.boja || "", velicina: s.velicina || "", kolicina: kolicina });
        });
        return spojeno;
    }

    function sacuvajKorpu(stavke) {
        try {
            localStorage.setItem(KLJUC_KORPE, JSON.stringify(stavke));
        } catch (e) {
            return false;
        }
        osveziBedz(true);
        document.dispatchEvent(new CustomEvent("pw:korpa"));
        return true;
    }

    PW.korpa = {
        MAKS: MAKS_KOLICINA,

        stavke: citajKorpu,

        // Koliko komada tačno ove stavke (model + boja + veličina) već ima u korpi
        kolicina: function (id, boja, velicina) {
            const s = citajKorpu().find(function (x) {
                return x.id === id && x.boja === boja && x.velicina === velicina;
            });
            return s ? s.kolicina : 0;
        },

        dodaj: function (id, boja, velicina, kolicina) {
            const stavke = citajKorpu();
            const postojeca = stavke.find(function (x) {
                return x.id === id && x.boja === boja && x.velicina === velicina;
            });
            kolicina = Math.max(1, Math.min(MAKS_KOLICINA, kolicina || 1));
            if (postojeca) postojeca.kolicina = Math.min(MAKS_KOLICINA, postojeca.kolicina + kolicina);
            else stavke.push({ id: id, boja: boja, velicina: velicina, kolicina: kolicina });
            return sacuvajKorpu(stavke);
        },

        postaviKolicinu: function (index, kolicina) {
            const stavke = citajKorpu();
            if (!stavke[index]) return;
            stavke[index].kolicina = Math.max(1, Math.min(MAKS_KOLICINA, kolicina));
            sacuvajKorpu(stavke);
        },

        ukloni: function (index) {
            const stavke = citajKorpu();
            stavke.splice(index, 1);
            sacuvajKorpu(stavke);
        },

        isprazni: function () {
            sacuvajKorpu([]);
        },

        broj: function () {
            return citajKorpu().reduce(function (z, s) { return z + s.kolicina; }, 0);
        },

        // Stavke spojene sa podacima iz baze; proizvodi kojih više nema se preskaču.
        linije: function () {
            return citajKorpu()
                .map(function (s, index) {
                    const p = PW.proizvod(s.id);
                    if (!p) return null;
                    const boja = p.boje.find(function (b) { return b.ime === s.boja; }) || p.boje[0];
                    return {
                        index: index,
                        id: s.id,
                        proizvod: p,
                        boja: boja.ime,
                        velicina: s.velicina,
                        kolicina: s.kolicina,
                        slika: boja.slike[0],
                        cena: p.cena,
                        ukupno: p.cena * s.kolicina
                    };
                })
                .filter(Boolean);
        }
    };

    let prethodniBroj = null;

    function osveziBedz(animiraj) {
        const broj = PW.korpa.broj();
        document.querySelectorAll("[data-cart-count]").forEach(function (el) {
            el.textContent = broj > 9 ? "9+" : String(broj);
            el.toggleAttribute("data-empty", broj === 0);
            const dugme = el.closest("a");
            if (dugme) dugme.setAttribute("aria-label", broj ? "Korpa, artikala: " + broj : "Korpa je prazna");

            // Mali "bump" kada se broj poveća – potvrda da je klik registrovan.
            if (animiraj && prethodniBroj !== null && broj > prethodniBroj && !smanjenoKretanje.matches && el.animate) {
                el.animate(
                    [{ transform: "scale(1)" }, { transform: "scale(1.3)" }, { transform: "scale(1)" }],
                    { duration: 320, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
                );
            }
        });
        prethodniBroj = broj;
    }

    // Korpa promenjena u drugom tabu
    window.addEventListener("storage", function (e) {
        if (e.key === KLJUC_KORPE) {
            osveziBedz(false);
            document.dispatchEvent(new CustomEvent("pw:korpa"));
        }
    });

    // ---------- Header: ivica kada se skroluje ----------

    function initHeader() {
        const header = document.querySelector(".site-header");
        if (!header || !("IntersectionObserver" in window)) return;
        const senzor = document.createElement("div");
        senzor.setAttribute("aria-hidden", "true");
        senzor.style.cssText = "position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none";
        document.body.prepend(senzor);
        new IntersectionObserver(function (unosi) {
            header.toggleAttribute("data-scrolled", !unosi[0].isIntersecting);
        }).observe(senzor);
    }

    // ---------- Mobilni meni ----------

    function initMeni() {
        const drawer = document.getElementById("meni");
        const otvori = document.querySelector("[data-menu-open]");
        if (!drawer || !otvori) return;

        const panel = drawer.querySelector(".drawer-panel");
        const desktop = window.matchMedia("(min-width: 960px)");

        function otvoriMeni() {
            drawer.inert = false;
            drawer.setAttribute("data-open", "");
            otvori.setAttribute("aria-expanded", "true");
            document.documentElement.style.overflow = "hidden";
            const zatvoriDugme = drawer.querySelector(".drawer-top [data-menu-close]");
            if (zatvoriDugme) zatvoriDugme.focus({ preventScroll: true });
        }

        function zatvoriMeni(vratiFokus) {
            if (!drawer.hasAttribute("data-open")) return;
            drawer.removeAttribute("data-open");
            drawer.inert = true;
            otvori.setAttribute("aria-expanded", "false");
            document.documentElement.style.overflow = "";
            if (vratiFokus) otvori.focus({ preventScroll: true });
        }

        otvori.addEventListener("click", otvoriMeni);
        drawer.querySelectorAll("[data-menu-close]").forEach(function (el) {
            el.addEventListener("click", function () { zatvoriMeni(true); });
        });
        drawer.querySelectorAll(".drawer-nav a").forEach(function (a) {
            a.addEventListener("click", function () { zatvoriMeni(false); });
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") zatvoriMeni(true);
            // Fokus ostaje unutar otvorenog menija
            if (e.key === "Tab" && drawer.hasAttribute("data-open")) {
                const fokusabilni = panel.querySelectorAll("a, button");
                const prvi = fokusabilni[0];
                const poslednji = fokusabilni[fokusabilni.length - 1];
                if (e.shiftKey && document.activeElement === prvi) { e.preventDefault(); poslednji.focus(); }
                else if (!e.shiftKey && document.activeElement === poslednji) { e.preventDefault(); prvi.focus(); }
            }
        });
        desktop.addEventListener("change", function (e) {
            if (e.matches) zatvoriMeni(false);
        });
    }

    // ---------- Toast ----------
    // Jedan toast koji se ponovo koristi. Tajmer se resetuje pri svakom novom pozivu,
    // pauzira dok je miš preko njega i dok je tab sakriven (kao Sonner).

    let toastEl = null;
    let toastTajmer = null;
    let toastPreostalo = 0;
    let toastPocetak = 0;

    function sakrijToast() {
        clearTimeout(toastTajmer);
        toastTajmer = null;
        if (toastEl) toastEl.removeAttribute("data-visible");
    }

    function pokreniToastTajmer(ms) {
        clearTimeout(toastTajmer);
        toastPreostalo = ms;
        toastPocetak = Date.now();
        toastTajmer = setTimeout(sakrijToast, ms);
    }

    function pauzirajToast() {
        if (!toastTajmer) return;
        clearTimeout(toastTajmer);
        toastTajmer = null;
        toastPreostalo = Math.max(1200, toastPreostalo - (Date.now() - toastPocetak));
    }

    function nastaviToast() {
        if (toastEl && toastEl.hasAttribute("data-visible") && !toastTajmer) pokreniToastTajmer(toastPreostalo);
    }

    PW.toast = function (opcije) {
        if (!toastEl) {
            toastEl = document.createElement("div");
            toastEl.className = "toast";
            toastEl.setAttribute("role", "status");
            toastEl.setAttribute("aria-live", "polite");
            document.body.appendChild(toastEl);
            toastEl.addEventListener("mouseenter", pauzirajToast);
            toastEl.addEventListener("mouseleave", nastaviToast);
            document.addEventListener("visibilitychange", function () {
                if (document.hidden) pauzirajToast();
                else nastaviToast();
            });
        }

        toastEl.innerHTML =
            '<div class="toast-media">' + (opcije.slika ? PW.imgHTML(opcije.slika, 640, "", 'decoding="async"') : PW.ikonica("check")) + "</div>" +
            '<div class="toast-text"><strong>' + PW.ikonica("check", "icon--sm") + PW.esc(opcije.naslov) + "</strong>" +
            (opcije.tekst ? "<small>" + PW.esc(opcije.tekst) + "</small>" : "") + "</div>" +
            (opcije.akcija ? '<a class="btn btn--light btn--sm" href="' + opcije.akcija.href + '">' + PW.esc(opcije.akcija.tekst) + "</a>" : "");

        // Sledeći frame da bi tranzicija krenula i kada je toast tek dodat
        requestAnimationFrame(function () {
            toastEl.setAttribute("data-visible", "");
        });
        pokreniToastTajmer(opcije.trajanje || 4000);
    };

    // ---------- Kolačići ----------

    function initKolacici() {
        const baner = document.getElementById("cookie-banner");
        if (!baner) return;
        let status = null;
        try { status = localStorage.getItem("statusKolacica"); } catch (e) { status = "nepoznato"; }
        if (status) return;

        baner.hidden = false;
        // Kratka pauza da se ne takmiči sa prvim prikazom stranice
        setTimeout(function () { baner.setAttribute("data-visible", ""); }, 900);

        baner.querySelectorAll("[data-cookie]").forEach(function (dugme) {
            dugme.addEventListener("click", function () {
                try { localStorage.setItem("statusKolacica", dugme.dataset.cookie); } catch (e) { /* bez skladištenja */ }
                baner.removeAttribute("data-visible");
                setTimeout(function () { baner.hidden = true; }, 260);
            });
        });
    }

    // ---------- Kartica proizvoda ----------

    PW.karticaHTML = function (id, opcije) {
        const p = PW.proizvod(id);
        if (!p) return "";
        opcije = opcije || {};
        const boja = p.boje[0];
        const popust = PW.popust(p);
        const url = PW.urlProizvoda(id);

        const boje = p.boje.length > 1
            ? '<div class="swatches" role="radiogroup" aria-label="Boja">' +
              p.boje.map(function (b, i) {
                  return '<button type="button" class="swatch" role="radio" aria-checked="' + (i === 0) + '" ' +
                      'aria-label="' + PW.esc(b.ime) + '" title="' + PW.esc(b.ime) + '" data-boja="' + PW.esc(b.ime) + '" ' +
                      'style="--c1:' + b.hex + (b.hex2 ? ";--c2:" + b.hex2 : "") + '"></button>';
              }).join("") +
              "</div>"
            : "";

        return (
            '<article class="card' + (opcije.reveal ? " reveal" : "") + '" data-id="' + PW.esc(id) + '">' +
                '<div class="card-media">' +
                    PW.imgHTML(boja.slike[0], 640, p.naziv + " – " + boja.ime, opcije.prioritet ? 'decoding="async"' : null) +
                    '<div class="card-tags">' +
                        (p.oznaka ? '<span class="tag">' + PW.esc(p.oznaka) + "</span>" : "") +
                        (popust ? '<span class="tag tag--sale">−' + popust + "%</span>" : "") +
                    "</div>" +
                "</div>" +
                '<div class="card-body">' +
                    '<p class="card-cat">' + PW.nazivKategorije[p.kategorija] + "</p>" +
                    '<h3 class="card-title"><a href="' + url + '">' + PW.esc(p.naziv) + "</a></h3>" +
                    boje +
                    '<p class="card-price price"><strong>' + PW.rsd(p.cena) + "</strong>" +
                        (p.staraCena > p.cena ? '<s aria-label="Stara cena">' + PW.rsd(p.staraCena) + "</s>" : "") +
                    "</p>" +
                "</div>" +
            "</article>"
        );
    };

    // Zamena slike uz kratak blur prelaz (maskira razliku između dve slike)
    PW.zameniSliku = function (img, novaPutanja, sirina) {
        const nova = new Image();
        const src = PW.slika(novaPutanja, sirina);
        function postavi(s) {
            img.src = s;
            if (!smanjenoKretanje.matches && img.animate) {
                img.animate(
                    [{ opacity: 0.4, filter: "blur(4px)" }, { opacity: 1, filter: "blur(0)" }],
                    { duration: 220, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }
                );
            }
        }
        nova.onload = function () { postavi(src); };
        nova.onerror = function () { postavi(PW.slika(novaPutanja)); };
        nova.src = src;
    };

    // Klik na boju na kartici: menja sliku i link vodi na izabranu boju
    document.addEventListener("click", function (e) {
        const swatch = e.target.closest(".card .swatch");
        if (!swatch) return;
        const kartica = swatch.closest(".card");
        const p = PW.proizvod(kartica.dataset.id);
        const boja = p && p.boje.find(function (b) { return b.ime === swatch.dataset.boja; });
        if (!boja || swatch.getAttribute("aria-checked") === "true") return;

        kartica.querySelectorAll(".swatch").forEach(function (s) {
            s.setAttribute("aria-checked", String(s === swatch));
        });
        const img = kartica.querySelector(".card-media img");
        img.alt = p.naziv + " – " + boja.ime;
        PW.zameniSliku(img, boja.slike[0], 640);
        kartica.querySelector(".card-title a").href = PW.urlProizvoda(kartica.dataset.id, boja.ime);
    });

    // Strelice levo/desno unutar grupe boja
    document.addEventListener("keydown", function (e) {
        const swatch = e.target.closest && e.target.closest(".card .swatch");
        if (!swatch || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
        const sve = Array.from(swatch.parentElement.children);
        const sledeci = sve[(sve.indexOf(swatch) + (e.key === "ArrowRight" ? 1 : -1) + sve.length) % sve.length];
        sledeci.focus();
        sledeci.click();
        e.preventDefault();
    });

    // ---------- Pojavljivanje pri skrolu (sa malim zaostatkom između elemenata) ----------

    PW.reveal = function (kontejner) {
        const elementi = Array.from((kontejner || document).querySelectorAll(".reveal:not(.is-visible)"));
        if (!elementi.length) return;
        if (!("IntersectionObserver" in window)) {
            elementi.forEach(function (el) { el.classList.add("is-visible"); });
            return;
        }
        const posmatrac = new IntersectionObserver(function (unosi) {
            let red = 0;
            unosi.forEach(function (u) {
                if (!u.isIntersecting) return;
                u.target.style.setProperty("--i", Math.min(red++, 6));
                u.target.classList.add("is-visible");
                posmatrac.unobserve(u.target);
            });
        }, { rootMargin: "0px 0px -60px 0px" });
        elementi.forEach(function (el) { posmatrac.observe(el); });
    };

    // ---------- Slanje forme (Netlify Forms) ----------
    // Netlify prepoznaje forme sa atributom data-netlify="true" pri deploy-u.
    // Obaveštenje na email se uključuje u Netlify: Site → Forms → Form notifications.

    PW.posaljiFormu = function (imeForme, podaci) {
        const telo = new URLSearchParams();
        telo.append("form-name", imeForme);
        Object.keys(podaci).forEach(function (k) { telo.append(k, podaci[k]); });
        return fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: telo.toString()
        }).then(function (odgovor) {
            if (!odgovor.ok) throw new Error("Status " + odgovor.status);
            return odgovor;
        });
    };

    // Dugme u stanju učitavanja
    PW.ucitavanje = function (dugme, aktivno) {
        dugme.classList.toggle("is-loading", aktivno);
        dugme.disabled = aktivno;
        dugme.setAttribute("aria-busy", String(aktivno));
    };

    // ---------- Pokretanje ----------

    function init() {
        osveziBedz(false);
        initHeader();
        initMeni();
        initKolacici();
        document.querySelectorAll("[data-year]").forEach(function (el) {
            el.textContent = new Date().getFullYear();
        });
        // Cene upisane direktno u HTML se uvek osvežavaju iz baze proizvoda
        document.querySelectorAll("[data-cena]").forEach(function (el) {
            const p = PW.proizvod(el.dataset.cena);
            if (p) el.textContent = PW.rsd(p.cena);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
