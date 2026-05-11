-- ============================================================
-- RADAR VINCOLOG — Phase 1 Schema (additive, idempotent)
-- Builds on existing providers + audit_logs + auth.users tables
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Clients ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  document        TEXT,
  document_type   TEXT CHECK (document_type IN ('cnpj','cpf')),
  email           TEXT,
  phone           TEXT,
  contact_name    TEXT,
  contact_sector  TEXT,
  city            TEXT,
  uf              TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      UUID REFERENCES auth.users(id)
);

-- ── Budgets (Orçamentos) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number          TEXT UNIQUE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'cadastrado'
                    CHECK (status IN ('cadastrado','proposta_gerada','proposta_enviada','aprovado','recusado','cancelado')),
  origin_source   TEXT,
  description     TEXT,

  client_id       UUID REFERENCES clients(id),
  client_name             TEXT,
  client_document         TEXT,
  client_contact_name     TEXT,
  client_contact_phone    TEXT,
  client_contact_email    TEXT,
  client_contact_sector   TEXT,
  client_notes            TEXT,

  document_number TEXT,
  document_value  NUMERIC(12,2),
  xml_received    BOOLEAN DEFAULT FALSE,
  cargo_description TEXT,
  cargo_volumes   INTEGER,
  cargo_weight    TEXT,
  cargo_dimensions JSONB,
  cargo_sensitive   BOOLEAN DEFAULT FALSE,
  cargo_high_value  BOOLEAN DEFAULT FALSE,
  cargo_needs_tarp  BOOLEAN DEFAULT FALSE,
  cargo_needs_strap BOOLEAN DEFAULT FALSE,
  cargo_needs_tracker BOOLEAN DEFAULT FALSE,
  cargo_needs_photo BOOLEAN DEFAULT FALSE,
  cargo_notes       TEXT,

  vehicle_suggested_type TEXT,
  vehicle_body_type      TEXT,
  vehicle_exclusive      BOOLEAN DEFAULT FALSE,
  vehicle_full_load      BOOLEAN DEFAULT FALSE,
  operation_dedicated    BOOLEAN DEFAULT FALSE,
  operation_aero         BOOLEAN DEFAULT FALSE,
  operation_project      BOOLEAN DEFAULT FALSE,
  vehicle_notes          TEXT,

  freight_components JSONB DEFAULT '{}'::jsonb,
  service_levels     JSONB DEFAULT '{}'::jsonb,

  validity_date    DATE,
  payment_condition TEXT,
  general_notes    TEXT,
  premises         TEXT,
  exclusions       TEXT,
  needs_operational_approval BOOLEAN DEFAULT FALSE,
  needs_director_approval    BOOLEAN DEFAULT FALSE,

  proposal_pdf_url        TEXT,
  proposal_sent_at        TIMESTAMPTZ,
  approval_evidence_url   TEXT,
  approved_at             TIMESTAMPTZ,
  approved_level          TEXT CHECK (approved_level IN ('essencial','assistido_basico','assistido_completo','prime_critico')),
  approved_value          NUMERIC(12,2),

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      UUID REFERENCES auth.users(id)
);

-- ── OITs (Ordem Interna de Transporte) ───────────────────────
CREATE TABLE IF NOT EXISTS oits (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number          TEXT UNIQUE NOT NULL,
  budget_id       UUID REFERENCES budgets(id),
  client_id       UUID REFERENCES clients(id),

  service_level   TEXT NOT NULL CHECK (service_level IN ('essencial','assistido_basico','assistido_completo','prime_critico')),
  status          TEXT NOT NULL DEFAULT 'novos_aprovados'
                    CHECK (status IN (
                      'novos_aprovados','em_analise','em_alocacao','aguardando_contrato',
                      'prestador_alocado','aguardando_coleta','em_coleta','em_transito',
                      'em_entrega','comprovante_pendente','finalizado','ocorrencia'
                    )),
  priority        TEXT DEFAULT 'normal' CHECK (priority IN ('baixa','normal','alta','critica')),

  responsible_operator UUID REFERENCES auth.users(id),
  current_owner        UUID REFERENCES auth.users(id),

  vendor_value     NUMERIC(12,2),
  contracted_value NUMERIC(12,2),
  advance_amount   NUMERIC(12,2) DEFAULT 0,
  balance_amount   NUMERIC(12,2) DEFAULT 0,
  pedagio          NUMERIC(12,2),
  vale_pedagio     NUMERIC(12,2),
  seguro           NUMERIC(12,2),
  ciot             TEXT,
  other_expenses   NUMERIC(12,2),
  estimated_margin NUMERIC(12,2),
  margin_percentage NUMERIC(5,2),
  financial_status TEXT DEFAULT 'nao_iniciado',
  financial_notes  TEXT,

  client_name      TEXT,
  client_document  TEXT,
  client_contact_name  TEXT,
  client_contact_phone TEXT,
  client_contact_email TEXT,

  cargo_description TEXT,
  cargo_volumes     INTEGER,
  cargo_weight      TEXT,
  cargo_dimensions  JSONB,
  document_number   TEXT,
  document_value    NUMERIC(12,2),

  provider_id      UUID REFERENCES providers(id),
  driver_name      TEXT,
  driver_cpf       TEXT,
  driver_phone     TEXT,
  driver_cnh       TEXT,
  vehicle_type     TEXT,
  vehicle_body     TEXT,
  vehicle_plate_cavalo TEXT,
  vehicle_plate_carreta TEXT,
  vehicle_has_tarp BOOLEAN,
  vehicle_has_tracker BOOLEAN,
  vehicle_tracker_link TEXT,
  vehicle_photos   TEXT[] DEFAULT '{}',

  client_link_token   TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12),'hex'),
  provider_link_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12),'hex'),

  contract_pdf_url         TEXT,
  signed_contract_url      TEXT,
  collection_order_pdf_url TEXT,
  collection_order_sent_at TIMESTAMPTZ,

  next_action          TEXT,
  next_action_owner    UUID REFERENCES auth.users(id),
  next_action_deadline TIMESTAMPTZ,

  pendencies            TEXT,
  restrictions          TEXT,
  specific_instructions TEXT,
  notes                 TEXT,

  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  allocated_at  TIMESTAMPTZ,
  finalized_at  TIMESTAMPTZ,
  created_by    UUID REFERENCES auth.users(id)
);

-- ── Collection points (multiple per budget/OIT) ──────────────
CREATE TABLE IF NOT EXISTS collection_points (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id       UUID REFERENCES budgets(id) ON DELETE CASCADE,
  oit_id          UUID REFERENCES oits(id) ON DELETE CASCADE,
  sequence        INTEGER DEFAULT 1,
  name            TEXT,
  cnpj            TEXT,
  contact_name    TEXT,
  phone           TEXT,
  email           TEXT,
  full_address    TEXT,
  city            TEXT,
  uf              TEXT,
  cep             TEXT,
  scheduled_date  DATE,
  time_window     TEXT,
  needs_scheduling BOOLEAN DEFAULT FALSE,
  access_instructions TEXT,
  linked_docs     TEXT,
  notes           TEXT,
  arrived_at      TIMESTAMPTZ,
  collected_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Delivery points (multiple per budget/OIT) ────────────────
CREATE TABLE IF NOT EXISTS delivery_points (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id       UUID REFERENCES budgets(id) ON DELETE CASCADE,
  oit_id          UUID REFERENCES oits(id) ON DELETE CASCADE,
  sequence        INTEGER DEFAULT 1,
  name            TEXT,
  cnpj            TEXT,
  contact_name    TEXT,
  phone           TEXT,
  email           TEXT,
  full_address    TEXT,
  city            TEXT,
  uf              TEXT,
  cep             TEXT,
  scheduled_date  DATE,
  time_window     TEXT,
  needs_scheduling BOOLEAN DEFAULT FALSE,
  access_instructions TEXT,
  linked_docs     TEXT,
  notes           TEXT,
  arrived_at      TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  pod_recipient   TEXT,
  pod_url         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Contracts per trip ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS contracts_per_trip (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oit_id          UUID REFERENCES oits(id) ON DELETE CASCADE,
  provider_id     UUID REFERENCES providers(id),
  generated_pdf_url TEXT,
  signed_pdf_url    TEXT,
  acceptance_type   TEXT CHECK (acceptance_type IN ('upload','digital','whatsapp','manual')),
  accepted_by       UUID REFERENCES auth.users(id),
  accepted_at       TIMESTAMPTZ,
  status            TEXT DEFAULT 'nao_gerado'
                      CHECK (status IN ('nao_gerado','gerado','enviado','aceito','assinado_anexado','pendente','cancelado')),
  notes             TEXT,
  contract_value    NUMERIC(12,2),
  advance_amount    NUMERIC(12,2),
  balance_amount    NUMERIC(12,2),
  payment_terms     TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Timeline events ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS timeline_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oit_id          UUID REFERENCES oits(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,
  source          TEXT CHECK (source IN ('comercial','operacional','financeiro','prestador','cliente','sistema')),
  user_id         UUID REFERENCES auth.users(id),
  description     TEXT,
  visible_to_client BOOLEAN DEFAULT FALSE,
  attachments     JSONB DEFAULT '[]'::jsonb,
  location_text   TEXT,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Occurrences ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS occurrences (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oit_id          UUID REFERENCES oits(id) ON DELETE CASCADE,
  type            TEXT CHECK (type IN (
                    'atraso_coleta','atraso_entrega','espera_origem','espera_destino',
                    'avaria','recusa_recebimento','problema_documental','problema_veiculo',
                    'fiscalizacao','sinistro','reentrega','divergencia_carga','outros'
                  )),
  description     TEXT,
  location        TEXT,
  impact          TEXT,
  action_taken    TEXT,
  new_estimate    TIMESTAMPTZ,
  responsible_user UUID REFERENCES auth.users(id),
  attachments     JSONB DEFAULT '[]'::jsonb,
  visible_to_client BOOLEAN DEFAULT FALSE,
  status          TEXT DEFAULT 'aberta'
                    CHECK (status IN ('aberta','em_tratativa','resolvida','encerrada','escalada')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  closed_at       TIMESTAMPTZ,
  created_by      UUID REFERENCES auth.users(id)
);

-- ── GPS positions ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gps_positions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oit_id          UUID REFERENCES oits(id) ON DELETE CASCADE,
  device_id       TEXT,
  latitude        NUMERIC(10,7),
  longitude       NUMERIC(10,7),
  accuracy        NUMERIC,
  speed           NUMERIC,
  battery_level   NUMERIC,
  recorded_at     TIMESTAMPTZ NOT NULL,
  synced_at       TIMESTAMPTZ DEFAULT NOW(),
  source          TEXT DEFAULT 'app'
);

-- ── WhatsApp logs ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oit_id          UUID REFERENCES oits(id),
  budget_id       UUID REFERENCES budgets(id),
  recipient_type  TEXT CHECK (recipient_type IN ('client','provider','operational_team')),
  recipient_phone TEXT,
  trigger_event   TEXT,
  message_text    TEXT,
  status          TEXT DEFAULT 'preparado'
                    CHECK (status IN ('preparado','copiado','enviado','falhou')),
  sent_by         UUID REFERENCES auth.users(id),
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_budgets_status      ON budgets(status);
CREATE INDEX IF NOT EXISTS idx_budgets_client      ON budgets(client_id);
CREATE INDEX IF NOT EXISTS idx_budgets_created     ON budgets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_oits_status         ON oits(status);
CREATE INDEX IF NOT EXISTS idx_oits_client_token   ON oits(client_link_token);
CREATE INDEX IF NOT EXISTS idx_oits_provider_token ON oits(provider_link_token);
CREATE INDEX IF NOT EXISTS idx_oits_provider       ON oits(provider_id);
CREATE INDEX IF NOT EXISTS idx_oits_created        ON oits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collection_oit      ON collection_points(oit_id);
CREATE INDEX IF NOT EXISTS idx_collection_budget   ON collection_points(budget_id);
CREATE INDEX IF NOT EXISTS idx_delivery_oit        ON delivery_points(oit_id);
CREATE INDEX IF NOT EXISTS idx_delivery_budget     ON delivery_points(budget_id);
CREATE INDEX IF NOT EXISTS idx_contracts_trip_oit  ON contracts_per_trip(oit_id);
CREATE INDEX IF NOT EXISTS idx_timeline_oit        ON timeline_events(oit_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_occurrences_oit     ON occurrences(oit_id);
CREATE INDEX IF NOT EXISTS idx_occurrences_status  ON occurrences(status);
CREATE INDEX IF NOT EXISTS idx_gps_oit             ON gps_positions(oit_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_oit        ON whatsapp_logs(oit_id);

-- ── Functions ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_budget_number()
RETURNS TEXT AS $$
DECLARE
  year_str TEXT := TO_CHAR(NOW(),'YYYY');
  next_seq INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 'ORC-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO next_seq
  FROM budgets WHERE number LIKE 'ORC-' || year_str || '-%';
  RETURN 'ORC-' || year_str || '-' || LPAD(next_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_oit_number()
RETURNS TEXT AS $$
DECLARE
  year_str TEXT := TO_CHAR(NOW(),'YYYY');
  next_seq INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(number FROM 'OIT-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO next_seq
  FROM oits WHERE number LIKE 'OIT-' || year_str || '-%';
  RETURN 'OIT-' || year_str || '-' || LPAD(next_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ── updated_at triggers ──────────────────────────────────────
DROP TRIGGER IF EXISTS budgets_updated_at ON budgets;
CREATE TRIGGER budgets_updated_at
  BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS oits_updated_at ON oits;
CREATE TRIGGER oits_updated_at
  BEFORE UPDATE ON oits FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS clients_updated_at ON clients;
CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE clients            ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets            ENABLE ROW LEVEL SECURITY;
ALTER TABLE oits               ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_points  ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_points    ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts_per_trip ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE occurrences        ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_positions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_logs      ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "auth_full_clients"            ON clients;
  DROP POLICY IF EXISTS "auth_full_budgets"            ON budgets;
  DROP POLICY IF EXISTS "auth_full_oits"               ON oits;
  DROP POLICY IF EXISTS "auth_full_collection_points"  ON collection_points;
  DROP POLICY IF EXISTS "auth_full_delivery_points"    ON delivery_points;
  DROP POLICY IF EXISTS "auth_full_contracts_per_trip" ON contracts_per_trip;
  DROP POLICY IF EXISTS "auth_full_timeline_events"    ON timeline_events;
  DROP POLICY IF EXISTS "auth_full_occurrences"        ON occurrences;
  DROP POLICY IF EXISTS "auth_full_gps_positions"      ON gps_positions;
  DROP POLICY IF EXISTS "auth_full_whatsapp_logs"      ON whatsapp_logs;
  DROP POLICY IF EXISTS "anon_read_oits"               ON oits;
  DROP POLICY IF EXISTS "anon_read_timeline"           ON timeline_events;
  DROP POLICY IF EXISTS "anon_read_collection_points"  ON collection_points;
  DROP POLICY IF EXISTS "anon_read_delivery_points"    ON delivery_points;
  DROP POLICY IF EXISTS "anon_read_occurrences"        ON occurrences;
  DROP POLICY IF EXISTS "anon_full_provider_updates"   ON oits;
  DROP POLICY IF EXISTS "anon_full_timeline_create"    ON timeline_events;
  DROP POLICY IF EXISTS "anon_full_occurrence_create"  ON occurrences;
  DROP POLICY IF EXISTS "anon_update_collection_points" ON collection_points;
  DROP POLICY IF EXISTS "anon_update_delivery_points"  ON delivery_points;
END $$;

CREATE POLICY "auth_full_clients"            ON clients            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_budgets"            ON budgets            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_oits"               ON oits               FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_collection_points"  ON collection_points  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_delivery_points"    ON delivery_points    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_contracts_per_trip" ON contracts_per_trip FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_timeline_events"    ON timeline_events    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_occurrences"        ON occurrences        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_gps_positions"      ON gps_positions      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_whatsapp_logs"      ON whatsapp_logs      FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public (anon) read access for tracking link + provider portal
CREATE POLICY "anon_read_oits"               ON oits               FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_timeline"           ON timeline_events    FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_collection_points"  ON collection_points  FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_delivery_points"    ON delivery_points    FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_occurrences"        ON occurrences        FOR SELECT TO anon USING (true);

-- Provider portal can create timeline events and occurrences (token verified in code)
CREATE POLICY "anon_full_timeline_create"    ON timeline_events    FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_full_occurrence_create"  ON occurrences        FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_collection_points" ON collection_points FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_update_delivery_points"  ON delivery_points    FOR UPDATE TO anon USING (true) WITH CHECK (true);
