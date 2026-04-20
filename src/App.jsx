import { useState, useEffect, useRef } from 'react'
import './App.css'

const LOAD_WATTS = 850
const BATTERY_CAPACITY = 10000
const PV_MAX = 3200

function useSim(pvConnected) {
  const [batteryWh, setBatteryWh] = useState(7500)
  const [pvPower, setPvPower] = useState(2100)
  const [history, setHistory] = useState([])
  const tick = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      tick.current += 1
      const pv = pvConnected
        ? Math.max(0, PV_MAX * (0.6 + 0.15 * Math.sin(tick.current / 10) + (Math.random() - 0.5) * 0.1))
        : 0
      setPvPower(Math.round(pv))

      setBatteryWh(prev => {
        const net = pvConnected ? pv - LOAD_WATTS : -LOAD_WATTS
        const delta = net / 3600
        return Math.min(BATTERY_CAPACITY, Math.max(0, prev + delta))
      })

      setHistory(prev => {
        const now = new Date()
        const label = now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        const next = [...prev, { label, pv: Math.round(pvConnected ? pv : 0), load: LOAD_WATTS }]
        return next.slice(-30)
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [pvConnected])

  return { batteryWh, pvPower }
}

function FlowDiagram({ pvConnected, batteryPct, pvPower }) {
  const charging = pvConnected && pvPower > LOAD_WATTS
  const battColor = batteryPct < 20 ? '#c0392b' : batteryPct < 50 ? '#e67e22' : '#27ae60'

  return (
    <div className="diagram">
      <div className="dia-node pv">
        <div className="dia-icon">☀️</div>
        <div className="dia-label">Panele PV</div>
        <div className="dia-value">{pvConnected ? pvPower + ' W' : '— W'}</div>
      </div>

      <div className="dia-arrow">
        <div className={`arrow-line ${pvConnected ? 'active' : 'inactive'}`} />
        <span className="arrow-tip">→</span>
      </div>

      <div className="dia-node battery">
        <div className="dia-icon">🔋</div>
        <div className="dia-label">Akumulator</div>
        <div className="dia-value" style={{ color: battColor }}>{batteryPct.toFixed(1)} %</div>
        <div className="batt-bar-wrap">
          <div className="batt-bar" style={{ width: batteryPct + '%', background: battColor }} />
        </div>
        {charging && <div className="charging-badge">⚡ ładowanie</div>}
      </div>

      <div className="dia-arrow">
        <div className="arrow-line active" />
        <span className="arrow-tip">→</span>
      </div>

      <div className="dia-node load">
        <div className="dia-icon">🏢</div>
        <div className="dia-label">Sala konf.</div>
        <div className="dia-value">{LOAD_WATTS} W</div>
      </div>
    </div>
  )
}

function LineChart({ history }) {
  const W = 540, H = 140, PAD = 36
  if (history.length < 2) return <div className="chart-empty">Zbieranie danych…</div>

  const maxVal = Math.max(...history.map(h => Math.max(h.pv, h.load)), 1000)
  const scaleX = i => PAD + (i / (history.length - 1)) * (W - PAD * 2)
  const scaleY = v => H - PAD / 2 - (v / maxVal) * (H - PAD)

  const polyPV = history.map((h, i) => `${scaleX(i)},${scaleY(h.pv)}`).join(' ')
  const polyLoad = history.map((h, i) => `${scaleX(i)},${scaleY(h.load)}`).join(' ')

  const yTicks = [0, Math.round(maxVal / 2), maxVal]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
      {yTicks.map(v => (
        <g key={v}>
          <line x1={PAD} y1={scaleY(v)} x2={W - PAD} y2={scaleY(v)} stroke="#e8eaed" strokeWidth="1" />
          <text x={PAD - 4} y={scaleY(v) + 4} fontSize="9" fill="#aaa" textAnchor="end">{v}W</text>
        </g>
      ))}
      <polyline points={polyPV} fill="none" stroke="#f39c12" strokeWidth="2" strokeLinejoin="round" />
      <polyline points={polyLoad} fill="none" stroke="#2980b9" strokeWidth="2" strokeLinejoin="round" strokeDasharray="5,3" />
      <circle cx={scaleX(history.length - 1)} cy={scaleY(history[history.length - 1].pv)} r="3" fill="#f39c12" />
      <circle cx={scaleX(history.length - 1)} cy={scaleY(history[history.length - 1].load)} r="3" fill="#2980b9" />
      <g>
        <circle cx={PAD} cy={H - 10} r="4" fill="#f39c12" />
        <text x={PAD + 8} y={H - 6} fontSize="10" fill="#888">Moc PV</text>
        <circle cx={PAD + 80} cy={H - 10} r="4" fill="#2980b9" />
        <text x={PAD + 92} y={H - 6} fontSize="10" fill="#888">Obciążenie sali</text>
      </g>
    </svg>
  )
}

export default function App() {
  const [pvConnected, setPvConnected] = useState(true)
  const [view, setView] = useState('pv')
  const [time, setTime] = useState(new Date())
  const { batteryWh, pvPower } = useSim(pvConnected)

  const batteryPct = (batteryWh / BATTERY_CAPACITY) * 100
  const [history, setHistory] = useState([])

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const label = now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      setHistory(prev => [...prev, {
        label,
        pv: pvConnected ? pvPower : 0,
        load: LOAD_WATTS
      }].slice(-30))
    }, 1000)
    return () => clearInterval(interval)
  }, [pvConnected, pvPower])

  return (
    <div className="app">
      <header className="header">
        <span className="logo">Energy Monitor</span>
        <span className="clock">{time.toLocaleTimeString('pl-PL')}</span>
      </header>

      <div className="tabs">
        <button className={view === 'pv' ? 'tab active' : 'tab'} onClick={() => setView('pv')}>
          ☀️ PV → Akumulator
        </button>
        <button className={view === 'room' ? 'tab active' : 'tab'} onClick={() => setView('room')}>
          🏢 Sala konferencyjna
        </button>
      </div>

      {view === 'pv' && (
        <div className="panel">
          <FlowDiagram pvConnected={pvConnected} batteryPct={batteryPct} pvPower={pvPower} />
          <div className="control-row">
            <span className="control-label">Ładowanie z PV</span>
            <button
              className={'toggle-btn ' + (pvConnected ? 'on' : 'off')}
              onClick={() => setPvConnected(v => !v)}
            >
              {pvConnected ? '⏸ Odłącz PV' : '▶ Podłącz PV'}
            </button>
          </div>
          {!pvConnected && batteryPct < 30 && (
            <div className="alert">⚠️ Niski poziom akumulatora — podłącz panele PV</div>
          )}
        </div>
      )}

      {view === 'room' && (
        <div className="panel">
          <div className="room-stats">
            <div className="stat-card">
              <div className="stat-label">Zasilanie</div>
              <div className="stat-val" style={{ color: pvConnected ? '#27ae60' : '#e67e22' }}>
                {pvConnected ? 'PV + Akumulator' : 'Tylko akumulator'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Pobór mocy</div>
              <div className="stat-val">{LOAD_WATTS} W</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Poziom baterii</div>
              <div className="stat-val" style={{ color: batteryPct < 20 ? '#c0392b' : '#27ae60' }}>
                {batteryPct.toFixed(1)} %
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Energia pozostała</div>
              <div className="stat-val">{(batteryWh / 1000).toFixed(2)} kWh</div>
            </div>
          </div>
          <div className="chart-wrap">
            <div className="chart-title">Moc PV vs obciążenie sali (ostatnie 30 s)</div>
            <LineChart history={history} />
          </div>
        </div>
      )}
    </div>
  )
}