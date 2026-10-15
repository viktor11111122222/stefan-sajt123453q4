// =====================================================
// PRESTIGE WEAR – BAZA PROIZVODA
// Jedino mesto gde se menjaju nazivi, cene, slike i boje.
// Katalog, početna, stranica proizvoda, korpa i checkout
// čitaju podatke odavde, pa su cene svuda iste.
//
// cena / staraCena  – broj u dinarima (bez tačke i "RSD")
// kategorija        – "komplet" | "gornji" | "donji"
// oznaka            – kratka oznaka na kartici (npr. "Novo") ili null
// slike             – putanje u odnosu na folder img/
// =====================================================

window.PW_PROIZVODI = {
    "nike-tech-fleece-joggers--donji-deo": {
        naziv: "Nike Tech Fleece 2025 – Donji deo",
        kategorija: "donji",
        cena: 6990,
        staraCena: 11990,
        oznaka: "Bestseller",
        velicine: ["S", "M", "L", "XL"],
        boje: [
            {
                ime: "Teget",
                hex: "#1d2536",
                slike: [
                    "proizvodi slike/techlfleeceeteget2025_7.webp",
                    "proizvodi slike/techlfleeceeteget2025_8.jpg",
                    "proizvodi slike/techlfleeceeteget2025_9.webp",
                    "proizvodi slike/techlfleeceeteget2025_10.webp"
                ]
            },
            {
                ime: "Crno-Siva",
                hex: "#16161a",
                hex2: "#a6a6a6",
                slike: [
                    "proizvodi slike/techlfleececrnosivi2025_8.webp",
                    "proizvodi slike/techlfleececrnosivi2025_9.webp",
                    "proizvodi slike/techlfleececrnosivi2025_10.webp"
                ]
            },
            {
                ime: "Siva",
                hex: "#d1d5db",
                slike: [
                    "proizvodi slike/techlfleecesivi2025_4.webp",
                    "proizvodi slike/techlfleecesivi2025_5.webp"
                ]
            },
            {
                ime: "Crna",
                hex: "#111111",
                slike: [
                    "proizvodi slike/techlfleececrni2025_6.webp",
                    "proizvodi slike/techlfleececrni2025_7.webp",
                    "proizvodi slike/techlfleececrni2025_8.webp",
                    "proizvodi slike/techlfleececrni2025_9.webp"
                ]
            }
        ],
        opis: "Najnoviji model Nike Tech Fleece donjeg dela za 2025. godinu donosi savršeno izbalansiran kroj koji se blago sužava ka zglobovima. Izrađen je od laganog, ali izuzetno toplog pamučnog fleece materijala koji zadržava temperaturu tela bez dodatne težine. Prepoznatljivi bočni džep sa rajferšlusom obloženim trakom pruža siguran prostor za telefon i ključeve. Elastičan pojas sa podesivim učkurom omogućava maksimalnu udobnost tokom celodnevnog nošenja. Dostupan u više atraktivnih nijansi, ovaj donji deo je nezaobilazan komad za moderan ulični stil."
    },

    "nike-tech-fleece-joggers--gornji-deo": {
        naziv: "Nike Tech Fleece 2025 – Gornji deo",
        kategorija: "gornji",
        cena: 7490,
        staraCena: 12990,
        oznaka: "Bestseller",
        velicine: ["S", "M", "L", "XL"],
        boje: [
            {
                ime: "Teget",
                hex: "#1d2536",
                slike: [
                    "proizvodi slike/techlfleeceeteget2025_1.webp",
                    "proizvodi slike/techlfleeceeteget2025_2.webp",
                    "proizvodi slike/techlfleeceeteget2025_3.webp",
                    "proizvodi slike/techlfleeceeteget2025_4.webp",
                    "proizvodi slike/techlfleeceeteget2025_5.webp",
                    "proizvodi slike/techlfleeceeteget2025_6.webp"
                ]
            },
            {
                ime: "Crno-Siva",
                hex: "#16161a",
                hex2: "#a6a6a6",
                slike: [
                    "proizvodi slike/techlfleececrnosivi2025_7.webp",
                    "proizvodi slike/techlfleececrnosivi2025_6.webp",
                    "proizvodi slike/techlfleecescrnosivi2025_4.webp",
                    "proizvodi slike/techlfleecescrnosivi2025_3.webp"
                ]
            },
            {
                ime: "Siva",
                hex: "#d1d5db",
                slike: [
                    "proizvodi slike/techlfleecesivi2025_1.webp",
                    "proizvodi slike/techlfleecesivi2025_3.webp",
                    "proizvodi slike/techlfleecesivi2025_6.webp",
                    "proizvodi slike/techlfleecesivi2025_7.webp"
                ]
            },
            {
                ime: "Crna",
                hex: "#111111",
                slike: [
                    "proizvodi slike/techlfleececrni2025_4.webp",
                    "proizvodi slike/techlfleececrni2025_3.webp",
                    "proizvodi slike/techlfleececrni2025_5.webp",
                    "proizvodi slike/techlfleececrni2025_2.webp"
                ]
            }
        ],
        opis: "Dizajniran za one koji ne pristaju na kompromise između udobnosti i stila, ovaj gornji deo duks-jakne pruža vrhunsku zaštitu od hladnoće. Opremljen je funkcionalnim rajferšlusom punom dužinom i višedelnom kapuljačom koja lepo prianja uz glavu. Džep sa rajferšlusom na rukavu predstavlja prepoznatljiv Tech Fleece pečat i idealan je za sitnice. Premium materijal sprečava gubljenje oblika čak i nakon višekratnog pranja. Lako se kombinuje kako sa sportskim, tako i sa svakodnevnim urbano-casual outfitima."
    },

    "nike-tech-fleece-joggers-komplet": {
        naziv: "Nike Tech Fleece 2025 – Komplet",
        kategorija: "komplet",
        cena: 13490,
        staraCena: 22990,
        oznaka: "Novo",
        velicine: ["S", "M", "L", "XL"],
        boje: [
            {
                ime: "Teget",
                hex: "#1d2536",
                slike: [
                    "proizvodi slike/techlfleeceeteget2025_3.webp",
                    "proizvodi slike/techlfleeceeteget2025_4.webp",
                    "proizvodi slike/techlfleeceeteget2025_2.webp",
                    "proizvodi slike/techlfleeceeteget2025_5.webp",
                    "proizvodi slike/techlfleeceeteget2025_7.webp",
                    "proizvodi slike/techlfleeceeteget2025_8.jpg",
                    "proizvodi slike/techlfleeceeteget2025_9.webp",
                    "proizvodi slike/techlfleeceeteget2025_10.webp"
                ]
            },
            {
                ime: "Crno-Siva",
                hex: "#16161a",
                hex2: "#a6a6a6",
                slike: [
                    "proizvodi slike/techlfleecescrnosivi2025_4.webp",
                    "proizvodi slike/techlfleececrnosivi2025_6.webp",
                    "proizvodi slike/techlfleecescrnosivi2025_3.webp",
                    "proizvodi slike/techlfleececrnosivi2025_7.webp",
                    "proizvodi slike/techlfleececrnosivi2025_8.webp",
                    "proizvodi slike/techlfleececrnosivi2025_9.webp",
                    "proizvodi slike/techlfleececrnosivi2025_10.webp"
                ]
            },
            {
                ime: "Siva",
                hex: "#d1d5db",
                slike: [
                    "proizvodi slike/techlfleecesivi2025_1.webp",
                    "proizvodi slike/techlfleecesivi2025_3.webp",
                    "proizvodi slike/techlfleecesivi2025_6.webp",
                    "proizvodi slike/techlfleecesivi2025_7.webp",
                    "proizvodi slike/techlfleecesivi2025_4.webp",
                    "proizvodi slike/techlfleecesivi2025_5.webp"
                ]
            },
            {
                ime: "Crna",
                hex: "#111111",
                slike: [
                    "proizvodi slike/techlfleececrni2025_1.webp",
                    "proizvodi slike/techlfleececrni2025_2.webp",
                    "proizvodi slike/techlfleececrni2025_3.webp",
                    "proizvodi slike/techlfleececrni2025_4.webp",
                    "proizvodi slike/techlfleececrni2025_5.webp",
                    "proizvodi slike/techlfleececrni2025_6.webp",
                    "proizvodi slike/techlfleececrni2025_7.webp",
                    "proizvodi slike/techlfleececrni2025_8.webp",
                    "proizvodi slike/techlfleececrni2025_9.webp"
                ]
            }
        ],
        opis: "Kompletan Nike Tech Fleece 2025 komplet predstavlja vrhunac sportske elegancije i funkcionalnosti. Spoj gornjeg i donjeg dela u istoj nijansi garantuje besprekoran vizuelni utisak gde god da se pojaviš. Dvoslojni termo materijal pruža optimalnu toplotu bez glomaznosti, čineći ga idealnim za sve sezone. Precizno ukrojeni šavovi prate prirodne linije tela dajući punu slobodu pokreta. Izaberi svoju omiljenu boju i uživaj u maksimalnom komforu i premium izgledu."
    },

    "tech-fleece-crno-syna": {
        naziv: "Nike Tech Fleece Crno Syna",
        kategorija: "komplet",
        cena: 12490,
        staraCena: 21990,
        oznaka: "Limitirano",
        velicine: ["S", "M", "L", "XL"],
        boje: [
            {
                ime: "Crno-Syna",
                hex: "#16161a",
                hex2: "#c17a86",
                slike: [
                    "Nike Tech Fleece Syna/syna-world-x-nike-central-cee-tech-fleece-black-hoodie-hq3748-010-model-front-set.jpg",
                    "Nike Tech Fleece Syna/syna-world-x-nike-central-cee-tech-fleece-black-hoodie-hq3748-010-model-back-set.webp",
                    "Nike Tech Fleece Syna/syna-world-x-nike-central-cee-tech-fleece-black-sweatpants-hq3749-010-model-front-set.webp",
                    "Nike Tech Fleece Syna/syna-world-x-nike-central-cee-tech-fleece-black-sweatpants-hq3749-010-model-detail-set.jpg"
                ]
            }
        ],
        opis: "Limitirana kolaboracija inspirisana Syna World estetikom i Central Cee stilom donosi ekskluzivan dizajn na klasiku. Karakterišu ga specifični roze/ružičasti detalji i logotipi koji razbijaju klasičnu crnu podlogu. Izrađen je od specijalno tretiranog fleece pamuka visoke gustine koji drži formu i pruža premium osećaj na dodir. Unutrašnjost je meka i ugodna za kožu, dok spoljašnost garantuje otpornost na habanje. Ovaj komplet je pravi kolekcionarski komad za ljubitelje ulične mode koji žele da se istaknu."
    },

    "tech-fleece-crno-syna-gornji-deo": {
        naziv: "Nike Tech Fleece Crno Syna – Gornji deo",
        kategorija: "gornji",
        cena: 5990,
        staraCena: 8990,
        oznaka: null,
        velicine: ["S", "M", "L", "XL"],
        boje: [
            {
                ime: "Crno-Syna",
                hex: "#16161a",
                hex2: "#c17a86",
                slike: [
                    "Nike Tech Fleece Syna/syna-world-x-nike-central-cee-tech-fleece-black-hoodie-hq3748-010-model-front-set.jpg",
                    "Nike Tech Fleece Syna/syna-world-x-nike-central-cee-tech-fleece-black-hoodie-hq3748-010-model-back-set.webp"
                ]
            }
        ],
        opis: "Ekskluzivni Syna World x Nike gornji deo duks kombinacije nosi jedinstvenu grafiku na leđima i prednjem delu. Kapuljača sa podesivim trakama i upečatljivim roze detaljima daje mu prepoznatljiv karakter. Opremljen je dvostranim rajferšlusom i skrivenim džepovima za moderan siluetni izgled. Materijal pruža sjajnu termoizolaciju tokom hladnijih dana. Savršen izbor za kombinovanje sa farmerkama ili crnim donjim delovima trenerke."
    },

    "tech-fleece-crno-syna-donji-deo": {
        naziv: "Nike Tech Fleece Crno Syna – Donji deo",
        kategorija: "donji",
        cena: 4990,
        staraCena: 8990,
        oznaka: null,
        velicine: ["S", "M", "L", "XL"],
        boje: [
            {
                ime: "Crno-Syna",
                hex: "#16161a",
                hex2: "#c17a86",
                slike: [
                    "Nike Tech Fleece Syna/syna-world-x-nike-central-cee-tech-fleece-black-sweatpants-hq3749-010-model-front-set.webp",
                    "Nike Tech Fleece Syna/syna-world-x-nike-central-cee-tech-fleece-black-sweatpants-hq3749-010-model-back-set.webp"
                ]
            }
        ],
        opis: "Syna specijalno izdanje donjeg dela donosi prepoznatljive grafičke akcente na nogavici u kontrastnoj roze nijansi. Suženi slim-fit kroj u kombinaciji sa elastičnim patentima na dnu ističe tvoje patike na pravi način. Duboki džepovi sa rajferšlusima osiguravaju bezbednost ličnih stvari u pokretu. Izrađen od mešavine pamuka i poliestera za dugotrajnost i vrhunsku udobnost. Idealan za sve koji traže autentičan i hrabar stil."
    },

    "tech-fleece-2023-gornji-deo": {
        naziv: "Nike Tech Fleece 2023 Crni – Gornji deo",
        kategorija: "gornji",
        cena: 6990,
        staraCena: 10990,
        oznaka: null,
        velicine: ["S", "M", "L", "XL"],
        boje: [
            {
                ime: "Crna",
                hex: "#111111",
                slike: [
                    "Nike Tech Fleece 2023/Crni/gornjideo1.webp",
                    "Nike Tech Fleece 2023/Crni/gornjideo2.webp",
                    "Nike Tech Fleece 2023/Crni/gornjideo3pozadi.webp"
                ]
            }
        ],
        opis: "Klasik iz 2023. kolekcije u mat crnoj boji koji nikada ne izlazi iz mode. Duks-jakna ima rajferšlus celom dužinom i kapuljaču koja lepo prianja uz glavu, a džep sa rajferšlusom na rukavu je prepoznatljiv Tech Fleece detalj. Lagani dvoslojni fleece zadržava toplotu bez osećaja težine. Čist, minimalistički dizajn se lako kombinuje i sa trenerkom i sa farmerkama."
    },

    "tech-fleece-2023-donji-deo": {
        naziv: "Nike Tech Fleece 2023 Crni – Donji deo",
        kategorija: "donji",
        cena: 6990,
        staraCena: 10990,
        oznaka: null,
        velicine: ["S", "M", "L", "XL"],
        boje: [
            {
                ime: "Crna",
                hex: "#111111",
                slike: [
                    "Nike Tech Fleece 2023/Crni/gornjidonjideosedi1.webp"
                ]
            }
        ],
        opis: "Klasik iz 2023. kolekcije u mat crnoj boji koji nikada ne izlazi iz mode. Odlikuje ga izuzetno čist i minimalistički dizajn sa diskretnim Nike logotipom na kuku. Anatomski oblikovani šavovi u predelu kolena omogućavaju potpuno prirodno kretanje. Veliki bočni džep sa uzdužnim rajferšlusom pruža funkcionalnost i estetski prepoznatljiv pečat. Materijal pruža blagu elastičnost i zadržava punu mekoću tokom nošenja."
    },

    "tech-fleece-2023-komplet": {
        naziv: "Nike Tech Fleece 2023 Crni – Komplet",
        kategorija: "komplet",
        cena: 12990,
        staraCena: 18990,
        oznaka: null,
        velicine: ["S", "M", "L", "XL"],
        boje: [
            {
                ime: "Crna",
                hex: "#111111",
                slike: [
                    "Nike Tech Fleece 2023/Crni/komplet1.webp",
                    "Nike Tech Fleece 2023/Crni/gornjideo1.webp",
                    "Nike Tech Fleece 2023/Crni/gornjideo2.webp",
                    "Nike Tech Fleece 2023/Crni/gornjideo3pozadi.webp",
                    "Nike Tech Fleece 2023/Crni/gornjidonjideosedi1.webp"
                ]
            }
        ],
        opis: "Bezvremenski crni Nike Tech Fleece komplet iz 2023. godine predstavlja osnovu svakog dobre garderobe. Kombinacija duksa sa kapuljačom i donjeg dela stvara uniformisan, oštar i moderan izgled. Lagana troslojna tkanina efikasno čuva toplotu tela dok istovremeno dopušta koži da diše. Ojačani rajferšlusi i elastične trake osiguravaju dugotrajnost i stabilnost kroja. Savršen za večernje izlaske, putovanja i svakodnevne aktivnosti."
    },

    "tech-fleece-2023-sivi-gornji-deo": {
        naziv: "Nike Tech Fleece 2023 Sivi – Gornji deo",
        kategorija: "gornji",
        cena: 7490,
        staraCena: 11490,
        oznaka: null,
        velicine: ["S", "M", "L", "XL"],
        boje: [
            {
                ime: "Siva",
                hex: "#808080",
                slike: [
                    "Nike Tech Fleece 2023/Sivi/gornjideo1.jpg",
                    "Nike Tech Fleece 2023/Sivi/gornjideo2.jpg",
                    "Nike Tech Fleece 2023/Sivi/gornjideo3pozadi.jpg"
                ]
            }
        ],
        opis: "Prepoznatljiva svetlosiva nijansa daje ovom gornjem delu svež i upečatljiv sportski izgled. Poseduje dvosmerni rajferšlus i visoku kragnu integrisanu sa kapuljačom za dodatnu zaštitu od vetra. Džep sa crnim okvirom na rukavu stvara odličan vizuelni kontrast. Izrađen od meke i tople Tech Fleece tkanine koja ne stvara osećaj težine. Odličan izbor za slojevito oblačenje tokom prelaznog perioda."
    },

    "tech-fleece-2023-sivi-donji-deo": {
        naziv: "Nike Tech Fleece 2023 Sivi – Donji deo",
        kategorija: "donji",
        cena: 6490,
        staraCena: 9990,
        oznaka: null,
        velicine: ["S", "M", "L", "XL"],
        boje: [
            {
                ime: "Siva",
                hex: "#808080",
                slike: [
                    "Nike Tech Fleece 2023/Sivi/komplet1.jpg",
                    "Nike Tech Fleece 2023/Sivi/komplet2.jpg"
                ]
            }
        ],
        opis: "Sivi Tech Fleece donji deo donosi idealan balans između ulične mode i sportske opreme. Elegantan kroj koji prati liniju noge naglašava figuru bez zatezanja. Podesivi pojas sa pertlom osigurava da donji deo stoji čvrsto na mestu bez obzira na intenzitet pokreta. Džepovi obloženi kvalitetnim rajferšlusima drže sve tvoje dragocenosti na sigurnom. Neutralna siva boja lako se kombinuje sa bilo kojom bojom patika."
    },

    "tech-fleece-2023-sivi-komplet": {
        naziv: "Nike Tech Fleece 2023 Sivi – Komplet",
        kategorija: "komplet",
        cena: 13490,
        staraCena: 19990,
        oznaka: null,
        velicine: ["S", "M", "L", "XL"],
        boje: [
            {
                ime: "Siva",
                hex: "#808080",
                slike: [
                    "Nike Tech Fleece 2023/Sivi/komplet1.jpg",
                    "Nike Tech Fleece 2023/Sivi/komplet2.jpg"
                ]
            }
        ],
        opis: "Sivi komplet iz 2023. serije jedan je od najpopularnijih modela ikada izbačenih u Tech Fleece liniji. Svetlosivi tonovi u kombinaciji sa crnim rajferšlusima daju moćan i čist vizuelni efekat. Dizajniran je da pruži maksimalnu udobnost bilo da si u teretani, šetnji ili na kafu u gradu. Tkanina zadržava prirodnu toplotu tela i štiti od hladnih vetrova. Idealan komplet za svakoga ko voli proverenu klasiku."
    },

    "tech-fleece-2023-crno-sivi-gornji-deo": {
        naziv: "Nike Tech Fleece 2023 Crno-Sivi – Gornji deo",
        kategorija: "gornji",
        cena: 7990,
        staraCena: 11990,
        oznaka: null,
        velicine: ["S", "M", "L", "XL"],
        boje: [
            {
                ime: "Crno-Siva",
                hex: "#16161a",
                hex2: "#a6a6a6",
                slike: [
                    "Nike Tech Fleece 2023/CrnoSivi/gornjideo1.jpg",
                    "Nike Tech Fleece 2023/CrnoSivi/gornjideo2pozadi.jpg",
                    "Nike Tech Fleece 2023/CrnoSivi/gornjideo3jpg.jpg"
                ]
            }
        ],
        opis: "Dvobojna kombinacija crnih i sivih panela daje ovom gornjem delu dinamiku i moderan izgled. Strateški raspoređeni blokovi boja vizuelno sužavaju siluetu i naglašavaju ramena. Kapuljača od višedelnog materijala stabilno stoji i nudi odličnu zaštitu od vetra. Funkcionalni džepovi sa zaštitnom trakom osiguravaju da unutrašnjost ostane suva. Pravi izbor za sve koji žele nešto više od jednobojnog duksa."
    },

    "tech-fleece-2023-crno-sivi-donji-deo": {
        naziv: "Nike Tech Fleece 2023 Crno-Sivi – Donji deo",
        kategorija: "donji",
        cena: 6790,
        staraCena: 10490,
        oznaka: null,
        velicine: ["S", "M", "L", "XL"],
        boje: [
            {
                ime: "Crno-Siva",
                hex: "#16161a",
                hex2: "#a6a6a6",
                slike: [
                    "Nike Tech Fleece 2023/CrnoSivi/komplet1.jpg",
                    "Nike Tech Fleece 2023/CrnoSivi/komplet2.jpg"
                ]
            }
        ],
        opis: "Atraktivan dvobojni donji deo koji kombinuje sivu bazu sa kontrastnim crnim detaljima i džepovima. Ergonomske linije na kolenima sprečavaju rastezanje materijala tokom čučanja i sedenja. Podesivi struk pruža stabilno pristajanje bez pritiska na stomak. Meki fleece materijal prija koži i osigurava celodnevnu udobnost. Odličan za isticanje u masi i pravljenje efektnih uličnih kombinacija."
    },

    "tech-fleece-2023-crno-sivi-komplet": {
        naziv: "Nike Tech Fleece 2023 Crno-Sivi – Komplet",
        kategorija: "komplet",
        cena: 11490,
        staraCena: 20990,
        oznaka: null,
        velicine: ["S", "M", "L", "XL"],
        boje: [
            {
                ime: "Crno-Siva",
                hex: "#16161a",
                hex2: "#a6a6a6",
                slike: [
                    "Nike Tech Fleece 2023/CrnoSivi/komplet1.jpg",
                    "Nike Tech Fleece 2023/CrnoSivi/komplet2.jpg",
                    "Nike Tech Fleece 2023/CrnoSivi/gornjideo1.jpg",
                    "Nike Tech Fleece 2023/CrnoSivi/gornjideo2pozadi.jpg",
                    "Nike Tech Fleece 2023/CrnoSivi/gornjideo3jpg.jpg"
                ]
            }
        ],
        opis: "Snažan dvobojni komplet u kombinaciji crne i sive nijanse stvoren za najzahtevnije ljubitelje stila. Kontrastni blokovi na gornjem i donjem delu čine ga izuzetno upečatljivim iz svih uglova. Vrhunska izrada sa ojačanim šavovima garantuje visoku otpornost i trajanje kroz sezone. Pruža savršenu termičku izolaciju i potpunu slobodu pokreta. Komplet koji unosi futurističku i urbanu dimenziju u tvoju svakodnevnu garderobu."
    }
};
