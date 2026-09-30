/* Parmax: controllo di tutto il sito nel browser. Codice di Emanuele Parmegiani.

   Uso (con l'anteprima accesa: python -m http.server 8790 nella cartella del sito):
       playwright-cli -s=parmax open about:blank
       playwright-cli -s=parmax --raw run-code --filename=strumenti/controlla.js

   Apre ogni pagina nelle due versioni a 320, 390, 820 e 1280 px e controlla: errori, scorrimento
   laterale, pagine vuote, accessibilità (axe-core, scaricato da cdnjs). Poi prova le cose che contano:
   prezzi, scheda prodotto letta dal negozio, carrello fino al link della cassa, ricerca, filtri. */
async page => {
  const BASE = 'http://127.0.0.1:8790/';
  const AXE = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';
  const guai = [];
  /* con una regola di rete accesa il browser non usa la cache: si provano sempre i file di adesso */
  await page.route(BASE + '**', r => r.continue());
  let errori = [];
  page.on('console', m => { if (m.type() === 'error') errori.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => errori.push('errore JS: ' + String(e).slice(0, 200)));
  const vai = async (u, tema) => {
    errori = [];
    await page.goto(BASE + u + (u.includes('?') ? '&' : '?') + 'tema=' + tema, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
  };
  const axe = async () => {
    await page.addScriptTag({ url: AXE });
    return page.evaluate(async () => {
      const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } });
      return r.violations.map(v => 'axe ' + v.id + ' (' + v.impact + ') x' + v.nodes.length + ': ' + v.nodes.slice(0, 2).map(n => n.target.join(' ')).join(' || '));
    });
  };

  /* un capo vero con più taglie, preso dal catalogo di oggi (i capi si esauriscono: niente nomi fissi) */
  await vai('index.html', 'classica');
  const capo = await page.evaluate(() => {
    const p = PRODOTTI.p.find(x => x.c && x.c !== 'gift-card' && x.v.length > 1 && !x.v[0][2]);
    return { h: p.h, prezzo: PARMAX.prezzo(p).finale };
  });
  const conti = await page.evaluate(() =>
    PRODOTTI.p.filter(p => { const z = PARMAX.prezzo(p); return !(z.finale > 0) || z.finale > z.pieno || (z.pct && z.finale >= z.pieno); }).map(p => p.h));
  if (conti.length) guai.push('prezzi che non tornano: ' + conti.slice(0, 5).join(', '));

  const pagine = ['index.html', 'elenco.html?s=donna', 'elenco.html?s=donna&c=capispalla', 'elenco.html?s=outlet', 'elenco.html?s=novita', 'elenco.html?q=jeans',
    'elenco.html?q=zzzzqq', 'prodotto.html?p=' + capo.h, 'prodotto.html?p=gift-card-parmax-fashion', 'prodotto.html?p=non-esiste', 'marche.html', 'info.html', 'chi-siamo.html', '404.html'];
  let aperte = 0;
  for (const tema of ['classica', 'rinnovata']) {
    for (const w of [320, 390, 820, 1280]) {
      await page.setViewportSize({ width: w, height: w < 500 ? 664 : 900 });
      for (const u of pagine) {
        await vai(u, tema);
        aperte++;
        const g = await page.evaluate(() => {
          const out = [];
          const sw = document.documentElement.scrollWidth, cw = document.documentElement.clientWidth;
          if (sw > cw + 1) out.push('scorre di lato: ' + sw + ' su ' + cw);
          /* textContent: il testo com'è scritto, senza il maiuscolo dato dallo stile */
          const t = document.querySelector('main').textContent;
          if (t.trim().length < 80) out.push('pagina quasi vuota');
          const brutto = t.match(/\bundefined\b|\bNaN\b|\[object|FOTO:|DA DEFINIRE|lorem ipsum/);
          if (brutto) out.push('testo di prova: ' + brutto[0]);
          if (!document.querySelector('h1')) out.push('manca il titolo h1');
          return out;
        });
        /* il capo che non esiste chiede al negozio e riceve 404: è il caso che si sta provando */
        const err = u.includes('non-esiste') ? errori.filter(e => !/404/.test(e)) : errori;
        if (w === 390 || w === 1280) g.push(...await axe());
        g.push(...err.map(e => 'console: ' + e));
        if (g.length) guai.push(tema + ' ' + w + ' ' + u + '\n    ' + g.join('\n    '));
      }
    }
  }

  /* scheda prodotto: i tre pezzi letti dal negozio, anche partendo dal nome vecchio del pezzo del tema */
  await page.setViewportSize({ width: 390, height: 664 });
  await vai('prodotto.html?p=' + capo.h, 'classica');
  await page.evaluate(() => { localStorage.setItem('parmax:sezione', 'template--1__main'); localStorage.removeItem('parmax:carrello'); });
  await vai('prodotto.html?p=' + capo.h, 'classica');
  const scheda = await page.evaluate(() => ({
    desc: (document.querySelector('#a-desc .acc__b') || {}).innerText || '',
    det: !!document.querySelector('#a-det'),
    sezione: localStorage.getItem('parmax:sezione')
  }));
  if (scheda.desc.length < 40) guai.push('scheda: descrizione non letta dal negozio');
  if (!scheda.det) guai.push('scheda: mancano "Dettagli e composizione" (il negozio ha cambiato la pagina prodotto?)');
  if (scheda.sezione === 'template--1__main') guai.push('scheda: il nome del pezzo del tema non si aggiorna da solo');

  /* carrello: senza taglia avvisa, con la taglia aggiunge, il totale torna, il link porta alla cassa vera */
  await page.click('[data-add]');
  if (await page.locator('[data-errore]').isHidden()) guai.push('carrello: aggiunge senza aver scelto la taglia');
  await page.click('[data-var]:not(.opz--no) >> nth=0');
  await page.click('[data-add]');
  await page.waitForTimeout(300);
  const c = await page.evaluate(() => ({
    scritta: document.querySelector('.addq__n').textContent,
    totale: PARMAX.Cart.totale(), spedizione: PARMAX.Cart.spedizione(), cassa: PARMAX.Cart.cassa(),
    riga: PARMAX.Cart.righe[0], gratisDa: CATALOGO.spedizione.gratisDa, italia: CATALOGO.spedizione.italia
  }));
  if (!/^1 nel carrello/.test(c.scritta)) guai.push('carrello: il pulsante non conta (' + c.scritta + ')');
  if (Math.abs(c.totale - capo.prezzo) > 0.005) guai.push('carrello: totale ' + c.totale + ' diverso dal prezzo ' + capo.prezzo);
  if (c.spedizione !== (c.totale >= c.gratisDa ? 0 : c.italia)) guai.push('carrello: spedizione sbagliata ' + c.spedizione);
  if (c.cassa !== 'https://parmax.com/cart/' + c.riga.v + ':1') guai.push('carrello: link della cassa sbagliato ' + c.cassa);
  await page.click('.hdr__cart');
  await page.waitForTimeout(500);
  const pannello = await page.locator('#pannello-carrello').textContent();
  for (const parola of ['Prodotti', 'Spedizione in Italia', 'Totale', 'Vai alla cassa']) if (!pannello.includes(parola)) guai.push('carrello: manca "' + parola + '"');
  await page.keyboard.press('Escape');
  await page.evaluate(() => localStorage.removeItem('parmax:carrello'));

  /* ricerca e filtri */
  const r = await page.evaluate(() => ({ jeans: PARMAX.cerca('jeans').length, plurale: PARMAX.cerca('piumini donna').length, niente: PARMAX.cerca('zzzzqq').length }));
  if (!r.jeans || !r.plurale || r.niente) guai.push('ricerca: jeans ' + r.jeans + ', piumini donna ' + r.plurale + ', zzzzqq ' + r.niente);
  await page.click('[data-apri="cerca"]');
  await page.keyboard.type('jeans');
  await page.waitForTimeout(400);
  if (!(await page.locator('.cerca__lista li').count())) guai.push('ricerca: il pannello non mostra capi');
  await page.keyboard.press('Escape');
  if (await page.locator('#pannello-cerca').isVisible()) guai.push('ricerca: Esc non chiude il pannello');

  await page.setViewportSize({ width: 1280, height: 900 });
  await vai('elenco.html?s=donna&c=capispalla', 'classica');
  const prima = await page.locator('[data-conta]').innerText();
  await page.locator('[data-f="t"]').first().check({ force: true });
  await page.waitForTimeout(300);
  const dopo = await page.locator('[data-conta]').innerText();
  const num = (x) => parseInt(x.replace(/\./g, ''));
  if (num(dopo) >= num(prima) || !page.url().includes('t=')) guai.push('filtri: la taglia non filtra (' + prima + ' -> ' + dopo + ')');

  return aperte + ' pagine aperte, capo di prova: ' + capo.h + '\n' + (guai.join('\n') || 'NESSUN PROBLEMA');
}
