-- ============================================================
-- Phase 1 demo seed data (idempotent)
-- ============================================================

-- ── Sample Client ────────────────────────────────────────────
INSERT INTO clients (id, name, document, document_type, email, phone, contact_name, contact_sector, city, uf, notes)
VALUES
  ('aaaaaaaa-1111-1111-1111-111111111111', 'Indústria Vintage Ltda.', '12.345.678/0001-90', 'cnpj', 'logistica@vintage.com.br', '(11) 3344-5566', 'Carla Mendes', 'Logística', 'São Paulo', 'SP', 'Cliente recorrente — operação dedicada bimestral'),
  ('aaaaaaaa-2222-2222-2222-222222222222', 'Distribuidora Alpha S.A.',  '98.765.432/0001-10', 'cnpj', 'compras@alpha.com.br',     '(11) 4567-8800', 'Marcos Pereira', 'Suprimentos', 'Campinas',  'SP', 'Cliente padrão')
ON CONFLICT (id) DO NOTHING;

-- ── Sample Budget (approved → generated OIT) ─────────────────
INSERT INTO budgets (
  id, number, status, origin_source, description,
  client_id, client_name, client_document, client_contact_name, client_contact_phone, client_contact_email, client_contact_sector,
  cargo_description, cargo_volumes, cargo_weight, cargo_dimensions,
  cargo_sensitive, cargo_high_value, cargo_needs_tarp, cargo_needs_tracker,
  vehicle_suggested_type, vehicle_body_type, operation_dedicated,
  freight_components, service_levels,
  validity_date, payment_condition, premises,
  proposal_pdf_url, proposal_sent_at, approval_evidence_url, approved_at, approved_level, approved_value,
  created_at
) VALUES (
  'bbbbbbbb-1111-1111-1111-111111111111',
  'ORC-2026-0001',
  'aprovado',
  'whatsapp',
  'Transporte dedicado SP → Rio',
  'aaaaaaaa-1111-1111-1111-111111111111',
  'Indústria Vintage Ltda.', '12.345.678/0001-90', 'Carla Mendes', '(11) 3344-5566', 'logistica@vintage.com.br', 'Logística',
  'Produtos industrializados — 25 caixas paletizadas', 25, '800 kg',
  '{"length":"3","width":"2","height":"2","cubage":"12"}'::jsonb,
  false, true, true, true,
  'Truck', 'Baú', true,
  '{"fretePeso":1200,"pedagio":85,"seguro":120,"icms":110}'::jsonb,
  '{"essencial":{"offered":true,"total":1515,"additionalValue":0,"validity":"7 dias"},"assistido_completo":{"offered":true,"total":1815,"additionalValue":300,"validity":"7 dias","conditions":"Inclui fotos e acompanhamento"}}'::jsonb,
  '2026-05-18', '28 dias após coleta', 'Janela de coleta entre 8h e 12h',
  'proposta-ORC-2026-0001.pdf', '2026-05-09T10:00:00Z', 'WhatsApp 09/05 14h', '2026-05-09T15:30:00Z', 'assistido_completo', 1815,
  '2026-05-09T08:30:00Z'
)
ON CONFLICT (id) DO NOTHING;

-- Collection point for budget (will be copied to OIT)
INSERT INTO collection_points (budget_id, sequence, name, contact_name, phone, full_address, city, uf, cep, scheduled_date, time_window)
SELECT 'bbbbbbbb-1111-1111-1111-111111111111', 1, 'CD Vintage Industria', 'Carla Mendes', '(11) 3344-5566',
       'Rod. Anhanguera, km 25 - Galpão 3', 'Cajamar', 'SP', '07750-000', '2026-05-11', '08h-12h'
WHERE NOT EXISTS (SELECT 1 FROM collection_points WHERE budget_id='bbbbbbbb-1111-1111-1111-111111111111');

INSERT INTO delivery_points (budget_id, sequence, name, contact_name, phone, full_address, city, uf, cep, scheduled_date, time_window)
SELECT 'bbbbbbbb-1111-1111-1111-111111111111', 1, 'Centro Logístico Rio',  'João Pereira', '(21) 2233-4455',
       'Av. Brasil, 18000 - Galpão B', 'Rio de Janeiro', 'RJ', '21240-660', '2026-05-12', '14h-18h'
WHERE NOT EXISTS (SELECT 1 FROM delivery_points WHERE budget_id='bbbbbbbb-1111-1111-1111-111111111111');

-- ── Sample OIT (manually inserted to demonstrate) ────────────
INSERT INTO oits (
  id, number, budget_id, client_id, service_level, status, priority,
  vendor_value, contracted_value, advance_amount, balance_amount, pedagio, seguro,
  estimated_margin, margin_percentage,
  client_name, client_document, client_contact_name, client_contact_phone, client_contact_email,
  cargo_description, cargo_volumes, cargo_weight,
  provider_id, driver_name, driver_cpf, driver_phone, driver_cnh,
  vehicle_type, vehicle_body, vehicle_plate_cavalo, vehicle_has_tarp, vehicle_has_tracker,
  client_link_token, provider_link_token,
  collection_order_sent_at, allocated_at, created_at
) VALUES (
  'cccccccc-1111-1111-1111-111111111111',
  'OIT-2026-0001',
  'bbbbbbbb-1111-1111-1111-111111111111',
  'aaaaaaaa-1111-1111-1111-111111111111',
  'assistido_completo',
  'em_transito',
  'alta',
  1815, 1300, 300, 1000, 85, 120,
  310, 17.08,
  'Indústria Vintage Ltda.', '12.345.678/0001-90', 'Carla Mendes', '(11) 3344-5566', 'logistica@vintage.com.br',
  'Produtos industrializados — 25 caixas paletizadas', 25, '800 kg',
  '11111111-0000-0000-0000-000000000001',
  'Carlos Eduardo Mendes', '342.891.067-45', '(11) 99821-4537', '12345678901',
  'Truck', 'Baú', 'BRA-2E19', true, true,
  'tk-oit-vincolog-001-demo',
  'tk-prov-vincolog-001-demo',
  '2026-05-10T11:00:00Z', '2026-05-10T10:30:00Z', '2026-05-09T15:35:00Z'
)
ON CONFLICT (id) DO NOTHING;

-- Copy collection/delivery points to the OIT
INSERT INTO collection_points (oit_id, sequence, name, contact_name, phone, full_address, city, uf, cep, scheduled_date, time_window, arrived_at, collected_at)
SELECT 'cccccccc-1111-1111-1111-111111111111', 1, 'CD Vintage Industria', 'Carla Mendes', '(11) 3344-5566',
       'Rod. Anhanguera, km 25 - Galpão 3', 'Cajamar', 'SP', '07750-000', '2026-05-11', '08h-12h',
       '2026-05-11T08:45:00Z', '2026-05-11T10:15:00Z'
WHERE NOT EXISTS (SELECT 1 FROM collection_points WHERE oit_id='cccccccc-1111-1111-1111-111111111111');

INSERT INTO delivery_points (oit_id, sequence, name, contact_name, phone, full_address, city, uf, cep, scheduled_date, time_window)
SELECT 'cccccccc-1111-1111-1111-111111111111', 1, 'Centro Logístico Rio',  'João Pereira', '(21) 2233-4455',
       'Av. Brasil, 18000 - Galpão B', 'Rio de Janeiro', 'RJ', '21240-660', '2026-05-12', '14h-18h'
WHERE NOT EXISTS (SELECT 1 FROM delivery_points WHERE oit_id='cccccccc-1111-1111-1111-111111111111');

-- Per-trip contract
INSERT INTO contracts_per_trip (id, oit_id, provider_id, contract_value, advance_amount, balance_amount, status, accepted_at, acceptance_type)
VALUES (
  'dddddddd-1111-1111-1111-111111111111',
  'cccccccc-1111-1111-1111-111111111111',
  '11111111-0000-0000-0000-000000000001',
  1300, 300, 1000, 'aceito', '2026-05-10T11:15:00Z', 'digital'
) ON CONFLICT (id) DO NOTHING;

-- Timeline events
INSERT INTO timeline_events (oit_id, event_type, source, description, visible_to_client, created_at)
VALUES
  ('cccccccc-1111-1111-1111-111111111111', 'oit_criada',          'sistema',      'OIT criada após aprovação do orçamento ORC-2026-0001', false, '2026-05-09T15:35:00Z'),
  ('cccccccc-1111-1111-1111-111111111111', 'prestador_alocado',   'operacional', 'Prestador Carlos E. Mendes alocado — Truck BRA-2E19',     true,  '2026-05-10T10:30:00Z'),
  ('cccccccc-1111-1111-1111-111111111111', 'contrato_aceito',     'operacional', 'Contrato aceito digitalmente pelo prestador',            false, '2026-05-10T11:15:00Z'),
  ('cccccccc-1111-1111-1111-111111111111', 'ordem_coleta_enviada','operacional', 'Ordem de Coleta enviada por e-mail ao cliente',         true,  '2026-05-10T11:30:00Z'),
  ('cccccccc-1111-1111-1111-111111111111', 'em_rota_coleta',      'prestador',    'Motorista em rota para a coleta',                       true,  '2026-05-11T08:00:00Z'),
  ('cccccccc-1111-1111-1111-111111111111', 'chegou_coleta',       'prestador',    'Chegou na portaria do CD Vintage',                      true,  '2026-05-11T08:45:00Z'),
  ('cccccccc-1111-1111-1111-111111111111', 'carga_embarcada',     'prestador',    'Carga embarcada, 25 caixas conferidas e lacradas',      true,  '2026-05-11T10:15:00Z'),
  ('cccccccc-1111-1111-1111-111111111111', 'em_transito',         'prestador',    'Em trânsito para Rio de Janeiro via Dutra',             true,  '2026-05-11T10:30:00Z')
ON CONFLICT DO NOTHING;

-- Sample budget pending approval
INSERT INTO budgets (
  id, number, status, origin_source, description,
  client_name, client_document, client_contact_name, client_contact_phone, client_contact_email,
  cargo_description, cargo_volumes, cargo_weight,
  vehicle_suggested_type,
  freight_components, service_levels,
  validity_date, payment_condition,
  created_at
) VALUES (
  'bbbbbbbb-2222-2222-2222-222222222222',
  'ORC-2026-0002',
  'proposta_enviada',
  'email',
  'Transporte fracionado Campinas → Ribeirão Preto',
  'Distribuidora Alpha S.A.', '98.765.432/0001-10', 'Marcos Pereira', '(19) 3344-9988', 'compras@alpha.com.br',
  'Eletrônicos e equipamentos diversos', 15, '420 kg',
  'VUC',
  '{"fretePeso":650,"pedagio":40,"seguro":80}'::jsonb,
  '{"essencial":{"offered":true,"total":770,"validity":"5 dias"},"assistido_basico":{"offered":true,"total":850,"additionalValue":80,"validity":"5 dias"}}'::jsonb,
  '2026-05-15', '30 dias',
  '2026-05-10T14:00:00Z'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO collection_points (budget_id, sequence, name, full_address, city, uf, scheduled_date)
SELECT 'bbbbbbbb-2222-2222-2222-222222222222', 1, 'CD Alpha', 'Av. das Indústrias, 500', 'Campinas', 'SP', '2026-05-14'
WHERE NOT EXISTS (SELECT 1 FROM collection_points WHERE budget_id='bbbbbbbb-2222-2222-2222-222222222222');

INSERT INTO delivery_points (budget_id, sequence, name, full_address, city, uf, scheduled_date)
SELECT 'bbbbbbbb-2222-2222-2222-222222222222', 1, 'Loja Ribeirão', 'Av. 9 de Julho, 200', 'Ribeirão Preto', 'SP', '2026-05-15'
WHERE NOT EXISTS (SELECT 1 FROM delivery_points WHERE budget_id='bbbbbbbb-2222-2222-2222-222222222222');

-- Audit log
INSERT INTO audit_logs (entity_type, entity_id, action, new_data, user_email)
VALUES
  ('budget', 'bbbbbbbb-1111-1111-1111-111111111111', 'BUDGET_CREATED',  '{"number":"ORC-2026-0001"}', 'sistema'),
  ('budget', 'bbbbbbbb-1111-1111-1111-111111111111', 'BUDGET_APPROVED', '{"approved_level":"assistido_completo"}', 'sistema'),
  ('oit',    'cccccccc-1111-1111-1111-111111111111', 'STATUS_em_transito',  '{"status":"em_transito"}', 'sistema')
ON CONFLICT DO NOTHING;
