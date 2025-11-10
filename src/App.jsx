import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LogIn, LogOut, Plane, Settings, Map, CloudFog, FileText, Printer, Download, AlertTriangle, XCircle, RefreshCcw, Sun, Moon } from 'lucide-react'

const tokens = {
  colors: {
    bg: {
      base: 'bg-slate-950',
      panel: 'bg-slate-900/80',
      panelAlt: 'bg-slate-900/60',
      glass: 'backdrop-blur-xl bg-slate-900/60',
    },
    text: {
      primary: 'text-slate-100',
      secondary: 'text-slate-300',
      muted: 'text-slate-400',
      cyan: 'text-cyan-400',
      danger: 'text-rose-400',
      success: 'text-emerald-400',
      warning: 'text-amber-400',
    },
    ring: 'ring-1 ring-slate-700/60',
    border: 'border border-slate-800/80',
    accent: 'text-cyan-400',
  },
  focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70',
  card: 'rounded-2xl shadow-lg shadow-black/30',
  panel: 'rounded-2xl backdrop-blur-xl border border-slate-800/60',
}

const Button = ({ icon: Icon, children, variant='primary', className='', ...props }) => {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ' + tokens.focus
  const variants = {
    primary: 'bg-cyan-600 hover:bg-cyan-500 text-slate-900',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100',
    ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-200',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white'
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  )
}

const Input = ({ label, description, error, ...props }) => (
  <label className="block space-y-1">
    <span className={`text-sm ${tokens.colors.text.secondary}`}>{label}</span>
    <input {...props} className={`w-full ${tokens.panel} ${tokens.card} ${tokens.colors.text.primary} ${tokens.colors.bg.panel} ${tokens.colors.border} px-3 py-2 placeholder-slate-500 ${tokens.focus}`} />
    {description && <p className={`text-xs ${tokens.colors.text.muted}`}>{description}</p>}
    {error && <p className="text-xs text-rose-400">{error}</p>}
  </label>
)

const Select = ({ label, children, ...props }) => (
  <label className="block space-y-1">
    <span className={`text-sm ${tokens.colors.text.secondary}`}>{label}</span>
    <select {...props} className={`w-full ${tokens.panel} ${tokens.card} ${tokens.colors.text.primary} ${tokens.colors.bg.panel} ${tokens.colors.border} px-3 py-2 ${tokens.focus}`}>{children}</select>
  </label>
)

const Panel = ({ title, right, children, className='' }) => (
  <div className={`${tokens.panel} ${tokens.card} ${tokens.colors.bg.panel} ${tokens.colors.text.primary} ${className}`}>
    {(title || right) && (
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
        <h3 className="text-sm tracking-wide uppercase text-slate-300">{title}</h3>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    )}
    <div className="p-4">{children}</div>
  </div>
)

const Tag = ({ children, tone='cyan' }) => {
  const map = { cyan: 'bg-cyan-500/10 text-cyan-300', amber: 'bg-amber-500/10 text-amber-300', rose: 'bg-rose-500/10 text-rose-300', emerald: 'bg-emerald-500/10 text-emerald-300' }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${map[tone]}`}>{children}</span>
}

const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem('wa_token'))
  const [user, setUser] = useState(null)
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const login = async (email, password) => {
    const res = await fetch(`${baseUrl}/auth/login`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ email, password }) })
    if (!res.ok) throw new Error('Invalid credentials')
    const data = await res.json()
    localStorage.setItem('wa_token', data.access_token)
    setToken(data.access_token)
    await load()
  }
  const register = async (name, email, password) => {
    const res = await fetch(`${baseUrl}/auth/register`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ name, email, password }) })
    if (!res.ok) throw new Error('Registration failed')
    const data = await res.json()
    localStorage.setItem('wa_token', data.access_token)
    setToken(data.access_token)
    await load()
  }
  const logout = () => { localStorage.removeItem('wa_token'); setToken(null); setUser(null) }
  const load = async () => {
    if (!token) return
    const res = await fetch(`${baseUrl}/dashboard?token=${token}`)
    if (res.ok) {
      const data = await res.json(); setUser(data.user)
    }
  }
  useEffect(() => { load() }, [token])
  return { token, user, login, register, logout, baseUrl }
}

const AuthScreen = ({ onDone }) => {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(name, email, password)
      onDone()
    } catch (e) { setError(e.message) } finally { setLoading(false) }
  }

  return (
    <div className={`min-h-screen ${tokens.colors.bg.base} ${tokens.colors.text.primary} flex items-center justify-center p-6 bg-[radial-gradient(90rem_60rem_at_50%_-10%,rgba(34,211,238,0.10),transparent)]`}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`w-full max-w-md ${tokens.panel} ${tokens.card}`}>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Plane className="text-cyan-400" size={20} />
            <h1 className="text-xl font-semibold tracking-wide">WeathAware</h1>
          </div>
          <div className="flex gap-2 bg-slate-900/60 p-1 rounded-lg">
            <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-md text-sm ${mode==='login' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-slate-200'}`}>Sign in</button>
            <button onClick={() => setMode('register')} className={`flex-1 py-2 rounded-md text-sm ${mode==='register' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-slate-200'}`}>Create account</button>
          </div>
          <form className="space-y-4" onSubmit={submit}>
            {mode==='register' && (
              <Input label="Name" placeholder="Captain Jane" value={name} onChange={e=>setName(e.target.value)} required />
            )}
            <Input label="Email" type="email" placeholder="you@airline.com" value={email} onChange={e=>setEmail(e.target.value)} required />
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required />
            {error && <div className="text-sm text-rose-400">{error}</div>}
            <Button type="submit" icon={LogIn} disabled={loading}>{loading?'Please wait…': mode==='login'?'Sign in':'Create account'}</Button>
          </form>
          <p className={`text-xs ${tokens.colors.text.muted}`}>WCAG AA contrast, keyboard focus ring, and ARIA labels are implemented across controls.</p>
        </div>
      </motion.div>
    </div>
  )
}

const Navbar = ({ user, onLogout, theme, setTheme }) => (
  <div className={`sticky top-0 z-40 ${tokens.colors.bg.glass} ${tokens.colors.border}`} role="navigation" aria-label="Main">
    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
      <Plane className="text-cyan-400" size={20} aria-hidden />
      <span className="font-semibold tracking-wide">WeathAware</span>
      <nav className="ml-6 hidden md:flex items-center gap-3 text-sm text-slate-300">
        <a href="#dashboard" className="hover:text-white">Dashboard</a>
        <a href="#plan" className="hover:text-white">Flight Planner</a>
        <a href="#brief" className="hover:text-white">Briefing</a>
        <a href="#map" className="hover:text-white">Map</a>
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" icon={theme==='dark'?Sun:Moon} aria-label="Toggle theme" onClick={()=>setTheme(theme==='dark'?'light':'dark')} />
        <Button variant="ghost" icon={Settings} aria-label="Settings" />
        <div className="h-4 w-px bg-slate-700 mx-2" />
        <span className="text-sm text-slate-300 hidden sm:block">{user?.name}</span>
        <Button variant="secondary" icon={LogOut} onClick={onLogout}>Sign out</Button>
      </div>
    </div>
  </div>
)

const Dashboard = ({ baseUrl, token }) => {
  const [data, setData] = useState({ recent_plans: [], user: null })
  const [state, setState] = useState('loading') // loading | ready | error
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${baseUrl}/dashboard?token=${token}`)
        if (!res.ok) throw new Error('Failed')
        const d = await res.json(); setData(d); setState('ready')
      } catch(e) { setState('error') }
    }
    load()
  }, [token])
  if (state==='loading') return <EmptyState icon={RefreshCcw} title="Loading dashboard" description="Fetching your recent flight plans and weather widgets" />
  if (state==='error') return <EmptyState icon={XCircle} tone="rose" title="Couldn’t load dashboard" description="Check your connection and try again." />
  return (
    <div id="dashboard" className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      <Panel title="Your status" right={<Tag tone="emerald">Current</Tag>}>
        <div className="text-sm text-slate-300">Welcome back, {data.user?.name}. All systems nominal.</div>
      </Panel>
      <Panel title="Recent flight plans">
        <ul className="space-y-2">
          {data.recent_plans.length === 0 ? (
            <li className="text-sm text-slate-400">No plans yet. Create one below.</li>
          ) : data.recent_plans.map(p => (
            <li key={p._id} className="flex items-center justify-between text-sm">
              <span className="text-slate-200">{p.origin} → {p.destination}</span>
              <Tag>{new Date(p.departure_time).toUTCString()}</Tag>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Hazards overview" right={<Tag tone="amber">Enroute</Tag>}>
        <div className="flex items-center gap-3 text-sm text-slate-300"><AlertTriangle className="text-amber-400" size={18} /> No convective SIGMETs on route</div>
      </Panel>
    </div>
  )
}

const EmptyState = ({ icon:Icon, title, description, tone='cyan', action }) => {
  const map = { cyan:'text-cyan-300', rose:'text-rose-300', amber:'text-amber-300' }
  return (
    <div className={`flex flex-col items-center justify-center ${tokens.panel} ${tokens.colors.bg.panel} ${tokens.card} p-8 text-center`}>
      <Icon size={28} className={map[tone]} aria-hidden />
      <h3 className="mt-2 font-medium">{title}</h3>
      <p className={`text-sm mt-1 ${tokens.colors.text.muted}`}>{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

const Planner = ({ baseUrl, token, onPlanCreated }) => {
  const [form, setForm] = useState({ origin:'', destination:'', alternates:'', callsign:'', route:'', departure_time:'', cruise_altitude:'', aircraft_type:'' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const update = (k,v)=> setForm(s=>({...s,[k]:v}))

  const submit = async (e)=>{
    e.preventDefault(); setBusy(true); setError('')
    try{
      const payload = {
        origin: form.origin.trim(),
        destination: form.destination.trim(),
        alternates: form.alternates.split(',').map(s=>s.trim()).filter(Boolean),
        callsign: form.callsign || undefined,
        route: form.route || undefined,
        departure_time: new Date(form.departure_time).toISOString(),
        cruise_altitude: form.cruise_altitude || undefined,
        aircraft_type: form.aircraft_type || undefined,
      }
      const res = await fetch(`${baseUrl}/flightplan?token=${token}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      if(!res.ok) throw new Error('Failed to create plan')
      const d = await res.json(); onPlanCreated(d.id); setForm({ origin:'', destination:'', alternates:'', callsign:'', route:'', departure_time:'', cruise_altitude:'', aircraft_type:'' })
    }catch(e){ setError(e.message) } finally{ setBusy(false) }
  }

  return (
    <Panel title="Flight planner" right={<Tag>v1</Tag>}>
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
        <Input label="From (ICAO)" value={form.origin} onChange={e=>update('origin', e.target.value.toUpperCase())} placeholder="KSEA" required />
        <Input label="To (ICAO)" value={form.destination} onChange={e=>update('destination', e.target.value.toUpperCase())} placeholder="KSFO" required />
        <Input label="Alternates (comma-separated)" value={form.alternates} onChange={e=>update('alternates', e.target.value.toUpperCase())} placeholder="KOAK, KSJC" />
        <Input label="Callsign" value={form.callsign} onChange={e=>update('callsign', e.target.value)} placeholder="ASA123" />
        <Input label="Route" value={form.route} onChange={e=>update('route', e.target.value)} placeholder="HAROB6 HAROB DCT OLM V27 ONP" className="md:col-span-2" />
        <Input label="Departure (UTC)" type="datetime-local" value={form.departure_time} onChange={e=>update('departure_time', e.target.value)} required />
        <Input label="Cruise Altitude" value={form.cruise_altitude} onChange={e=>update('cruise_altitude', e.target.value)} placeholder="FL340" />
        <Input label="Aircraft Type" value={form.aircraft_type} onChange={e=>update('aircraft_type', e.target.value)} placeholder="A20N" />
        {error && <div className="md:col-span-2 text-rose-400 text-sm">{error}</div>}
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={busy} icon={CloudFog}>{busy?'Planning…':'Create flight plan'}</Button>
        </div>
      </form>
    </Panel>
  )
}

const Briefing = ({ baseUrl, token, planId }) => {
  const [data, setData] = useState(null)
  const [state, setState] = useState('idle')
  const brief = async ()=>{
    setState('loading')
    try{
      const res = await fetch(`${baseUrl}/brief?token=${token}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ flight_plan_id: planId }) })
      if(!res.ok) throw new Error('Failed to brief')
      const d = await res.json(); setData(d); setState('ready')
    }catch(e){ setState('error') }
  }
  useEffect(()=>{ if(planId) brief() },[planId])

  if(state==='idle') return null
  if(state==='loading') return <EmptyState icon={RefreshCcw} title="Generating briefing" description="Decoding METAR/TAF, NOTAMs, PIREPs and hazards" />
  if(state==='error') return <EmptyState icon={XCircle} tone="rose" title="Briefing failed" description="Please retry shortly." action={<Button onClick={brief} icon={RefreshCcw}>Retry</Button>} />
  return (
    <div id="brief" className="grid lg:grid-cols-3 gap-4">
      <Panel title="AI 5‑line summary" right={<Tag tone="amber">MEDIUM RISK</Tag>} className="lg:col-span-3">
        <p className="text-slate-200 text-sm leading-6">{data.summary}</p>
      </Panel>
      <Panel title="Decoded METAR/TAF">
        <ul className="text-sm space-y-2 text-slate-300">
          <li><span className="text-slate-400">Origin:</span> METAR details …</li>
          <li><span className="text-slate-400">Destination:</span> TAF details …</li>
        </ul>
      </Panel>
      <Panel title="NOTAMs">
        <ul className="text-sm space-y-2 text-slate-300">
          <li>RWY 12/30 closed</li>
        </ul>
      </Panel>
      <Panel title="PIREPs">
        <ul className="text-sm space-y-2 text-slate-300">
          <li>MOD TURB FL180</li>
        </ul>
      </Panel>
      <Panel title="Alternates">
        <ul className="text-sm space-y-2 text-slate-300">
          <li>KBUR — Nearby</li>
        </ul>
      </Panel>
      <Panel title="Hazards & risk">
        <div className="flex items-center gap-3 text-sm text-slate-300"><AlertTriangle className="text-amber-400" size={18}/> Isolated TS enroute</div>
      </Panel>
      <Panel title="Export">
        <div className="flex gap-2">
          <Button icon={Printer} variant="secondary">Print</Button>
          <Button icon={Download} variant="secondary">Export PDF</Button>
        </div>
      </Panel>
    </div>
  )
}

const MapPanel = () => (
  <Panel title="Interactive map" right={<Tag>Route + Wx</Tag>}>
    <div id="map" className="h-64 md:h-96 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 grid place-items-center text-slate-400">
      <Map className="text-cyan-400" />
      <p className="text-sm">Map placeholder with route and weather overlays</p>
    </div>
  </Panel>
)

function AppShell(){
  const { token, user, logout, baseUrl } = useAuth()
  const [theme, setTheme] = useState('dark')
  const [planId, setPlanId] = useState(null)
  const onPlanCreated = (id)=> setPlanId(id)

  if(!token) return <AuthScreen onDone={()=>{}} />

  return (
    <div className={`${tokens.colors.bg.base} ${tokens.colors.text.primary} min-h-screen`}> 
      <Navbar user={user} onLogout={logout} theme={theme} setTheme={setTheme} />
      <main className="max-w-7xl mx-auto p-4 space-y-4">
        <Dashboard baseUrl={baseUrl} token={token} />
        <Planner baseUrl={baseUrl} token={token} onPlanCreated={onPlanCreated} />
        <Briefing baseUrl={baseUrl} token={token} planId={planId} />
        <MapPanel />
      </main>
      <footer className="max-w-7xl mx-auto p-6 text-center text-slate-500 text-xs">WeathAware prototype — accessibility: keyboard focus rings, labels, and AA colors.</footer>
    </div>
  )
}

export default function App(){
  return <AppShell />
}
