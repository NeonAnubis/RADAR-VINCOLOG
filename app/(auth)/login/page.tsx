'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { signIn } from '@/lib/actions/auth'
import { Eye, EyeOff, LogIn, MapPin, CheckCircle, Truck, Radio } from 'lucide-react'
import { useT } from '@/lib/i18n/I18nProvider'
import { useTheme } from '@/lib/providers/ThemeProvider'
import ThemeLanguageToggle from '@/components/ThemeLanguageToggle'

/* ── Radar visualization ──────────────────────────────────── */
function RadarScope() {
  const blips = [
    { cx: 190, cy: 88,  r: 4, color: '#60A5FA', delay: '0s',    label: 'Guarulhos',    lx: 197, ly: 84  },
    { cx: 78,  cy: 168, r: 4, color: '#34D399', delay: '0.8s',  label: 'São Paulo',    lx: 32,  ly: 164 },
    { cx: 212, cy: 196, r: 4, color: '#F59E0B', delay: '1.6s',  label: 'Campinas',     lx: 218, ly: 192 },
    { cx: 96,  cy: 76,  r: 4, color: '#60A5FA', delay: '2.4s',  label: 'Cajamar',      lx: 52,  ly: 72  },
    { cx: 168, cy: 218, r: 4, color: '#34D399', delay: '3.2s',  label: 'Sorocaba',     lx: 125, ly: 228 },
    { cx: 58,  cy: 118, r: 4, color: '#A78BFA', delay: '1.2s',  label: 'Mogi das C.', lx: 0,   ly: 114 },
    { cx: 232, cy: 130, r: 4, color: '#F87171', delay: '2.0s',  label: 'Ribeirão P.',  lx: 237, ly: 126 },
  ]
  const routes = [
    { x1: 140, y1: 140, x2: 190, y2: 88  },
    { x1: 140, y1: 140, x2: 78,  y2: 168 },
    { x1: 140, y1: 140, x2: 212, y2: 196 },
    { x1: 140, y1: 140, x2: 96,  y2: 76  },
    { x1: 140, y1: 140, x2: 168, y2: 218 },
    { x1: 140, y1: 140, x2: 58,  y2: 118 },
    { x1: 140, y1: 140, x2: 232, y2: 130 },
  ]

  return (
    <div className="relative" style={{ width: 280, height: 280 }}>
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', filter: 'blur(8px)' }} />

      {/* Scope background */}
      <div className="absolute inset-0 rounded-full overflow-hidden"
        style={{ background: 'radial-gradient(circle, #030F28 0%, #020918 60%, #010612 100%)', border: '1px solid rgba(59,130,246,0.25)' }}>

        {/* Sweep overlay */}
        <div className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(59,130,246,0.18) 35deg, rgba(59,130,246,0.06) 70deg, transparent 90deg)',
            animation: 'radarSweep 4s linear infinite',
          }} />

        {/* SVG rings + routes + blips */}
        <svg viewBox="0 0 280 280" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="1.5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Rings */}
          {[35, 70, 105, 139].map((r, i) => (
            <circle key={r} cx="140" cy="140" r={r} fill="none"
              stroke={`rgba(59,130,246,${i === 3 ? 0.35 : 0.15})`}
              strokeWidth={i === 3 ? 1.5 : 1} />
          ))}

          {/* Crosshairs */}
          <line x1="0" y1="140" x2="280" y2="140" stroke="rgba(59,130,246,0.12)" strokeWidth="1"/>
          <line x1="140" y1="0" x2="140" y2="280" stroke="rgba(59,130,246,0.12)" strokeWidth="1"/>
          <line x1="41" y1="41" x2="239" y2="239" stroke="rgba(59,130,246,0.06)" strokeWidth="0.5"/>
          <line x1="239" y1="41" x2="41" y2="239" stroke="rgba(59,130,246,0.06)" strokeWidth="0.5"/>

          {/* Routes (animated dashes) */}
          {routes.map((r, i) => (
            <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
              stroke="rgba(99,102,241,0.45)" strokeWidth="1.2"
              strokeDasharray="5,4"
              style={{ animation: `routeDash ${1.5 + i * 0.2}s linear infinite` }} />
          ))}

          {/* Blip rings (pulse) */}
          {blips.map((b, i) => (
            <circle key={`ring-${i}`} cx={b.cx} cy={b.cy} r={b.r + 2}
              fill="none" stroke={b.color} strokeWidth="1" opacity="0.5"
              style={{ animation: `blipRing 2s ease-out ${b.delay} infinite` }} />
          ))}

          {/* Blips */}
          {blips.map((b, i) => (
            <circle key={`blip-${i}`} cx={b.cx} cy={b.cy} r={b.r}
              fill={b.color} filter="url(#glow)"
              style={{ animation: `blipPulse 2s ease-in-out ${b.delay} infinite` }} />
          ))}

          {/* Labels */}
          {blips.map((b, i) => (
            <text key={`label-${i}`} x={b.lx} y={b.ly}
              fill="rgba(147,197,253,0.7)" fontSize="7" fontFamily="monospace">
              {b.label}
            </text>
          ))}

          {/* Center HQ dot */}
          <circle cx="140" cy="140" r="5" fill="rgba(59,130,246,0.3)" filter="url(#glow)"/>
          <circle cx="140" cy="140" r="3" fill="#60A5FA"/>
          <circle cx="140" cy="140" r="1.5" fill="white"/>

          {/* Degree markers */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
            const rad = (deg * Math.PI) / 180
            const x1 = 140 + 132 * Math.sin(rad); const y1 = 140 - 132 * Math.cos(rad)
            const x2 = 140 + 139 * Math.sin(rad); const y2 = 140 - 139 * Math.cos(rad)
            return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(59,130,246,0.4)" strokeWidth={deg % 90 === 0 ? 2 : 1} />
          })}
        </svg>

        {/* Sweep line (bright edge) */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ animation: 'radarSweep 4s linear infinite' }}>
          <div style={{ width: '50%', height: '1.5px', background: 'linear-gradient(to left, rgba(96,165,250,0.9), transparent)', transformOrigin: 'left center', marginLeft: '50%', marginTop: -0.75 }} />
        </div>
      </div>

      {/* Cardinal labels */}
      {[
        { label: 'N', x: '50%', y: 8,   tx: '-50%', ty: 0 },
        { label: 'S', x: '50%', y: 268, tx: '-50%', ty: 0 },
        { label: 'O', x: 4,    y: '50%',tx: 0,      ty: '-50%' },
        { label: 'L', x: 265,  y: '50%',tx: 0,      ty: '-50%' },
      ].map(({ label, x, y, tx, ty }) => (
        <div key={label} className="absolute text-[9px] font-bold text-blue-500"
          style={{ left: x, top: y, transform: `translate(${tx}, ${ty})` }}>
          {label}
        </div>
      ))}
    </div>
  )
}

/* ── Left hero panel ─────────────────────────────────────── */
function HeroPanel() {
  const t = useT()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const features = [
    { icon: Radio,     text: t('auth.hero.feat1') },
    { icon: Truck,     text: t('auth.hero.feat2') },
    { icon: CheckCircle, text: t('auth.hero.feat3') },
  ]
  const stats = [
    { value: t('auth.hero.statValue1'), label: t('auth.hero.statLabel1') },
    { value: t('auth.hero.statValue2'), label: t('auth.hero.statLabel2') },
    { value: t('auth.hero.statValue3'), label: t('auth.hero.statLabel3') },
  ]

  return (
    <div className="relative flex flex-col items-center justify-center h-full px-12 py-10 overflow-hidden"
      style={{
        background: isLight
          ? '#FFFFFF'
          : 'linear-gradient(160deg, #030E24 0%, #020918 50%, #010612 100%)',
        borderRight: isLight ? '1px solid #E2E8F0' : 'none',
      }}>

      {/* Ambient blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)', filter: 'blur(40px)', transform: 'translate(-30%, -30%)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)', filter: 'blur(40px)', transform: 'translate(20%, 20%)' }} />

      {/* Grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="authGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#authGrid)" />
      </svg>

      {/* Brand */}
      <div className="flex items-center gap-3 mb-2" style={{ animation: 'fadeInUp 0.6s ease-out both' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', boxShadow: '0 4px 20px rgba(59,130,246,0.5)' }}>
          <Truck className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-extrabold text-xl leading-none tracking-wider">RADAR</p>
          <p className="text-blue-400 font-bold text-[10px] tracking-[0.3em] uppercase mt-0.5">VINCOLOG</p>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-blue-300 text-sm text-center mb-8 max-w-xs" style={{ animation: 'fadeInUp 0.6s 0.1s ease-out both' }}>
        {t('auth.hero.tagline')}
      </p>

      {/* Radar */}
      <div style={{ animation: 'fadeInUp 0.8s 0.2s ease-out both' }}>
        <RadarScope />
      </div>

      {/* Live badge */}
      <div className="flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full"
        style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', animation: 'fadeInUp 0.6s 0.3s ease-out both' }}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ animation: 'blipPulse 1.5s ease-in-out infinite' }} />
        <span className="text-emerald-400 text-xs font-bold">{t('auth.hero.systemOnline')}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-8 w-full max-w-sm" style={{ animation: 'fadeInUp 0.6s 0.4s ease-out both' }}>
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-lg font-extrabold text-white leading-none">{value}</p>
            <p className="text-[10px] text-blue-400 mt-1 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="mt-6 space-y-2.5 w-full max-w-sm" style={{ animation: 'fadeInUp 0.6s 0.5s ease-out both' }}>
        {features.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(96,165,250,0.25)' }}>
              <Icon className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-sm text-blue-300">{text}</span>
          </div>
        ))}
      </div>

      {/* Bottom map hint */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="w-1 h-1 rounded-full"
            style={{ background: i === 3 ? '#3B82F6' : 'rgba(59,130,246,0.3)' }} />
        ))}
      </div>
    </div>
  )
}

/* ── Login page ─────────────────────────────────────────── */
export default function LoginPage() {
  const t = useT()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await signIn(fd)
      if (res?.error) setError(res.error)
    })
  }

  const L = "block text-xs font-bold text-blue-300 mb-1.5 uppercase tracking-wider"

  return (
    <div className="min-h-screen flex" style={{ background: isLight ? '#FFFFFF' : '#020C1F' }}>
      {/* ── Left: 2/3 visual ── */}
      <div className="hidden lg:block lg:w-2/3">
        <HeroPanel />
      </div>

      {/* ── Right: 1/3 form ── */}
      <div className="w-full lg:w-1/3 flex flex-col items-center justify-center p-8 relative"
        style={{
          background: isLight ? '#FFFFFF' : 'rgba(1,6,18,0.95)',
          borderLeft: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)',
        }}>

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', boxShadow: '0 4px 16px rgba(59,130,246,0.5)' }}>
            <Truck className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-extrabold text-base leading-none tracking-wider">RADAR</p>
            <p className="text-blue-400 font-bold text-[9px] tracking-[0.28em] uppercase">VINCOLOG</p>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{t('auth.login.title')}</h1>
              <p className="text-blue-400 text-sm mt-1">{t('auth.login.subtitle')}</p>
            </div>
            <div className="hidden md:block w-44"><ThemeLanguageToggle /></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={L}>{t('auth.login.email')}</label>
              <input name="email" type="email" required autoComplete="email"
                placeholder={t('auth.login.emailPlaceholder')} className="glass-input" />
            </div>

            <div>
              <label className={L}>{t('auth.login.password')}</label>
              <div className="relative">
                <input name="password" type={showPw ? 'text' : 'password'} required
                  autoComplete="current-password" placeholder="••••••••"
                  className="glass-input pr-11" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-300 transition-colors p-1">
                  {showPw
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye     className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl text-sm text-red-300 font-medium"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={pending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all mt-2"
              style={{ background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', boxShadow: '0 4px 20px rgba(59,130,246,0.45)' }}>
              <LogIn className="w-4 h-4" />
              {pending ? t('auth.login.submitting') : t('auth.login.submit')}
            </button>
          </form>

          <p className="text-center text-sm text-blue-500 mt-6">
            {t('auth.login.noAccount')}{' '}
            <Link href="/register" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
              {t('auth.login.createAccount')}
            </Link>
          </p>

          {/* Decorative location pins */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 opacity-30">
            {[MapPin, MapPin, MapPin].map((Icon, i) => (
              <Icon key={i} className="w-3 h-3 text-blue-600"
                style={{ animation: `floatY ${1.5 + i * 0.3}s ease-in-out ${i * 0.4}s infinite` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
