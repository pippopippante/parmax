"""Parmax: scarica il catalogo vero da parmax.com e scrive assets/js/prodotti.js.

Codice di Emanuele Parmegiani.

Uso (dalla cartella del sito):
    python strumenti/aggiorna-catalogo.py              # scarica tutto da parmax.com (~1 minuto)
    python strumenti/aggiorna-catalogo.py <cartella>   # usa products1.json, products2.json... già scaricati

Legge solo le pagine pubbliche del negozio Shopify (products.json e il widget delle
recensioni Trustindex). Tiene solo i prodotti con almeno una taglia disponibile.

Formato di ogni prodotto in PRODOTTI.p (chiavi corte perché i prodotti sono ~2.300):
    h  handle Shopify (indirizzo del prodotto)       t  nome, com'è sul sito
    m  marca                                          g  genere: donna, uomo, bambina, bambino ('' = altro)
    c  categoria (slug, etichette in catalogo.js)     o  1 se è in outlet
    n  1 se è fra le novità ("New" sul sito attuale)  s  stagione: ai / pe
    p  prezzo pieno                                   r  prezzo barrato di Shopify, solo se più alto di p
    x  codici promo presi dai tag (NEW15, OUT70...): lo sconto lo calcola catalogo.js
    k  colore (o colori, separati da " · ")           u  famiglia di colore (tag megacolore) per il filtro
    v  taglie disponibili: [id variante, taglia] o [id variante, taglia, colore]
    i  prime due foto (percorso dopo PRODOTTI.img)    d  data di pubblicazione
    q  numero del modello: stesso numero = stesso capo in altri colori
"""

import datetime
import glob
import html
import json
import os
import re
import sys
import time
import urllib.request

NEGOZIO = "https://parmax.com"
TRUSTINDEX = "https://cdn.trustindex.io/widgets/6e/6efc73173ecf54935166fd75325/content.html"
IMG = "https://cdn.shopify.com/s/files/1/0773/5364/8412/files/"
USCITA = os.path.join(os.path.dirname(__file__), "..", "assets", "js", "prodotti.js")

# tipo di prodotto di Shopify (senza "Outlet") -> categoria del sito
TIPI = {
    "abiti donna": "abiti", "abiti uomo": "abiti", "abiti e gonne": "abiti",
    "maglie e maglioni donna": "maglie", "maglieria uomo": "maglie", "maglie e felpe": "maglie",
    "felpe e maglie bambina": "maglie", "felpe e maglie bambino": "maglie",
    "felpe donna": "felpe", "felpe uomo": "felpe",
    "capispalla donna": "capispalla", "capispalla e giubbotti donna": "capispalla",
    "capispalla e giubbotti uomo": "capispalla", "capispalla bambina": "capispalla",
    "capispalla bambino": "capispalla", "giubbini e cappotti": "capispalla",
    "giacche e blazer donna": "giacche", "giacche uomo": "giacche",
    "pantaloni donna": "pantaloni", "pantaloni uomo": "pantaloni",
    "jeans e pantaloni bambina": "pantaloni", "jeans e pantaloni bambino": "pantaloni",
    "pantaloni e jeans bambina": "pantaloni", "pantaloni e jeans bambino": "pantaloni",
    "jeans donna": "jeans", "jeans uomo": "jeans",
    "gonne donna": "gonne",
    "camicie e bluse donna": "camicie", "camicie uomo": "camicie",
    "t-shirt e polo donna": "t-shirt", "t-shirt donna": "t-shirt", "t-shirt e polo uomo": "t-shirt",
    "t shirt camicie e polo bambino": "t-shirt", "t shirt camicie e top bambina": "t-shirt",
    "t-shirt e camicie": "t-shirt",
    "canotte e top donna": "top", "tute jumpsuit donna": "tute", "gilet e smanicati donna": "gilet",
    "completi donna": "completi", "bermuda e short uomo": "bermuda",
    "borse e accessori": "accessori", "accessori": "accessori",
}
SCARPE = ("sneakers", "scarpe", "stivali", "stivaletti", "mocassini", "scarponcini", "calzature")
GENERI = ("bambina", "bambino", "donna", "uomo")


def scarica(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (aggiorna-catalogo Parmax)"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", "replace")


def tutti_i_prodotti(cartella):
    if cartella:
        file = sorted(glob.glob(os.path.join(cartella, "products*.json")), key=lambda f: int(re.sub(r"\D", "", os.path.basename(f)) or 0))
        return [p for f in file for p in json.load(open(f, encoding="utf-8"))["products"]]
    tutti, pagina = [], 1
    while True:
        blocco = json.loads(scarica(f"{NEGOZIO}/products.json?limit=250&page={pagina}"))["products"]
        if not blocco:
            return tutti
        tutti += blocco
        print(f"  pagina {pagina}: {len(blocco)} prodotti")
        pagina += 1
        time.sleep(1)


def categoria(p, genere):
    tipo = re.sub(r"\s+outlet$", "", p["product_type"].strip(), flags=re.I).strip().lower()
    if tipo in TIPI:
        return TIPI[tipo]
    if any(tipo.startswith(s) for s in SCARPE):
        return "scarpe"
    if "gift-card" in p["handle"]:
        return "gift-card"
    print(f"  ! tipo senza categoria: {p['product_type']!r} ({p['handle']})")
    return ""


def genere(p):
    fam = [t[7:] for t in p["tags"] if t.startswith("family_")]
    if fam and fam[0] in GENERI:
        return fam[0]
    tipo = p["product_type"].lower()
    return next((g for g in GENERI if g in tipo), "")


def euro(x):
    x = float(x or 0)
    return int(x) if x.is_integer() else x


def compatta(p):
    disp = [v for v in p["variants"] if v["available"]]
    colori = list(dict.fromkeys(v["option1"] for v in p["variants"] if v["option1"]))
    multi = len(colori) > 1
    g = genere(p)
    tags = set(p["tags"])
    r = {
        "h": p["handle"],
        "t": p["title"].strip(),
        "m": p["vendor"].strip(),
        "g": g,
        "c": categoria(p, g),
        "p": euro(p["variants"][0]["price"]),
        "k": " · ".join(colori),
        "v": [[v["id"], v["option2"] or v["option1"] or ""] + ([v["option1"]] if multi else []) for v in disp],
        "i": [im["src"].split("/files/")[-1].split("?")[0] for im in p["images"][:2]],
        "d": p["published_at"][:10],
    }
    confronto = euro(p["variants"][0]["compare_at_price"])
    if confronto > r["p"]:
        r["r"] = confronto
    if "outlet" in tags:
        r["o"] = 1
    if "pfs:label-new arrivals" in tags:
        r["n"] = 1
    stagione = [t[7:] for t in tags if t.startswith("season_")]
    if stagione:
        r["s"] = "ai" if stagione[0] == "inverno" else "pe"
    promo = sorted(t for t in tags if re.fullmatch(r"(NEW|OUT)\d+", t))
    if promo:
        r["x"] = promo
    mega = sorted(t[11:] for t in tags if t.startswith("megacolore_"))
    if mega:
        r["u"] = mega[0]
    return r


def recensioni():
    """Le ultime recensioni Google mostrate dal widget Trustindex del sito attuale."""
    try:
        s = scarica(TRUSTINDEX)
    except Exception as e:  # senza recensioni il sito funziona lo stesso
        print("  ! recensioni non scaricate:", e)
        return {"totale": 0, "elenco": []}
    totale = re.search(r"In base a\s+([\d.]+)", html.unescape(re.sub(r"<[^>]+>", " ", s)))
    totale = int(re.sub(r"\D", "", totale.group(1))) if totale else 0
    elenco = []
    for it in s.split('<div class="ti-review-item')[1:]:
        testo = re.search(r"<!-- R-CONTENT -->(.*?)<!-- R-CONTENT -->", it, re.S)
        testo = html.unescape(re.sub(r"<br\s*/?>", "\n", testo.group(1))).strip() if testo else ""
        elenco.append({
            "nome": html.unescape(re.search(r'<div class="ti-name">\s*(?:<a[^>]*>)?([^<]+)', it).group(1).strip()),
            "stelle": round(float(re.search(r'data-rating="([\d.]+)"', it).group(1))),
            "data": datetime.date.fromtimestamp(int(re.search(r'data-time="(\d+)"', it).group(1))).isoformat(),
            "testo": testo,
        })
    luogo = re.search(r"query_place_id=([\w-]+)", s)
    return {
        "totale": totale,
        "google": f"https://www.google.com/maps/search/?api=1&query=Parmax&query_place_id={luogo.group(1)}" if luogo else "",
        "elenco": elenco,
    }


def sezione_scheda(handle):
    """Il nome del pezzo della scheda prodotto da cui il sito legge dettagli, vestibilità e domande.
    Cambia ogni volta che il negozio aggiorna il tema; se qui non si trova, il sito se lo cerca da solo."""
    try:
        m = re.search(r'id="shopify-section-(template--\d+__main)"', scarica(f"{NEGOZIO}/products/{handle}"))
        return m.group(1) if m else ""
    except Exception as e:
        print("  ! pezzo della scheda non trovato:", e)
        return ""


def main():
    cartella = sys.argv[1] if len(sys.argv) > 1 else None
    print("Scarico i prodotti" + (f" da {cartella}" if cartella else f" da {NEGOZIO}") + "...")
    tutti = tutti_i_prodotti(cartella)
    disponibili = [p for p in tutti if any(v["available"] for v in p["variants"]) and p["images"]]
    prodotti = [compatta(p) for p in disponibili]

    # stesso capo in altri colori: stessa marca e stesso nome prima della " / "
    modelli = {}
    for r in prodotti:
        modelli.setdefault((r["m"].lower(), r["t"].split(" / ")[0].strip().lower()), []).append(r)
    n = 0
    for gruppo in modelli.values():
        if len(gruppo) > 1:
            n += 1
            for r in gruppo:
                r["q"] = n

    prodotti.sort(key=lambda r: r["d"], reverse=True)
    dati = {
        "aggiornato": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M"),
        "img": IMG,
        "sezione": sezione_scheda(prodotti[0]["h"]),
        "p": prodotti,
        "recensioni": recensioni(),
    }
    testo = json.dumps(dati, ensure_ascii=False, separators=(",", ":"))
    with open(USCITA, "w", encoding="utf-8", newline="\n") as f:
        f.write(
            "/* Parmax: prodotti e recensioni, generato da strumenti/aggiorna-catalogo.py il "
            + dati["aggiornato"].replace("T", " ")
            + ". Non modificare a mano: rilancia lo script.\n   Codice di Emanuele Parmegiani. */\n"
            + "window.PRODOTTI=" + testo + ";\n"
        )
    print(f"Fatto: {len(prodotti)} prodotti su {len(tutti)}, {n} modelli in più colori, "
          f"{len(dati['recensioni']['elenco'])} recensioni, {len(testo) // 1024} KB -> {os.path.normpath(USCITA)}")


if __name__ == "__main__":
    main()
