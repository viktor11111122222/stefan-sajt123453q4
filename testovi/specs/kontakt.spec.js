// Kontakt forma: validacija, slanje (Netlify Forms), uspeh i greška.
import { test, expect, procitaj } from "../helpers/sajt.js";

function presretni(page, status = 200) {
    const zahtevi = [];
    return page.route((u) => u.pathname === "/", async (route) => {
        if (route.request().method() !== "POST") return route.continue();
        zahtevi.push(Object.fromEntries(new URLSearchParams(route.request().postData())));
        await route.fulfill({ status, body: "ok" });
    }).then(() => zahtevi);
}

test.describe("kontakt", () => {
    test("prazna forma prikazuje greške i ne šalje ništa", async ({ page, greske }) => {
        const zahtevi = await presretni(page);
        await page.goto("/html/kontakt.html");
        await page.locator("#posalji").click();
        await expect(page.locator("#greska-ime")).toHaveText("Unesite ime.");
        await expect(page.locator("#greska-email")).toHaveText("Unesite ispravnu email adresu.");
        await expect(page.locator("#greska-poruka")).toHaveText("Poruka treba da ima bar 10 karaktera.");
        await expect(page.locator("#ime")).toBeFocused();
        expect(zahtevi).toEqual([]);
    });

    test("kratka poruka nije dovoljna", async ({ page }) => {
        await page.goto("/html/kontakt.html");
        await page.locator("#ime").fill("Marko Marković");
        await page.locator("#email").fill("marko@primer.rs");
        await page.locator("#poruka").fill("Zdravo");
        await page.locator("#posalji").click();
        await expect(page.locator("#poruka")).toBeFocused();
        await expect(page.locator("#greska-poruka")).not.toBeEmpty();
    });

    test("uspešno slanje sa temom i brojem porudžbine", async ({ page, greske }) => {
        const zahtevi = await presretni(page);
        await page.goto("/html/kontakt.html");
        await page.getByText("Zamena proizvoda").click();
        await page.locator("#ime").fill("Marko Marković");
        await page.locator("#email").fill("marko@primer.rs");
        await page.locator("#broj_porudzbine").fill("PW-ABC123");
        await page.locator("#poruka").fill("Treba mi veća veličina, M umesto S.");
        await page.locator("#posalji").click();
        await expect(page.locator("#kontakt-uspeh")).toBeVisible();
        await expect(page.locator("#kontakt-forma")).toBeHidden();
        await expect(page.locator("#kontakt-uspeh h2")).toBeFocused();
        expect(zahtevi).toEqual([{
            "form-name": "kontakt",
            subject: "Kontakt forma: Zamena proizvoda",
            razlog: "Zamena proizvoda",
            ime: "Marko Marković",
            email: "marko@primer.rs",
            broj_porudzbine: "PW-ABC123",
            poruka: "Treba mi veća veličina, M umesto S.",
            "bot-field": ""
        }]);
        // Sva poslata polja postoje u HTML formi
        const html = procitaj("html/kontakt.html").match(/<form id="kontakt-forma"[\s\S]*?<\/form>/)[0];
        for (const k of Object.keys(zahtevi[0])) expect(html, k).toContain('name="' + k + '"');
    });

    test("bez izabrane teme šalje se „Nije izabrano“", async ({ page }) => {
        const zahtevi = await presretni(page);
        await page.goto("/html/kontakt.html");
        await page.locator("#ime").fill("Ana");
        await page.locator("#email").fill("ana@primer.rs");
        await page.locator("#poruka").fill("Kada stiže nova kolekcija?");
        await page.locator("#posalji").click();
        await expect(page.locator("#kontakt-uspeh")).toBeVisible();
        expect(zahtevi[0].razlog).toBe("Nije izabrano");
        expect(zahtevi[0].subject).toBe("Kontakt forma: Poruka sa sajta");
    });

    test("greška pri slanju ostavlja formu popunjenu", async ({ page }) => {
        await presretni(page, 500);
        await page.goto("/html/kontakt.html");
        await page.locator("#ime").fill("Ana");
        await page.locator("#email").fill("ana@primer.rs");
        await page.locator("#poruka").fill("Kada stiže nova kolekcija?");
        await page.locator("#posalji").click();
        await expect(page.locator("#greska-slanja")).toBeVisible();
        await expect(page.locator("#posalji")).toBeEnabled();
        await expect(page.locator("#poruka")).toHaveValue("Kada stiže nova kolekcija?");
    });
});
