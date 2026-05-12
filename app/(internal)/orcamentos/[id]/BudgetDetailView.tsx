'use client'

import Link from 'next/link'
import { ArrowLeft, MapPin, FileText, Package, Truck, User, AlertCircle } from 'lucide-react'
import { BudgetStatusBadge, ServiceLevelBadge } from '@/components/StatusBadge'
import { fmtDate, fmtCurrency, fmtDateTime } from '@/lib/utils/format'
import { useT } from '@/lib/i18n/I18nProvider'
import type { DbBudget, DbCollectionPoint, DbDeliveryPoint, ServiceLevel, ServiceLevelOffer } from '@/lib/types'
import GenerateProposalButton from './GenerateProposalButton'
import ApproveBudgetButton from './ApproveBudgetButton'

interface Props {
  b: DbBudget
  collectionPoints: DbCollectionPoint[]
  deliveryPoints: DbDeliveryPoint[]
  oit: { id: string; number: string } | null
  offered: [ServiceLevel, ServiceLevelOffer][]
}

const CARGO_TAG_MAP: Array<[keyof DbBudget, string]> = [
  ['cargo_sensitive', 'sensitive'],
  ['cargo_high_value', 'highValue'],
  ['cargo_needs_tarp', 'tarp'],
  ['cargo_needs_strap', 'strap'],
  ['cargo_needs_tracker', 'tracker'],
  ['cargo_needs_photo', 'photo'],
]

const VEHICLE_TAG_MAP: Array<[keyof DbBudget, string]> = [
  ['vehicle_exclusive', 'exclusive'],
  ['vehicle_full_load', 'fullLoad'],
  ['operation_dedicated', 'dedicated'],
  ['operation_aero', 'aero'],
  ['operation_project', 'project'],
]

export default function BudgetDetailView({ b, collectionPoints, deliveryPoints, oit, offered }: Props) {
  const t = useT()

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/orcamentos" className="p-2 rounded-xl text-blue-400 hover:text-white glass">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-white font-mono">{b.number}</h1>
              <BudgetStatusBadge status={b.status} />
              {b.approved_level && <ServiceLevelBadge level={b.approved_level} />}
            </div>
            <p className="text-sm text-blue-400 mt-0.5">{t('budgetDetail.createdAt', { date: fmtDateTime(b.created_at) })}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {b.status !== 'aprovado' && b.status !== 'recusado' && (
            <GenerateProposalButton budget={b} collectionPoints={collectionPoints} deliveryPoints={deliveryPoints} />
          )}
          {b.status !== 'aprovado' && b.status !== 'recusado' && offered.length > 0 && (
            <ApproveBudgetButton budgetId={b.id} offered={offered} />
          )}
          {oit && (
            <Link href={`/oits/${oit.id}`} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#34D399,#059669)', boxShadow: '0 4px 14px rgba(52,211,153,0.4)' }}>
              {t('budgetDetail.viewOit', { number: oit.number })}
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Cliente */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2"><User className="w-4 h-4" /> {t('budgetDetail.client')}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-blue-500 text-xs">{t('budgetDetail.clientFields.companyName')}</p><p className="text-white font-bold">{b.client_name ?? '—'}</p></div>
              <div><p className="text-blue-500 text-xs">{t('budgetDetail.clientFields.document')}</p><p className="text-blue-200">{b.client_document ?? '—'}</p></div>
              <div><p className="text-blue-500 text-xs">{t('budgetDetail.clientFields.contact')}</p><p className="text-blue-200">{b.client_contact_name ?? '—'}</p></div>
              <div><p className="text-blue-500 text-xs">{t('budgetDetail.clientFields.phone')}</p><p className="text-blue-200">{b.client_contact_phone ?? '—'}</p></div>
              <div className="col-span-2"><p className="text-blue-500 text-xs">{t('budgetDetail.clientFields.email')}</p><p className="text-blue-200">{b.client_contact_email ?? '—'}</p></div>
            </div>
          </div>

          {/* Rota A+ → B+ */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {t('budgetDetail.routeTitle')}
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">{t('budgetDetail.pickupPointsCount', { count: collectionPoints.length })}</p>
                {collectionPoints.map((p, i) => (
                  <div key={p.id} className="p-3 rounded-lg mb-2" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}>
                    <p className="text-xs font-bold text-blue-300">{t('budgetDetail.pickupNumber', { n: i+1, name: p.name ?? '—' })}</p>
                    <p className="text-sm text-white">{p.full_address ?? '—'}</p>
                    <p className="text-xs text-blue-400">{p.city}/{p.uf} {p.cep ? `· ${t('budgetDetail.cepLabel')} ${p.cep}` : ''}</p>
                    {p.scheduled_date && <p className="text-xs text-blue-400">{t('budgetDetail.dateLabel')} {fmtDate(p.scheduled_date)} {p.time_window ?? ''}</p>}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">{t('budgetDetail.deliveryPointsCount', { count: deliveryPoints.length })}</p>
                {deliveryPoints.map((p, i) => (
                  <div key={p.id} className="p-3 rounded-lg mb-2" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <p className="text-xs font-bold text-emerald-300">{t('budgetDetail.deliveryNumber', { n: i+1, name: p.name ?? '—' })}</p>
                    <p className="text-sm text-white">{p.full_address ?? '—'}</p>
                    <p className="text-xs text-blue-400">{p.city}/{p.uf} {p.cep ? `· ${t('budgetDetail.cepLabel')} ${p.cep}` : ''}</p>
                    {p.scheduled_date && <p className="text-xs text-blue-400">{t('budgetDetail.dateLabel')} {fmtDate(p.scheduled_date)} {p.time_window ?? ''}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Carga */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2"><Package className="w-4 h-4" /> {t('budgetDetail.cargo')}</h2>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="col-span-3"><p className="text-blue-500 text-xs">{t('budgetDetail.cargoFields.description')}</p><p className="text-white">{b.cargo_description ?? '—'}</p></div>
              <div><p className="text-blue-500 text-xs">{t('budgetDetail.cargoFields.weight')}</p><p className="text-white">{b.cargo_weight ?? '—'}</p></div>
              <div><p className="text-blue-500 text-xs">{t('budgetDetail.cargoFields.volumes')}</p><p className="text-white">{b.cargo_volumes ?? '—'}</p></div>
              <div><p className="text-blue-500 text-xs">{t('budgetDetail.cargoFields.nf')}</p><p className="text-white">{b.document_number ?? '—'}</p></div>
              {b.document_value && <div><p className="text-blue-500 text-xs">{t('budgetDetail.cargoFields.nfValue')}</p><p className="text-white">{fmtCurrency(b.document_value)}</p></div>}
            </div>
            <div className="flex gap-2 flex-wrap mt-3">
              {CARGO_TAG_MAP.map(([k, tk]) => b[k] ? (
                <span key={String(k)} className="px-2 py-0.5 rounded text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/35">{t(`budgetDetail.cargoTags.${tk}`)}</span>
              ) : null)}
            </div>
          </div>

          {/* Veículo */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-bold text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2"><Truck className="w-4 h-4" /> {t('budgetDetail.vehicleProfile')}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-blue-500 text-xs">{t('budgetDetail.vehicleType')}</p><p className="text-white">{b.vehicle_suggested_type ?? '—'}</p></div>
              <div><p className="text-blue-500 text-xs">{t('budgetDetail.vehicleBody')}</p><p className="text-white">{b.vehicle_body_type ?? '—'}</p></div>
            </div>
            <div className="flex gap-2 flex-wrap mt-3">
              {VEHICLE_TAG_MAP.map(([k, tk]) => b[k] ? (
                <span key={String(k)} className="px-2 py-0.5 rounded text-[10px] bg-violet-400/20 text-violet-300 border border-violet-400/35">{t(`budgetDetail.vehicleTags.${tk}`)}</span>
              ) : null)}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Service Levels */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-wider">{t('budgetDetail.levelsOffered')}</h2>
            {offered.length === 0 ? (
              <p className="text-xs text-blue-600">{t('budgetDetail.noneConfigured')}</p>
            ) : (
              <div className="space-y-2.5">
                {offered.map(([key, cfg]) => (
                  <ServiceLevelCard key={key} levelKey={key} cfg={cfg} />
                ))}
              </div>
            )}
          </div>

          {/* Proposal PDF */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-wider flex items-center gap-2"><FileText className="w-4 h-4" /> {t('budgetDetail.proposal')}</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-blue-500">{t('common.status')}</span>
                <BudgetStatusBadge status={b.status} />
              </div>
              {b.proposal_sent_at && <div className="flex justify-between"><span className="text-blue-500">{t('budgetDetail.proposalSentAt')}</span><span className="text-blue-200">{fmtDateTime(b.proposal_sent_at)}</span></div>}
              {b.approved_at && <div className="flex justify-between"><span className="text-blue-500">{t('budgetDetail.approvedAt')}</span><span className="text-emerald-400 font-bold">{fmtDateTime(b.approved_at)}</span></div>}
              {b.approved_value && <div className="flex justify-between"><span className="text-blue-500">{t('budgetDetail.approvedValue')}</span><span className="text-white font-bold">{fmtCurrency(b.approved_value)}</span></div>}
            </div>
          </div>

          {/* Commercial conditions */}
          <div className="glass rounded-2xl p-5">
            <h2 className="text-xs font-bold text-blue-400 mb-3 uppercase tracking-wider">{t('budgetDetail.commercialConditions')}</h2>
            <div className="space-y-2 text-xs">
              {b.validity_date     && <div><p className="text-blue-500">{t('common.fields.validity')}</p><p className="text-blue-200">{fmtDate(b.validity_date)}</p></div>}
              {b.payment_condition && <div><p className="text-blue-500">{t('budgets.form.paymentCondition')}</p><p className="text-blue-200">{b.payment_condition}</p></div>}
              {b.premises          && <div><p className="text-blue-500">{t('budgets.form.premises')}</p><p className="text-blue-200">{b.premises}</p></div>}
              {b.exclusions        && <div><p className="text-blue-500">{t('budgets.form.exclusions')}</p><p className="text-blue-200">{b.exclusions}</p></div>}
            </div>
          </div>

          {b.needs_operational_approval || b.needs_director_approval ? (
            <div className="rounded-2xl p-4" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-300">
                  {b.needs_operational_approval && <p>{t('budgetDetail.needsOperationalApproval')}</p>}
                  {b.needs_director_approval && <p>{t('budgetDetail.needsDirectorApproval')}</p>}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function ServiceLevelCard({ levelKey, cfg }: { levelKey: ServiceLevel; cfg: ServiceLevelOffer }) {
  const t = useT()
  // Match colors from SERVICE_LEVELS but use translation for label
  const COLORS: Record<ServiceLevel, string> = {
    essencial: '#94A3B8', assistido_basico: '#60A5FA',
    assistido_completo: '#A78BFA', prime_critico: '#F59E0B',
  }
  const color = COLORS[levelKey]
  return (
    <div className="rounded-lg p-3" style={{ background: `${color}1a`, border: `1px solid ${color}55` }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold" style={{ color }}>{t(`serviceLevels.${levelKey}`)}</span>
        <span className="text-sm font-extrabold text-white">{fmtCurrency(cfg.total)}</span>
      </div>
      {cfg.validity && <p className="text-[10px] text-blue-500">{t('common.fields.validity')}: {cfg.validity}</p>}
      {cfg.notes && <p className="text-[10px] text-blue-400 mt-1">{cfg.notes}</p>}
    </div>
  )
}
