'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signUp } from '@/lib/actions/auth'
import { Eye, EyeOff, UserPlus, MapPin, Radio, Truck, ShieldCheck } from 'lucide-react'
import { useT } from '@/lib/i18n/I18nProvider'
import { useTheme } from '@/lib/providers/ThemeProvider'
import ThemeLanguageToggle from '@/components/ThemeLanguageToggle'

/* ── Animated route map visual ───────────────────────────── */
function RouteMapVisual() {
  const nodes = [
    { cx: 140, cy: 60,  r: 5,  color: '#60A5FA', label: 'São Paulo',      lx: 148, ly: 56  },
    { cx: 260, cy: 120, r: 4,  color: '#34D399', label: 'Campinas',        lx: 265, ly: 116 },
    { cx: 220, cy: 230, r: 4,  color: '#A78BFA', label: 'Sorocaba',        lx: 226, ly: 226 },
    { cx: 60,  cy: 200, r: 4,  color: '#F59E0B', label: 'Ribeirão Preto',  lx: 4,   ly: 196 },
    { cx: 80,  cy: 100, r: 4,  color: '#F87171', label: 'Guarulhos',       lx: 30,  ly: 96  },
    { cx: 170, cy: 160, r: 5,  color: '#60A5FA', label: 'Santo André',     lx: 176, ly: 156 },
    { cx: 300, cy: 200, r: 4,  color: '#34D399', label: 'Jundiaí',         lx: 306, ly: 196 },
    { cx: 110, cy: 270, r: 4,  color: '#A78BFA', label: 'Barretos',        lx: 55,  ly: 266 },
  ]
  const edges = [
    [0, 1], [0, 4], [0, 5], [1, 2], [1, 6], [2, 5],
    [3, 5], [3, 7], [4, 5], [5, 6], [5, 7], [0, 3],
  ]

  return (
    <div className="relative w-full" style={{ maxWidth: 360, margin: '0 auto' }}>
      <svg viewBox="0 0 360 300" className="w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <pattern id="mapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(59,130,246,0.08)" strokeWidth="0.5"/>
          </pattern>
        </defs>

        {/* Grid */}
        <rect width="360" height="300" fill="url(#mapGrid)" rx="12"/>

        {/* Edges */}
        {edges.map(([a, b], i) => (
          <line key={i}
            x1={nodes[a].cx} y1={nodes[a].cy}
            x2={nodes[b].cx} y2={nodes[b].cy}
            stroke="rgba(99,102,241,0.4)" strokeWidth="1.5"
            strokeDasharray="6,4"
            style={{ animation: `routeDash ${1.4 + (i % 4) * 0.2}s linear infinite` }} />
        ))}

        {/* Node pulse rings */}
        {nodes.map((n, i) => (
          <circle key={`pr-${i}`} cx={n.cx} cy={n.cy} r={n.r + 3}
            fill="none" stroke={n.color} strokeWidth="1"
            style={{ animation: `blipRing 2.2s ease-out ${(i * 0.35) % 2}s infinite` }} />
        ))}

        {/* Nodes */}
        {nodes.map((n, i) => (
          <circle key={`n-${i}`} cx={n.cx} cy={n.cy} r={n.r}
            fill={n.color} filter="url(#nodeGlow)"
            style={{ animation: `blipPulse 2s ease-in-out ${(i * 0.4) % 2}s infinite` }} />
        ))}

        {/* Labels */}
        {nodes.map((n, i) => (
          <text key={`l-${i}`} x={n.lx} y={n.ly}
            fill="rgba(147,197,253,0.65)" fontSize="7.5" fontFamily="monospace">
            {n.label}
          </text>
        ))}

        {/* Moving truck icon (SVG path that travels along a route) */}
        <circle cx="200" cy="110" r="6"
          fill="rgba(59,130,246,0.25)" stroke="rgba(96,165,250,0.5)" strokeWidth="1.5">
          <animateMotion dur="6s" repeatCount="indefinite" rotate="auto">
            <mpath href="#routePath1"/>
          </animateMotion>
        </circle>
        <circle cx="200" cy="110" r="3" fill="#60A5FA">
          <animateMotion dur="6s" repeatCount="indefinite" rotate="auto">
            <mpath href="#routePath1"/>
          </animateMotion>
        </circle>

        <path id="routePath1" d={`M ${nodes[0].cx} ${nodes[0].cy} L ${nodes[1].cx} ${nodes[1].cy} L ${nodes[6].cx} ${nodes[6].cy} L ${nodes[2].cx} ${nodes[2].cy} L ${nodes[5].cx} ${nodes[5].cy} L ${nodes[0].cx} ${nodes[0].cy}`} fill="none"/>

        {/* Second truck */}
        <circle r="5" fill="rgba(52,211,153,0.2)" stroke="rgba(52,211,153,0.5)" strokeWidth="1.5">
          <animateMotion dur="8s" begin="2s" repeatCount="indefinite">
            <mpath href="#routePath2"/>
          </animateMotion>
        </circle>
        <circle r="2.5" fill="#34D399">
          <animateMotion dur="8s" begin="2s" repeatCount="indefinite">
            <mpath href="#routePath2"/>
          </animateMotion>
        </circle>
        <path id="routePath2" d={`M ${nodes[4].cx} ${nodes[4].cy} L ${nodes[5].cx} ${nodes[5].cy} L ${nodes[7].cx} ${nodes[7].cy} L ${nodes[3].cx} ${nodes[3].cy} L ${nodes[5].cx} ${nodes[5].cy} L ${nodes[4].cx} ${nodes[4].cy}`} fill="none"/>
      </svg>

      {/* Floating status chips */}
      {[
        { label: 'FT-0047 • Em Rota',  color: '#A78BFA', top: '8%',   left: '2%',  delay: '0s'   },
        { label: 'FT-0048 • Coletado', color: '#60A5FA', top: '68%',  right: '2%', delay: '0.5s' },
        { label: 'FT-0046 • Entregue', color: '#34D399', bottom: '5%',left: '8%',  delay: '1s'   },
      ].map(({ label, color, top, right, bottom, left, delay }) => (
        <div key={label}
          className="absolute flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold"
          style={{
            background: 'rgba(2,8,28,0.85)',
            border: `1px solid ${color}44`,
            color,
            top, right, bottom, left,
            animation: `floatY 3s ease-in-out ${delay} infinite`,
            backdropFilter: 'blur(8px)',
          }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
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
    { icon: Radio,       text: t('auth.hero.registerFeat1') },
    { icon: Truck,       text: t('auth.hero.registerFeat2') },
    { icon: ShieldCheck, text: t('auth.hero.registerFeat3') },
  ]

  return (
    <div className="relative flex flex-col items-center justify-center h-full px-6 sm:px-10 py-8 sm:py-10 overflow-hidden"
      style={{
        background: isLight
          ? '#FFFFFF'
          : 'linear-gradient(160deg, #030E24 0%, #020918 50%, #010612 100%)',
        borderRight: isLight ? '1px solid #E2E8F0' : 'none',
      }}>

      {/* Ambient blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.16) 0%, transparent 70%)', filter: 'blur(40px)', transform: 'translate(20%, -20%)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 70%)', filter: 'blur(40px)', transform: 'translate(-20%, 20%)' }} />

      {/* Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="authGrid2" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#authGrid2)" />
      </svg>

      {/* Brand — clickable, returns to landing */}
      <Link href="/" aria-label="VINCOLOG" className="block mb-1" style={{ animation: 'fadeInUp 0.6s ease-out both' }}>
        <Image
          src={isLight ? '/landing/logo.png' : '/landing/logo_white.png'}
          alt="VINCOLOG"
          width={210}
          height={44}
          priority
          className="h-10 w-auto"
        />
      </Link>

      <p className="text-blue-300 text-sm text-center mb-6 max-w-xs" style={{ animation: 'fadeInUp 0.6s 0.1s ease-out both' }}>
        {t('auth.hero.registerTagline')}
      </p>

      {/* Route map */}
      <div className="w-full" style={{ animation: 'fadeInUp 0.8s 0.2s ease-out both' }}>
        <RouteMapVisual />
      </div>

      {/* Features */}
      <div className="mt-6 space-y-2.5 w-full max-w-sm" style={{ animation: 'fadeInUp 0.6s 0.4s ease-out both' }}>
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

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 opacity-30">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="w-1 h-1 rounded-full"
            style={{ background: i === 2 ? '#3B82F6' : 'rgba(59,130,246,0.3)' }} />
        ))}
      </div>
    </div>
  )
}

/* ── Register page ─────────────────────────────────────── */
export default function RegisterPage() {
  const t = useT()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const [showPw,      setShowPw]      = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error,  setError]  = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    if (fd.get('password') !== fd.get('confirmPassword')) {
      setError(t('auth.register.passwordMismatch'))
      return
    }
    startTransition(async () => {
      const res = await signUp(fd)
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
      <div className="w-full lg:w-1/3 flex flex-col items-center justify-center p-8 relative overflow-auto"
        style={{
          background: isLight ? '#FFFFFF' : 'rgba(1,6,18,0.95)',
          borderLeft: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)',
        }}>

        {/* Mobile logo — clickable, returns to landing */}
        <Link href="/" aria-label="VINCOLOG" className="lg:hidden mb-8 inline-block">
          <Image
            src={isLight ? '/landing/logo.png' : '/landing/logo_white.png'}
            alt="VINCOLOG"
            width={180}
            height={38}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{t('auth.register.title')}</h1>
              <p className="text-blue-400 text-sm mt-1">{t('auth.register.subtitle')}</p>
            </div>
            <div className="hidden md:block w-44"><ThemeLanguageToggle /></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={L}>{t('auth.register.fullName')}</label>
              <input name="name" type="text" required placeholder={t('auth.register.namePlaceholder')}
                className="glass-input" />
            </div>

            <div>
              <label className={L}>{t('auth.login.email')}</label>
              <input name="email" type="email" required placeholder={t('auth.login.emailPlaceholder')}
                className="glass-input" />
            </div>

            <div>
              <label className={L}>{t('auth.register.password')}</label>
              <div className="relative">
                <input name="password" type={showPw ? 'text' : 'password'} required minLength={6}
                  placeholder="••••••••" className="glass-input pr-11" />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-300 transition-colors p-1">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className={L}>{t('auth.register.confirmPassword')}</label>
              <div className="relative">
                <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} required
                  placeholder="••••••••" className="glass-input pr-11" />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-300 transition-colors p-1">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              <UserPlus className="w-4 h-4" />
              {pending ? t('auth.register.submitting') : t('auth.register.submit')}
            </button>
          </form>

          <p className="text-center text-sm text-blue-500 mt-6">
            {t('auth.register.haveAccount')}{' '}
            <Link href="/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
              {t('auth.register.signIn')}
            </Link>
          </p>

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
