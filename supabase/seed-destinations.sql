-- Seed: 10 destinos curados para MVP
-- Run after migrations are applied
-- Vector order: [ritmo, natureza, urbano, praia, cultura, gastronomia, sociabilidade, fitness, aventura, relax]

INSERT INTO destinations (name, slug, description, state, city, region, latitude, longitude, climate_type, best_months, tags, destination_vector, min_days, max_days, avg_daily_cost, is_active) VALUES

('Chapada dos Veadeiros', 'chapada-dos-veadeiros',
  'Santuário ecológico com cachoeiras cristalinas, trilhas no cerrado e céu estrelado. Patrimônio natural da humanidade.',
  'GO', 'Alto Paraíso de Goiás', 'centro-oeste', -14.0861, -47.5277, 'tropical de altitude',
  ARRAY[5,6,7,8,9], ARRAY['natureza','ecoturismo','cachoeiras','trilhas','cerrado'],
  '[30,95,10,15,40,50,40,75,85,60]'::vector(10), 4, 7, 350.00, true),

('Fernando de Noronha', 'fernando-de-noronha',
  'Arquipélago paradisíaco com praias de águas cristalinas, mergulho com golfinhos e vida marinha exuberante.',
  'PE', 'Fernando de Noronha', 'nordeste', -3.8547, -32.4247, 'tropical',
  ARRAY[8,9,10,11,12,1,2], ARRAY['praia','mergulho','natureza','ilha','golfinhos'],
  '[40,80,5,100,30,45,50,60,70,85]'::vector(10), 5, 10, 800.00, true),

('Gramado', 'gramado',
  'Cidade serrana com arquitetura europeia, chocolate artesanal, fondue e clima romântico no inverno.',
  'RS', 'Gramado', 'sul', -29.3731, -50.8756, 'subtropical',
  ARRAY[5,6,7,8], ARRAY['gastronomia','romantico','inverno','chocolate','serra'],
  '[30,40,60,5,70,95,65,20,15,80]'::vector(10), 3, 5, 450.00, true),

('Jericoacoara', 'jericoacoara',
  'Vila de pescadores com dunas, lagoas cristalinas, kitesurf e pôr do sol na Duna do Pôr do Sol.',
  'CE', 'Jijoca de Jericoacoara', 'nordeste', -2.4961, -40.5117, 'tropical semiárido',
  ARRAY[7,8,9,10,11], ARRAY['praia','kitesurf','dunas','aventura','pôr-do-sol'],
  '[70,60,15,95,25,55,80,65,80,70]'::vector(10), 5, 8, 400.00, true),

('Bonito', 'bonito',
  'Capital do ecoturismo com flutuação em rios cristalinos, grutas, cachoeiras e fauna aquática impressionante.',
  'MS', 'Bonito', 'centro-oeste', -21.1236, -56.4855, 'tropical',
  ARRAY[1,2,3,4,10,11,12], ARRAY['ecoturismo','flutuação','grutas','natureza','aventura'],
  '[40,95,10,20,35,40,45,70,90,50]'::vector(10), 4, 6, 500.00, true),

('Lençóis Maranhenses', 'lencois-maranhenses',
  'Deserto de dunas brancas com lagoas azuis e verdes. Paisagem surreal e única no mundo.',
  'MA', 'Barreirinhas', 'nordeste', -2.4833, -43.1167, 'tropical',
  ARRAY[6,7,8,9,10], ARRAY['dunas','lagoas','natureza','aventura','deserto'],
  '[50,85,5,60,30,30,40,65,80,55]'::vector(10), 3, 5, 350.00, true),

('Paraty', 'paraty',
  'Cidade colonial entre mar e montanha, com praias, trilhas, cachaçarias artesanais e centro histórico preservado.',
  'RJ', 'Paraty', 'sudeste', -23.2178, -44.7131, 'tropical atlântico',
  ARRAY[3,4,5,9,10,11], ARRAY['histórico','praia','gastronomia','cultura','colonial'],
  '[40,65,35,75,90,85,60,40,45,70]'::vector(10), 3, 5, 400.00, true),

('Chapada Diamantina', 'chapada-diamantina',
  'Parque nacional com trilhas épicas, cachoeiras gigantes, grutas com poços azuis e vales profundos.',
  'BA', 'Lençóis', 'nordeste', -12.5614, -41.3870, 'tropical de altitude',
  ARRAY[4,5,6,7,8,9], ARRAY['trekking','cachoeiras','grutas','natureza','aventura'],
  '[35,95,5,10,45,40,35,85,95,40]'::vector(10), 5, 8, 300.00, true),

('Florianópolis', 'florianopolis',
  'Ilha da Magia com 42 praias, surf, trilhas, vida noturna agitada e gastronomia de frutos do mar.',
  'SC', 'Florianópolis', 'sul', -27.5954, -48.5480, 'subtropical',
  ARRAY[12,1,2,3], ARRAY['praia','surf','vida-noturna','gastronomia','urbano'],
  '[75,50,65,90,55,80,90,60,55,45]'::vector(10), 4, 7, 400.00, true),

('São Miguel dos Milagres', 'sao-miguel-dos-milagres',
  'Piscinas naturais de águas mornas e cristalinas, coqueirais e tranquilidade absoluta no litoral alagoano.',
  'AL', 'São Miguel dos Milagres', 'nordeste', -9.2653, -35.3731, 'tropical',
  ARRAY[9,10,11,12,1,2,3], ARRAY['praia','relax','piscinas-naturais','romântico','tranquilidade'],
  '[15,60,5,95,20,50,30,15,10,100]'::vector(10), 3, 5, 550.00, true);

-- Insert dimension scores for each destination (triggers vector rebuild)
-- Chapada dos Veadeiros
INSERT INTO destination_scores (destination_id, dimension, score)
SELECT d.id, s.dimension, s.score
FROM destinations d,
LATERAL (VALUES
  ('ritmo', 30), ('natureza', 95), ('urbano', 10), ('praia', 15), ('cultura', 40),
  ('gastronomia', 50), ('sociabilidade', 40), ('fitness', 75), ('aventura', 85), ('relax', 60)
) AS s(dimension, score)
WHERE d.slug = 'chapada-dos-veadeiros';

-- Fernando de Noronha
INSERT INTO destination_scores (destination_id, dimension, score)
SELECT d.id, s.dimension, s.score
FROM destinations d,
LATERAL (VALUES
  ('ritmo', 40), ('natureza', 80), ('urbano', 5), ('praia', 100), ('cultura', 30),
  ('gastronomia', 45), ('sociabilidade', 50), ('fitness', 60), ('aventura', 70), ('relax', 85)
) AS s(dimension, score)
WHERE d.slug = 'fernando-de-noronha';

-- Gramado
INSERT INTO destination_scores (destination_id, dimension, score)
SELECT d.id, s.dimension, s.score
FROM destinations d,
LATERAL (VALUES
  ('ritmo', 30), ('natureza', 40), ('urbano', 60), ('praia', 5), ('cultura', 70),
  ('gastronomia', 95), ('sociabilidade', 65), ('fitness', 20), ('aventura', 15), ('relax', 80)
) AS s(dimension, score)
WHERE d.slug = 'gramado';

-- Jericoacoara
INSERT INTO destination_scores (destination_id, dimension, score)
SELECT d.id, s.dimension, s.score
FROM destinations d,
LATERAL (VALUES
  ('ritmo', 70), ('natureza', 60), ('urbano', 15), ('praia', 95), ('cultura', 25),
  ('gastronomia', 55), ('sociabilidade', 80), ('fitness', 65), ('aventura', 80), ('relax', 70)
) AS s(dimension, score)
WHERE d.slug = 'jericoacoara';

-- Bonito
INSERT INTO destination_scores (destination_id, dimension, score)
SELECT d.id, s.dimension, s.score
FROM destinations d,
LATERAL (VALUES
  ('ritmo', 40), ('natureza', 95), ('urbano', 10), ('praia', 20), ('cultura', 35),
  ('gastronomia', 40), ('sociabilidade', 45), ('fitness', 70), ('aventura', 90), ('relax', 50)
) AS s(dimension, score)
WHERE d.slug = 'bonito';

-- Lençóis Maranhenses
INSERT INTO destination_scores (destination_id, dimension, score)
SELECT d.id, s.dimension, s.score
FROM destinations d,
LATERAL (VALUES
  ('ritmo', 50), ('natureza', 85), ('urbano', 5), ('praia', 60), ('cultura', 30),
  ('gastronomia', 30), ('sociabilidade', 40), ('fitness', 65), ('aventura', 80), ('relax', 55)
) AS s(dimension, score)
WHERE d.slug = 'lencois-maranhenses';

-- Paraty
INSERT INTO destination_scores (destination_id, dimension, score)
SELECT d.id, s.dimension, s.score
FROM destinations d,
LATERAL (VALUES
  ('ritmo', 40), ('natureza', 65), ('urbano', 35), ('praia', 75), ('cultura', 90),
  ('gastronomia', 85), ('sociabilidade', 60), ('fitness', 40), ('aventura', 45), ('relax', 70)
) AS s(dimension, score)
WHERE d.slug = 'paraty';

-- Chapada Diamantina
INSERT INTO destination_scores (destination_id, dimension, score)
SELECT d.id, s.dimension, s.score
FROM destinations d,
LATERAL (VALUES
  ('ritmo', 35), ('natureza', 95), ('urbano', 5), ('praia', 10), ('cultura', 45),
  ('gastronomia', 40), ('sociabilidade', 35), ('fitness', 85), ('aventura', 95), ('relax', 40)
) AS s(dimension, score)
WHERE d.slug = 'chapada-diamantina';

-- Florianópolis
INSERT INTO destination_scores (destination_id, dimension, score)
SELECT d.id, s.dimension, s.score
FROM destinations d,
LATERAL (VALUES
  ('ritmo', 75), ('natureza', 50), ('urbano', 65), ('praia', 90), ('cultura', 55),
  ('gastronomia', 80), ('sociabilidade', 90), ('fitness', 60), ('aventura', 55), ('relax', 45)
) AS s(dimension, score)
WHERE d.slug = 'florianopolis';

-- São Miguel dos Milagres
INSERT INTO destination_scores (destination_id, dimension, score)
SELECT d.id, s.dimension, s.score
FROM destinations d,
LATERAL (VALUES
  ('ritmo', 15), ('natureza', 60), ('urbano', 5), ('praia', 95), ('cultura', 20),
  ('gastronomia', 50), ('sociabilidade', 30), ('fitness', 15), ('aventura', 10), ('relax', 100)
) AS s(dimension, score)
WHERE d.slug = 'sao-miguel-dos-milagres';
