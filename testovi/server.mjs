// Mali statički server za testove – služi koren sajta (folder iznad testovi/).
// Pokretanje ručno: node server.mjs  →  http://localhost:5599
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT) || 5599;

const TIPOVI = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json",
    ".webmanifest": "application/manifest+json",
    ".xml": "application/xml",
    ".txt": "text/plain; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon"
};

http.createServer(function (zahtev, odgovor) {
    // Netlify Forms postoji samo na Netlify-u; testovi presreću POST preko page.route
    if (zahtev.method !== "GET" && zahtev.method !== "HEAD") {
        odgovor.writeHead(405).end();
        return;
    }
    let putanja = decodeURIComponent(new URL(zahtev.url, "http://x").pathname);
    if (putanja.endsWith("/")) putanja += "index.html";
    const fajl = path.join(KOREN, putanja);
    if (!fajl.startsWith(KOREN) || fajl.includes(path.sep + "node_modules" + path.sep)) {
        odgovor.writeHead(403).end();
        return;
    }
    fs.readFile(fajl, function (greska, sadrzaj) {
        if (greska) {
            odgovor.writeHead(404, { "Content-Type": "text/plain" }).end("404");
            return;
        }
        odgovor.writeHead(200, { "Content-Type": TIPOVI[path.extname(fajl).toLowerCase()] || "application/octet-stream" });
        odgovor.end(zahtev.method === "HEAD" ? undefined : sadrzaj);
    });
}).listen(PORT, function () {
    console.log("Prestige Wear test server: http://localhost:" + PORT);
});
