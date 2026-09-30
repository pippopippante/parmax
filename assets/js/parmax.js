/* ==========================================================================
   Parmax: comportamento del sito
   Codice di Emanuele Parmegiani.
   Intestazione, menu, ricerca, carrello, piè di pagina, schede prodotto,
   elenchi con filtri, scheda del capo, pagina marche e home.
   Dati: catalogo.js (scritto a mano) e prodotti.js (generato).
   ========================================================================== */

(function () {
  "use strict";

  const C = window.CATALOGO;
  const D = window.PRODOTTI || { p: [], img: "", recensioni: { totale: 0, elenco: [] } };
  const N = C.negozio;
  const P = D.p;
  const PARAM = new URLSearchParams(location.search);
  const PAGINA = document.body.dataset.pagina || "";

  /* ------------------------------------------------------------- utilità */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const slug = (s) => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const euro = (n) => Number(n).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const numero = (n) => Number(n).toLocaleString("it-IT");
  const maiuscola = (s) => String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1);
  const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  const data = (iso) => {
    const d = new Date(iso + "T12:00:00");
    return d.getDate() + " " + MESI[d.getMonth()] + " " + d.getFullYear();
  };
  const MOBILE = window.matchMedia("(max-width: 759px)");
  const DESKTOP = window.matchMedia("(min-width: 1120px)");
  const HOVER = window.matchMedia("(hover: hover) and (pointer: fine)");

  /* foto dal CDN di Shopify: `width` la fa ridimensionare (e la serve in WebP a chi lo supporta) */
  const foto = (path, w) => {
    const u = /^(https?:)?\/\//.test(path) ? (path.startsWith("//") ? "https:" + path : path) : D.img + path;
    return u + (u.includes("?") ? "&" : "?") + "width=" + w;
  };
  const srcset = (path, larghezze) => larghezze.map((w) => foto(path, w) + " " + w + "w").join(", ");

  /* WhatsApp col messaggio già iniziato (regola del metodo: "vi scrivo dal sito ...") */
  const wa = (testo) => "https://wa.me/" + N.waNum + "?text=" + encodeURIComponent(testo);
  const WA_SITO = "Buongiorno, vi scrivo dal sito Parmax";
  const NUOVA_SCHEDA = '<span class="sr"> (si apre in una nuova scheda)</span>';

  /* ------------------------------------------------------------- icone */
  const SPRITE = `
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
<symbol id="i-menu" viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h18"/></symbol>
<symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
<symbol id="i-search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></symbol>
<symbol id="i-bag" viewBox="0 0 24 24"><path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></symbol>
<symbol id="i-down" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></symbol>
<symbol id="i-right" viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6"/></symbol>
<symbol id="i-left" viewBox="0 0 24 24"><path d="M20 12H5M11 6l-6 6 6 6"/></symbol>
<symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
<symbol id="i-minus" viewBox="0 0 24 24"><path d="M5 12h14"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></symbol>
<symbol id="i-filter" viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></symbol>
<symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></symbol>
<symbol id="i-phone" viewBox="0 0 24 24"><path d="M7 3h4l1.6 4.4-2.3 1.6a12 12 0 0 0 4.7 4.7l1.6-2.3L21 13v4a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 5 5.2 2 2 0 0 1 7 3z"/></symbol>
<symbol id="i-mail" viewBox="0 0 24 24"><path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/></symbol>
<symbol id="i-zoom" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6"/></symbol>
<symbol id="i-truck" viewBox="0 0 24 24"><path d="M2 6h12v10H2zM14 10h4l3 3v3h-7"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></symbol>
<symbol id="i-swap" viewBox="0 0 24 24"><path d="M4 8h14l-3-3M20 16H6l3 3"/></symbol>
<symbol id="i-return" viewBox="0 0 24 24"><path d="M9 7L4 12l5 5"/><path d="M4 12h11a5 5 0 0 1 0 10h-2"/></symbol>
<symbol id="i-star" viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/></symbol>
</svg>`;
  const ico = (n, cls) => `<svg class="ico ${cls || ""}" aria-hidden="true" focusable="false"><use href="#i-${n}"></use></svg>`;
  const WA_ICO =
    '<svg class="ico ico--wa" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" stroke="none" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41z"/></svg>';

  /* --------------------------------------------------------------- indici */
  const perHandle = new Map(P.map((p) => [p.h, p]));
  const perModello = new Map();
  P.forEach((p) => {
    if (!p.q) return;
    if (!perModello.has(p.q)) perModello.set(p.q, []);
    perModello.get(p.q).push(p);
  });
  const MARCHE = (() => {
    const m = new Map();
    P.forEach((p) => {
      if (p.c === "gift-card" || !p.m) return;
      const k = slug(p.m);
      if (!m.has(k)) m.set(k, { slug: k, nome: p.m, n: 0 });
      m.get(k).n++;
    });
    return Array.from(m.values());
  })();
  const marcaDa = (s) => MARCHE.find((x) => x.slug === s);

  const nomeCategoria = (g, c) => {
    for (const k of [g, "donna", "uomo", "bambina", "bambino"]) {
      const x = (C.categorie[k] || []).find((y) => y[0] === c);
      if (x) return x[1];
    }
    return c === "gift-card" ? "Gift card" : "";
  };
  /* il nome del capo senza la marca davanti e senza " / colore" dietro: marca e colore si vedono a parte */
  const nomeCapo = (p) => {
    let t = String(p.t || "").split(" / ")[0].trim();
    if (p.m && norm(t).startsWith(norm(p.m) + " ")) t = t.slice(p.m.length).trim();
    return maiuscola(t);
  };
  const colorePrincipale = (p) => String(p.k || "").split(" · ")[0];

  /* ------------------------------------------------------------- prezzo */
  /* Una funzione sola per ogni prezzo del sito (schede, scheda del capo, carrello):
     gli sconti dei tag come li applica la cassa Shopify, arrotondati al centesimo. */
  const ADESSO = Date.now();
  function prezzo(p) {
    let pct = 0;
    let nome = "";
    (p.x || []).forEach((t) => {
      const pr = C.promo[t];
      if (pr && (!pr.fino || ADESSO < Date.parse(pr.fino)) && pr.pct > pct) {
        pct = pr.pct;
        nome = pr.nome;
      }
    });
    if (pct) return { pieno: p.p, finale: Math.round(p.p * (100 - pct)) / 100, pct, nome };
    if (p.r && p.r > p.p) return { pieno: p.r, finale: p.p, pct: Math.round((1 - p.p / p.r) * 100), nome: "" };
    return { pieno: p.p, finale: p.p, pct: 0, nome: "" };
  }
  const prezzoHtml = (p, conNome) => {
    const z = prezzo(p);
    if (!z.pct) return `<span class="prezzo"><span class="prezzo__f">${euro(z.finale)}</span></span>`;
    return `<span class="prezzo prezzo--sconto"><span class="sr">Prezzo scontato </span><span class="prezzo__f">${euro(z.finale)}</span>
      <span class="sr">, invece di </span><s class="prezzo__p">${euro(z.pieno)}</s>
      <span class="prezzo__pct">−${z.pct}%${conNome && z.nome ? " " + esc(z.nome) : ""}</span></span>`;
  };
  const MAX_OUTLET = Math.max(0, ...P.filter((p) => p.o).map((p) => prezzo(p).pct));

  /* ------------------------------------------------------------- taglie */
  const LETTERE = ["XXXS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL", "5XL"];
  function pesoTaglia(z) {
    const s = String(z || "").toUpperCase().trim();
    const i = LETTERE.indexOf(s);
    if (i >= 0) return 1000 + i;
    let m = s.match(/^(\d+)M$/);
    if (m) return 100 + Number(m[1]);
    m = s.match(/^(\d+)A$/);
    if (m) return 200 + Number(m[1]);
    if (/^\d/.test(s)) return 2000 + parseFloat(s.replace("/5", ".5")) + (s.includes("2/3") ? 0.66 : s.includes("1/3") ? 0.33 : 0);
    if (s === "TU") return 9000;
    return 5000;
  }
  const ordinaTaglie = (a) => a.slice().sort((x, y) => pesoTaglia(x) - pesoTaglia(y));
  const taglieDi = (p) => ordinaTaglie(Array.from(new Set((p.v || []).map((v) => v[1]).filter(Boolean))));
  /* le scarpe hanno numeri che si confondono con le taglie dei vestiti: chiavi separate nel filtro */
  const chiaveTaglia = (p, z) => (p.c === "scarpe" ? "s:" : "a:") + z;

  /* ------------------------------------------------------------ carrello */
  /* Una riga per variante (taglia). Si salva quello che serve per mostrarla e ricalcolarne il prezzo;
     alla cassa si passa a Shopify "variante:quantità". */
  const KEY = "parmax:carrello";
  const Cart = {
    righe: [],
    carica() {
      try {
        const r = JSON.parse(localStorage.getItem(KEY));
        this.righe = Array.isArray(r) ? r.filter((x) => x && x.v && x.q > 0 && x.p) : [];
      } catch (e) {
        this.righe = [];
      }
    },
    salva() {
      try {
        localStorage.setItem(KEY, JSON.stringify(this.righe));
      } catch (e) {
        /* archivio del browser non disponibile: il carrello resta in memoria per questa pagina */
      }
      render.carrello();
      render.pulsanti();
    },
    riga(v) {
      return this.righe.find((r) => String(r.v) === String(v));
    },
    qta(v) {
      const r = this.riga(v);
      return r ? r.q : 0;
    },
    aggiungi(dati) {
      const r = this.riga(dati.v);
      if (r) r.q++;
      else this.righe.push(Object.assign({}, dati, { q: 1 }));
      this.salva();
    },
    imposta(v, q) {
      const i = this.righe.findIndex((r) => String(r.v) === String(v));
      if (i < 0) return;
      if (q <= 0) this.righe.splice(i, 1);
      else this.righe[i].q = Math.min(q, 10);
      this.salva();
    },
    validi() {
      return this.righe.filter((r) => !r.esaurita);
    },
    totale() {
      return Math.round(this.validi().reduce((s, r) => s + prezzo(r).finale * r.q * 100, 0)) / 100;
    },
    /* spedizione in Italia: gratis da C.spedizione.gratisDa euro (in centesimi, per non sbagliare di 0,01) */
    spedizione() {
      return Math.round(this.totale() * 100) >= C.spedizione.gratisDa * 100 ? 0 : C.spedizione.italia;
    },
    pezzi() {
      return this.righe.reduce((s, r) => s + r.q, 0);
    },
    cassa() {
      return N.shopify + "/cart/" + this.validi().map((r) => r.v + ":" + r.q).join(",");
    }
  };

  /* prima di mostrare il carrello si ricontrolla sul negozio che ogni taglia ci sia ancora e che il prezzo sia quello */
  let verificato = 0;
  function verificaCarrello() {
    if (!Cart.righe.length || Date.now() - verificato < 60000) return;
    verificato = Date.now();
    const handle = Array.from(new Set(Cart.righe.map((r) => r.h)));
    Promise.all(handle.map((h) => leggiDalVivo(h).then((live) => [h, live])))
      .then((esiti) => {
        let cambiato = false;
        esiti.forEach(([h, live]) => {
          if (!live) return;
          Cart.righe.forEach((r) => {
            if (r.h !== h) return;
            const v = live.variants.find((x) => String(x.id) === String(r.v));
            const esaurita = !v || !v.available;
            const p = v ? v.price / 100 : r.p;
            const x = (live.tags || []).filter((t) => C.promo[t]);
            if (esaurita !== !!r.esaurita || p !== r.p || String(x) !== String(r.x || [])) {
              r.esaurita = esaurita;
              r.p = p;
              r.x = x;
              cambiato = true;
            }
          });
        });
        if (cambiato) Cart.salva();
      })
      .catch(() => {});
  }

  /* ------------------------------------------------------------ dal vivo */
  const cacheVivo = new Map();
  function leggiDalVivo(h) {
    if (!cacheVivo.has(h))
      cacheVivo.set(
        h,
        fetch(N.shopify + "/products/" + encodeURIComponent(h) + ".js", { headers: { Accept: "application/json" } })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      );
    return cacheVivo.get(h);
  }

  /* ------------------------------------------------------ avvisi e voce */
  function toast(msg, azione) {
    const host = $(".toasts");
    if (!host) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = ico("check") + `<span>${esc(msg)}</span>` + (azione ? `<button type="button" class="toast__btn">${esc(azione)}</button>` : "");
    host.appendChild(el);
    if (azione) $(".toast__btn", el).addEventListener("click", () => apri("carrello"));
    setTimeout(() => {
      el.classList.add("is-out");
      setTimeout(() => el.remove(), 300);
    }, 4200);
  }
  let tVoce;
  function annuncia(msg) {
    const el = $("[data-voce]");
    if (!el) return;
    el.textContent = "";
    clearTimeout(tVoce);
    tVoce = setTimeout(() => (el.textContent = msg), 80);
  }

  /* ----------------------------------------------------- pannelli (dialog) */
  /* menu, ricerca, carrello, filtri e zoom sono <dialog>: il browser rende inerte il resto della pagina,
     Esc chiude, e chiusi non esistono per il lettore di schermo */
  let ultimoFocus = null;
  function apri(nome) {
    const d = document.getElementById("pannello-" + nome);
    if (!d) return;
    $$("dialog[open]").forEach((x) => x !== d && x.close());
    ultimoFocus = document.activeElement;
    if (!d.open) d.showModal();
    $$(`[aria-controls="pannello-${nome}"]`).forEach((b) => b.setAttribute("aria-expanded", "true"));
    if (nome === "carrello") verificaCarrello();
    const f = $("[data-fuoco]", d) || $("input, button, a", d);
    if (f) setTimeout(() => f.focus(), 30);
  }
  function chiudiTutto() {
    $$("dialog[open]").forEach((d) => d.close());
  }
  function initDialog(d) {
    d.addEventListener("click", (e) => {
      if (e.target === d) d.close();
    });
    d.addEventListener("close", () => {
      $$(`[aria-controls="${d.id}"]`).forEach((b) => b.setAttribute("aria-expanded", "false"));
      if (ultimoFocus && document.contains(ultimoFocus)) ultimoFocus.focus();
    });
  }

  /* ------------------------------------------------------------ tema */
  /* Due versioni da mostrare al negozio: "classica" (stesso marchio) e "rinnovata".
     ponytail: interruttore solo per l'anteprima; scelta la versione, si toglie con l'altro set di colori. */
  const tema = () => document.documentElement.dataset.tema || "classica";
  function cambiaTema(t) {
    try {
      localStorage.setItem("parmax:tema", t);
    } catch (e) {}
    const u = new URL(location.href);
    u.searchParams.set("tema", t);
    location.replace(u.toString());
  }

  /* ---------------------------------------------------- conteggi per menu */
  const conta = (f) => P.reduce((n, p) => n + (f(p) ? 1 : 0), 0);
  const categorieDi = (filtro, g) =>
    (C.categorie[g] || []).map(([c, nome]) => ({ c, nome, n: conta((p) => filtro(p) && p.g === g && p.c === c) })).filter((x) => x.n);
  const inSezione = {
    donna: (p) => p.g === "donna" && !p.o,
    uomo: (p) => p.g === "uomo" && !p.o,
    outlet: (p) => !!p.o
  };
  const marcheTop = (filtro, quante) => {
    const m = new Map();
    P.forEach((p) => {
      if (!filtro(p) || !p.m) return;
      m.set(p.m, (m.get(p.m) || 0) + 1);
    });
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, quante)
      .map(([nome, n]) => ({ nome, slug: slug(nome), n }));
  };
  const hrefCat = (s, c, g) => "elenco.html?s=" + s + (g ? "&g=" + g : "") + "&c=" + c;

  /* ------------------------------------------------------- intestazione */
  function megaHtml(s) {
    if (s === "outlet") {
      const col = ["donna", "uomo", "bambina", "bambino"]
        .map((g) => {
          const cats = categorieDi(inSezione.outlet, g);
          if (!cats.length) return "";
          const tot = conta((p) => p.o && p.g === g);
          return `<div class="mega__col">
  <a class="mega__all" href="${hrefCat("outlet", "tutto", g)}">${C.generi[g]} <span class="n">${numero(tot)}</span></a>
  <ul>${cats.map((x) => `<li><a href="${hrefCat("outlet", x.c, g)}">${esc(x.nome)}</a></li>`).join("")}</ul>
</div>`;
        })
        .join("");
      return `<div class="mega__in wrap"><div class="mega__cols mega__cols--4">${col}</div></div>`;
    }
    const cats = categorieDi(inSezione[s], s);
    const tot = conta(inSezione[s]);
    const top = marcheTop(inSezione[s], 10);
    return `<div class="mega__in wrap">
  <div class="mega__main">
    <a class="mega__all" href="${hrefCat(s, "tutto")}">Vedi tutto ${C.generi[s]} <span class="n">${numero(tot)}</span></a>
    <ul class="mega__cats">${cats.map((x) => `<li><a href="${hrefCat(s, x.c)}">${esc(x.nome)} <span class="n">${x.n}</span></a></li>`).join("")}</ul>
  </div>
  <div class="mega__side">
    <p class="mega__h">Marche ${C.generi[s]}</p>
    <ul>${top.map((m) => `<li><a href="elenco.html?m=${m.slug}&amp;gen=${s}">${esc(m.nome)}</a></li>`).join("")}</ul>
    <a class="mega__more" href="marche.html">Tutte le marche ${ico("right")}</a>
  </div>
</div>`;
  }

  function headerHtml() {
    const s = document.body.dataset.sezione || "";
    const voce = (id, nome, href, conMega) => {
      const cur = s === id ? ' aria-current="page"' : "";
      if (!conMega) return `<div class="nav__item"><a class="nav__link" href="${href}"${cur}>${nome}</a></div>`;
      return `<div class="nav__item" data-mega>
  <a class="nav__link" href="${href}"${cur}>${nome}</a>
  <button type="button" class="nav__toggle" aria-expanded="false" aria-controls="mega-${id}" aria-label="Categorie ${nome}">${ico("down")}</button>
  <div class="mega" id="mega-${id}" hidden>${megaHtml(id)}</div>
</div>`;
    };
    return `
<a class="skip" href="#main">Vai al contenuto</a>
<header class="hdr">
  <div class="hdr__bar wrap">
    <button type="button" class="iconbtn hdr__menu" data-apri="menu" aria-controls="pannello-menu" aria-expanded="false" aria-label="Menu">${ico("menu")}</button>
    <a class="hdr__logo" href="index.html"><img src="assets/img/logo-parmax.png" alt="Parmax, vai alla pagina iniziale" width="900" height="150"></a>
    <nav class="nav" aria-label="Sezioni del negozio">
      ${voce("novita", "Novità", "elenco.html?s=novita")}
      ${voce("donna", "Donna", "elenco.html?s=donna", true)}
      ${voce("uomo", "Uomo", "elenco.html?s=uomo", true)}
      ${voce("outlet", "Outlet", "elenco.html?s=outlet", true)}
      ${voce("marche", "Marche", "marche.html")}
    </nav>
    <div class="hdr__side">
      <button type="button" class="iconbtn" data-apri="cerca" aria-controls="pannello-cerca" aria-expanded="false" aria-label="Cerca">${ico("search")}<span class="hdr__lbl">Cerca</span></button>
      <button type="button" class="iconbtn hdr__cart" data-apri="carrello" aria-controls="pannello-carrello" aria-expanded="false" aria-label="Carrello, vuoto">${ico("bag")}<span class="hdr__lbl">Carrello</span><span class="badge" data-cart-badge hidden>0</span></button>
    </div>
  </div>
</header>`;
  }

  /* mega-menu: al passaggio del mouse con un attimo di ritardo (Baymard, NN/g), al clic sulla freccia,
     e da tastiera solo quando lo si apre (W3C, menu a comparsa) */
  function initMega() {
    const voci = $$(".nav__item[data-mega]");
    let tApri, tChiudi;
    const apriMega = (v) => {
      voci.forEach((x) => x !== v && chiudiMega(x));
      $(".mega", v).hidden = false;
      $(".nav__toggle", v).setAttribute("aria-expanded", "true");
      v.classList.add("is-open");
    };
    const chiudiMega = (v) => {
      $(".mega", v).hidden = true;
      $(".nav__toggle", v).setAttribute("aria-expanded", "false");
      v.classList.remove("is-open");
    };
    voci.forEach((v) => {
      const t = $(".nav__toggle", v);
      t.addEventListener("click", () => ($(".mega", v).hidden ? apriMega(v) : chiudiMega(v)));
      v.addEventListener("mouseenter", () => {
        if (!HOVER.matches) return;
        clearTimeout(tChiudi);
        const gia = voci.some((x) => x.classList.contains("is-open"));
        clearTimeout(tApri);
        tApri = setTimeout(() => apriMega(v), gia ? 0 : 300);
      });
      v.addEventListener("mouseleave", () => {
        if (!HOVER.matches) return;
        clearTimeout(tApri);
        tChiudi = setTimeout(() => chiudiMega(v), 300);
      });
      v.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !$(".mega", v).hidden) {
          chiudiMega(v);
          t.focus();
        }
      });
      v.addEventListener("focusout", (e) => {
        if (!v.contains(e.relatedTarget)) chiudiMega(v);
      });
    });
  }

  /* ---------------------------------------------------------- pannelli */
  function menuHtml() {
    const s = document.body.dataset.sezione;
    const iniziale = ["donna", "uomo", "outlet"].includes(s) ? s : "donna";
    const lista = (sez, g) => {
      const filtro = inSezione[sez];
      const cats = categorieDi(filtro, g);
      const tot = conta((p) => filtro(p) && p.g === g);
      const tutto = sez === "outlet" ? `Vedi tutto l'outlet ${C.generi[g].toLowerCase()}` : `Vedi tutto ${C.generi[g]}`;
      return `<ul class="mlist">
  <li><a class="mlist__all" href="${hrefCat(sez, "tutto", sez === "outlet" ? g : "")}">${tutto} <span class="n">${numero(tot)}</span></a></li>
  ${cats.map((x) => `<li><a href="${hrefCat(sez, x.c, sez === "outlet" ? g : "")}">${esc(x.nome)} <span class="n">${x.n}</span></a></li>`).join("")}
</ul>`;
    };
    const schede = [
      ["donna", "Donna", lista("donna", "donna")],
      ["uomo", "Uomo", lista("uomo", "uomo")],
      [
        "outlet",
        "Outlet",
        ["donna", "uomo", "bambina", "bambino"]
          .filter((g) => conta((p) => p.o && p.g === g))
          .map((g) => `<p class="mlist__h">${C.generi[g]}</p>${lista("outlet", g)}`)
          .join("")
      ]
    ];
    return `
<dialog class="panel panel--left" id="pannello-menu" aria-label="Menu">
  <div class="panel__in">
    <div class="panel__head">
      <img class="panel__logo" src="assets/img/logo-parmax.png" alt="" width="900" height="150">
      <button type="button" class="iconbtn" data-chiudi aria-label="Chiudi il menu">${ico("close")}</button>
    </div>
    <div class="panel__body">
      <a class="mrow" href="elenco.html?s=novita" data-fuoco>Novità ${ico("right")}</a>
      <div class="mtabs" role="tablist" aria-label="Reparti">
        ${schede
          .map(
            ([id, nome]) =>
              `<button type="button" role="tab" id="tab-${id}" aria-controls="tp-${id}" aria-selected="${id === iniziale}" tabindex="${id === iniziale ? 0 : -1}">${nome}</button>`
          )
          .join("")}
      </div>
      ${schede.map(([id, , html]) => `<div class="mtab" role="tabpanel" id="tp-${id}" aria-labelledby="tab-${id}"${id === iniziale ? "" : " hidden"}>${html}</div>`).join("")}
      <a class="mrow" href="marche.html">Marche ${ico("right")}</a>
      <div class="mextra">
        <a href="info.html#spedizioni">Spedizioni</a>
        <a href="info.html#resi">Resi e cambi</a>
        <a href="info.html#assistenza">Assistenza</a>
        <a href="info.html#negozi">I negozi a Spoleto</a>
        <a href="chi-siamo.html">Chi siamo</a>
        <a href="${N.shopify}/account" target="_blank" rel="noopener">Il tuo account${NUOVA_SCHEDA}</a>
      </div>
      <div class="mcontatti">
        <a href="${wa(WA_SITO)}" target="_blank" rel="noopener">${WA_ICO} WhatsApp ${esc(N.wa)}${NUOVA_SCHEDA}</a>
        <a href="${N.telHref}">${ico("phone")} ${esc(N.tel)}</a>
      </div>
    </div>
  </div>
</dialog>`;
  }

  function cercaHtml() {
    return `
<dialog class="panel panel--top" id="pannello-cerca" aria-label="Cerca nel negozio">
  <div class="panel__in">
    <form class="cerca wrap" action="elenco.html" role="search">
      ${ico("search")}
      <label class="sr" for="cerca-q">Cerca un capo, una marca o una categoria</label>
      <input class="cerca__in" id="cerca-q" type="search" name="q" placeholder="Cerca: piumino, Pinko, jeans uomo…" autocomplete="off" data-fuoco>
      <button type="button" class="iconbtn" data-chiudi aria-label="Chiudi la ricerca">${ico("close")}</button>
    </form>
    <div class="cerca__out wrap" data-cerca-out></div>
  </div>
</dialog>`;
  }

  function carrelloHtml() {
    return `
<dialog class="panel panel--right" id="pannello-carrello" aria-label="Carrello">
  <div class="panel__in">
    <div class="panel__head">
      <h2 class="panel__title">Carrello</h2>
      <button type="button" class="iconbtn" data-chiudi aria-label="Chiudi il carrello">${ico("close")}</button>
    </div>
    <div class="panel__body" data-cart-body></div>
    <div class="panel__foot" data-cart-foot hidden>
      <div class="somma">
        <div><span>Prodotti</span><span data-cart-prod></span></div>
        <div><span>Spedizione in Italia</span><span data-cart-sped></span></div>
        <div class="somma__tot"><span>Totale <small>IVA inclusa</small></span><span data-cart-tot></span></div>
      </div>
      <p class="somma__nota" data-cart-nota></p>
      <a class="btn btn--primario btn--pieno" data-cassa href="#">Vai alla cassa</a>
      <p class="somma__cassa">Pagamento sulla cassa sicura di parmax.com: carta, PayPal, Klarna, Scalapay, bonifico o contrassegno (+4 €).</p>
    </div>
  </div>
</dialog>`;
  }

  function footerHtml() {
    const r = D.recensioni || {};
    return `
<footer class="ftr">
  <div class="ftr__servizi wrap">
    <div>${ico("truck")}<p><strong>Spedizione gratuita in Italia sopra ${C.spedizione.gratisDa} €</strong><span>Altrimenti ${C.spedizione.italia} €. Consegna in 1-2 giorni lavorativi per ordini entro le 10.</span></p></div>
    <div>${ico("swap")}<p><strong>Cambio taglia gratuito entro 14 giorni</strong><span>Il primo cambio o la sostituzione: il ritiro lo organizziamo noi.</span></p></div>
    <div>${ico("return")}<p><strong>Reso entro 14 giorni</strong><span>Senza cambio, la spedizione di ritorno è a tuo carico.</span></p></div>
  </div>
  <div class="ftr__grid wrap">
    <div class="ftr__col">
      <img class="ftr__logo" src="assets/img/logo-parmax.png" alt="Parmax" width="900" height="150" loading="lazy">
      <p>${N.negozi.map((n) => `<a href="${n.mappa}" target="_blank" rel="noopener">${esc(n.nome)}<span>${esc(n.via)}</span>${NUOVA_SCHEDA}</a>`).join("")}</p>
    </div>
    <div class="ftr__col">
      <h2 class="ftr__h">Assistenza</h2>
      <ul>
        <li><a href="${wa(WA_SITO)}" target="_blank" rel="noopener">WhatsApp ${esc(N.wa)}${NUOVA_SCHEDA}</a></li>
        <li><a href="${N.telHref}">Tel. ${esc(N.tel)}</a></li>
        <li><a href="mailto:${N.email}">${esc(N.email)}</a></li>
        <li class="ftr__orari">${N.orari.map(esc).join("<br>")}</li>
      </ul>
    </div>
    <div class="ftr__col">
      <h2 class="ftr__h">Ordini e resi</h2>
      <ul>
        <li><a href="info.html#spedizioni">Spedizioni</a></li>
        <li><a href="info.html#resi">Resi e rimborsi</a></li>
        <li><a href="${N.shopify}/account" target="_blank" rel="noopener">Il tuo account e richiesta reso${NUOVA_SCHEDA}</a></li>
        <li><a href="prodotto.html?p=gift-card-parmax-fashion">Gift card</a></li>
      </ul>
    </div>
    <div class="ftr__col">
      <h2 class="ftr__h">Parmax</h2>
      <ul>
        <li><a href="chi-siamo.html">Chi siamo</a></li>
        <li><a href="info.html#negozi">I negozi a Spoleto</a></li>
        <li><a href="${N.social.instagram}" target="_blank" rel="noopener">Instagram${NUOVA_SCHEDA}</a></li>
        <li><a href="${N.social.facebook}" target="_blank" rel="noopener">Facebook${NUOVA_SCHEDA}</a></li>
        <li><a href="${N.social.tiktok}" target="_blank" rel="noopener">TikTok${NUOVA_SCHEDA}</a></li>
        ${r.google ? `<li><a href="${r.google}" target="_blank" rel="noopener">${numero(r.totale)} recensioni su Google${NUOVA_SCHEDA}</a></li>` : ""}
      </ul>
    </div>
  </div>
  <div class="ftr__legal wrap">
    <p>© <span data-anno></span> ${esc(N.ragioneSociale)} · ${esc(N.sede)} · P.IVA ${esc(N.piva)} · REA ${esc(N.rea)}</p>
    <p class="ftr__links">
      <a href="${N.shopify}/pages/termini-condizioni" target="_blank" rel="noopener">Termini e condizioni${NUOVA_SCHEDA}</a>
      <a href="${N.shopify}/policies/privacy-policy" target="_blank" rel="noopener">Privacy${NUOVA_SCHEDA}</a>
      <a href="${N.shopify}/pages/trasparenza-utilizzo-ai" target="_blank" rel="noopener">Trasparenza sull'uso dell'IA${NUOVA_SCHEDA}</a>
    </p>
    <div class="tema" role="group" aria-label="Versione del sito da provare">
      <span>Anteprima:</span>
      <button type="button" data-tema="classica" aria-pressed="${tema() === "classica"}">Classica</button>
      <button type="button" data-tema="rinnovata" aria-pressed="${tema() === "rinnovata"}">Rinnovata</button>
    </div>
  </div>
</footer>
<div class="toasts" aria-live="polite"></div>
<div class="sr" aria-live="polite" data-voce></div>`;
  }

  /* ------------------------------------------------------------- render */
  const render = {
    carrello() {
      const n = Cart.pezzi();
      $$("[data-cart-badge]").forEach((e) => {
        e.textContent = n;
        e.hidden = n === 0;
      });
      $$(".hdr__cart").forEach((b) => b.setAttribute("aria-label", n ? `Carrello, ${n} ${n === 1 ? "articolo" : "articoli"}` : "Carrello, vuoto"));
      const body = $("[data-cart-body]");
      if (!body) return;
      const foot = $("[data-cart-foot]");
      if (!Cart.righe.length) {
        body.innerHTML = `
<div class="vuoto">
  <p class="vuoto__t">Il carrello è vuoto</p>
  <p>Le ultime novità e l'outlet sono un buon punto di partenza.</p>
  <p class="vuoto__link"><a class="btn btn--linea" href="elenco.html?s=novita">Novità</a><a class="btn btn--linea" href="elenco.html?s=outlet">Outlet</a></p>
</div>`;
        foot.hidden = true;
        return;
      }
      body.innerHTML = `<ul class="righe">${Cart.righe
        .map((r) => {
          const z = prezzo(r);
          return `<li class="riga${r.esaurita ? " riga--esaurita" : ""}">
  <a class="riga__img" href="prodotto.html?p=${encodeURIComponent(r.h)}" tabindex="-1" aria-hidden="true"><img src="${foto(r.i, 160)}" alt="" width="80" height="120" loading="lazy"></a>
  <div class="riga__b">
    <p class="riga__m">${esc(r.m)}</p>
    <a class="riga__n" href="prodotto.html?p=${encodeURIComponent(r.h)}">${esc(nomeCapo(r))}</a>
    <p class="riga__var">${[r.k, r.z ? (r.etichetta || "Taglia") + " " + r.z : ""].filter(Boolean).map(esc).join(" · ")}</p>
    ${r.esaurita ? `<p class="riga__avviso">Questa taglia non è più disponibile: non passerà alla cassa.</p>` : ""}
    <div class="riga__row">
      <span class="stepper">
        <button type="button" data-qta="${r.v}" data-d="-1" aria-label="Uno in meno: ${esc(nomeCapo(r))} ${esc(r.z)}">${ico("minus")}</button>
        <span class="stepper__n" aria-live="polite">${r.q}</span>
        <button type="button" data-qta="${r.v}" data-d="1" aria-label="Uno in più: ${esc(nomeCapo(r))} ${esc(r.z)}"${r.q >= 10 ? " disabled" : ""}>${ico("plus")}</button>
      </span>
      <span class="riga__p">${z.pct ? `<s>${euro(z.pieno * r.q)}</s> ` : ""}${euro(z.finale * r.q)}</span>
    </div>
    <button type="button" class="link-rimuovi" data-rimuovi="${r.v}">Rimuovi<span class="sr"> ${esc(nomeCapo(r))} taglia ${esc(r.z)}</span></button>
  </div>
</li>`;
        })
        .join("")}</ul>`;
      foot.hidden = false;
      const sped = Cart.spedizione();
      $("[data-cart-prod]").textContent = euro(Cart.totale());
      $("[data-cart-sped]").textContent = sped ? euro(sped) : "Gratis";
      $("[data-cart-tot]").textContent = euro(Cart.totale() + sped);
      $("[data-cart-nota]").textContent = sped
        ? `Ti mancano ${euro(C.spedizione.gratisDa - Cart.totale())} per la spedizione gratuita in Italia.`
        : "La spedizione in Italia è gratuita.";
      const cassa = $("[data-cassa]");
      cassa.href = Cart.validi().length ? Cart.cassa() : "#";
      cassa.classList.toggle("is-off", !Cart.validi().length);
    },
    /* ogni pulsante "Aggiungi al carrello" della pagina segue la quantità della sua taglia */
    pulsanti() {
      $$("[data-addq]").forEach((box) => aggiornaAddq(box));
    }
  };

  /* ------------------------------------------------------------ ricerca */
  /* Cerca in marca, nome, colore, categoria e reparto. Ogni parola deve comparire da qualche parte;
     plurali e singolari si trovano togliendo l'ultima vocale; i sinonimi più comuni sono qui sotto. */
  const SINONIMI = {
    giubbotto: "capispalla", giubbotti: "capispalla", piumino: "capispalla", piumini: "capispalla", cappotto: "capispalla",
    cappotti: "capispalla", parka: "capispalla", giacca: "giacche", giacconi: "capispalla", maglione: "maglie",
    maglioni: "maglie", maglieria: "maglie", pullover: "maglie", cardigan: "maglie", borsa: "accessori", borse: "accessori",
    cintura: "accessori", cappello: "accessori", sciarpa: "accessori", zaino: "accessori", sneaker: "scarpe", sneakers: "scarpe",
    stivali: "scarpe", stivaletti: "scarpe", mocassini: "scarpe", scarpe: "scarpe", tshirt: "t-shirt", maglietta: "t-shirt",
    polo: "t-shirt", camicia: "camicie", blusa: "camicie", vestito: "abiti", vestiti: "abiti", abito: "abiti", gonna: "gonne",
    pantalone: "pantaloni", jeans: "jeans", felpa: "felpe", bambini: "bambin", bimbo: "bambino", bimba: "bambina"
  };
  const radice = (w) => (w.length >= 4 ? w.replace(/[aeio]$/, "") : w);
  const testoRicerca = new Map();
  function testoDi(p) {
    if (!testoRicerca.has(p.h))
      testoRicerca.set(
        p.h,
        norm([p.m, p.t, p.k, p.u, nomeCategoria(p.g, p.c), p.c, p.g, C.generi[p.g], p.o ? "outlet" : "", p.n ? "novita" : ""].join(" "))
      );
    return testoRicerca.get(p.h);
  }
  function parole(q) {
    return norm(q)
      .replace(/[^a-z0-9àèéìòù\- ]+/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1 && !["di", "da", "in", "per", "con", "il", "la", "le", "lo", "gli", "i", "e"].includes(w));
  }
  /* prima le parole così come sono scritte; i sinonimi solo se così non si trova niente
     ("pinko borsa" deve dare le borse, non tutti gli accessori Pinko) */
  function cerca(q) {
    const ws = parole(q);
    if (!ws.length) return [];
    const esatti = P.filter((p) => ws.every((w) => testoDi(p).includes(radice(w))));
    /* in cima i capi che hanno le parole nel nome, poi quelli trovati per categoria o colore */
    const nelNome = (p) => ws.every((w) => norm(p.m + " " + p.t).includes(radice(w)));
    if (esatti.length) return esatti.filter(nelNome).concat(esatti.filter((p) => !nelNome(p)));
    return P.filter((p) => {
      const t = testoDi(p);
      return ws.every((w) => t.includes(radice(w)) || (SINONIMI[w] && t.includes(SINONIMI[w])));
    });
  }
  /* se non trova niente prova una marca scritta male (una o due lettere sbagliate) */
  function distanza(a, b) {
    const m = [];
    for (let i = 0; i <= a.length; i++) m[i] = [i];
    for (let j = 0; j <= b.length; j++) m[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++) m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return m[a.length][b.length];
  }
  function marcaSimile(q) {
    const w = norm(q).replace(/[^a-z0-9]/g, "");
    if (w.length < 4) return null;
    let meglio = null;
    MARCHE.forEach((m) => {
      const d = distanza(w, m.nome.toLowerCase().replace(/[^a-z0-9]/g, ""));
      if (d <= (w.length > 6 ? 2 : 1) && (!meglio || d < meglio.d)) meglio = { m, d };
    });
    return meglio && meglio.m;
  }

  function initCerca() {
    const input = $("#cerca-q");
    const out = $("[data-cerca-out]");
    if (!input) return;
    const suggerimenti = () => `
<div class="cerca__sugg">
  <p class="cerca__h">Scorciatoie</p>
  <p class="chips"><a class="chip" href="elenco.html?s=novita">Novità</a><a class="chip" href="elenco.html?s=outlet">Outlet fino al −${MAX_OUTLET}%</a><a class="chip" href="elenco.html?s=donna&c=capispalla">Capispalla donna</a><a class="chip" href="elenco.html?s=uomo&c=maglie">Maglieria uomo</a><a class="chip" href="marche.html">Tutte le marche</a></p>
</div>`;
    let t;
    const esegui = () => {
      const q = input.value.trim();
      if (q.length < 2) {
        out.innerHTML = suggerimenti();
        return;
      }
      const ris = cerca(q);
      const marche = MARCHE.filter((m) => norm(m.nome).includes(norm(q))).slice(0, 5);
      const mod = modelli(ris).slice(0, 6);
      if (!ris.length && !marche.length) {
        const simile = marcaSimile(q);
        out.innerHTML = `
<div class="cerca__zero">
  <p class="cerca__h">Nessun capo trovato per “${esc(q)}”</p>
  ${simile ? `<p>Forse cercavi <a href="elenco.html?m=${simile.slug}">${esc(simile.nome)}</a>?</p>` : ""}
  <p>Prova con una parola sola, una marca o una categoria, oppure <a href="${wa(WA_SITO + ". Cerco: " + q)}" target="_blank" rel="noopener">chiedi al negozio su WhatsApp${NUOVA_SCHEDA}</a>.</p>
</div>${suggerimenti()}`;
        annuncia("Nessun risultato");
        return;
      }
      out.innerHTML = `
${marche.length ? `<div class="cerca__marche"><p class="cerca__h">Marche</p><p class="chips">${marche.map((m) => `<a class="chip" href="elenco.html?m=${m.slug}">${esc(m.nome)} <span class="n">${m.n}</span></a>`).join("")}</p></div>` : ""}
${mod.length ? `<p class="cerca__h">Capi</p><ul class="cerca__lista">${mod
          .map((g) => {
            const p = g[0];
            return `<li><a href="prodotto.html?p=${encodeURIComponent(p.h)}"><img src="${foto(p.i[0], 120)}" alt="" width="60" height="90" loading="lazy"><span><span class="cerca__m">${esc(p.m)}</span><span class="cerca__n">${esc(nomeCapo(p))}</span>${prezzoHtml(p)}</span></a></li>`;
          })
          .join("")}</ul>` : ""}
${ris.length ? `<a class="btn btn--primario cerca__tutti" href="elenco.html?q=${encodeURIComponent(q)}">Vedi tutti i ${numero(modelli(ris).length)} risultati</a>` : ""}`;
      annuncia(`${modelli(ris).length} risultati`);
    };
    input.addEventListener("input", () => {
      clearTimeout(t);
      t = setTimeout(esegui, 120);
    });
    /* nel campo di ricerca il primo Esc del browser svuota solo il testo: qui chiude il pannello, come ovunque */
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        input.closest("dialog").close();
      }
    });
    out.innerHTML = suggerimenti();
    if (PAGINA === "elenco" && PARAM.get("q")) input.value = PARAM.get("q");
  }

  /* -------------------------------------------------------------- schede */
  /* Una scheda per modello: i colori dello stesso capo (campo q) stanno nella stessa scheda come miniature.
     `membri` sono i colori che passano i filtri, nell'ordine dell'elenco. */
  function modelli(lista) {
    const visti = new Map();
    const out = [];
    lista.forEach((p) => {
      const k = p.q ? "q" + p.q : "h" + p.h;
      if (visti.has(k)) return visti.get(k).push(p);
      const g = [p];
      visti.set(k, g);
      out.push(g);
    });
    return out;
  }

  function scheda(membri, opz) {
    opz = opz || {};
    const lv = opz.lv || 3;
    return `<article class="card" data-card data-lv="${lv}" data-membri="${esc(membri.map((p) => p.h).join(" "))}">${schedaDentro(membri[0], membri, lv, opz)}</article>`;
  }
  function schedaDentro(p, membri, lv, opz) {
    const taglie = taglieDi(p);
    const evid = opz.taglie || null;
    const alt = `${p.m} ${nomeCapo(p)}, ${colorePrincipale(p)}`;
    const altri =
      membri.length > 1
        ? `<div class="card__col" role="group" aria-label="${membri.length} colori">${membri
            .slice(0, 5)
            .map(
              (m) =>
                `<button type="button" class="card__sw${m === p ? " is-on" : ""}" data-sw="${esc(m.h)}" aria-pressed="${m === p}" aria-label="${esc(colorePrincipale(m))}"><img src="${foto(m.i[0], 60)}" alt="" width="24" height="36" loading="lazy"></button>`
            )
            .join("")}${membri.length > 5 ? `<span class="card__piu">+${membri.length - 5}</span>` : ""}</div>`
        : "";
    const tagl = taglie.length && !(taglie.length === 1 && taglie[0] === "TU")
      ? `<p class="card__taglie"><span class="sr">Taglie disponibili: </span>${taglie
          .map((z) => `<span${evid && evid.has(chiaveTaglia(p, z)) ? ' class="is-on"' : ""}>${esc(z)}</span>`)
          .join(" ")}</p>`
      : "";
    return `
<div class="card__media">
  <img class="card__img" src="${foto(p.i[0], 480)}" srcset="${srcset(p.i[0], [240, 360, 480, 720])}" sizes="(min-width:1120px) 22vw, (min-width:760px) 30vw, 46vw" alt="${esc(alt)}" width="480" height="720" loading="${opz.subito ? "eager" : "lazy"}" decoding="async">
  ${p.i[1] ? `<img class="card__img2" src="${foto(p.i[1], 480)}" alt="" width="480" height="720" loading="lazy" decoding="async">` : ""}
  ${/* lo sconto si legge accanto al prezzo: sulla foto niente bollino doppio */ !prezzo(p).pct && p.n && opz.novita !== false ? `<span class="card__badge">Novità</span>` : ""}
</div>
<div class="card__b">
  <p class="card__m">${esc(p.m)}</p>
  <h${lv} class="card__n"><a href="prodotto.html?p=${encodeURIComponent(p.h)}">${esc(nomeCapo(p))}<span class="sr">, ${esc(colorePrincipale(p))}</span></a></h${lv}>
  <p class="card__p">${prezzoHtml(p)}</p>
  ${tagl}
  ${altri}
</div>`;
  }
  /* clic su un colore: la scheda mostra quel colore (foto, prezzo, taglie, link) senza cambiare pagina */
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-sw]");
    if (!b) return;
    const card = b.closest("[data-card]");
    const membri = card.dataset.membri.split(" ").map((h) => perHandle.get(h)).filter(Boolean);
    const p = perHandle.get(b.dataset.sw);
    if (!p) return;
    card.innerHTML = schedaDentro(p, membri, Number(card.dataset.lv) || 3, { taglie: statoTaglie() });
    const nb = card.querySelector(`[data-sw="${CSS.escape(p.h)}"]`);
    if (nb) nb.focus();
  });
  let statoTaglie = () => null;

  const rail = (titolo, href, gruppi, id, lv, opzCard) =>
    gruppi.length
      ? `<section class="rail wrap" aria-labelledby="${id}">
  <div class="rail__head"><h2 class="h2" id="${id}">${titolo}</h2>${href ? `<a class="link-freccia" href="${href}">Vedi tutti ${ico("right")}</a>` : ""}</div>
  <div class="rail__track" tabindex="0" role="region" aria-label="${esc(titolo)}, scorri di lato">${gruppi.map((g) => scheda(g, Object.assign({ lv: lv || 3 }, opzCard))).join("")}</div>
</section>`
      : "";

  /* ------------------------------------------------------ pulsante carrello */
  /* "Aggiungi al carrello" e il contatore − n + stanno nella stessa scatola, che non cambia misura
     (regola del metodo). Il riquadro sa quale variante ha scelto dalla scheda (data-v). */
  function addqHtml() {
    return `<div class="addq" data-addq>
  <button type="button" class="btn btn--primario addq__go" data-add>Aggiungi al carrello</button>
  <span class="addq__s" hidden>
    <button type="button" data-addq-d="-1" aria-label="Uno in meno">${ico("minus")}</button>
    <span class="addq__n" aria-live="polite">1</span>
    <button type="button" data-addq-d="1" aria-label="Uno in più">${ico("plus")}</button>
  </span>
</div>`;
  }
  function aggiornaAddq(box) {
    const v = box.dataset.v;
    const n = v ? Cart.qta(v) : 0;
    const go = $(".addq__go", box);
    const st = $(".addq__s", box);
    go.hidden = n > 0;
    st.hidden = !n;
    box.classList.toggle("addq--on", n > 0);
    if (n) {
      $(".addq__n", st).textContent = n + " nel carrello";
      $('[data-addq-d="1"]', st).disabled = n >= 10;
    }
  }

  /* --------------------------------------------------------- briciole */
  const briciole = (voci) =>
    `<nav class="bc wrap" aria-label="Sei qui"><ol>${voci
      .map((v, i) => (i < voci.length - 1 ? `<li><a href="${v[1]}">${esc(v[0])}</a></li>` : `<li><span aria-current="page">${esc(v[0])}</span></li>`))
      .join("")}</ol></nav>`;

  /* ================================================================ HOME */
  function mountHome() {
    const main = $("#main");
    const perMarca = (gruppi, max) => {
      const n = {};
      return gruppi.filter((g) => (n[g[0].m] = (n[g[0].m] || 0) + 1) <= max);
    };
    const nov = perMarca(modelli(P.filter((p) => p.n)), 2).slice(0, 12);
    const outlet = perMarca(modelli(P.filter((p) => p.o && (p.g === "donna" || p.g === "uomo")).sort((a, b) => prezzo(b).pct - prezzo(a).pct || (b.d > a.d ? 1 : -1))), 2).slice(0, 12);
    const tot = { donna: conta(inSezione.donna), uomo: conta(inSezione.uomo), outlet: conta(inSezione.outlet), novita: conta((p) => p.n) };

    const hero = tema() === "rinnovata" ? heroCartellone(tot) : heroClassica(tot);
    const tessere = (g) =>
      categorieDi(inSezione[g], g)
        .slice(0, 10)
        .map((x) => {
          const p = P.find((y) => inSezione[g](y) && y.g === g && y.c === x.c);
          return `<a class="tessera" href="${hrefCat(g, x.c)}"><span class="tessera__img"><img src="${foto(p.i[0], 360)}" alt="" width="240" height="360" loading="lazy"></span><span class="tessera__t">${esc(x.nome)}</span><span class="tessera__n">${x.n} capi</span></a>`;
        })
        .join("");
    const rec = D.recensioni || { elenco: [] };
    /* in home le prime sei, nell'ordine in cui arrivano (per data, non scelte): le altre con un tocco */
    const REC_SUBITO = 6;
    const stelle = (n) => `<span class="stelle" role="img" aria-label="${n} stelle su 5">${[1, 2, 3, 4, 5].map((k) => `<svg class="ico${k <= n ? " on" : ""}" aria-hidden="true"><use href="#i-star"></use></svg>`).join("")}</span>`;

    main.innerHTML = `
${hero}
${rail("Novità", "elenco.html?s=novita", nov, "t-nov", 3, { novita: false })}
<section class="outlet-band" aria-labelledby="t-out">
  <div class="outlet-band__img"><picture><source media="(max-width: 759px)" srcset="${foto(N.foto.outletVerticale, 800)}"><img src="${foto(N.foto.outlet, 1600)}" alt="Un modello con una giacca K-Way nera sotto la pioggia" width="1600" height="800" loading="lazy"></picture></div>
  <div class="outlet-band__t wrap">
    <h2 class="h1" id="t-out">Outlet Parmax</h2>
    <p>Abbigliamento firmato fino al −${MAX_OUTLET}%, per donna, uomo e bambino.</p>
    <p class="outlet-band__link"><a class="btn btn--chiaro" href="${hrefCat("outlet", "tutto", "donna")}">Outlet donna</a><a class="btn btn--chiaro" href="${hrefCat("outlet", "tutto", "uomo")}">Outlet uomo</a><a class="btn btn--chiaro" href="elenco.html?s=outlet">Bambino e bambina</a></p>
  </div>
</section>
${rail("In outlet adesso", "elenco.html?s=outlet", outlet, "t-outr")}
<section class="reparti wrap" aria-labelledby="t-rep">
  <h2 class="h2" id="t-rep">Cerca per categoria</h2>
  <div class="reparti__g">
    <div><h3 class="reparti__h"><a href="elenco.html?s=donna">Donna</a></h3><div class="tessere">${tessere("donna")}</div></div>
    <div><h3 class="reparti__h"><a href="elenco.html?s=uomo">Uomo</a></h3><div class="tessere">${tessere("uomo")}</div></div>
  </div>
</section>
<section class="negozi wrap" aria-labelledby="t-neg">
  <div class="negozi__img"><img src="${foto(N.foto.negozioBn, 900)}" srcset="${srcset(N.foto.negozioBn, [600, 900, 1086])}" sizes="(min-width:760px) 45vw, 100vw" alt="L'interno di uno dei negozi di Spoleto, in bianco e nero: capi appesi lungo le pareti e un divano al centro" width="900" height="1200" loading="lazy"></div>
  <div class="negozi__t">
    <h2 class="h1" id="t-neg">Due negozi a Spoleto</h2>
    <p>Dal 1985 nel cuore del centro storico di Spoleto: 350 m² nello store L'Arca e 600 m² nel nostro outlet. Online dal 2012.</p>
    <ul class="negozi__l">${N.negozi.map((n) => `<li>${ico("pin")}<span><strong>${esc(n.nome)}</strong> ${esc(n.via)}<br><a href="${n.mappa}" target="_blank" rel="noopener">Indicazioni${NUOVA_SCHEDA}</a></span></li>`).join("")}</ul>
    <a class="link-freccia" href="chi-siamo.html">La nostra storia ${ico("right")}</a>
  </div>
</section>
${
  rec.elenco && rec.elenco.length
    ? `<section class="recensioni wrap" aria-labelledby="t-rec">
  <div class="recensioni__head">
    <h2 class="h2" id="t-rec">Dicono di noi</h2>
    <p>${numero(rec.totale)} recensioni su Google. Qui le ${rec.elenco.length} più recenti, così come sono.</p>
  </div>
  <ul class="recensioni__l">${rec.elenco
    .map(
      (r, i) => `<li class="rec${r.testo ? "" : " rec--solo"}"${i >= REC_SUBITO ? " hidden" : ""}>${stelle(r.stelle)}<p class="rec__chi"><strong>${esc(r.nome)}</strong> · <time datetime="${r.data}">${data(r.data)}</time></p>${r.testo ? `<p class="rec__t">${esc(r.testo).replace(/\n/g, "<br>")}</p>` : `<p class="rec__t rec__t--vuoto">Solo il voto, senza testo.</p>`}</li>`
    )
    .join("")}</ul>
  ${rec.elenco.length > REC_SUBITO ? `<p class="recensioni__piu"><button type="button" class="btn btn--linea" data-rec-tutte>Mostra tutte le ${rec.elenco.length} recensioni</button></p>` : ""}
  <p class="recensioni__nota">Le recensioni sono pubblicate su Google e raccolte dal servizio Trustindex, che verifica solo che vengano da Google: non sappiamo se chi scrive ha comprato da noi. Le mostriamo tutte, anche le meno positive. <a href="${rec.google}" target="_blank" rel="noopener">Leggile tutte su Google${NUOVA_SCHEDA}</a></p>
</section>`
    : ""
}`;
    const tutte = $("[data-rec-tutte]", main);
    if (tutte)
      tutte.addEventListener("click", () => {
        const nascoste = $$(".rec[hidden]", main);
        nascoste.forEach((li) => (li.hidden = false));
        tutte.parentElement.remove();
        /* il fuoco va alla prima recensione comparsa: chi usa la tastiera o il lettore di schermo riparte da lì */
        nascoste[0].tabIndex = -1;
        nascoste[0].focus({ preventScroll: true });
      });
  }

  /* hero "classica": le due foto di campagna del negozio (portano alle novità di donna e di uomo) e le quattro porte.
     Le foto sono quadrate e riempiono un riquadro più alto che largo: la misura da scaricare è l'altezza del riquadro */
  function heroClassica(tot) {
    return `<section class="hero-c" aria-labelledby="t-hero">
  <div class="hero-c__img">${["donna", "uomo"]
    .map(
      (g) =>
        `<a href="elenco.html?s=novita&gen=${g}"><img src="${foto(N.foto.campagna[g], 900)}" srcset="${srcset(N.foto.campagna[g], [400, 600, 900, 1254])}" sizes="(min-width:1000px) 55vw, (min-width:760px) 58vw, 80vw" alt="Novità ${g}" width="900" height="900" fetchpriority="high"></a>`
    )
    .join("")}</div>
  <div class="hero-c__t">
    <h1 class="hero-c__h" id="t-hero">Abbigliamento firmato, da Spoleto</h1>
    <p class="hero-c__sub">Oltre 80 brand selezionati per uomo e donna, spediti dal nostro magazzino in 1-2 giorni lavorativi.</p>
    <ul class="porte">
      <li><a href="elenco.html?s=donna"><span>Donna</span><span class="n">${numero(tot.donna)} capi</span>${ico("right")}</a></li>
      <li><a href="elenco.html?s=uomo"><span>Uomo</span><span class="n">${numero(tot.uomo)} capi</span>${ico("right")}</a></li>
      <li><a href="elenco.html?s=outlet"><span>Outlet</span><span class="n">fino al −${MAX_OUTLET}%</span>${ico("right")}</a></li>
      <li><a href="elenco.html?s=novita"><span>Novità</span><span class="n">${numero(tot.novita)} capi</span>${ico("right")}</a></li>
    </ul>
  </div>
</section>`;
  }

  /* hero "rinnovata": il cartellone. Reparti in testa come gli artisti principali,
     poi le marche in ordine di quanti capi hanno davvero in negozio (dati di prodotti.js) */
  function heroCartellone(tot) {
    const marche = MARCHE.slice().sort((a, b) => b.n - a.n);
    const fila = (da, a, cls) =>
      `<p class="bill__row ${cls}">${marche
        .slice(da, a)
        .map((m) => `<a href="elenco.html?m=${m.slug}">${esc(m.nome)}</a>`)
        .join(" ")}</p>`;
    return `<section class="bill" aria-labelledby="t-hero">
  <div class="bill__in wrap">
    <h1 class="sr" id="t-hero">Parmax, abbigliamento firmato da Spoleto: ${numero(MARCHE.length)} marche per donna, uomo e bambino</h1>
    <ul class="bill__head">
      <li><a href="elenco.html?s=donna">Donna<sup>${numero(tot.donna)}</sup></a></li>
      <li><a href="elenco.html?s=uomo">Uomo<sup>${numero(tot.uomo)}</sup></a></li>
      <li><a href="elenco.html?s=outlet">Outlet<sup>−${MAX_OUTLET}%</sup></a></li>
    </ul>
    ${fila(0, 4, "bill__row--l")}
    ${fila(4, 12, "bill__row--m")}
    ${fila(12, 28, "bill__row--s")}
    ${fila(28, 70, "bill__row--xs")}
    <p class="bill__foot"><a href="marche.html">e altre ${numero(Math.max(0, marche.length - 70))} marche ${ico("right")}</a><span>Spoleto · dal 1985 · spedizione gratuita in Italia sopra ${C.spedizione.gratisDa} €</span></p>
  </div>
</section>`;
  }

  /* ============================================================== ELENCO */
  const PER_PAGINA = () => (DESKTOP.matches ? 48 : 24);
  const ORDINI = [
    ["recenti", "Più recenti"],
    ["prezzo-su", "Prezzo più basso"],
    ["prezzo-giu", "Prezzo più alto"],
    ["sconto", "Sconto più alto"]
  ];

  function mountElenco() {
    const main = $("#main");
    const s = PARAM.get("s") || "";
    const c = PARAM.get("c") || "";
    const g = PARAM.get("g") || "";
    const m = PARAM.get("m") || "";
    const q = (PARAM.get("q") || "").trim();
    document.body.dataset.sezione = s || (m ? "marche" : "");

    /* pagine "hub" di Donna, Uomo e Outlet: solo le categorie (Baymard, pagine intermedie leggere) */
    if ((s === "donna" || s === "uomo" || s === "outlet") && !c) return mountHub(s);

    let base;
    let titolo;
    let bc = [["Home", "index.html"]];
    if (q) {
      base = cerca(q);
      titolo = `Risultati per “${q}”`;
      bc.push(["Ricerca", "elenco.html?q=" + encodeURIComponent(q)]);
    } else if (m) {
      const marca = marcaDa(m);
      base = P.filter((p) => slug(p.m) === m);
      titolo = marca ? marca.nome : "Marca";
      bc.push(["Marche", "marche.html"], [titolo, ""]);
    } else if (s === "novita") {
      base = P.filter((p) => p.n);
      titolo = "Novità";
      bc.push([titolo, ""]);
    } else if (s === "donna" || s === "uomo") {
      base = P.filter((p) => inSezione[s](p) && (c === "tutto" || p.c === c));
      titolo = c === "tutto" ? "Tutto " + C.generi[s] : nomeCategoria(s, c) + " " + s;
      bc.push([C.generi[s], "elenco.html?s=" + s]);
      if (c !== "tutto") bc.push([nomeCategoria(s, c), ""]);
      else bc.push(["Vedi tutto", ""]);
    } else if (s === "outlet") {
      base = P.filter((p) => p.o && (!g || p.g === g) && (c === "tutto" || p.c === c));
      const gen = g ? C.generi[g].toLowerCase() : "";
      titolo = c === "tutto" ? "Outlet" + (gen ? " " + gen : "") : nomeCategoria(g, c) + (gen ? " " + gen : "") + " in outlet";
      bc.push(["Outlet", "elenco.html?s=outlet"]);
      if (g) bc.push([C.generi[g], hrefCat("outlet", "tutto", g)]);
      if (c !== "tutto") bc.push([nomeCategoria(g, c), ""]);
    } else {
      base = P.filter((p) => p.c !== "gift-card");
      titolo = "Tutti i capi";
      bc.push([titolo, ""]);
    }
    bc[bc.length - 1][1] = "";
    document.title = titolo + " | Parmax";

    /* ------------ stato dei filtri, letto e scritto nell'indirizzo (così "indietro" torna qui) */
    const F = {
      t: new Set((PARAM.get("t") || "").split(",").filter(Boolean)),
      mk: new Set((PARAM.get("mk") || "").split(",").filter(Boolean)),
      pr: new Set((PARAM.get("pr") || "").split(",").filter(Boolean)),
      col: new Set((PARAM.get("col") || "").split(",").filter(Boolean)),
      cat: new Set((PARAM.get("cat") || "").split(",").filter(Boolean)),
      gen: new Set((PARAM.get("gen") || "").split(",").filter(Boolean)),
      o: PARAM.get("o") || (q ? "rilevanti" : "recenti"),
      n: Math.max(Number(PARAM.get("n")) || PER_PAGINA(), PER_PAGINA())
    };
    statoTaglie = () => (F.t.size ? F.t : null);

    const fascia = (p) => {
      const f = prezzo(p).finale;
      const x = C.fascePrezzo.find((y) => f >= y[2] && f < y[3]);
      return x ? x[0] : "";
    };
    const passa = {
      t: (p) => (p.v || []).some((v) => F.t.has(chiaveTaglia(p, v[1]))),
      mk: (p) => F.mk.has(slug(p.m)),
      pr: (p) => F.pr.has(fascia(p)),
      col: (p) => F.col.has(p.u || ""),
      cat: (p) => F.cat.has(p.c),
      gen: (p) => F.gen.has(p.g)
    };
    const filtra = (salta) => base.filter((p) => Object.keys(passa).every((k) => k === salta || !F[k].size || passa[k](p)));
    const ordina = (a) => {
      const x = a.slice();
      if (F.o === "rilevanti") return x;
      if (F.o === "prezzo-su") x.sort((u, v) => prezzo(u).finale - prezzo(v).finale);
      else if (F.o === "prezzo-giu") x.sort((u, v) => prezzo(v).finale - prezzo(u).finale);
      else if (F.o === "sconto") x.sort((u, v) => prezzo(v).pct - prezzo(u).pct || (v.d > u.d ? 1 : v.d < u.d ? -1 : 0));
      else x.sort((u, v) => (v.d > u.d ? 1 : v.d < u.d ? -1 : 0));
      return x;
    };

    /* ------------ i gruppi di filtri: taglia per prima e aperta (Baymard, filtri per abbigliamento) */
    const conteggi = (k, chiavi) => {
      const lista = filtra(k);
      const n = new Map();
      lista.forEach((p) => {
        new Set(chiavi(p)).forEach((x) => x && n.set(x, (n.get(x) || 0) + 1));
      });
      return n;
    };
    const gruppi = () => {
      const out = [];
      const nt = conteggi("t", (p) => (p.v || []).map((v) => chiaveTaglia(p, v[1])));
      const ta = ordinaTaglie(Array.from(nt.keys()).filter((k) => k[0] === "a").map((k) => k.slice(2)));
      const ts = ordinaTaglie(Array.from(nt.keys()).filter((k) => k[0] === "s").map((k) => k.slice(2)));
      const taglieOpz = (pref, arr) => arr.map((z) => [pref + z, z, nt.get(pref + z)]);
      /* lettere (XS-XL) e numeri (38-50, K-Way 5-8) in due gruppi: tutte insieme erano un mucchio */
      const lettere = ta.filter((z) => !/^\d/.test(z));
      const numeri = ta.filter((z) => /^\d/.test(z));
      const sotto =
        ta.length && ts.length
          ? [["Abbigliamento e accessori", taglieOpz("a:", ta)], ["Scarpe", taglieOpz("s:", ts)]]
          : lettere.length && numeri.length
            ? [["Lettere", taglieOpz("a:", lettere)], ["Numeri", taglieOpz("a:", numeri)]]
            : null;
      if (ta.length || ts.length)
        out.push({
          k: "t",
          nome: "Taglia",
          aperto: true,
          griglia: true,
          sotto,
          opz: sotto ? null : taglieOpz(ta.length ? "a:" : "s:", ta.length ? ta : ts)
        });
      const nm = conteggi("mk", (p) => [slug(p.m)]);
      if (nm.size > 1 || F.mk.size)
        out.push({
          k: "mk",
          nome: "Marca",
          cerca: nm.size > 10,
          opz: Array.from(nm.entries())
            .map(([k, n]) => [k, (marcaDa(k) || { nome: k }).nome, n])
            .sort((a, b) => a[1].localeCompare(b[1], "it"))
        });
      const np = conteggi("pr", (p) => [fascia(p)]);
      out.push({ k: "pr", nome: "Prezzo", opz: C.fascePrezzo.filter((f) => np.get(f[0]) || F.pr.has(f[0])).map((f) => [f[0], f[1], np.get(f[0]) || 0]) });
      const nc = conteggi("col", (p) => [p.u]);
      if (nc.size > 1 || F.col.size)
        out.push({
          k: "col",
          nome: "Colore",
          colori: true,
          opz: Array.from(nc.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([k, n]) => [k, maiuscola(k), n])
        });
      const ncat = conteggi("cat", (p) => [p.c]);
      if (ncat.size > 1 || F.cat.size)
        out.push({
          k: "cat",
          nome: "Categoria",
          opz: Array.from(ncat.entries())
            .map(([k, n]) => [k, nomeCategoria(g || s, k) || k, n])
            .sort((a, b) => b[2] - a[2])
        });
      const ng = conteggi("gen", (p) => [p.g]);
      if (ng.size > 1 || F.gen.size)
        out.push({ k: "gen", nome: "Reparto", opz: Object.keys(C.generi).filter((k) => ng.has(k) || F.gen.has(k)).map((k) => [k, C.generi[k], ng.get(k) || 0]) });
      return out;
    };

    const opzHtml = (gr, [k, nome, n]) => {
      const on = F[gr.k].has(k);
      const id = "f-" + gr.k + "-" + slug(k);
      return `<li${gr.cerca ? ` data-nome="${esc(norm(nome))}"` : ""}><input type="checkbox" id="${id}" data-f="${gr.k}" value="${esc(k)}"${on ? " checked" : ""}${!n && !on ? " disabled" : ""}><label for="${id}">${gr.colori ? `<span class="sw sw--${esc(slug(k))}" aria-hidden="true"></span>` : ""}<span>${esc(nome)}</span>${gr.griglia ? "" : ` <span class="n">${n}</span>`}</label></li>`;
    };
    const gruppoHtml = (gr) => `
<details class="fg" data-fg="${gr.k}"${gr.aperto || F[gr.k].size ? " open" : ""}>
  <summary><span>${gr.nome}</span>${F[gr.k].size ? `<span class="fg__n">${F[gr.k].size}</span>` : ""}${ico("down")}</summary>
  <div class="fg__b">
    ${gr.cerca ? `<label class="sr" for="fc-${gr.k}">Cerca una marca</label><input class="fg__cerca" id="fc-${gr.k}" type="search" placeholder="Cerca una marca" data-fcerca>` : ""}
    ${
      gr.sotto
        ? gr.sotto.map(([t, o]) => `<p class="fg__sub">${t}</p><ul class="fg__l fg__l--griglia">${o.map((x) => opzHtml(gr, x)).join("")}</ul>`).join("")
        : `<ul class="fg__l${gr.griglia ? " fg__l--griglia" : ""}${gr.colori ? " fg__l--colori" : ""}">${gr.opz.map((x) => opzHtml(gr, x)).join("")}</ul>`
    }
  </div>
</details>`;

    const altroOutlet = s === "donna" || s === "uomo" ? conta((p) => p.o && p.g === s && (c === "tutto" || p.c === c)) : 0;

    main.innerHTML = `
${briciole(bc)}
<div class="elenco wrap">
  <div class="elenco__head">
    <h1 class="h1">${esc(maiuscola(titolo))}</h1>
    <p class="elenco__conta" data-conta></p>
  </div>
  <div class="barra-filtri">
    <button type="button" class="btn btn--linea barra-filtri__btn" data-apri-filtri>${ico("filter")} Filtri <span class="fg__n" data-nfiltri hidden></span></button>
    <div class="barra-filtri__rapidi" data-rapidi></div>
  </div>
  <div class="elenco__g">
    <aside class="filtri" aria-label="Filtri" data-filtri-casa>
      <form class="filtri__form" data-filtri novalidate></form>
    </aside>
    <div class="elenco__ris">
      <div class="elenco__top">
        <div class="attivi" data-attivi></div>
        <label class="ordina"><span>Ordina</span><select data-ordina>${(q ? [["rilevanti", "Più pertinenti"]] : []).concat(ORDINI).map((o) => `<option value="${o[0]}"${F.o === o[0] ? " selected" : ""}>${o[1]}</option>`).join("")}</select></label>
      </div>
      <div class="griglia" data-griglia></div>
      <div class="elenco__piu" data-piu></div>
      ${altroOutlet ? `<p class="elenco__altro">Anche in outlet: <a href="${hrefCat("outlet", c || "tutto", s)}">${altroOutlet} capi ${c === "tutto" ? s : nomeCategoria(s, c).toLowerCase() + " " + s} scontati</a></p>` : ""}
    </div>
  </div>
</div>
<dialog class="panel panel--sheet" id="pannello-filtri" aria-label="Filtri">
  <div class="panel__in">
    <div class="panel__head"><h2 class="panel__title">Filtri</h2><button type="button" class="iconbtn" data-chiudi aria-label="Chiudi i filtri">${ico("close")}</button></div>
    <div class="panel__body" data-filtri-foglio></div>
    <div class="panel__foot panel__foot--2"><button type="button" class="btn btn--linea" data-azzera>Azzera</button><button type="button" class="btn btn--primario" data-chiudi data-mostra>Mostra</button></div>
  </div>
</dialog>`;
    initDialog($("#pannello-filtri"));
    $(".elenco", main).classList.toggle("elenco--vuoto", !base.length);

    const form = $("[data-filtri]");
    /* il modulo dei filtri è uno solo: a lato su computer, nel foglio dal basso su telefono e tablet */
    const colloca = () => {
      const casa = DESKTOP.matches ? $("[data-filtri-casa]") : $("[data-filtri-foglio]");
      if (form.parentNode !== casa) casa.appendChild(form);
      if (DESKTOP.matches && $("#pannello-filtri").open) $("#pannello-filtri").close();
    };
    colloca();
    DESKTOP.addEventListener("change", colloca);

    const scrivi = () => {
      const u = new URL(location.href);
      ["t", "mk", "pr", "col", "cat", "gen"].forEach((k) => (F[k].size ? u.searchParams.set(k, Array.from(F[k]).join(",")) : u.searchParams.delete(k)));
      F.o !== (q ? "rilevanti" : "recenti") ? u.searchParams.set("o", F.o) : u.searchParams.delete("o");
      F.n > PER_PAGINA() ? u.searchParams.set("n", F.n) : u.searchParams.delete("n");
      history.replaceState(null, "", u.toString());
    };

    const disegna = (nuovo) => {
      const lista = modelli(ordina(filtra()));
      const aperti = $$("details.fg", form).reduce((o, d) => ((o[d.dataset.fg] = d.open), o), {});
      const cercaMarca = ($("[data-fcerca]", form) || {}).value || "";
      form.innerHTML = gruppi().map(gruppoHtml).join("") || "";
      $$("details.fg", form).forEach((d) => {
        if (d.dataset.fg in aperti) d.open = aperti[d.dataset.fg];
      });
      if (cercaMarca && $("[data-fcerca]", form)) {
        $("[data-fcerca]", form).value = cercaMarca;
        filtraMarche(cercaMarca);
      }
      const nAttivi = ["t", "mk", "pr", "col", "cat", "gen"].reduce((s, k) => s + F[k].size, 0);
      $("[data-nfiltri]").hidden = !nAttivi;
      $("[data-nfiltri]").textContent = nAttivi;
      $("[data-conta]").textContent = lista.length === 1 ? "1 capo" : numero(lista.length) + " capi";
      $("[data-mostra]").textContent = lista.length ? `Mostra ${numero(lista.length)} capi` : "Nessun capo: cambia i filtri";

      /* filtri attivi, ognuno si toglie da solo */
      const nomi = {};
      gruppi().forEach((gr) => (gr.opz || gr.sotto.flatMap((x) => x[1])).forEach((o) => (nomi[gr.k + "|" + o[0]] = o[1])));
      const chip = [];
      ["t", "mk", "pr", "col", "cat", "gen"].forEach((k) =>
        F[k].forEach((v) => chip.push(`<button type="button" class="chip chip--on" data-togli="${k}|${esc(v)}">${esc(nomi[k + "|" + v] || v.replace(/^[as]:/, ""))}${ico("close")}<span class="sr"> (togli il filtro)</span></button>`))
      );
      $("[data-attivi]").innerHTML = chip.length ? chip.join("") + `<button type="button" class="link-rimuovi" data-azzera>Azzera tutto</button>` : "";

      /* filtri rapidi sopra l'elenco, su telefono e tablet */
      $("[data-rapidi]").innerHTML = gruppi()
        .slice(0, 4)
        .map((gr) => `<button type="button" class="chip${F[gr.k].size ? " chip--on" : ""}" data-rapido="${gr.k}">${gr.nome}${F[gr.k].size ? " · " + F[gr.k].size : ""}</button>`)
        .join("");

      const griglia = $("[data-griglia]");
      if (!lista.length) {
        griglia.innerHTML = `<div class="vuoto vuoto--elenco">
  <p class="vuoto__t">${base.length ? "Nessun capo con questi filtri" : q ? `Nessun capo trovato per “${esc(q)}”` : "Qui non c'è niente in questo momento"}</p>
  ${base.length ? `<p>Togli un filtro, oppure <button type="button" class="link" data-azzera>azzerali tutti</button>.</p>` : ""}
  ${q && marcaSimile(q) ? `<p>Forse cercavi <a href="elenco.html?m=${marcaSimile(q).slug}">${esc(marcaSimile(q).nome)}</a>?</p>` : ""}
  <p>Non trovi quello che cerchi? <a href="${wa(WA_SITO + (q ? ". Cerco: " + q : ""))}" target="_blank" rel="noopener">Chiedi al negozio su WhatsApp${NUOVA_SCHEDA}</a></p>
  ${base.length ? "" : `<p class="vuoto__link"><a class="btn btn--linea" href="elenco.html?s=novita">Novità</a><a class="btn btn--linea" href="elenco.html?s=outlet">Outlet</a><a class="btn btn--linea" href="marche.html">Marche</a></p>`}
</div>`;
        $("[data-piu]").innerHTML = "";
      } else {
        const visti = lista.slice(0, F.n);
        const t = statoTaglie();
        griglia.innerHTML = visti.map((gr, i) => scheda(gr, { lv: 2, taglie: t, subito: i < 4, novita: s !== "novita" })).join("");
        const resto = lista.length - visti.length;
        $("[data-piu]").innerHTML =
          `<p class="elenco__visti">Hai visto ${numero(visti.length)} capi su ${numero(lista.length)}</p>` +
          (resto > 0 ? `<button type="button" class="btn btn--linea" data-carica>Carica altri ${Math.min(resto, PER_PAGINA())}</button>` : "");
      }
      scrivi();
      if (nuovo) annuncia(lista.length ? `${numero(lista.length)} capi` : "Nessun capo con questi filtri");
    };

    const filtraMarche = (v) => $$("[data-nome]", form).forEach((li) => (li.hidden = v && !li.dataset.nome.includes(norm(v))));

    form.addEventListener("change", (e) => {
      const x = e.target;
      if (!x.dataset.f) return;
      x.checked ? F[x.dataset.f].add(x.value) : F[x.dataset.f].delete(x.value);
      F.n = PER_PAGINA();
      const id = x.id;
      disegna(true);
      const nx = document.getElementById(id);
      if (nx) nx.focus();
    });
    form.addEventListener("input", (e) => {
      if (e.target.matches("[data-fcerca]")) filtraMarche(e.target.value);
    });
    form.addEventListener("submit", (e) => e.preventDefault());
    $("[data-ordina]").addEventListener("change", (e) => {
      F.o = e.target.value;
      F.n = PER_PAGINA();
      disegna(true);
    });
    main.addEventListener("click", (e) => {
      const b = e.target.closest("[data-togli], [data-azzera], [data-carica], [data-rapido], [data-apri-filtri]");
      if (!b) return;
      if (b.dataset.togli) {
        const [k, v] = b.dataset.togli.split("|");
        F[k].delete(v);
        F.n = PER_PAGINA();
        disegna(true);
      } else if (b.hasAttribute("data-azzera")) {
        ["t", "mk", "pr", "col", "cat", "gen"].forEach((k) => F[k].clear());
        F.n = PER_PAGINA();
        disegna(true);
      } else if (b.hasAttribute("data-carica")) {
        const prima = $$("[data-card]").length;
        F.n += PER_PAGINA();
        disegna(false);
        const primoNuovo = $$("[data-card]")[prima];
        if (primoNuovo) $("a", primoNuovo).focus({ preventScroll: true });
        annuncia(`Caricati altri capi, ora ne vedi ${$$("[data-card]").length}`);
      } else if (b.dataset.rapido || b.hasAttribute("data-apri-filtri")) {
        apri("filtri");
        if (b.dataset.rapido) {
          const d = $(`details[data-fg="${b.dataset.rapido}"]`, form);
          if (d) {
            d.open = true;
            setTimeout(() => d.scrollIntoView({ block: "start" }), 60);
          }
        }
      }
    });
    disegna(false);
  }

  function mountHub(s) {
    const main = $("#main");
    document.title = (s === "outlet" ? "Outlet" : C.generi[s]) + " | Parmax";
    const tessere = (filtro, g, sez) =>
      categorieDi(filtro, g)
        .map((x) => {
          const p = P.find((y) => filtro(y) && y.g === g && y.c === x.c);
          return `<a class="tessera" href="${hrefCat(sez, x.c, sez === "outlet" ? g : "")}"><span class="tessera__img"><img src="${foto(p.i[0], 360)}" alt="" width="240" height="360" loading="lazy"></span><span class="tessera__t">${esc(x.nome)}</span><span class="tessera__n">${x.n} capi</span></a>`;
        })
        .join("");
    if (s === "outlet") {
      const generi = ["donna", "uomo", "bambina", "bambino"].filter((g) => conta((p) => p.o && p.g === g));
      main.innerHTML = `
${briciole([["Home", "index.html"], ["Outlet", ""]])}
<div class="hub wrap">
  <div class="hub__head">
    <h1 class="h1">Outlet</h1>
    <p>Abbigliamento firmato fino al −${MAX_OUTLET}%: ${numero(conta(inSezione.outlet))} capi.</p>
  </div>
  <nav class="hub__salti" aria-label="Reparti dell'outlet">${generi.map((g) => `<a class="chip" href="#out-${g}">${C.generi[g]}</a>`).join("")}</nav>
  ${generi
    .map(
      (g) => `<section class="hub__sez" id="out-${g}" aria-labelledby="h-${g}">
    <h2 class="h2" id="h-${g}">${C.generi[g]}</h2>
    <div class="tessere tessere--hub">
      <a class="tessera tessera--tutto" href="${hrefCat("outlet", "tutto", g)}"><span class="tessera__t">Vedi tutto l'outlet ${C.generi[g].toLowerCase()}</span><span class="tessera__n">${numero(conta((p) => p.o && p.g === g))} capi</span>${ico("right")}</a>
      ${tessere(inSezione.outlet, g, "outlet")}
    </div>
  </section>`
    )
    .join("")}
</div>`;
      return;
    }
    main.innerHTML = `
${briciole([["Home", "index.html"], [C.generi[s], ""]])}
<div class="hub wrap">
  <div class="hub__head"><h1 class="h1">${C.generi[s]}</h1><p>${numero(conta(inSezione[s]))} capi di ${numero(new Set(P.filter(inSezione[s]).map((p) => p.m)).size)} marche.</p></div>
  <div class="tessere tessere--hub">
    <a class="tessera tessera--tutto" href="${hrefCat(s, "tutto")}"><span class="tessera__t">Vedi tutto ${C.generi[s]}</span><span class="tessera__n">${numero(conta(inSezione[s]))} capi</span>${ico("right")}</a>
    ${tessere(inSezione[s], s, s)}
  </div>
  <p class="hub__outlet">Cerchi un affare? <a href="${hrefCat("outlet", "tutto", s)}">Outlet ${s}: ${numero(conta((p) => p.o && p.g === s))} capi fino al −${MAX_OUTLET}%</a></p>
</div>`;
  }

  /* ============================================================ PRODOTTO */
  /* Testo dal negozio (descrizione, dettagli, domande): si tengono solo i tag di testo, senza attributi */
  function pulisci(html) {
    const d = new DOMParser().parseFromString("<div>" + (html || "") + "</div>", "text/html");
    const ok = { P: "p", UL: "ul", OL: "ol", LI: "li", STRONG: "strong", B: "strong", EM: "em", I: "em", BR: "br", H1: "p", H2: "p", H3: "p", H4: "p", H5: "p", H6: "p" };
    const giro = (n) =>
      Array.from(n.childNodes)
        .map((c) => {
          if (c.nodeType === 3) return esc(c.textContent);
          if (c.nodeType !== 1) return "";
          const t = ok[c.tagName];
          const dentro = giro(c);
          if (!t) return dentro;
          if (t === "br") return "<br>";
          const tit = /^H\d$/.test(c.tagName);
          return `<${t}${tit ? ' class="desc__t"' : ""}>${dentro}</${t}>`;
        })
        .join("");
    return giro(d.body.firstChild).replace(/<p>\s*<\/p>/g, "");
  }

  /* dalla scheda del sito attuale: "Dettagli Prodotto", "Taglia e Fit", "Domande Frequenti".
     Il negozio li dà in un pezzo della pagina che cambia nome ogni volta che aggiorna il tema
     (è successo il 30/09/2026): se il nome che abbiamo è vecchio si legge la pagina intera,
     più pesante, e ci si segna il nome nuovo per le volte dopo. */
  const KEY_SEZIONE = "parmax:sezione";
  function leggiDettagli(h) {
    const url = N.shopify + "/products/" + encodeURIComponent(h);
    const testo = (u) => fetch(u).then((r) => (r.ok ? r.text() : ""));
    let sezione = D.sezione || "";
    try {
      sezione = localStorage.getItem(KEY_SEZIONE) || sezione;
    } catch (e) {}
    return (sezione ? testo(url + "?section_id=" + encodeURIComponent(sezione)) : Promise.resolve(""))
      .then((t) => t || testo(url))
      .then((t) => {
        const out = {};
        if (!t) return out;
        const d = new DOMParser().parseFromString(t, "text/html");
        const pezzo = $('[id^="shopify-section-template--"][id$="__main"]', d);
        try {
          if (pezzo) localStorage.setItem(KEY_SEZIONE, pezzo.id.replace("shopify-section-", ""));
        } catch (e) {}
        $$("details", d).forEach((x) => {
          const titolo = ($("summary", x) || {}).textContent || "";
          const corpo = $(".disclosure__content", x) || x;
          const k = /dettagli prodotto/i.test(titolo) ? "dettagli" : /taglia e fit/i.test(titolo) ? "fit" : /domande frequenti/i.test(titolo) ? "faq" : "";
          if (k) out[k] = pulisci(corpo.innerHTML);
        });
        return out;
      })
      .catch(() => ({}));
  }

  function mountProdotto() {
    const main = $("#main");
    const h = PARAM.get("p") || "";
    const snap = perHandle.get(h);
    if (snap) disegnaProdotto(daSnapshot(snap), false);
    else main.innerHTML = `<div class="wrap caricamento" role="status">Carico il prodotto…</div>`;
    Promise.all([leggiDalVivo(h), leggiDettagli(h)]).then(([live, det]) => {
      if (!live && !snap) return nonTrovato();
      const m = live ? daVivo(live, snap) : daSnapshot(snap);
      m.det = det;
      disegnaProdotto(m, true);
    });
  }

  function daSnapshot(p) {
    const multi = (p.v || []).some((v) => v[2]);
    return {
      h: p.h, t: p.t, m: p.m, g: p.g, c: p.c, o: p.o, n: p.n, s: p.s, x: p.x, p: p.p, r: p.r, q: p.q, u: p.u,
      k: p.k, desc: "", sku: "", foto: p.i.slice(), opzioni: multi ? ["Colore", "Taglia"] : ["Taglia"],
      varianti: (p.v || []).map((v) => ({ id: v[0], colore: v[2] || colorePrincipale(p), taglia: v[1], disp: true, p: p.p })),
      completo: false
    };
  }
  function daVivo(l, snap) {
    const tags = l.tags || [];
    const fam = (tags.find((t) => /^family_/.test(t)) || "").slice(7);
    const opz = (l.options || []).map((o) => (typeof o === "string" ? o : o.name));
    const iCol = opz.findIndex((o) => /colore/i.test(o));
    const iTag = opz.findIndex((o) => /taglia/i.test(o));
    const unica = iCol < 0 && iTag < 0;
    return {
      h: l.handle, t: l.title, m: l.vendor, g: snap ? snap.g : fam, c: snap ? snap.c : "", o: tags.includes("outlet") ? 1 : 0,
      n: tags.includes("pfs:label-new arrivals") ? 1 : 0, s: tags.includes("season_estate") ? "pe" : tags.includes("season_inverno") ? "ai" : "",
      x: tags.filter((t) => C.promo[t]), p: l.variants[0].price / 100,
      r: l.variants[0].compare_at_price && l.variants[0].compare_at_price > l.variants[0].price ? l.variants[0].compare_at_price / 100 : 0,
      q: snap && snap.q, u: snap && snap.u,
      k: Array.from(new Set(l.variants.map((v) => (iCol >= 0 ? v.options[iCol] : "")).filter(Boolean))).join(" · "),
      desc: pulisci(l.description), sku: (l.variants[0] || {}).sku || "",
      foto: (l.images || []).map((u) => (u.startsWith("//") ? "https:" + u : u)),
      opzioni: unica ? [opz[0] || "Taglia"] : iCol >= 0 && new Set(l.variants.map((v) => v.options[iCol])).size > 1 ? ["Colore", "Taglia"] : ["Taglia"],
      etichetta: unica ? (opz[0] || "Taglia").replace(/^seleziona (il |la )?/i, "") : "Taglia",
      varianti: l.variants.map((v) => ({
        id: v.id,
        colore: iCol >= 0 ? v.options[iCol] : "",
        taglia: unica ? v.options[0] : iTag >= 0 ? v.options[iTag] : v.title,
        disp: v.available,
        p: v.price / 100
      })),
      completo: true
    };
  }

  function nonTrovato() {
    document.title = "Prodotto non trovato | Parmax";
    $("#main").innerHTML = `
<div class="wrap vuoto vuoto--pagina">
  <h1 class="h1">Questo capo non c'è più</h1>
  <p>Forse è stato venduto o tolto dal negozio online. Prova a cercarlo, o guarda le novità.</p>
  <p class="vuoto__link"><button type="button" class="btn btn--primario" data-apri="cerca" aria-controls="pannello-cerca">Cerca nel negozio</button><a class="btn btn--linea" href="elenco.html?s=novita">Novità</a></p>
  <p><a href="${wa(WA_SITO + ". Cercavo un prodotto che non trovo più: " + location.href)}" target="_blank" rel="noopener">Chiedi al negozio su WhatsApp${NUOVA_SCHEDA}</a></p>
</div>`;
  }

  let scelta = { colore: "", id: "" };
  let clicAttivo = null;
  function disegnaProdotto(m, dalVivo) {
    const main = $("#main");
    const sez = m.o ? "outlet" : m.g === "donna" || m.g === "uomo" ? m.g : "";
    document.body.dataset.sezione = sez;
    const nome = nomeCapo(m);
    document.title = `${m.m} ${nome} | Parmax`;
    const desc = $('meta[name="description"]');
    if (desc) desc.content = `${m.m} ${nome}${m.k ? ", " + m.k : ""}: ${euro(prezzo(m).finale)}. Spedizione gratuita in Italia sopra ${C.spedizione.gratisDa} €.`;

    const bc = [["Home", "index.html"]];
    if (sez === "outlet") {
      bc.push(["Outlet", "elenco.html?s=outlet"]);
      if (m.g && C.generi[m.g]) bc.push([C.generi[m.g], hrefCat("outlet", "tutto", m.g)]);
      if (m.c && nomeCategoria(m.g, m.c)) bc.push([nomeCategoria(m.g, m.c), hrefCat("outlet", m.c, m.g)]);
    } else if (sez) {
      bc.push([C.generi[sez], "elenco.html?s=" + sez]);
      if (m.c && nomeCategoria(sez, m.c)) bc.push([nomeCategoria(sez, m.c), hrefCat(sez, m.c)]);
    }
    bc.push([nome, ""]);

    /* colori dentro lo stesso prodotto (pochi casi) oppure altri prodotti dello stesso modello */
    const colori = Array.from(new Set(m.varianti.map((v) => v.colore).filter(Boolean)));
    const multi = m.opzioni.length === 2 && colori.length > 1;
    if (!multi) scelta.colore = colori[0] || "";
    else if (!colori.includes(scelta.colore)) scelta.colore = (m.varianti.find((v) => v.disp) || m.varianti[0]).colore;
    const varianti = m.varianti.filter((v) => !multi || v.colore === scelta.colore);
    const ordinate = varianti.slice().sort((a, b) => pesoTaglia(a.taglia) - pesoTaglia(b.taglia));
    const disponibili = ordinate.filter((v) => v.disp);
    if (!ordinate.some((v) => String(v.id) === String(scelta.id) && v.disp)) scelta.id = "";
    if (!scelta.id && disponibili.length === 1 && ordinate.length === 1) scelta.id = String(disponibili[0].id);
    const esaurito = !disponibili.length;
    const unica = ordinate.length === 1 && /^(tu|taglia unica)$/i.test(ordinate[0].taglia || "");
    const vsel = ordinate.find((v) => String(v.id) === String(scelta.id));
    const prezzoCorrente = Object.assign({}, m, { p: vsel ? vsel.p : m.p });

    const fratelli = m.q ? (perModello.get(m.q) || []).filter((x) => x.h !== m.h) : [];
    const altriColori = fratelli.length
      ? `<div class="pdp__altri"><p class="pdp__lbl">Altri colori</p><ul>${fratelli
          .map(
            (x) =>
              `<li><a href="prodotto.html?p=${encodeURIComponent(x.h)}"><img src="${foto(x.i[0], 120)}" alt="" width="56" height="84" loading="lazy"><span>${esc(colorePrincipale(x))}</span></a></li>`
          )
          .join("")}</ul></div>`
      : "";

    const fotoLista = m.foto.length ? m.foto : [];
    const etichetta = m.etichetta || "Taglia";

    const fit = m.det && m.det.fit ? m.det.fit.replace(/<\/?p>/g, " ").trim() : "";
    const codice = [m.sku ? "Codice: " + esc(m.sku) : "", m.s ? "Stagione: " + (m.s === "ai" ? "Autunno/Inverno" : "Primavera/Estate") : ""].filter(Boolean).join("<br>");
    const gift = m.c === "gift-card";
    const acc = (id, titolo, corpo, aperto) =>
      corpo ? `<details class="acc" id="${id}"${aperto ? " open" : ""}><summary><h2 class="acc__t">${titolo}</h2>${ico("down")}</summary><div class="acc__b desc">${corpo}</div></details>` : "";

    main.innerHTML = `
${briciole(bc)}
<div class="pdp wrap">
  <div class="pdp__gal" data-gal>
    <div class="gal__track" data-track tabindex="0" role="region" aria-label="Foto del prodotto, ${fotoLista.length} in tutto: scorri di lato">
      ${fotoLista
        .map(
          (f, i) =>
            `<figure class="gal__slide"><button type="button" class="gal__zoom" data-zoom="${i}" aria-label="Ingrandisci la foto ${i + 1} di ${fotoLista.length}"><img src="${foto(f, 900)}" srcset="${srcset(f, [480, 720, 900, 1200, 1600])}" sizes="(min-width:1120px) 44vw, (min-width:760px) 50vw, 86vw" alt="${esc(`${m.m} ${nome}${m.k ? ", " + (multi ? scelta.colore : m.k) : ""}, foto ${i + 1}`)}" width="900" height="1350"${i === 0 ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"></button></figure>`
        )
        .join("")}
    </div>
    ${
      fotoLista.length > 1
        ? `<div class="gal__thumbs" role="group" aria-label="Scegli la foto">${fotoLista
            .map((f, i) => `<button type="button" class="gal__th${i === 0 ? " is-on" : ""}" data-vai="${i}" aria-label="Foto ${i + 1}"${i === 0 ? ' aria-current="true"' : ""}><img src="${foto(f, 160)}" alt="" width="64" height="96" loading="lazy"></button>`)
            .join("")}</div>`
        : ""
    }
  </div>

  <div class="pdp__info">
    <p class="pdp__marca"><a href="elenco.html?m=${slug(m.m)}">${esc(m.m)}</a></p>
    <h1 class="pdp__nome">${esc(nome)}</h1>
    <div class="pdp__prezzo" data-prezzo>${prezzoHtml(prezzoCorrente, true)}<span class="pdp__iva">IVA inclusa</span></div>

    ${
      multi
        ? `<fieldset class="scelta"><legend class="pdp__lbl">Colore: <strong>${esc(scelta.colore)}</strong></legend><div class="scelta__l">${colori
            .map((c) => {
              const ok = m.varianti.some((v) => v.colore === c && v.disp);
              return `<button type="button" class="opz${c === scelta.colore ? " is-on" : ""}${ok ? "" : " opz--no"}" data-colore="${esc(c)}" aria-pressed="${c === scelta.colore}">${esc(c)}${ok ? "" : '<span class="sr"> (esaurito)</span>'}</button>`;
            })
            .join("")}</div></fieldset>`
        : m.k
        ? `<p class="pdp__lbl pdp__colore">Colore: <strong>${esc(m.k)}</strong></p>`
        : ""
    }
    ${altriColori}

    ${
      unica
        ? `<p class="pdp__lbl pdp__unica">${esc(etichetta)}: <strong>${esc(ordinate[0].taglia === "TU" ? "taglia unica" : ordinate[0].taglia)}</strong></p>`
        : `<fieldset class="scelta" data-taglie>
      <legend class="pdp__lbl">${esc(etichetta)}${vsel ? `: <strong>${esc(vsel.taglia)}</strong>` : ""}</legend>
      <div class="scelta__l scelta__l--taglie">${ordinate
        .map(
          (v) =>
            `<button type="button" class="opz opz--taglia${String(v.id) === String(scelta.id) ? " is-on" : ""}${v.disp ? "" : " opz--no"}" data-var="${v.id}" aria-pressed="${String(v.id) === String(scelta.id)}"${v.disp ? "" : ' aria-disabled="true"'}>${esc(v.taglia)}${v.disp ? "" : '<span class="sr"> (esaurita)</span>'}</button>`
        )
        .join("")}</div>
      <p class="pdp__errore" data-errore role="alert" hidden>Scegli la ${esc(etichetta.toLowerCase())} prima di aggiungere al carrello.</p>
      ${ordinate.some((v) => !v.disp) && !esaurito ? `<p class="pdp__nota">Le ${etichetta === "Taglia" ? "taglie barrate sono esaurite" : "opzioni barrate sono esaurite"}.</p>` : ""}
    </fieldset>`
    }
    ${fit ? `<p class="pdp__fit"><strong>Vestibilità:</strong> ${fit}</p>` : ""}
    ${!gift ? `<p class="pdp__ps"><a href="${wa(WA_SITO + ". Ho un dubbio sulla taglia di: " + m.m + " " + nome + (m.k ? " (" + m.k + ")" : ""))}" target="_blank" rel="noopener">${WA_ICO}Dubbi sulla taglia? Chiedi a un Personal Shopper su WhatsApp${NUOVA_SCHEDA}</a></p>` : ""}

    <div class="pdp__buy">
      <div class="pdp__buyp">${prezzoHtml(prezzoCorrente)}</div>
      ${
        esaurito
          ? `<p class="pdp__esaurito">Esaurito in tutte le taglie. <a href="${wa(WA_SITO + ". Tornerà disponibile? " + m.m + " " + nome)}" target="_blank" rel="noopener">Chiedi se torna${NUOVA_SCHEDA}</a></p>`
          : addqHtml()
      }
    </div>

    ${gift ? `<p class="pdp__nota">La gift card arriva per email e vale un anno. Per inviarla direttamente a chi la riceve, con un messaggio e un giorno di consegna, usa per ora <a href="${N.shopify}/products/${m.h}" target="_blank" rel="noopener">la pagina della gift card su parmax.com${NUOVA_SCHEDA}</a>.</p>` : `<ul class="garanzie">
      <li>${ico("truck")}<span>Spedizione gratuita in Italia sopra ${C.spedizione.gratisDa} € (altrimenti ${C.spedizione.italia} €). Consegna in 1-2 giorni lavorativi per ordini entro le 10, dal lunedì al venerdì.</span></li>
      <li>${ico("swap")}<span>Cambio taglia gratuito entro 14 giorni dalla consegna.</span></li>
      <li>${ico("return")}<span>Reso entro 14 giorni: senza cambio, la spedizione di ritorno è a tuo carico. <a href="info.html#resi">Dettagli</a></span></li>
    </ul>`}

    <div class="pdp__acc">
      ${acc("a-desc", "Descrizione", m.desc || (dalVivo ? "" : '<p class="caricamento">Carico la descrizione…</p>'), true)}
      ${acc("a-det", "Dettagli e composizione", (m.det && m.det.dettagli) || "", false)}
      ${acc("a-faq", "Domande frequenti", (m.det && m.det.faq) || "", false)}
      ${acc("a-info", "Codice e stagione", codice ? `<p>${codice}</p>` : "", false)}
    </div>

    <div class="dubbi">
      <p class="dubbi__t">Dubbi? Chiedi al negozio</p>
      <p>${N.orari.map(esc).join(" · ")}</p>
      <p class="dubbi__l"><a class="btn btn--linea" href="${wa(WA_SITO + ". Vorrei informazioni su: " + m.m + " " + nome)}" target="_blank" rel="noopener">${WA_ICO} WhatsApp${NUOVA_SCHEDA}</a><a class="dubbi__tel" href="${N.telHref}">${ico("phone")}<span><span class="sr">Chiama il </span>${esc(N.tel)}</span></a></p>
    </div>
  </div>
</div>
<div data-correlati></div>
<dialog class="zoom" id="pannello-zoom" aria-label="Foto ingrandita">
  <div class="zoom__in" data-zoom-box><img alt="" data-zoom-img></div>
  <div class="zoom__bar">
    <button type="button" class="iconbtn" data-zoom-d="-1" aria-label="Foto precedente">${ico("left")}</button>
    <span data-zoom-n></span>
    <button type="button" class="iconbtn" data-zoom-d="1" aria-label="Foto successiva">${ico("right")}</button>
    <button type="button" class="iconbtn" data-chiudi aria-label="Chiudi la foto">${ico("close")}</button>
  </div>
</dialog>`;

    /* scatola "Aggiungi al carrello": sa quale variante è scelta e cosa scrivere nel carrello */
    const box = $("[data-addq]", main);
    const riga = (v) => ({
      v: v.id, h: m.h, t: m.t, m: m.m, k: multi ? scelta.colore : colorePrincipale(m), z: v.taglia === "TU" ? "taglia unica" : v.taglia,
      etichetta, p: v.p, r: m.r || 0, x: m.x || [], i: m.foto[0] || ""
    });
    if (box) {
      box.dataset.v = scelta.id || "";
      if (unica && disponibili[0]) box.dataset.v = String(disponibili[0].id);
      aggiornaAddq(box);
      $("[data-add]", box).addEventListener("click", () => {
        const id = box.dataset.v;
        const v = ordinate.find((x) => String(x.id) === String(id));
        if (!v || !v.disp) {
          const err = $("[data-errore]", main);
          const sc = $("[data-taglie]", main);
          if (err) err.hidden = false;
          if (sc) {
            sc.classList.add("is-err");
            sc.scrollIntoView({ block: "center", behavior: "smooth" });
            const primo = $(".opz--taglia:not(.opz--no)", sc);
            if (primo) setTimeout(() => primo.focus({ preventScroll: true }), 350);
          }
          return;
        }
        Cart.aggiungi(riga(v));
        toast(`Aggiunto al carrello: ${nome}${v.taglia && !unica ? ", " + etichetta.toLowerCase() + " " + v.taglia : ""}`, "Vedi il carrello");
        $(".addq__s button", box) && $('[data-addq-d="1"]', box).focus();
      });
      box.addEventListener("click", (e) => {
        const b = e.target.closest("[data-addq-d]");
        if (!b) return;
        const id = box.dataset.v;
        const n = Cart.qta(id) + Number(b.dataset.addqD);
        const v = ordinate.find((x) => String(x.id) === String(id));
        if (!Cart.qta(id) && v) Cart.aggiungi(riga(v));
        else Cart.imposta(id, n);
        annuncia(n > 0 ? `${nome}: ${n} nel carrello` : `${nome}: tolto dal carrello`);
        if (n <= 0) $("[data-add]", box).focus();
      });
    }

    if (clicAttivo) main.removeEventListener("click", clicAttivo);
    clicAttivo = clicScheda;
    main.addEventListener("click", clicScheda);
    function clicScheda(e) {
      const t = e.target.closest("[data-var], [data-colore]");
      if (!t || !main.contains(t)) return;
      if (t.dataset.colore) {
        scelta.colore = t.dataset.colore;
        scelta.id = "";
        disegnaProdotto(m, dalVivo);
        const nb = $(`[data-colore="${CSS.escape(scelta.colore)}"]`);
        if (nb) nb.focus();
        return;
      }
      if (t.getAttribute("aria-disabled") === "true") {
        annuncia(`Taglia ${t.textContent.replace(" (esaurita)", "")} esaurita`);
        return;
      }
      scelta.id = t.dataset.var;
      $$("[data-var]", main).forEach((b) => {
        const on = b === t;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", on);
      });
      const v = ordinate.find((x) => String(x.id) === String(scelta.id));
      $("[data-taglie] legend", main).innerHTML = `${esc(etichetta)}: <strong>${esc(v.taglia)}</strong>`;
      const err = $("[data-errore]", main);
      if (err) err.hidden = true;
      $("[data-taglie]", main).classList.remove("is-err");
      const pc = Object.assign({}, m, { p: v.p });
      $("[data-prezzo]", main).innerHTML = prezzoHtml(pc, true) + '<span class="pdp__iva">IVA inclusa</span>';
      $(".pdp__buyp", main).innerHTML = prezzoHtml(pc);
      if (box) {
        box.dataset.v = scelta.id;
        aggiornaAddq(box);
      }
    }

    initGalleria(fotoLista, m, nome);
    if (dalVivo || !m.completo) correlati(m);
  }

  function initGalleria(fotoLista, m, nome) {
    const track = $("[data-track]");
    if (!track) return;
    const thumbs = $$("[data-vai]");
    const vai = (i) => {
      const s = track.children[i];
      if (s) track.scrollTo({ left: s.offsetLeft - track.offsetLeft, behavior: "smooth" });
    };
    thumbs.forEach((b) => b.addEventListener("click", () => vai(Number(b.dataset.vai))));
    const io = new IntersectionObserver(
      (ent) =>
        ent.forEach((x) => {
          if (x.intersectionRatio < 0.6) return;
          const i = Array.prototype.indexOf.call(track.children, x.target);
          thumbs.forEach((b, k) => {
            b.classList.toggle("is-on", k === i);
            k === i ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current");
          });
          const th = thumbs[i];
          if (th) th.parentNode.scrollTo({ left: th.offsetLeft - th.parentNode.clientWidth / 2 + th.clientWidth / 2, behavior: "smooth" });
        }),
      { root: track, threshold: [0.6] }
    );
    Array.from(track.children).forEach((s) => io.observe(s));
    track.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const w = track.children[0].getBoundingClientRect().width;
      track.scrollBy({ left: e.key === "ArrowRight" ? w : -w, behavior: "smooth" });
    });

    /* zoom a tutto schermo: la foto grande, col pizzico su telefono e il clic per ingrandire su computer */
    const z = $("#pannello-zoom");
    if (!z) return;
    initDialog(z);
    let i = 0;
    const mostra = () => {
      const img = $("[data-zoom-img]", z);
      img.src = foto(fotoLista[i], 1800);
      img.alt = `${m.m} ${nome}, foto ${i + 1} di ${fotoLista.length}`;
      $("[data-zoom-n]", z).textContent = `${i + 1} / ${fotoLista.length}`;
      $("[data-zoom-box]", z).classList.remove("is-grande");
    };
    track.addEventListener("click", (e) => {
      const b = e.target.closest("[data-zoom]");
      if (!b) return;
      i = Number(b.dataset.zoom);
      mostra();
      ultimoFocus = b;
      z.showModal();
    });
    z.addEventListener("click", (e) => {
      const d = e.target.closest("[data-zoom-d]");
      if (d) {
        i = (i + Number(d.dataset.zoomD) + fotoLista.length) % fotoLista.length;
        mostra();
        return;
      }
      const box = e.target.closest("[data-zoom-box]");
      if (box && HOVER.matches) {
        const r = box.getBoundingClientRect();
        const fx = (e.clientX - r.left) / r.width;
        const fy = (e.clientY - r.top) / r.height;
        box.classList.toggle("is-grande");
        if (box.classList.contains("is-grande")) box.scrollTo(fx * (box.scrollWidth - r.width), fy * (box.scrollHeight - r.height));
      }
    });
    z.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        i = (i + (e.key === "ArrowRight" ? 1 : -1) + fotoLista.length) % fotoLista.length;
        mostra();
      }
    });
    if (fotoLista.length < 2) $$("[data-zoom-d]", z).forEach((b) => (b.hidden = true));
  }

  /* simili (stessa categoria e reparto) e altro della stessa marca: due strisce separate, con nomi chiari */
  function correlati(m) {
    const host = $("[data-correlati]");
    if (!host) return;
    const stesso = (p) => p.h === m.h || (m.q && p.q === m.q);
    const pf = prezzo(m).finale;
    const simili = modelli(
      P.filter((p) => !stesso(p) && p.g === m.g && p.c === m.c && !!p.o === !!m.o).sort((a, b) => Math.abs(prezzo(a).finale - pf) - Math.abs(prezzo(b).finale - pf))
    ).slice(0, 12);
    const marca = modelli(P.filter((p) => !stesso(p) && p.m === m.m && (!m.g || p.g === m.g))).slice(0, 12);
    host.innerHTML =
      rail("Simili", m.c && m.g ? (m.o ? hrefCat("outlet", m.c, m.g) : hrefCat(m.g, m.c)) : "", simili, "t-sim") +
      rail("Altro di " + esc(m.m), "elenco.html?m=" + slug(m.m), marca, "t-marca");
  }

  /* ============================================================== MARCHE */
  function mountMarche() {
    const main = $("#main");
    document.body.dataset.sezione = "marche";
    const perNumero = MARCHE.slice().sort((a, b) => b.n - a.n);
    const alfa = MARCHE.slice().sort((a, b) => a.nome.localeCompare(b.nome, "it", { sensitivity: "base" }));
    const livello = (i) => (i < 4 ? "l" : i < 12 ? "m" : i < 28 ? "s" : i < 70 ? "xs" : "xxs");
    const lettere = Array.from(new Set(alfa.map((m) => (/[a-z]/i.test(m.nome[0]) ? norm(m.nome[0]).toUpperCase() : "0-9"))));
    main.innerHTML = `
${briciole([["Home", "index.html"], ["Marche", ""]])}
<div class="marche wrap">
  <div class="marche__head">
    <h1 class="h1">Marche</h1>
    <p>${numero(MARCHE.length)} marche con almeno un capo disponibile adesso. Più capi ha una marca, più grande è il suo nome.</p>
    <div class="marche__tools">
      <label class="campo"><span class="sr">Cerca una marca</span>${ico("search")}<input type="search" placeholder="Cerca una marca" data-mcerca></label>
      <div class="seg" role="group" aria-label="Ordine">
        <button type="button" aria-pressed="true" data-vista="cartellone">Per numero di capi</button>
        <button type="button" aria-pressed="false" data-vista="az">Dalla A alla Z</button>
      </div>
    </div>
  </div>
  <div class="bill bill--pagina" data-vista-cartellone>
    <p class="bill__lista">${perNumero
      .map((m, i) => `<a class="bl bl--${livello(i)}" href="elenco.html?m=${m.slug}" data-nome="${esc(norm(m.nome))}">${esc(m.nome)}<sup>${m.n}</sup></a>`)
      .join(" ")}</p>
  </div>
  <div class="az" data-vista-az hidden>
    <nav class="az__salti" aria-label="Lettere">${lettere.map((l) => `<a href="#l-${l}">${l}</a>`).join("")}</nav>
    ${lettere
      .map(
        (l) => `<section class="az__g" id="l-${l}" aria-labelledby="lh-${l}"><h2 class="az__l" id="lh-${l}">${l}</h2><ul>${alfa
          .filter((m) => (l === "0-9" ? !/[a-z]/i.test(m.nome[0]) : norm(m.nome[0]).toUpperCase() === l))
          .map((m) => `<li data-nome="${esc(norm(m.nome))}"><a href="elenco.html?m=${m.slug}">${esc(m.nome)} <span class="n">${m.n}</span></a></li>`)
          .join("")}</ul></section>`
      )
      .join("")}
  </div>
  <p class="marche__zero" data-mzero hidden>Nessuna marca con questo nome tra quelle disponibili adesso. <a href="${wa(WA_SITO + ". Cercavo una marca")}" target="_blank" rel="noopener">Chiedi al negozio${NUOVA_SCHEDA}</a></p>
</div>`;
    const input = $("[data-mcerca]");
    input.addEventListener("input", () => {
      const v = norm(input.value.trim());
      let visibili = 0;
      $$("[data-nome]", main).forEach((el) => {
        const ok = !v || el.dataset.nome.includes(v);
        el.hidden = !ok;
        if (ok && el.closest("[data-vista-cartellone]")) visibili++;
      });
      $$(".az__g", main).forEach((g) => (g.hidden = !$$("li:not([hidden])", g).length));
      $("[data-mzero]").hidden = visibili > 0;
      annuncia(visibili ? `${visibili} marche` : "Nessuna marca");
    });
    $$("[data-vista]", main).forEach((b) =>
      b.addEventListener("click", () => {
        $$("[data-vista]", main).forEach((x) => x.setAttribute("aria-pressed", x === b));
        $("[data-vista-cartellone]").hidden = b.dataset.vista !== "cartellone";
        $("[data-vista-az]").hidden = b.dataset.vista !== "az";
      })
    );
  }

  /* =============================================================== AVVIO */
  function init() {
    document.body.insertAdjacentHTML("afterbegin", SPRITE + headerHtml());
    document.body.insertAdjacentHTML("beforeend", footerHtml() + menuHtml() + cercaHtml() + carrelloHtml());
    $$("[data-anno]").forEach((e) => (e.textContent = new Date().getFullYear()));
    Cart.carica();
    ["menu", "cerca", "carrello"].forEach((n) => initDialog(document.getElementById("pannello-" + n)));
    initMega();
    initCerca();

    if (PAGINA === "home") mountHome();
    else if (PAGINA === "elenco") mountElenco();
    else if (PAGINA === "prodotto") mountProdotto();
    else if (PAGINA === "marche") mountMarche();
    /* la sezione del menu si sa solo dopo aver letto la pagina: si riallinea la voce corrente */
    const s = document.body.dataset.sezione;
    $$(".nav__link").forEach((a) => {
      const id = (a.getAttribute("href").match(/s=(\w+)/) || [])[1] || (a.getAttribute("href") === "marche.html" ? "marche" : "");
      id && id === s ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
    });

    render.carrello();
    render.pulsanti();

    document.addEventListener("click", (e) => {
      const ap = e.target.closest("[data-apri]");
      if (ap) return apri(ap.dataset.apri);
      const ch = e.target.closest("[data-chiudi]");
      if (ch) return ch.closest("dialog") && ch.closest("dialog").close();
      const q = e.target.closest("[data-qta]");
      if (q) {
        const r = Cart.riga(q.dataset.qta);
        if (!r) return;
        const n = r.q + Number(q.dataset.d);
        Cart.imposta(q.dataset.qta, n);
        annuncia(n > 0 ? `${nomeCapo(r)}: ${n} nel carrello` : `${nomeCapo(r)}: tolto dal carrello`);
        const nb = $(`[data-qta="${q.dataset.qta}"][data-d="${q.dataset.d}"]`) || $("[data-qta]") || $("#pannello-carrello [data-chiudi]");
        if (nb) nb.focus();
        return;
      }
      const rm = e.target.closest("[data-rimuovi]");
      if (rm) {
        const r = Cart.riga(rm.dataset.rimuovi);
        Cart.imposta(rm.dataset.rimuovi, 0);
        if (r) annuncia(`${nomeCapo(r)}: tolto dal carrello`);
        const nb = $("[data-qta]") || $("#pannello-carrello [data-chiudi]");
        if (nb) nb.focus();
        return;
      }
      const cs = e.target.closest("[data-cassa]");
      if (cs && cs.classList.contains("is-off")) e.preventDefault();
      const t = e.target.closest("[data-tema]");
      if (t && t.tagName === "BUTTON") cambiaTema(t.dataset.tema);
    });

    /* schede del menu su telefono: frecce a destra e sinistra come prevede il ruolo "tab" */
    const tabs = $$('#pannello-menu [role="tab"]');
    const scegli = (t) => {
      tabs.forEach((x) => {
        const on = x === t;
        x.setAttribute("aria-selected", on);
        x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
      });
      t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => scegli(t));
      t.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") scegli(tabs[(i + 1) % tabs.length]);
        if (e.key === "ArrowLeft") scegli(tabs[(i - 1 + tabs.length) % tabs.length]);
      });
    });

    /* il carrello cambiato in un'altra scheda del browser si aggiorna anche qui */
    window.addEventListener("storage", (e) => {
      if (e.key !== KEY) return;
      Cart.carica();
      render.carrello();
      render.pulsanti();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  /* per i controlli automatici (strumenti/controlla.js) */
  window.PARMAX = { prezzo, Cart, cerca, modelli, pesoTaglia, MARCHE };
})();
