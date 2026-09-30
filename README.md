# Parmax

Codice di Emanuele Parmegiani.

Proposta di sito nuovo per [parmax.com](https://parmax.com): cambia solo quello che si vede. Prodotti, prezzi, disponibilità e cassa restano quelli del negozio Shopify di oggi.

È un'anteprima: le pagine chiedono a Google di non metterle nei risultati (`noindex`).

## Guardarlo

Dalla cartella del sito:

    python -m http.server 8790

poi nel browser `http://127.0.0.1:8790/`. Le versioni da mostrare sono tre e si scelgono in fondo alla pagina ("Anteprima: Classica / Rinnovata / Nuova") o dall'indirizzo, con `?tema=classica`, `?tema=rinnovata` e `?tema=nuova`.

- **Classica**: il marchio di oggi, bianco e nero.
- **Rinnovata**: il cartellone delle marche in blu.
- **Nuova**: libera dal sito di oggi. I vestiti si vedono indossati (la seconda foto che il negozio carica per ogni capo), un carattere solo (Jost), bianco e nero con il rosso solo per gli sconti.

## Com'è fatto

Sito statico senza build.

- `index.html`, `elenco.html`, `prodotto.html`, `marche.html`, `info.html`, `chi-siamo.html`, `404.html`: le pagine. Quelle dei prodotti sono gusci che il codice riempie.
- `assets/js/catalogo.js`: i dati del negozio scritti a mano (contatti, negozi, spedizione, sconti, categorie).
- `assets/js/prodotti.js`: prodotti e recensioni, **generato**. Non si modifica a mano.
- `assets/js/parmax.js`: tutto il comportamento (menu, ricerca, carrello, elenchi con filtri, scheda).
- `assets/css/parmax.css`: lo stile della classica e della rinnovata, sugli stessi componenti.
- `assets/css/nuova.css`: lo stile della nuova, da solo (con la nuova `parmax.css` è spento).

Cosa arriva dal negozio vero:

- il catalogo, da `parmax.com/products.json` (lo scarica lo script qui sotto);
- nella scheda, disponibilità e descrizione di adesso (`/products/<nome>.js`) e i pezzi "Dettagli", "Taglia e fit", "Domande frequenti" (dalla pagina del prodotto);
- la cassa: "Vai alla cassa" apre `parmax.com/cart/<variante>:<quantità>,...`, quindi pagamento, account e resi sono quelli di Shopify.

## Aggiornare i prodotti

    python strumenti/aggiorna-catalogo.py

Riscrive `assets/js/prodotti.js` con i prodotti disponibili adesso (circa un minuto). Va rilanciato spesso: i capi si esauriscono e il negozio ne aggiunge.

## Controllare che funzioni tutto

Con l'anteprima accesa:

    playwright-cli -s=parmax open about:blank
    playwright-cli -s=parmax --raw run-code --filename=strumenti/controlla.js

Apre ogni pagina nelle tre versioni a 320, 390, 820 e 1280 px e prova prezzi, scheda, carrello, ricerca e filtri. Deve rispondere `NESSUN PROBLEMA`.
