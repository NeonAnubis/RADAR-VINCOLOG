-- ============================================================
-- RADAR VINCOLOG — Database Schema (idempotent)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Providers ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS providers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  phone             TEXT,
  cpf               TEXT,
  cnh               TEXT,
  cnh_photo_url     TEXT,
  vehicle_type      TEXT,
  vehicle_plate     TEXT NOT NULL,
  vehicle_photos    TEXT[] DEFAULT '{}',
  status            TEXT NOT NULL DEFAULT 'ativo'
                      CHECK (status IN ('ativo','adormecido')),
  contract_signed   BOOLEAN DEFAULT FALSE,
  contract_date     DATE,
  total_fretes      INTEGER DEFAULT 0,
  rating            NUMERIC(3,1) DEFAULT 5.0,
  bank_name         TEXT,
  pix_key           TEXT,
  profile_photo_url TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  created_by        UUID REFERENCES auth.users(id)
);

-- ── Orders ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocol              TEXT UNIQUE NOT NULL,
  client_name           TEXT NOT NULL,
  client_phone          TEXT,
  client_email          TEXT,
  origin_address        TEXT NOT NULL,
  origin_city           TEXT NOT NULL,
  destination_address   TEXT NOT NULL,
  destination_city      TEXT NOT NULL,
  cargo_description     TEXT,
  cargo_weight          TEXT,
  status                TEXT NOT NULL DEFAULT 'criado'
                          CHECK (status IN (
                            'criado','aceito','alocado','radar_ativo',
                            'em_rota','entregue','ocorrencia','finalizado'
                          )),
  provider_id           UUID REFERENCES providers(id),
  frete_value           NUMERIC(10,2),
  advance_amount        NUMERIC(10,2) DEFAULT 0,
  balance_amount        NUMERIC(10,2) DEFAULT 0,
  payment_deadline      TEXT,
  tracking_token        TEXT UNIQUE NOT NULL
                          DEFAULT encode(gen_random_bytes(12),'hex'),
  contract_id           UUID,
  contract_pdf_url      TEXT,
  signed_contract_url   TEXT,
  oc_pdf_url            TEXT,
  collection_order_sent BOOLEAN DEFAULT FALSE,
  notes                 TEXT,
  estimated_delivery    TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  accepted_at           TIMESTAMPTZ,
  allocated_at          TIMESTAMPTZ,
  radar_active_at       TIMESTAMPTZ,
  finalized_at          TIMESTAMPTZ,
  created_by            UUID REFERENCES auth.users(id)
);

-- ── Checkpoints ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS checkpoints (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id           UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type               TEXT NOT NULL
                       CHECK (type IN (
                         'saiu_coleta','chegou_coleta','coletou','saiu_coleta_fim',
                         'em_transito','chegou_entrega','entregue','finalizado','ocorrencia'
                       )),
  occurrence_type    TEXT
                       CHECK (occurrence_type IN (
                         'atraso','recusa','avaria','reentrega','sem_acesso','outro'
                       )),
  description        TEXT,
  city               TEXT,
  latitude           NUMERIC(10,7),
  longitude          NUMERIC(10,7),
  photo_urls         TEXT[] DEFAULT '{}',
  pod_recipient_name TEXT,
  pod_signature_url  TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  created_by         UUID REFERENCES auth.users(id)
);

-- ── Contracts ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contracts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id         UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider_id      UUID REFERENCES providers(id),
  frete_value      NUMERIC(10,2),
  advance_amount   NUMERIC(10,2) DEFAULT 0,
  balance_amount   NUMERIC(10,2) DEFAULT 0,
  payment_deadline TEXT,
  pdf_url          TEXT,
  signed_url       TEXT,
  status           TEXT NOT NULL DEFAULT 'pendente'
                     CHECK (status IN ('pendente','assinado','encerrado')),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  signed_at        TIMESTAMPTZ,
  created_by       UUID REFERENCES auth.users(id)
);

-- ── Audit Logs ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id   UUID NOT NULL,
  action      TEXT NOT NULL,
  old_data    JSONB,
  new_data    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  created_by  UUID REFERENCES auth.users(id),
  user_email  TEXT
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_token      ON orders(tracking_token);
CREATE INDEX IF NOT EXISTS idx_orders_provider   ON orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_orders_created    ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkpoints_order ON checkpoints(order_id);
CREATE INDEX IF NOT EXISTS idx_contracts_order   ON contracts(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity      ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_providers_status  ON providers(status);

-- ── Functions ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_protocol()
RETURNS TEXT AS $$
DECLARE
  year_str TEXT := TO_CHAR(NOW(),'YYYY');
  next_seq INTEGER;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(protocol FROM 'FT-\d{4}-(\d+)') AS INTEGER)
  ), 0) + 1
  INTO next_seq
  FROM orders
  WHERE protocol LIKE 'FT-' || year_str || '-%';
  RETURN 'FT-' || year_str || '-' || LPAD(next_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_provider_fretes(provider_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE providers SET total_fretes = total_fretes + 1 WHERE id = provider_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Triggers (idempotent) ────────────────────────────────────
DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS providers_updated_at ON providers;
CREATE TRIGGER providers_updated_at
  BEFORE UPDATE ON providers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs  ENABLE ROW LEVEL SECURITY;

-- Drop existing policies then recreate (idempotent)
DO $$ BEGIN
  DROP POLICY IF EXISTS "auth_full_orders"      ON orders;
  DROP POLICY IF EXISTS "auth_full_providers"   ON providers;
  DROP POLICY IF EXISTS "auth_full_checkpoints" ON checkpoints;
  DROP POLICY IF EXISTS "auth_full_contracts"   ON contracts;
  DROP POLICY IF EXISTS "auth_full_audit"       ON audit_logs;
  DROP POLICY IF EXISTS "anon_read_orders"      ON orders;
  DROP POLICY IF EXISTS "anon_read_checkpoints" ON checkpoints;
END $$;

CREATE POLICY "auth_full_orders"      ON orders      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_providers"   ON providers   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_checkpoints" ON checkpoints FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_contracts"   ON contracts   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_audit"       ON audit_logs  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_read_orders"      ON orders      FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_checkpoints" ON checkpoints FOR SELECT TO anon USING (true);

-- ── Storage buckets ──────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES
  ('contracts',   'contracts',   false, NOW(), NOW()),
  ('checkpoints', 'checkpoints', true,  NOW(), NOW()),
  ('vehicles',    'vehicles',    true,  NOW(), NOW()),
  ('documents',   'documents',   false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Storage policies (idempotent)
DO $$ BEGIN
  DROP POLICY IF EXISTS "auth_upload_contracts"   ON storage.objects;
  DROP POLICY IF EXISTS "auth_upload_checkpoints" ON storage.objects;
  DROP POLICY IF EXISTS "auth_upload_vehicles"    ON storage.objects;
  DROP POLICY IF EXISTS "auth_upload_documents"   ON storage.objects;
  DROP POLICY IF EXISTS "auth_read_all"           ON storage.objects;
  DROP POLICY IF EXISTS "anon_read_public"        ON storage.objects;
END $$;

CREATE POLICY "auth_read_all"   ON storage.objects FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_upload_all" ON storage.objects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_all" ON storage.objects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "anon_read_public" ON storage.objects FOR SELECT TO anon
  USING (bucket_id IN ('checkpoints','vehicles'));
