-- Seed: 10 curated Brazilian destinations with dimension scores
-- Author: Dara (data-engineer)
-- Date: 2026-03-09
-- Note: destination_vector is auto-calculated by trigger from destination_scores

-- ============================================================
-- Insert destinations (inactive until partners are added)
-- ============================================================
INSERT INTO destinations (name, slug, state, city, region, latitude, longitude, climate_type, best_months, tags, destination_vector, cover_url, min_days, max_days, avg_daily_cost)
VALUES
  ('Chapada dos Veadeiros', 'chapada-dos-veadeiros', 'GO', 'Alto Paraíso de Goiás', 'centro-oeste',
   -14.1091, -47.5197, 'tropical de altitude', '{5,6,7,8,9}',
   '{"ecoturismo","trilhas","cachoeiras","natureza","misticismo"}',
   '[30,95,10,5,60,40,50,85,80,40]'::vector(10),
   NULL, 4, 7, 280.00),

  ('Fernando de Noronha', 'fernando-de-noronha', 'PE', 'Fernando de Noronha', 'nordeste',
   -3.8547, -32.4247, 'tropical', '{8,9,10,11,12}',
   '{"praia","mergulho","natureza","exclusivo","fauna marinha"}',
   '[40,90,5,100,30,50,40,60,70,80]'::vector(10),
   NULL, 5, 7, 650.00),

  ('Gramado', 'gramado', 'RS', 'Gramado', 'sul',
   -29.3773, -50.8765, 'subtropical', '{6,7,8,11,12}',
   '{"frio","gastronomia","romântico","chocolate","europeu"}',
   '[50,50,70,5,70,95,60,20,15,75]'::vector(10),
   NULL, 3, 5, 350.00),

  ('Jericoacoara', 'jericoacoara', 'CE', 'Jijoca de Jericoacoara', 'nordeste',
   -2.7953, -40.5136, 'tropical semiárido', '{7,8,9,10,11}',
   '{"praia","kitesurf","pôr do sol","rústico","vento"}',
   '[60,70,10,95,20,40,70,75,80,60]'::vector(10),
   NULL, 4, 7, 320.00),

  ('Bonito', 'bonito', 'MS', 'Bonito', 'centro-oeste',
   -21.1267, -56.4836, 'tropical', '{4,5,6,7,8,9,10,11}',
   '{"ecoturismo","mergulho","rios cristalinos","grutas","flutuação"}',
   '[50,100,5,10,30,35,55,70,85,45]'::vector(10),
   NULL, 4, 6, 380.00),

  ('Lençóis Maranhenses', 'lencois-maranhenses', 'MA', 'Barreirinhas', 'nordeste',
   -2.5912, -43.1073, 'tropical', '{6,7,8,9,10}',
   '{"dunas","lagoas","paisagem única","aventura","4x4"}',
   '[70,85,5,40,25,25,50,65,90,30]'::vector(10),
   NULL, 3, 5, 300.00),

  ('Paraty', 'paraty', 'RJ', 'Paraty', 'sudeste',
   -23.2178, -44.7131, 'tropical úmido', '{3,4,5,9,10,11}',
   '{"histórico","praias","ilhas","colonial","cachaça"}',
   '[40,65,40,75,90,80,60,40,35,65]'::vector(10),
   NULL, 3, 5, 320.00),

  ('Chapada Diamantina', 'chapada-diamantina', 'BA', 'Lençóis', 'nordeste',
   -12.5628, -41.3878, 'tropical de altitude', '{4,5,6,7,8,9,10,11}',
   '{"trilhas","cachoeiras","grutas","trekking","natureza"}',
   '[25,95,10,5,50,30,40,90,85,30]'::vector(10),
   NULL, 5, 8, 250.00),

  ('Florianópolis', 'florianopolis', 'SC', 'Florianópolis', 'sul',
   -27.5954, -48.5480, 'subtropical', '{12,1,2,3}',
   '{"praias","surf","gastronomia","urbano","baladas"}',
   '[75,55,65,90,40,75,85,65,60,50]'::vector(10),
   NULL, 4, 7, 380.00),

  ('São Miguel dos Milagres', 'sao-miguel-dos-milagres', 'AL', 'São Miguel dos Milagres', 'nordeste',
   -9.2667, -35.3833, 'tropical', '{9,10,11,12,1,2,3}',
   '{"praia","piscinas naturais","rústico","relax","exclusivo"}',
   '[15,60,5,95,15,50,30,20,10,100]'::vector(10),
   NULL, 3, 5, 420.00)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Insert dimension scores (triggers auto-rebuild vector)
-- ============================================================
-- Helper: insert all 10 dimensions for a destination
DO $$
DECLARE
  dest RECORD;
  dims TEXT[] := ARRAY['ritmo','natureza','urbano','praia','cultura','gastronomia','sociabilidade','fitness','aventura','relax'];
  scores_map JSONB;
  d TEXT;
  i INTEGER;
BEGIN
  FOR dest IN SELECT id, slug FROM destinations LOOP
    -- Scores per destination (matches the vectors inserted above)
    scores_map := CASE dest.slug
      WHEN 'chapada-dos-veadeiros'   THEN '{"ritmo":30,"natureza":95,"urbano":10,"praia":5,"cultura":60,"gastronomia":40,"sociabilidade":50,"fitness":85,"aventura":80,"relax":40}'
      WHEN 'fernando-de-noronha'     THEN '{"ritmo":40,"natureza":90,"urbano":5,"praia":100,"cultura":30,"gastronomia":50,"sociabilidade":40,"fitness":60,"aventura":70,"relax":80}'
      WHEN 'gramado'                 THEN '{"ritmo":50,"natureza":50,"urbano":70,"praia":5,"cultura":70,"gastronomia":95,"sociabilidade":60,"fitness":20,"aventura":15,"relax":75}'
      WHEN 'jericoacoara'            THEN '{"ritmo":60,"natureza":70,"urbano":10,"praia":95,"cultura":20,"gastronomia":40,"sociabilidade":70,"fitness":75,"aventura":80,"relax":60}'
      WHEN 'bonito'                  THEN '{"ritmo":50,"natureza":100,"urbano":5,"praia":10,"cultura":30,"gastronomia":35,"sociabilidade":55,"fitness":70,"aventura":85,"relax":45}'
      WHEN 'lencois-maranhenses'     THEN '{"ritmo":70,"natureza":85,"urbano":5,"praia":40,"cultura":25,"gastronomia":25,"sociabilidade":50,"fitness":65,"aventura":90,"relax":30}'
      WHEN 'paraty'                  THEN '{"ritmo":40,"natureza":65,"urbano":40,"praia":75,"cultura":90,"gastronomia":80,"sociabilidade":60,"fitness":40,"aventura":35,"relax":65}'
      WHEN 'chapada-diamantina'      THEN '{"ritmo":25,"natureza":95,"urbano":10,"praia":5,"cultura":50,"gastronomia":30,"sociabilidade":40,"fitness":90,"aventura":85,"relax":30}'
      WHEN 'florianopolis'           THEN '{"ritmo":75,"natureza":55,"urbano":65,"praia":90,"cultura":40,"gastronomia":75,"sociabilidade":85,"fitness":65,"aventura":60,"relax":50}'
      WHEN 'sao-miguel-dos-milagres' THEN '{"ritmo":15,"natureza":60,"urbano":5,"praia":95,"cultura":15,"gastronomia":50,"sociabilidade":30,"fitness":20,"aventura":10,"relax":100}'
      ELSE '{}'
    END;

    FOR i IN 1..10 LOOP
      d := dims[i];
      INSERT INTO destination_scores (destination_id, dimension, score)
      VALUES (dest.id, d, (scores_map ->> d)::SMALLINT)
      ON CONFLICT (destination_id, dimension) DO UPDATE SET score = EXCLUDED.score;
    END LOOP;
  END LOOP;
END;
$$;

-- ============================================================
-- Weather data (monthly averages — curated)
-- ============================================================
-- Chapada dos Veadeiros
INSERT INTO destination_weather (destination_id, month, avg_temp_c, avg_rain_mm, condition, is_high_season)
SELECT d.id, m.month, m.temp, m.rain, m.condition, m.high_season
FROM destinations d,
(VALUES
  (1, 26.0, 250, 'chuvoso', false), (2, 26.0, 220, 'chuvoso', false),
  (3, 26.0, 200, 'chuvoso', false), (4, 25.0, 80, 'parcialmente nublado', false),
  (5, 23.0, 15, 'ensolarado', true), (6, 21.0, 5, 'ensolarado', true),
  (7, 21.0, 3, 'ensolarado', true), (8, 23.0, 5, 'ensolarado', true),
  (9, 26.0, 30, 'ensolarado', true), (10, 26.0, 120, 'parcialmente nublado', false),
  (11, 26.0, 200, 'chuvoso', false), (12, 26.0, 260, 'chuvoso', false)
) AS m(month, temp, rain, condition, high_season)
WHERE d.slug = 'chapada-dos-veadeiros'
ON CONFLICT (destination_id, month) DO NOTHING;

-- Fernando de Noronha
INSERT INTO destination_weather (destination_id, month, avg_temp_c, avg_rain_mm, condition, is_high_season)
SELECT d.id, m.month, m.temp, m.rain, m.condition, m.high_season
FROM destinations d,
(VALUES
  (1, 28.0, 80, 'parcialmente nublado', false), (2, 28.0, 120, 'chuvoso', false),
  (3, 28.0, 200, 'chuvoso', false), (4, 28.0, 200, 'chuvoso', false),
  (5, 27.0, 150, 'chuvoso', false), (6, 27.0, 100, 'parcialmente nublado', false),
  (7, 26.0, 60, 'ensolarado', false), (8, 26.0, 20, 'ensolarado', true),
  (9, 27.0, 10, 'ensolarado', true), (10, 28.0, 10, 'ensolarado', true),
  (11, 28.0, 15, 'ensolarado', true), (12, 28.0, 30, 'ensolarado', true)
) AS m(month, temp, rain, condition, high_season)
WHERE d.slug = 'fernando-de-noronha'
ON CONFLICT (destination_id, month) DO NOTHING;

-- ============================================================
-- Destination requirements (documents, vaccines, fees)
-- ============================================================
-- Fernando de Noronha (taxa de preservação obrigatória)
INSERT INTO destination_requirements (destination_id, type, title, description, is_mandatory, sort_order)
SELECT d.id, r.type, r.title, r.description, r.mandatory, r.sort_order
FROM destinations d,
(VALUES
  ('taxa', 'Taxa de Preservação Ambiental (TPA)', 'Taxa obrigatória cobrada por dia. Valor varia conforme tempo de permanência. Pagável online antecipadamente.', true, 1),
  ('documento', 'RG ou Passaporte', 'Documento de identificação com foto obrigatório para embarque.', true, 2),
  ('taxa', 'Cartão de Turista (CTUR)', 'Cartão obrigatório para acesso ao parque. Adquirido na chegada ou online.', true, 3),
  ('recomendacao', 'Protetor Solar Reef-Safe', 'Use protetor solar biodegradável para proteger os corais.', false, 4),
  ('equipamento', 'Máscara de Snorkel', 'Pode alugar no local, mas equipamento próprio é mais higiênico.', false, 5)
) AS r(type, title, description, mandatory, sort_order)
WHERE d.slug = 'fernando-de-noronha'
ON CONFLICT DO NOTHING;

-- Chapada dos Veadeiros
INSERT INTO destination_requirements (destination_id, type, title, description, is_mandatory, sort_order)
SELECT d.id, r.type, r.title, r.description, r.mandatory, r.sort_order
FROM destinations d,
(VALUES
  ('documento', 'RG ou CNH', 'Documento com foto para trilhas no Parque Nacional.', true, 1),
  ('equipamento', 'Calçado para Trilha', 'Tênis de trilha ou bota — terreno irregular com pedras.', true, 2),
  ('recomendacao', 'Repelente + Protetor Solar', 'Região de cerrado com insetos. SPF 50+ recomendado.', false, 3),
  ('recomendacao', 'Garrafa de Água (1L+)', 'Trilhas longas sem ponto de venda. Hidratação essencial.', false, 4)
) AS r(type, title, description, mandatory, sort_order)
WHERE d.slug = 'chapada-dos-veadeiros'
ON CONFLICT DO NOTHING;
