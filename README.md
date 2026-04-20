# PV Battery Monitor

Symulacja systemu zarządzania energią z paneli fotowoltaicznych i akumulatora.  
Projekt demonstracyjny z dziedziny IoT / Energy Management Systems.

🔗 **Demo live:** [pv-battery-monitor.vercel.app](https://pv-battery-monitor.vercel.app)

---

## Funkcje

- ☀️ Symulacja mocy paneli PV w czasie rzeczywistym
- 🔋 Wizualizacja stanu akumulatora z paskiem ładowania
- ⚡ Animowany schemat przepływu energii: PV → Akumulator → Sala
- 🏢 Widok sali konferencyjnej z parametrami zużycia
- 📈 Wykres liniowy mocy PV vs obciążenie (ostatnie 30 s)
- 🔌 Przycisk odłączenia PV — obserwacja rozładowania akumulatora
- ⚠️ Alert przy niskim poziomie baterii

---

## Technologie

| Technologia | Zastosowanie |
|---|---|
| React 18 | UI, symulacja (`useState`, `useEffect`, `useRef`) |
| Vite | Bundler, dev server |
| SVG | Wykres liniowy bez zewnętrznych bibliotek |
| CSS (vanilla) | Stylowanie |

---

## Uruchomienie lokalne

```bash
git clone https://github.com/baniokris-lang/pv-battery-monitor.git
cd pv-battery-monitor
npm install
npm run dev
```

Aplikacja dostępna pod `http://localhost:5173`

---

## Kontekst

Projekt powstał jako demonstracja umiejętności frontendowych przygotowana  
na potrzeby prezentacji w branży automatyki budynkowej i zarządzania energią.