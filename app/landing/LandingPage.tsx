import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Radio, Truck, FileSignature, Send, Clock, Image as ImageIcon, AlertTriangle, ShieldCheck, BarChart2, Globe, Zap, Lock, Plane, Ship, Package } from 'lucide-react'

const FEATURES = [
  { icon: FileSignature, title: 'Orçamento → OIT automática',     desc: 'O comercial cadastra a proposta; quando o cliente aprova, a OIT nasce no Kanban operacional instantaneamente.' },
  { icon: Truck,         title: 'Rota A+ → B+',                   desc: 'Uma OIT, múltiplas coletas e múltiplas entregas. Dedicado, lotação, expresso, aéreo ou carga-projeto.' },
  { icon: Send,          title: 'Contrato por viagem + OC PDF',   desc: 'Contrato do prestador e Ordem de Coleta do cliente geradas em PDF com a identidade visual VINCOLOG.' },
  { icon: Radio,         title: 'GPS contínuo on/offline',        desc: 'Rastreamento do veículo durante a viagem. Sem sinal? Grava local e sincroniza ao voltar online.' },
  { icon: ImageIcon,     title: 'Fotos vinculadas a eventos',     desc: 'Cada foto fica colada ao status correspondente — chegada, carregamento, amarração, POD. Histórico visual completo.' },
  { icon: AlertTriangle, title: 'Ocorrências estruturadas',       desc: 'Atraso, avaria, recusa, sinistro — registradas com impacto, ação tomada e nova previsão.' },
]

const SERVICE_LEVELS = [
  { name: 'Essencial',           tagline: 'Comunicação básica + comprovante',  uses: 'Carga simples, baixa complexidade.' },
  { name: 'Assistido Básico',    tagline: 'Status por marcos principais',      uses: 'Cliente padrão recorrente.' },
  { name: 'Assistido Completo',  tagline: 'Acompanhamento ativo + evidências', uses: 'Carga sensível, margem saudável.' },
  { name: 'Prime / Crítico',     tagline: 'Gestão operacional + relatórios',   uses: 'Cliente estratégico, alto valor.' },
]

const STATS = [
  { value: '12',     label: 'Etapas do Kanban',     sub: 'da criação à finalização' },
  { value: 'A+→B+',  label: 'Pontos por OIT',        sub: 'múltiplas coletas e entregas' },
  { value: '4',      label: 'Níveis de serviço',     sub: 'do Essencial ao Prime' },
  { value: '24/7',   label: 'Cliente acompanha',      sub: 'link público por token' },
]

const STEPS = [
  { n: '01', label: 'Solicitação',  desc: 'Comercial cadastra orçamento com cliente, rota A+→B+, carga e veículo.' },
  { n: '02', label: 'Aprovação',    desc: 'Cliente aprova um dos níveis de serviço. OIT nasce automaticamente.' },
  { n: '03', label: 'Alocação',     desc: 'Operacional aloca prestador, veículo e motorista. Contrato gerado.' },
  { n: '04', label: 'Execução',     desc: 'Motorista atualiza status, anexa fotos e POD. GPS rastreia em tempo real.' },
  { n: '05', label: 'Finalização',  desc: 'Entrega confirmada, comprovante anexado. OIT encerrada com histórico completo.' },
]

export default function LandingPage() {
  return (
    <div className="bg-vincolog-radial text-white overflow-x-hidden">
      {/* ─── NAV ─── */}
      <Nav />

      {/* ─── HERO ─── */}
      <Hero />

      {/* ─── LOGO MARQUEE / TRUST STRIP ─── */}
      <TrustStrip />

      {/* ─── MODAIS ─── */}
      <ModalitiesStrip />

      {/* ─── PRODUTO ─── */}
      <ProductShowcase />

      {/* ─── FEATURES GRID ─── */}
      <FeaturesGrid />

      {/* ─── SERVICE LEVELS ─── */}
      <ServiceLevelsSection />

      {/* ─── STATS BAND ─── */}
      <StatsBand />

      {/* ─── HOW IT WORKS ─── */}
      <HowItWorks />

      {/* ─── HUMAN SIDE ─── */}
      <HumanSide />

      {/* ─── FINAL CTA ─── */}
      <FinalCta />

      {/* ─── FOOTER ─── */}
      <Footer />
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */

function Nav() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: 'rgba(5,6,21,0.65)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/landing/logo_white.png" alt="VINCOLOG" width={170} height={36} priority className="h-9 w-auto" />
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
            style={{ background: 'rgba(167,139,250,0.18)', color: '#C4B5FD', border: '1px solid rgba(167,139,250,0.35)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            RADAR
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="#features" className="hidden md:inline-block text-sm font-medium text-blue-300 hover:text-white px-3 py-2">Plataforma</Link>
          <Link href="#niveis" className="hidden md:inline-block text-sm font-medium text-blue-300 hover:text-white px-3 py-2">Níveis</Link>
          <Link href="#fluxo" className="hidden md:inline-block text-sm font-medium text-blue-300 hover:text-white px-3 py-2">Como funciona</Link>
          <Link href="/login" className="text-sm font-bold text-white px-4 py-2 rounded-xl glass">Entrar</Link>
          <Link href="/register"
            className="text-sm font-bold px-4 py-2 rounded-xl btn-glass-primary">
            Acessar RADAR
          </Link>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="relative">
      {/* Background image with overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <Image src="/landing/2.png" alt="Logística global" fill priority className="object-cover opacity-40" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(5,6,21,0.4) 0%, rgba(5,6,21,0.75) 70%, rgba(5,6,21,1) 100%)' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-32 lg:pt-28 lg:pb-40 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-blue-200">Operação 100% rastreável · Sistema interno VINCOLOG</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
            <span className="text-white">Inteligência que</span><br/>
            <span className="text-vincolog-gradient">conecta cada frete</span><br/>
            <span className="text-white">à sua decisão.</span>
          </h1>

          <p className="text-lg lg:text-xl text-blue-200 max-w-2xl leading-relaxed">
            Gestão operacional completa de transporte <strong className="text-white">A+ → B+</strong>: do orçamento comercial à entrega comprovada, com GPS contínuo, fotos vinculadas a cada etapa e link de acompanhamento para o cliente.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/register"
              className="group flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold btn-glass-primary">
              Acessar RADAR <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="#features"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-blue-200 hover:text-white glass">
              Conhecer a plataforma
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-blue-400">
            {[
              { icon: ShieldCheck, text: 'Contrato por viagem' },
              { icon: Radio,        text: 'GPS online/offline' },
              { icon: Lock,         text: 'Token público seguro' },
            ].map(({ icon: I, text }) => (
              <div key={text} className="flex items-center gap-1.5"><I className="w-3.5 h-3.5 text-blue-300" />{text}</div>
            ))}
          </div>
        </div>

        {/* Right showcase — uses home.jpg as floating poster */}
        <div className="lg:col-span-5 relative">
          {/* Glow — single-color blue */}
          <div className="absolute -inset-8 rounded-full opacity-50 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.55) 0%, transparent 70%)', animation: 'glowPulse 6s ease-in-out infinite' }} />

          <div className="relative rounded-3xl overflow-hidden shadow-2xl"
            style={{ border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>
            <Image src="/landing/home.jpg" alt="RADAR Operacional do Pedido" width={635} height={901} className="w-full h-auto" priority />
          </div>

          {/* Floating cards */}
          <div className="hidden md:block absolute -left-6 top-1/4 px-3 py-2 rounded-xl glass-strong text-xs"
            style={{ animation: 'floatY 4s ease-in-out infinite' }}>
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-violet-300" />
              <span className="font-bold text-white">FT-2026-0047</span>
            </div>
            <p className="text-violet-300 mt-0.5">Em rota · Cajamar→SP</p>
          </div>
          <div className="hidden md:block absolute -right-4 bottom-1/4 px-3 py-2 rounded-xl glass-strong text-xs"
            style={{ animation: 'floatY 4.5s ease-in-out 0.5s infinite' }}>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-emerald-300">POD recebido</span>
            </div>
            <p className="text-blue-300 mt-0.5">Ana Paula Rodrigues · 14:30</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustStrip() {
  return (
    <section className="border-y" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(5,6,21,0.6)' }}>
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between gap-6 flex-wrap">
        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Cobertura operacional</p>
        <div className="flex items-center gap-8 flex-wrap text-blue-300 text-sm">
          {[
            { icon: Truck,    label: 'Rodoviário' },
            { icon: Plane,    label: 'Aéreo' },
            { icon: Ship,     label: 'Marítimo' },
            { icon: Package,  label: 'Carga Projeto' },
            { icon: Zap,      label: 'Expresso' },
            { icon: Globe,    label: 'Dedicado' },
          ].map(({ icon: I, label }) => (
            <div key={label} className="flex items-center gap-2"><I className="w-4 h-4 text-blue-400" />{label}</div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ModalitiesStrip() {
  // Marquee with repeating service labels
  const items = ['Velocidade', 'Inteligência', 'Conexão Logística', 'Rastreabilidade', 'Evidências', 'POD digital', 'Auditoria', 'A+ → B+', 'Multi-Coletas', 'Multi-Entregas', 'Torre de Controle', 'GPS Contínuo']
  return (
    <section className="py-10 overflow-hidden" style={{ background: 'rgba(5,6,21,0.4)' }}>
      <div className="flex gap-12 whitespace-nowrap" style={{ animation: 'marqueeLtr 30s linear infinite', width: 'max-content' }}>
        {[...items, ...items].map((t, i) => (
          <span key={i} className="text-2xl font-extrabold text-vincolog-gradient opacity-70">
            {t} <span className="text-blue-700 mx-4">·</span>
          </span>
        ))}
      </div>
    </section>
  )
}

function ProductShowcase() {
  return (
    <section className="relative py-24 lg:py-32" id="features">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
        {/* Image */}
        <div className="lg:col-span-6 relative order-2 lg:order-1">
          <div className="absolute -inset-6 blur-3xl opacity-50 pointer-events-none rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.5) 0%, transparent 70%)' }} />
          <div className="relative rounded-3xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <Image src="/landing/1.png" alt="RADAR Operacional de Frotas" width={1054} height={1492} className="w-full h-auto" />
          </div>
        </div>

        {/* Copy */}
        <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(232,62,140,0.15)', color: '#F0ABFC', border: '1px solid rgba(232,62,140,0.3)' }}>
            <BarChart2 className="w-3 h-3" /> RADAR Operacional
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            Visibilidade <span className="text-vincolog-gradient">completa</span> da sua operação na estrada.
          </h2>
          <p className="text-lg text-blue-300 leading-relaxed">
            Do orçamento aprovado até o POD assinado, cada evento operacional é registrado, vinculado a fotos e disponível em tempo real para a equipe interna e para o cliente.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              'Monitoramento 24/7',
              'Segurança na operação',
              'Indicadores de performance',
              'Conformidade & alertas',
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
  return (
    <section className="relative py-24 lg:py-32" style={{ background: 'rgba(5,6,21,0.4)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(59,130,246,0.15)', color: '#93C5FD', border: '1px solid rgba(59,130,246,0.3)' }}>
            Plataforma
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            Tudo que sua operação <span className="text-vincolog-gradient">precisa</span> em um só sistema.
          </h2>
          <p className="text-lg text-blue-400 mt-4 max-w-2xl mx-auto">
            Substitua planilhas, WhatsApp solto e e-mails dispersos por um fluxo único auditável.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass rounded-2xl p-6 hover:glass-strong transition-all group">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(59,130,246,0.16)', border: '1px solid rgba(96,165,250,0.38)' }}>
                <Icon className="w-5 h-5 text-blue-300" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-blue-300 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceLevelsSection() {
  return (
    <section className="relative py-24 lg:py-32" id="niveis">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.3)' }}>
            Níveis de Serviço
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            Quatro produtos. <span className="text-vincolog-gradient">Sua escolha.</span>
          </h2>
          <p className="text-lg text-blue-400 mt-4 max-w-2xl mx-auto">
            Cada frete é vendido com um nível de acompanhamento — do comprovante final ao plano operacional completo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICE_LEVELS.map((lvl) => (
            <div key={lvl.name} className="glass rounded-2xl p-6 hover:scale-[1.02] transition-transform"
              style={{ borderTop: '3px solid rgba(96,165,250,0.55)' }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-300">Nível</span>
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-300"
                  style={{ background: 'rgba(59,130,246,0.16)', border: '1px solid rgba(96,165,250,0.4)' }}>
                  ★
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white mb-2">{lvl.name}</h3>
              <p className="text-sm text-blue-300 leading-relaxed mb-4">{lvl.tagline}</p>
              <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[11px] text-blue-500 uppercase tracking-wider font-bold">Indicado para</p>
                <p className="text-xs text-blue-300 mt-1">{lvl.uses}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsBand() {
  return (
    <section className="relative py-16 lg:py-20" style={{
      background: 'linear-gradient(95deg, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0.14) 50%, rgba(59,130,246,0.06) 100%)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map(({ value, label, sub }) => (
          <div key={label} className="text-center">
            <p className="text-4xl lg:text-5xl font-extrabold text-vincolog-gradient tracking-tight">{value}</p>
            <p className="text-sm font-bold text-white mt-2">{label}</p>
            <p className="text-xs text-blue-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="relative py-24 lg:py-32" id="fluxo">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-start">
        {/* Left copy */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(6,182,212,0.15)', color: '#67E8F9', border: '1px solid rgba(6,182,212,0.3)' }}>
            Como funciona
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            Do <span className="text-vincolog-gradient">orçamento</span> ao POD<br/>em 5 etapas auditáveis.
          </h2>
          <p className="text-lg text-blue-300 leading-relaxed">
            Cada etapa registra evento, usuário, anexo e timestamp. Cliente acompanha em tempo real pelo link público.
          </p>

          <div className="relative rounded-2xl overflow-hidden mt-6"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <Image src="/landing/4.png" alt="Fluxo operacional" width={384} height={256} className="w-full h-auto" />
          </div>
        </div>

        {/* Right steps */}
        <div className="lg:col-span-7 space-y-4">
          {STEPS.map((s, i) => (
            <div key={s.n} className="glass rounded-2xl p-6 flex gap-5 group hover:glass-strong transition-all">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-extrabold btn-glass-primary"
                  style={{ boxShadow: '0 8px 30px rgba(59,130,246,0.25), inset 0 1px 0 rgba(255,255,255,0.12)' }}>
                  {s.n}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-px h-12 mx-auto mt-3" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.2), transparent)' }} />
                )}
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white mb-1">{s.label}</h3>
                <p className="text-sm text-blue-300 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HumanSide() {
  return (
    <section className="relative py-24 lg:py-32" style={{ background: 'rgba(5,6,21,0.4)' }}>
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 relative">
          {/* Decorative ring — single blue */}
          <div className="absolute -inset-4 rounded-full pointer-events-none"
            style={{ background: 'conic-gradient(from 0deg, rgba(59,130,246,0.35), rgba(59,130,246,0.05), rgba(59,130,246,0.35), rgba(59,130,246,0.05), rgba(59,130,246,0.35))', filter: 'blur(40px)', opacity: 0.6, animation: 'rotateSlow 20s linear infinite' }} />
          <div className="relative rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
            <Image src="/landing/3.png" alt="Equipe VINCOLOG" width={373} height={252} className="w-full h-auto" />
          </div>
        </div>

        <div className="lg:col-span-6 space-y-5">
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(167,139,250,0.15)', color: '#C4B5FD', border: '1px solid rgba(167,139,250,0.3)' }}>
            Operação humana
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            Tecnologia que <span className="text-vincolog-gradient">simplifica</span> a rotina de quem opera.
          </h2>
          <p className="text-lg text-blue-300 leading-relaxed">
            Operadores trabalham no Kanban. Motoristas usam o app por link, sem instalar nada. Clientes acompanham por link público. Tudo conectado em uma única OIT.
          </p>
          <div className="space-y-3 pt-2">
            {[
              'Onboarding em 2 minutos via convite link',
              'Status em 2 toques no celular do motorista',
              'POD com foto + nome do recebedor + assinatura',
              'Cliente sempre informado, sem virar telefone',
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(96,165,250,0.45)' }}>
                  <svg className="w-3 h-3 text-blue-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" /></svg>
                </div>
                <span className="text-blue-200">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background blue orbs — single color */}
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
          Pronto para <span className="text-vincolog-gradient">acelerar</span><br/>sua operação?
        </h2>
        <p className="text-lg lg:text-xl text-blue-200 mt-6 max-w-2xl mx-auto leading-relaxed">
          Acesse a RADAR VINCOLOG agora e transforme cada frete em informação operacional.
        </p>
        <div className="flex flex-wrap items-center gap-3 justify-center mt-10">
          <Link href="/register"
            className="group flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold btn-glass-primary">
            Criar acesso agora <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link href="/login"
            className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-blue-200 hover:text-white glass">
            Já tenho conta
          </Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(2,3,12,0.8)' }}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Image src="/landing/logo_white.png" alt="VINCOLOG" width={170} height={36} className="h-8 w-auto mb-3" />
            <p className="text-sm text-blue-400 max-w-xs">Velocidade, inteligência e conexão logística. Sistema interno de gestão operacional de transporte A+→B+.</p>
          </div>
          <div>
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">Plataforma</p>
            <div className="space-y-1.5 text-sm text-blue-400">
              <Link href="#features" className="block hover:text-white">Recursos</Link>
              <Link href="#niveis" className="block hover:text-white">Níveis de Serviço</Link>
              <Link href="#fluxo" className="block hover:text-white">Como funciona</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-3">Acesso</p>
            <div className="space-y-1.5 text-sm text-blue-400">
              <Link href="/login" className="block hover:text-white">Entrar</Link>
              <Link href="/register" className="block hover:text-white">Criar conta</Link>
            </div>
          </div>
        </div>
        <div className="pt-6 flex items-center justify-between flex-wrap gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs text-blue-600">© {new Date().getFullYear()} VINCOLOG Transportes · Sistema RADAR · Phase 1</p>
          <p className="text-xs text-blue-600">Powered by RADAR Operacional</p>
        </div>
      </div>
    </footer>
  )
}
