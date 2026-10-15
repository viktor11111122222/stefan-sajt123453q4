// Pravi optimizovane WebP verzije slika proizvoda (640px za kartice, 1200px za galeriju)
// i kompresovanu pozadinu za hero sekciju.
// Pokretanje iz korena projekta:  node alati/optimizuj-slike.mjs
// (koristi "sharp" paket; ako ga nema: npm i -g sharp ili npm i sharp)
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const IMG = path.resolve('img');
const IZVORI = ['proizvodi slike', 'Nike Tech Fleece 2023', 'Nike Tech Fleece Syna'];
const VELICINE = [640, 1200];

function sveSlike(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((f) => {
        const p = path.join(dir, f.name);
        if (f.isDirectory()) return sveSlike(p);
        return /\.(webp|jpe?g|png)$/i.test(f.name) ? [p] : [];
    });
}

let broj = 0;
for (const izvor of IZVORI) {
    for (const fajl of sveSlike(path.join(IMG, izvor))) {
        const relativno = path.relative(IMG, fajl).replace(/\.(webp|jpe?g|png)$/i, '.webp');
        for (const sirina of VELICINE) {
            const izlaz = path.join(IMG, 'opt', String(sirina), relativno);
            if (fs.existsSync(izlaz) && fs.statSync(izlaz).mtimeMs > fs.statSync(fajl).mtimeMs) continue;
            fs.mkdirSync(path.dirname(izlaz), { recursive: true });
            await sharp(fajl).resize({ width: sirina, withoutEnlargement: true }).webp({ quality: 78 }).toFile(izlaz);
            broj++;
        }
    }
}

const hero = path.join(IMG, 'opt', 'hero.webp');
if (!fs.existsSync(hero)) {
    await sharp(path.join(IMG, 'hero4.png')).resize({ width: 2000 }).webp({ quality: 72 }).toFile(hero);
    broj++;
}

console.log(`Gotovo: ${broj} novih slika u img/opt/`);
