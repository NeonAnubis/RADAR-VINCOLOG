'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Radio, Truck, FileSignature, Send, Image as ImageIcon, AlertTriangle, ShieldCheck, BarChart2, Globe, Zap, Lock, Plane, Ship, Package } from 'lucide-react'
import { useT } from '@/lib/i18n/I18nProvider'
import { useTheme } from '@/lib/providers/ThemeProvider'
import ThemeLanguageToggle from '@/components/ThemeLanguageToggle'

/* Feature data uses translation keys — actual strings come from JSON. */
const FEATURE_KEYS = [
  { icon: FileSignature, k: 'f1' },
  { icon: Truck,         k: 'f2' },
  { icon: Send,          k: 'f3' },
  { icon: Radio,         k: 'f4' },
  { icon: ImageIcon,     k: 'f5' },
  { icon: AlertTriangle, k: 'f6' },
] as const

const SERVICE_LEVEL_KEYS = ['essencial', 'assistido_basico', 'assistido_completo', 'prime_critico'] as const

const SERVICE_LEVEL_TAGLINES: Record<typeof SERVICE_LEVEL_KEYS[number], { tagline: string; uses: string }> = {
  essencial:           { tagline: 'tagline.essencial',           uses: 'uses.essencial' },
  assistido_basico:    { tagline: 'tagline.assistido_basico',    uses: 'uses.assistido_basico' },
  assistido_completo:  { tagline: 'tagline.assistido_completo',  uses: 'uses.assistido_completo' },
  prime_critico:       { tagline: 'tagline.prime_critico',       uses: 'uses.prime_critico' },
}

const STAT_KEYS = ['kanbanSteps', 'pointsPerOit', 'serviceLevels', 'clientWatch'] as const
const STAT_VALUES: Record<typeof STAT_KEYS[number], string> = {
  kanbanSteps:   '12',
  pointsPerOit:  'A+→B+',
  serviceLevels: '4',
  clientWatch:   '24/7',
}

const STEP_KEYS = ['s1', 's2', 's3', 's4', 's5'] as const

export default function LandingPage() {
  return (
    <div className="landing-page bg-vincolog-radial overflow-x-hidden">
      <Nav />
      <Hero />
      <TrustStrip />
      <ModalitiesStrip />
      <ProductShowcase />
      <FeaturesGrid />
      <ServiceLevelsSection />
      <StatsBand />
      <HowItWorks />
      <HumanSide />
      <FinalCta />
      <Footer />
    </div>
  )
}

function Nav() {
  const t = useT()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl"
      style={{
        background: isLight ? '#FFFFFF' : 'rgba(5,6,21,0.65)',
        borderBottom: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={isLight ? '/landing/logo.png' : '/landing/logo_white.png'}
            alt="VINCOLOG"
            width={170}
            height={36}
            priority
            className="h-9 w-auto"
          />
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
            style={{ background: 'rgba(167,139,250,0.18)', color: isLight ? '#6D28D9' : '#C4B5FD', border: '1px solid rgba(167,139,250,0.35)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            RADAR
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="#features" className="hidden md:inline-block text-sm font-medium px-3 py-2" style={{ color: 'var(--text-secondary)' }}>{t('landing.nav.platform')}</Link>
          <Link href="#niveis" className="hidden md:inline-block text-sm font-medium px-3 py-2" style={{ color: 'var(--text-secondary)' }}>{t('landing.nav.levels')}</Link>
          <Link href="#fluxo" className="hidden md:inline-block text-sm font-medium px-3 py-2" style={{ color: 'var(--text-secondary)' }}>{t('landing.nav.howItWorks')}</Link>
          <div className="hidden lg:block w-40"><ThemeLanguageToggle /></div>
          <Link href="/login" className="text-sm font-bold px-4 py-2 rounded-xl glass" style={{ color: 'var(--text-primary)' }}>{t('landing.nav.signIn')}</Link>
          <Link href="/register" className="text-sm font-bold px-4 py-2 rounded-xl btn-glass-primary">
            {t('landing.nav.accessRadar')}
          </Link>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  const t = useT()
  return (
    <section className="relative">
      <div className="absolute inset-0 overflow-hidden">
        <Image src="/landing/2.png" alt="" fill priority className="object-cover opacity-40" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(5,6,21,0.4) 0%, rgba(5,6,21,0.75) 70%, rgba(5,6,21,1) 100%)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-32 lg:pt-28 lg:pb-40 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-blue-200">{t('landing.hero.badge')}</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
            <span className="text-white">{t('landing.hero.title1')}</span><br/>
            <span className="text-vincolog-gradient">{t('landing.hero.title2')}</span><br/>
            <span className="text-white">{t('landing.hero.title3')}</span>
          </h1>

          <p className="text-lg lg:text-xl text-blue-200 max-w-2xl leading-relaxed">
            {t('landing.hero.subtitle')}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/register"
              className="group flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold btn-glass-primary">
              {t('landing.hero.ctaPrimary')} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="#features" className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-blue-200 hover:text-white glass">
              {t('landing.hero.ctaSecondary')}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-blue-400">
            {[
              { icon: ShieldCheck, text: t('landing.hero.chip1') },
              { icon: Radio,        text: t('landing.hero.chip2') },
              { icon: Lock,         text: t('landing.hero.chip3') },
            ].map(({ icon: I, text }) => (
              <div key={text} className="flex items-center gap-1.5"><I className="w-3.5 h-3.5 text-blue-300" />{text}</div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="absolute -inset-8 rounded-full opacity-50 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.55) 0%, transparent 70%)', animation: 'glowPulse 6s ease-in-out infinite' }} />
          <div className="relative rounded-3xl overflow-hidden shadow-2xl"
            style={{ border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>
            <Image src="/landing/home.jpg" alt="" width={635} height={901} className="w-full h-auto" priority />
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustStrip() {
  const t = useT()
  return (
    <section className="border-y" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(5,6,21,0.6)' }}>
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between gap-6 flex-wrap">
        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">{t('landing.trust.title')}</p>
        <div className="flex items-center gap-8 flex-wrap text-blue-300 text-sm">
          {[
            { icon: Truck,    label: t('landing.trust.road') },
            { icon: Plane,    label: t('landing.trust.air') },
            { icon: Ship,     label: t('landing.trust.sea') },
            { icon: Package,  label: t('landing.trust.project') },
            { icon: Zap,      label: t('landing.trust.express') },
            { icon: Globe,    label: t('landing.trust.dedicated') },
          ].map(({ icon: I, label }) => (
            <div key={label} className="flex items-center gap-2"><I className="w-4 h-4 text-blue-400" />{label}</div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ModalitiesStrip() {
  const t = useT()
  const items = [
    'Velocidade', t('common.actions'), t('landing.trust.road'), t('landing.trust.air'),
    'A+ → B+', t('budgets.collections', { count: '...' }).split(' ').slice(1).join(' '),
    t('budgets.deliveries', { count: '...' }).split(' ').slice(1).join(' '),
    t('dashboard.title'), 'GPS', 'POD', t('common.fields.contact'),
  ]
  return (
    <section className="py-10 overflow-hidden" style={{ background: 'rgba(5,6,21,0.4)' }}>
      <div className="flex gap-12 whitespace-nowrap" style={{ animation: 'marqueeLtr 30s linear infinite', width: 'max-content' }}>
        {[...items, ...items].map((t2, i) => (
          <span key={i} className="text-2xl font-extrabold text-vincolog-gradient opacity-70">
            {t2} <span className="text-blue-700 mx-4">·</span>
          </span>
        ))}
      </div>
    </section>
  )
}

function ProductShowcase() {
  const t = useT()
  return (
    <section className="relative py-24 lg:py-32" id="features">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 relative order-2 lg:order-1">
          <div className="absolute -inset-6 blur-3xl opacity-50 pointer-events-none rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.5) 0%, transparent 70%)' }} />
          <div className="relative rounded-3xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <Image src="/landing/1.png" alt="" width={1054} height={1492} className="w-full h-auto" />
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(232,62,140,0.15)', color: '#F0ABFC', border: '1px solid rgba(232,62,140,0.3)' }}>
            <BarChart2 className="w-3 h-3" /> {t('landing.showcase.badge')}
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            {t('landing.showcase.title1')} <span className="text-vincolog-gradient">{t('landing.showcase.title2')}</span> {t('landing.showcase.title3')}
          </h2>
          <p className="text-lg text-blue-300 leading-relaxed">
            {t('landing.showcase.subtitle')}
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              t('landing.showcase.tag1'),
              t('landing.showcase.tag2'),
              t('landing.showcase.tag3'),
              t('landing.showcase.tag4'),
            ].map((label) => (
              <div key={label} className="rounded-xl p-3 glass-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0 bg-blue-400" style={{ boxShadow: '0 0 8px rgba(96,165,250,0.6)' }} />
                <span className="text-sm font-semibold text-blue-200">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesGrid() {
  const t = useT()
  return (
    <section className="relative py-24 lg:py-32" style={{ background: 'rgba(5,6,21,0.4)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(59,130,246,0.15)', color: '#93C5FD', border: '1px solid rgba(59,130,246,0.3)' }}>
            {t('landing.features.badge')}
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            {t('landing.features.title1')} <span className="text-vincolog-gradient">{t('landing.features.title2')}</span> {t('landing.features.title3')}
          </h2>
          <p className="text-lg text-blue-400 mt-4 max-w-2xl mx-auto">{t('landing.features.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURE_KEYS.map(({ icon: Icon, k }) => (
            <div key={k} className="glass rounded-2xl p-6 hover:glass-strong transition-all group">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(59,130,246,0.16)', border: '1px solid rgba(96,165,250,0.38)' }}>
                <Icon className="w-5 h-5 text-blue-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t(`landing.features.${k}Title`)}</h3>
              <p className="text-sm text-blue-300 leading-relaxed">{t(`landing.features.${k}Desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceLevelsSection() {
  const t = useT()
  return (
    <section className="relative py-24 lg:py-32" id="niveis">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.3)' }}>
            {t('landing.levels.badge')}
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            {t('landing.levels.title1')} <span className="text-vincolog-gradient">{t('landing.levels.title2')}</span>
          </h2>
          <p className="text-lg text-blue-400 mt-4 max-w-2xl mx-auto">{t('landing.levels.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICE_LEVEL_KEYS.map((key) => {
            const tagsKey = SERVICE_LEVEL_TAGLINES[key]
            const taglines: Record<string, string> = {
              essencial:           t('landing.levels.t1') !== 'landing.levels.t1' ? t('landing.levels.t1') : 'Comunicação básica + comprovante',
              assistido_basico:    'Status por marcos principais',
              assistido_completo:  'Acompanhamento ativo + evidências',
              prime_critico:       'Gestão operacional + relatórios',
            }
            const uses: Record<string, string> = {
              essencial:           'Carga simples, baixa complexidade.',
              assistido_basico:    'Cliente padrão recorrente.',
              assistido_completo:  'Carga sensível, margem saudável.',
              prime_critico:       'Cliente estratégico, alto valor.',
            }
            void tagsKey
            return (
              <div key={key} className="glass rounded-2xl p-6 hover:scale-[1.02] transition-transform"
                style={{ borderTop: '3px solid rgba(96,165,250,0.55)' }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-300">{t('landing.levels.level')}</span>
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-300"
                    style={{ background: 'rgba(59,130,246,0.16)', border: '1px solid rgba(96,165,250,0.4)' }}>★</span>
                </div>
                <h3 className="text-xl font-extrabold text-white mb-2">{t(`serviceLevels.${key}`)}</h3>
                <p className="text-sm text-blue-300 leading-relaxed mb-4">{taglines[key]}</p>
                <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[11px] text-blue-500 uppercase tracking-wider font-bold">{t('landing.levels.indicatedFor')}</p>
                  <p className="text-xs text-blue-300 mt-1">{uses[key]}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function StatsBand() {
  const t = useT()
  const subKeys: Record<typeof STAT_KEYS[number], string> = {
    kanbanSteps:   'kanbanSub',
    pointsPerOit:  'pointsSub',
    serviceLevels: 'levelsSub',
    clientWatch:   'watchSub',
  }
  return (
    <section className="relative py-16 lg:py-20" style={{
      background: 'linear-gradient(95deg, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0.14) 50%, rgba(59,130,246,0.06) 100%)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {STAT_KEYS.map(k => (
          <div key={k} className="text-center">
            <p className="text-4xl lg:text-5xl font-extrabold text-vincolog-gradient tracking-tight">{STAT_VALUES[k]}</p>
            <p className="text-sm font-bold text-white mt-2">{t(`landing.stats.${k}`)}</p>
            <p className="text-xs text-blue-400 mt-1">{t(`landing.stats.${subKeys[k]}`)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  const t = useT()
  return (
    <section className="relative py-24 lg:py-32" id="fluxo">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(6,182,212,0.15)', color: '#67E8F9', border: '1px solid rgba(6,182,212,0.3)' }}>
            {t('landing.howItWorks.badge')}
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            {t('landing.howItWorks.title1')} <span className="text-vincolog-gradient">{t('landing.howItWorks.title2')}</span><br/>{t('landing.howItWorks.title3')}
          </h2>
          <p className="text-lg text-blue-300 leading-relaxed">{t('landing.howItWorks.subtitle')}</p>

          <div className="relative rounded-2xl overflow-hidden mt-6" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <Image src="/landing/4.png" alt="" width={384} height={256} className="w-full h-auto" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          {STEP_KEYS.map((k, i) => (
            <div key={k} className="glass rounded-2xl p-6 flex gap-5 group hover:glass-strong transition-all">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-extrabold btn-glass-primary"
                  style={{ boxShadow: '0 8px 30px rgba(59,130,246,0.25), inset 0 1px 0 rgba(255,255,255,0.12)' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                {i < STEP_KEYS.length - 1 && (
                  <div className="w-px h-12 mx-auto mt-3" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2), transparent)' }} />
                )}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white mb-1">{t(`landing.howItWorks.${k}Label`)}</h3>
                <p className="text-sm text-blue-300 leading-relaxed">{t(`landing.howItWorks.${k}Desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HumanSide() {
  const t = useT()
  return (
    <section className="relative py-24 lg:py-32" style={{ background: 'rgba(5,6,21,0.4)' }}>
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 relative">
          <div className="absolute -inset-4 rounded-full pointer-events-none"
            style={{ background: 'conic-gradient(from 0deg, rgba(59,130,246,0.35), rgba(59,130,246,0.05), rgba(59,130,246,0.35), rgba(59,130,246,0.05), rgba(59,130,246,0.35))', filter: 'blur(40px)', opacity: 0.6, animation: 'rotateSlow 20s linear infinite' }} />
          <div className="relative rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
            <Image src="/landing/3.png" alt="" width={373} height={252} className="w-full h-auto" />
          </div>
        </div>

        <div className="lg:col-span-6 space-y-5">
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(167,139,250,0.15)', color: '#C4B5FD', border: '1px solid rgba(167,139,250,0.3)' }}>
            {t('landing.human.badge')}
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            {t('landing.human.title1')} <span className="text-vincolog-gradient">{t('landing.human.title2')}</span> {t('landing.human.title3')}
          </h2>
          <p className="text-lg text-blue-300 leading-relaxed">{t('landing.human.subtitle')}</p>
          <div className="space-y-3 pt-2">
            {(['b1','b2','b3','b4'] as const).map((k) => (
              <div key={k} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(96,165,250,0.45)' }}>
                  <svg className="w-3 h-3 text-blue-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" /></svg>
                </div>
                <span className="text-blue-200">{t(`landing.human.${k}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  const t = useT()
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full -top-32 -left-32"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.32) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full top-20 -right-32"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full bottom-0 left-1/3"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-5xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
          {t('landing.finalCta.title1')} <span className="text-vincolog-gradient">{t('landing.finalCta.title2')}</span><br/>{t('landing.finalCta.title3')}
        </h2>
        <p className="text-lg lg:text-xl text-blue-200 mt-6 max-w-2xl mx-auto leading-relaxed">
          {t('landing.finalCta.subtitle')}
        </p>
        <div className="flex flex-wrap items-center gap-3 justify-center mt-10">
          <Link href="/register" className="group flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold btn-glass-primary">
            {t('landing.finalCta.cta')} <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link href="/login" className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-blue-200 hover:text-white glass">
            {t('landing.finalCta.ctaSecondary')}
          </Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const t = useT()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  return (
    <footer
      className="border-t"
      style={{
        borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.06)',
        background:  isLight ? '#FFFFFF' : 'rgba(2,3,12,0.8)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Image
              src={isLight ? '/landing/logo.png' : '/landing/logo_white.png'}
              alt="VINCOLOG"
              width={170}
              height={36}
              className="h-8 w-auto mb-3"
            />
            <p className="text-sm text-blue-400 max-w-xs">{t('landing.footer.tagline')}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">{t('landing.footer.platform')}</p>
            <div className="space-y-1.5 text-sm text-blue-400">
              <Link href="#features" className="block hover:text-white">{t('landing.nav.platform')}</Link>
              <Link href="#niveis" className="block hover:text-white">{t('landing.nav.levels')}</Link>
              <Link href="#fluxo" className="block hover:text-white">{t('landing.nav.howItWorks')}</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">{t('landing.footer.access')}</p>
            <div className="space-y-1.5 text-sm text-blue-400">
              <Link href="/login" className="block hover:text-white">{t('landing.nav.signIn')}</Link>
              <Link href="/register" className="block hover:text-white">{t('common.createAccount')}</Link>
            </div>
          </div>
        </div>
        <div
          className="pt-6 flex items-center justify-between flex-wrap gap-3"
          style={{ borderTop: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs text-blue-600">{t('landing.footer.rights', { year: new Date().getFullYear() })}</p>
          <p className="text-xs text-blue-600">{t('landing.footer.powered')}</p>
        </div>
      </div>
    </footer>
  )
}
