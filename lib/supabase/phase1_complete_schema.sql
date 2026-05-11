-- ============================================================
-- RADAR VINCOLOG — Phase 1 Completion (additive, idempotent)
-- Adds: payment_status, GPS, invite tokens, settings, notifications
-- ============================================================

-- ── OIT extensions ───────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='oits' AND column_name='payment_status') THEN
    ALTER TABLE oits ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'nao_iniciado'
      CHECK (payment_status IN ('nao_iniciado','adiantamento_pendente','adiantamento_pago','saldo_pendente','saldo_liberado','pago_integralmente','bloqueado','em_auditoria'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='oits' AND column_name='gps_tracking_active') THEN
    ALTER TABLE oits ADD COLUMN gps_tracking_active BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='oits' AND column_name='provider_invite_token') THEN
    ALTER TABLE oits ADD COLUMN provider_invite_token TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='oits' AND column_name='provider_unlinked_at') THEN
    ALTER TABLE oits ADD COLUMN provider_unlinked_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='oits' AND column_name='last_gps_lat') THEN
    ALTER TABLE oits ADD COLUMN last_gps_lat NUMERIC(10,7);
    ALTER TABLE oits ADD COLUMN last_gps_lng NUMERIC(10,7);
    ALTER TABLE oits ADD COLUMN last_gps_at  TIMESTAMPTZ;
  END IF;
END $$;

-- ── App settings ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB,
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_by  UUID REFERENCES auth.users(id)
);

-- ── Notifications (emails, WhatsApp dispatch log) ────────────
CREATE TABLE IF NOT EXISTS notifications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oit_id            UUID REFERENCES oits(id) ON DELETE CASCADE,
  budget_id         UUID REFERENCES budgets(id) ON DELETE CASCADE,
  channel           TEXT NOT NULL CHECK (channel IN ('email','whatsapp','sms')),
  recipient_type    TEXT,
  recipient_address TEXT,
  subject           TEXT,
  body              TEXT,
  status            TEXT NOT NULL DEFAULT 'pendente'
                      CHECK (status IN ('pendente','enviado','falhou','agendado')),
  sent_at           TIMESTAMPTZ,
  error_message     TEXT,
  metadata          JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  created_by        UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_oit     ON notifications(oit_id);
CREATE INDEX IF NOT EXISTS idx_notifications_channel ON notifications(channel);
CREATE INDEX IF NOT EXISTS idx_app_settings_key      ON app_settings(key);
CREATE INDEX IF NOT EXISTS idx_oits_invite_token     ON oits(provider_invite_token);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE app_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "auth_full_settings"      ON app_settings;
  DROP POLICY IF EXISTS "auth_full_notifications" ON notifications;
  DROP POLICY IF EXISTS "anon_read_settings"      ON app_settings;
  DROP POLICY IF EXISTS "anon_create_provider"    ON providers;
  DROP POLICY IF EXISTS "anon_update_oits_invite" ON oits;
  DROP POLICY IF EXISTS "anon_insert_gps"         ON gps_positions;
END $$;

CREATE POLICY "auth_full_settings"      ON app_settings  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_full_notifications" ON notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public read of company settings for tracking page branding
CREATE POLICY "anon_read_settings" ON app_settings FOR SELECT TO anon USING (true);

-- Anon can create a provider via invite token (token verified in code)
CREATE POLICY "anon_create_provider"    ON providers     FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_oits_invite" ON oits          FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_insert_gps"         ON gps_positions FOR INSERT TO anon WITH CHECK (true);

-- ── Default settings seed ────────────────────────────────────
INSERT INTO app_settings (key, value)
VALUES
  ('company.name',         '"VINCOLOG TRANSPORTES"'),
  ('company.tagline',      '"Gestão Operacional de Transporte"'),
  ('company.phone',        '"+55 11 99999-9999"'),
  ('company.email',        '"operacional@vincolog.com.br"'),
  ('company.cnpj',         '""'),
  ('company.address',      '""'),
  ('pdf.footer',           '"RADAR VINCOLOG · Sistema interno de gestão operacional"'),
  ('emails.operational',   '"operacional@vincolog.com.br"'),
  ('emails.financial',     '"financeiro@vincolog.com.br"'),
  ('emails.commercial',    '"comercial@vincolog.com.br"'),
  ('finance.margin_alert', '5'),
  ('whatsapp.dispatch_phone', '"5511999999999"')
ON CONFLICT (key) DO NOTHING;
