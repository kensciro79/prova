# Coding Grid App 🎮

Un'applicazione web educativa per insegnare i concetti base della programmazione attraverso il movimento di un robot su una griglia.

## 🚀 Come usare l'app

1. **Aggiungi comandi**: Clicca sui pulsanti freccia (⬆️⬇️⬅️➡️) per programmare la sequenza di movimenti
2. **Esegui**: Premi il pulsante **START** per vedere il robot eseguire i comandi
3. **Reset**: Usa **RESET** per riportare il robot alla posizione iniziale (0,0)
4. **Cancella**: Usa **CANCELLA COMANDI** per eliminare tutti i comandi e ricominciare

## ⌨️ Scorciatoie da tastiera

- **Frecce direzionali**: Aggiungi comandi
- **Enter**: Avvia l'esecuzione
- **ESC**: Cancella tutti i comandi
- **R**: Reset posizione robot

## 🌐 Come testare l'app esternamente

### ✅ METODO RACCOMANDATO: Port Forwarding in VS Code

Se stai usando VS Code con un dev container o Codespace:

1. Apri il pannello **PORTS** (in basso, accanto al terminale)
2. Il port 8080 dovrebbe essere già visibile
3. Clicca con il tasto destro sul port 8080
4. Seleziona **"Port Visibility" → "Public"**
5. Copia l'URL generato (formato: `https://xxxxx-8080.app.github.dev`)
6. 🎉 Condividi l'URL per accedere all'app da qualsiasi dispositivo!

### Opzione 2: Deploy su GitHub Pages (gratuito e permanente)

1. Fai commit e push dei file:
```bash
git add .
git commit -m "Add Coding Grid App"
git push
```

2. Vai su GitHub → Settings del repository → Pages
3. Source: Deploy from branch `main`, cartella `/` (root)
4. Salva e attendi qualche minuto
5. L'app sarà disponibile su: `https://kensciro79.github.io/prova`

### Opzione 3: Deploy su Netlify (instant deploy!)

1. Vai su [Netlify Drop](https://app.netlify.com/drop)
2. Trascina la cartella del progetto
3. Ottieni un URL pubblico immediato (es: `https://random-name.netlify.app`)

### Opzione 4: Deploy su Vercel

```bash
npx vercel --prod
```

## 🎯 Obiettivi educativi

- Introduzione alla programmazione sequenziale
- Pensiero algoritmico
- Debugging e correzione errori
- Coordinamento spaziale
- Problem solving

## 📁 Struttura del progetto

```
prova/
├── index.html    # Struttura HTML dell'app
├── style.css     # Stili e animazioni
├── script.js     # Logica del gioco
└── README.md     # Documentazione
```

## 🛠️ Tecnologie utilizzate

- HTML5
- CSS3 (con animazioni e gradient)
- JavaScript Vanilla (ES6+)

## 📱 Compatibilità

✅ Chrome/Edge
✅ Firefox
✅ Safari
✅ Opera
✅ Mobile browsers
app per la scuola
