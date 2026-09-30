/* ==========================================================================
   Parmax: dati del negozio scritti a mano (i prodotti sono in prodotti.js, generato)
   Codice di Emanuele Parmegiani.
   Da dove viene ogni dato: sito parmax.com letto il 26-29/09/2026
   (piè di pagina, Assistenza, Spedizioni, Resi e rimborsi, Chi siamo, menu).
   ========================================================================== */

window.CATALOGO = {
  negozio: {
    nome: "Parmax",
    ragioneSociale: "Parmegiani S.r.l.",
    piva: "IT03357990542",
    rea: "PG-283472",
    sede: "Corso Garibaldi 29, 06049 Spoleto (PG)",
    tel: "+39 0743 225664",
    telHref: "tel:+390743225664",
    wa: "+39 331 2140367",
    waNum: "393312140367",
    email: "clienti@parmax.com",
    /* orari dell'assistenza (pagina Assistenza); gli orari dei negozi non sono sul sito: da chiedere */
    orari: ["Lun-Ven 9:00-13:00 e 15:30-19:00", "Sab 9:00-13:00", "Dom chiuso"],
    /* indirizzi dalla pagina Chi siamo; la sede legale nel piè di pagina dice Corso Garibaldi 29: da confermare quale è il negozio */
    negozi: [
      { nome: "L'Arca Spoleto", via: "Corso Garibaldi 23/26, Spoleto (PG)", mappa: "https://www.google.com/maps/search/?api=1&query=L%27Arca+Spoleto+Corso+Garibaldi+Spoleto" },
      { nome: "Parmax Outlet", via: "Via dei Tessili 5, 06049 Spoleto (PG)", mappa: "https://www.google.com/maps/search/?api=1&query=Parmax+Outlet+Via+dei+Tessili+5+Spoleto" }
    ],
    social: {
      instagram: "https://www.instagram.com/parmaxbylarcaspoleto/",
      facebook: "https://www.facebook.com/ParmaxByLArcaSpoleto/",
      tiktok: "https://www.tiktok.com/@parmaxbylarca"
    },
    /* il negozio Shopify vero: cassa, account, resi, pagine legali */
    shopify: "https://parmax.com",
    /* foto del negozio e della campagna, dal sito attuale */
    foto: {
      negozio: "Parmax.com_L_Arca_Spoleto_Shop.png",
      outlet: "banner_home_parmax_k-way_outlet.jpg",
      outletVerticale: "banner_home_outlet_9-16_parmax_k-way.jpg",
      /* le due foto che aprono la home di parmax.com (hanno la scritta "NEW IN DONNA / UOMO" dentro l'immagine):
         il negozio le cambia a ogni stagione, qui va aggiornato il nome del file */
      campagna: { donna: "new-in-donna-fw27-parmax-abbigliamento.jpg", uomo: "new-in-uomo-fw27-parmax-abbigliamento.jpg" },
      /* interno in bianco e nero, dal riquadro "La nostra storia" di parmax.com ("Oggi"): quale dei due negozi sia è da confermare */
      negozioBn: "parmax-storia-spoleto.jpg"
    }
  },

  /* pagina Spedizioni: express in Italia 7 €, gratuita oltre 100 € */
  spedizione: { italia: 7, gratisDa: 100 },

  /* Sconti dai tag dei prodotti: la cassa Shopify applica gli stessi (provato il 29/09/2026 con tre capi).
     Se un prodotto ha più tag vale lo sconto più alto. `fino`: dopo quell'ora lo sconto non si mostra più.
     La fine della Flash Week viene dal conto alla rovescia del sito attuale (26/09/2026); le altre date
     di fine non sono sul sito: da confermare col negozio. */
  promo: {
    NEW15: { pct: 15, nome: "Flash Week", fino: "2026-10-01T00:00:00+02:00" },
    NEW40: { pct: 40, nome: "Saldi estivi" },
    NEW50: { pct: 50, nome: "Saldi estivi" },
    OUT50: { pct: 50, nome: "Promo outlet" },
    OUT60: { pct: 60, nome: "Promo outlet" },
    OUT70: { pct: 70, nome: "Promo outlet" }
  },

  generi: { donna: "Donna", uomo: "Uomo", bambina: "Bambina", bambino: "Bambino" },

  /* categorie per genere, nell'ordine e coi nomi del menu del sito attuale;
     lo slug è quello che scrive strumenti/aggiorna-catalogo.py */
  categorie: {
    donna: [
      ["capispalla", "Capispalla e Giubbotti"], ["giacche", "Giacche e Blazer"], ["maglie", "Maglie e maglioni"],
      ["felpe", "Felpe"], ["camicie", "Camicie e Bluse"], ["t-shirt", "T-shirt e Polo"], ["top", "Canotte e Top"],
      ["abiti", "Abiti"], ["completi", "Completi"], ["tute", "Tute Jumpsuit"], ["gonne", "Gonne"],
      ["pantaloni", "Pantaloni"], ["jeans", "Jeans"], ["gilet", "Gilet e Smanicati"],
      ["scarpe", "Scarpe"], ["accessori", "Borse e Accessori"]
    ],
    uomo: [
      ["capispalla", "Capispalla e Giubbotti"], ["giacche", "Giacche"], ["abiti", "Abiti"], ["maglie", "Maglieria"],
      ["felpe", "Felpe"], ["camicie", "Camicie"], ["t-shirt", "T-shirt e Polo"], ["pantaloni", "Pantaloni"],
      ["jeans", "Jeans"], ["bermuda", "Bermuda e Short"], ["scarpe", "Scarpe"], ["accessori", "Accessori"]
    ],
    bambina: [
      ["capispalla", "Piumini e Cappotti"], ["maglie", "Maglie e Felpe"], ["t-shirt", "T-Shirt e Camicie"],
      ["pantaloni", "Pantaloni e Jeans"], ["abiti", "Abiti e Gonne"], ["scarpe", "Scarpe"]
    ],
    bambino: [
      ["capispalla", "Piumini e Cappotti"], ["maglie", "Maglie e Felpe"], ["t-shirt", "T-Shirt e Camicie"],
      ["pantaloni", "Pantaloni & Jeans"], ["scarpe", "Scarpe"]
    ]
  },

  /* fasce del filtro prezzo (prezzo pagato, sconto compreso) */
  fascePrezzo: [
    ["0-50", "Fino a 50 €", 0, 50],
    ["50-100", "50-100 €", 50, 100],
    ["100-200", "100-200 €", 100, 200],
    ["200-400", "200-400 €", 200, 400],
    ["400-", "Oltre 400 €", 400, Infinity]
  ]
};
