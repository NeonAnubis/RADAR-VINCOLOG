-- ============================================================
-- RADAR VINCOLOG — Seed Data (idempotent)
-- ============================================================

-- ── Providers ────────────────────────────────────────────────
INSERT INTO providers
  (id, name, phone, cpf, cnh, vehicle_type, vehicle_plate, status,
   contract_signed, contract_date, total_fretes, rating, bank_name, pix_key)
VALUES
  ('11111111-0000-0000-0000-000000000001','Carlos Eduardo Mendes',  '(11) 99821-4537','342.891.067-45','12345678901','Furgão',        'BRA-2E19','ativo',     true,'2026-04-15',23,4.9,'Nubank',  '342.891.067-45'),
  ('11111111-0000-0000-0000-000000000002','Roberto Alves da Silva', '(11) 97634-2201','571.204.938-12','98765432100','Caminhonete',   'GHT-5F34','ativo',     true,'2026-04-22', 8,4.7,'Itaú',    'roberto.silva@gmail.com'),
  ('11111111-0000-0000-0000-000000000003','Marcos Antônio Ferreira','(11) 98456-7823','198.345.762-88','11122233344','Furgão',        'CDE-3K77','ativo',     true,'2026-05-01', 3,4.8,'Bradesco','(11) 98456-7823'),
  ('11111111-0000-0000-0000-000000000004','Edilson Souza Barbosa',  '(11) 96521-3348','423.876.019-55','55566677788','Moto',          'KLM-9P02','adormecido',true,'2026-03-05', 5,4.5,'PicPay',  '423.876.019-55'),
  ('11111111-0000-0000-0000-000000000005','Paulo Ricardo Nunes',    '(11) 99012-8865','654.321.987-00','99988877766','Caminhão Leve', 'FGH-1J44','adormecido',true,'2026-02-18',11,4.6,'C6 Bank', 'paulo.nunes@hotmail.com'),
  ('11111111-0000-0000-0000-000000000006','Thiago Costa Lima',      '(11) 98877-4412','789.012.345-67','33344455566','Furgão',        'MNO-4Q88','adormecido',false,null,         1,4.3,'Nubank',  '(11) 98877-4412')
ON CONFLICT (id) DO NOTHING;

-- ── Orders ───────────────────────────────────────────────────
INSERT INTO orders
  (id, protocol, client_name, client_phone, client_email,
   origin_address, origin_city, destination_address, destination_city,
   cargo_description, cargo_weight, status, provider_id,
   frete_value, advance_amount, balance_amount, tracking_token,
   collection_order_sent, notes, created_at, accepted_at, allocated_at, radar_active_at)
VALUES
  ('22222222-0000-0000-0000-000000000001','FT-2026-0047','Farmácias Saúde Total','(11) 3321-8800','logistica@saudetotal.com.br',
   'Rua das Indústrias, 450 - Distrito Industrial','Guarulhos','Av. Paulista, 1234 - Bela Vista','São Paulo',
   'Medicamentos - carga fracionada','180 kg','em_rota','11111111-0000-0000-0000-000000000002',
   420,100,320,'tk-ft47-x9kp2m',true,null,
   '2026-05-08T07:30:00Z','2026-05-08T07:35:00Z','2026-05-08T07:45:00Z','2026-05-08T09:00:00Z'),

  ('22222222-0000-0000-0000-000000000002','FT-2026-0046','Distribuidora Norte Alimentos','(11) 4567-2200','compras@nortealimentos.com.br',
   'Rod. Anhanguera, km 18 - Galpão 7','Cajamar','Rua São Bento, 89 - Centro','Campinas',
   'Produtos alimentícios - carga seca','620 kg','finalizado','11111111-0000-0000-0000-000000000001',
   780,150,630,'tk-ft46-a3nw7q',true,null,
   '2026-05-07T08:00:00Z','2026-05-07T08:05:00Z','2026-05-07T08:15:00Z','2026-05-07T09:30:00Z'),

  ('22222222-0000-0000-0000-000000000003','FT-2026-0048','TechParts Componentes','(11) 3887-5500','expedicao@techparts.com.br',
   'Av. das Nações Unidas, 3000 - Vila Gertrudes','São Paulo','Rua Industrial, 220 - Polo Industrial','Sorocaba',
   'Componentes eletrônicos - carga frágil','95 kg','radar_ativo','11111111-0000-0000-0000-000000000003',
   350,80,270,'tk-ft48-b7vx4r',true,null,
   '2026-05-08T10:00:00Z','2026-05-08T10:05:00Z','2026-05-08T10:20:00Z','2026-05-08T11:30:00Z'),

  ('22222222-0000-0000-0000-000000000004','FT-2026-0049','Gráfica Impressão Rápida','(11) 5544-9900','producao@impressaorapida.com.br',
   'Rua Vergueiro, 1500 - Liberdade','São Paulo','Av. Dom Pedro I, 400 - Jardim Paulista','Santo André',
   'Material gráfico - impressos','210 kg','aceito',null,
   290,0,290,'tk-ft49-c2yz9s',false,null,
   '2026-05-08T12:00:00Z','2026-05-08T12:10:00Z',null,null),

  ('22222222-0000-0000-0000-000000000005','FT-2026-0045','Construção e Acabamentos Silva','(11) 2233-4455','obras@construcaosilva.com.br',
   'Rua do Comércio, 800 - Centro','Mogi das Cruzes','Av. Brasil, 2200 - Jardim América','São Paulo',
   'Material de construção','850 kg','ocorrencia','11111111-0000-0000-0000-000000000001',
   520,150,370,'tk-ft45-d8mf1t',true,'Destinatário não encontrado no endereço informado.',
   '2026-05-06T07:00:00Z','2026-05-06T07:05:00Z','2026-05-06T07:20:00Z','2026-05-06T08:00:00Z'),

  ('22222222-0000-0000-0000-000000000006','FT-2026-0044','Bella Moda Atacado','(11) 3344-5566','logistica@bellamoda.com.br',
   'Rua José Paulino, 1100 - Bom Retiro','São Paulo','Rua das Flores, 300 - Centro','Ribeirão Preto',
   'Roupas e acessórios - 32 caixas','440 kg','finalizado','11111111-0000-0000-0000-000000000001',
   650,150,500,'tk-ft44-e5nh6u',true,null,
   '2026-05-05T06:30:00Z','2026-05-05T06:35:00Z','2026-05-05T06:50:00Z','2026-05-05T07:45:00Z'),

  ('22222222-0000-0000-0000-000000000007','FT-2026-0050','Petroquímica Barretos','(17) 3322-1100','logistica@pqbarretos.com.br',
   'Rod. Candido Portinari, km 8','Barretos','Terminal Portuário, Galpão 12','Santos',
   'Produtos químicos embalados','1.200 kg','criado',null,
   950,0,950,'tk-ft50-z1ab3c',false,null,
   '2026-05-08T14:00:00Z',null,null,null)
ON CONFLICT (id) DO NOTHING;

-- ── Checkpoints ──────────────────────────────────────────────
INSERT INTO checkpoints (order_id, type, description, city, created_at)
VALUES
  -- FT-0047 (em_rota)
  ('22222222-0000-0000-0000-000000000001','saiu_coleta',    'Motorista saiu para realizar a coleta.',                   'Guarulhos','2026-05-08T09:05:00Z'),
  ('22222222-0000-0000-0000-000000000001','chegou_coleta',  'Chegou na portaria do remetente.',                         'Guarulhos','2026-05-08T09:15:00Z'),
  ('22222222-0000-0000-0000-000000000001','coletou',        'Carga coletada. Documentos conferidos.',                   'Guarulhos','2026-05-08T09:35:00Z'),
  ('22222222-0000-0000-0000-000000000001','saiu_coleta_fim','Saiu do local de coleta em direção ao destino.',           'Guarulhos','2026-05-08T09:45:00Z'),
  ('22222222-0000-0000-0000-000000000001','em_transito',    'Em trânsito para São Paulo.',                              'Guarulhos','2026-05-08T09:50:00Z'),
  -- FT-0046 (finalizado)
  ('22222222-0000-0000-0000-000000000002','saiu_coleta',    'Saiu para coleta.',                                        'Cajamar', '2026-05-07T09:30:00Z'),
  ('22222222-0000-0000-0000-000000000002','chegou_coleta',  'Chegou na portaria.',                                      'Cajamar', '2026-05-07T09:45:00Z'),
  ('22222222-0000-0000-0000-000000000002','coletou',        '14 volumes conferidos e lacrados.',                        'Cajamar', '2026-05-07T10:00:00Z'),
  ('22222222-0000-0000-0000-000000000002','saiu_coleta_fim','Saiu do armazém.',                                         'Cajamar', '2026-05-07T10:10:00Z'),
  ('22222222-0000-0000-0000-000000000002','em_transito',    'Em rota pela Rodovia Anhanguera.',                         'Cajamar', '2026-05-07T10:15:00Z'),
  ('22222222-0000-0000-0000-000000000002','chegou_entrega', 'Chegou na portaria do destinatário.',                      'Campinas','2026-05-07T14:00:00Z'),
  ('22222222-0000-0000-0000-000000000002','entregue',       'Entrega realizada. POD assinado por Ana Paula Rodrigues.', 'Campinas','2026-05-07T14:30:00Z'),
  ('22222222-0000-0000-0000-000000000002','finalizado',     'Frete encerrado pelo operador.',                           'Campinas','2026-05-07T15:00:00Z'),
  -- FT-0048 (radar_ativo — sem checkpoints ainda, normal)
  -- FT-0045 (ocorrencia)
  ('22222222-0000-0000-0000-000000000005','saiu_coleta',    'Saiu para coleta.',                 'Mogi das Cruzes','2026-05-06T08:30:00Z'),
  ('22222222-0000-0000-0000-000000000005','coletou',        'Carga coletada.',                   'Mogi das Cruzes','2026-05-06T09:00:00Z'),
  ('22222222-0000-0000-0000-000000000005','em_transito',    'Em rota para São Paulo.',           'Mogi das Cruzes','2026-05-06T09:10:00Z'),
  ('22222222-0000-0000-0000-000000000005','ocorrencia',     'Destinatário ausente. Tentativa de entrega sem sucesso. Aguardando instrução.','São Paulo','2026-05-06T12:15:00Z'),
  -- FT-0044 (finalizado)
  ('22222222-0000-0000-0000-000000000006','saiu_coleta',    'Saiu para coleta.',                              'São Paulo',    '2026-05-05T07:50:00Z'),
  ('22222222-0000-0000-0000-000000000006','coletou',        '32 caixas coletadas e conferidas.',              'São Paulo',    '2026-05-05T08:10:00Z'),
  ('22222222-0000-0000-0000-000000000006','em_transito',    'Em rota via Rodovia Anhanguera.',                'São Paulo',    '2026-05-05T08:20:00Z'),
  ('22222222-0000-0000-0000-000000000006','chegou_entrega', 'Chegou na portaria do destinatário.',            'Ribeirão Preto','2026-05-05T13:00:00Z'),
  ('22222222-0000-0000-0000-000000000006','entregue',       'Entrega realizada. POD assinado por Marcos Roberto Cunha.','Ribeirão Preto','2026-05-05T13:20:00Z'),
  ('22222222-0000-0000-0000-000000000006','finalizado',     'Frete encerrado.',                               'Ribeirão Preto','2026-05-05T14:00:00Z')
ON CONFLICT DO NOTHING;

-- ── Contracts ────────────────────────────────────────────────
INSERT INTO contracts
  (id, order_id, provider_id, frete_value, advance_amount, balance_amount, status, created_at, signed_at)
VALUES
  ('33333333-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000001','11111111-0000-0000-0000-000000000002',420,100,320,'assinado','2026-05-08T07:45:00Z','2026-05-08T07:58:00Z'),
  ('33333333-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000002','11111111-0000-0000-0000-000000000001',780,150,630,'encerrado','2026-05-07T08:15:00Z','2026-05-07T08:28:00Z'),
  ('33333333-0000-0000-0000-000000000003','22222222-0000-0000-0000-000000000003','11111111-0000-0000-0000-000000000003',350,80,270,'assinado','2026-05-08T10:20:00Z','2026-05-08T10:35:00Z'),
  ('33333333-0000-0000-0000-000000000005','22222222-0000-0000-0000-000000000005','11111111-0000-0000-0000-000000000001',520,150,370,'assinado','2026-05-06T07:20:00Z','2026-05-06T07:32:00Z'),
  ('33333333-0000-0000-0000-000000000006','22222222-0000-0000-0000-000000000006','11111111-0000-0000-0000-000000000001',650,150,500,'encerrado','2026-05-05T06:50:00Z','2026-05-05T07:02:00Z')
ON CONFLICT (id) DO NOTHING;

-- Link contracts to orders
UPDATE orders SET contract_id = '33333333-0000-0000-0000-000000000001' WHERE id = '22222222-0000-0000-0000-000000000001' AND contract_id IS NULL;
UPDATE orders SET contract_id = '33333333-0000-0000-0000-000000000002' WHERE id = '22222222-0000-0000-0000-000000000002' AND contract_id IS NULL;
UPDATE orders SET contract_id = '33333333-0000-0000-0000-000000000003' WHERE id = '22222222-0000-0000-0000-000000000003' AND contract_id IS NULL;
UPDATE orders SET contract_id = '33333333-0000-0000-0000-000000000005' WHERE id = '22222222-0000-0000-0000-000000000005' AND contract_id IS NULL;
UPDATE orders SET contract_id = '33333333-0000-0000-0000-000000000006' WHERE id = '22222222-0000-0000-0000-000000000006' AND contract_id IS NULL;
