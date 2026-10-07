-- 030_investigacion_real — Grupos y semilleros reales del programa.
--
-- Sustituye los tres grupos (GITUG, WayuuLab, Caribe.AI) y los cinco
-- semilleros de ejemplo que sembró la 019 por los reales:
--
--   · Semilleros: listado de semilleros de investigación del programa
--     (seguimiento SIGINV). Se publican nombre, sede, coordinador y grupo; la
--     etapa del seguimiento y el rol de quien lo hace son internos y no se
--     cargan.
--   · Grupos: los cuatro de los que dependen esos semilleros. Innovemos y
--     Universidad Paralela traen líder, GrupLAC y objetivo de la exportación
--     de grupos de la universidad; categoría y sede salen de la tabla de grupos
--     del Factor 8 del informe de autoevaluación (Convocatoria 957 de 2024),
--     porque la exportación trae la categoría vacía. IPAITUG y Nuevos Vestigios
--     solo tienen lo del informe; el resto se completa desde el panel.
--
-- Se borran solo los nombres de ejemplo exactos. Lo demás es idempotente.

/* Un semillero puede estar ya activo pero con su propuesta todavía en
   evaluación por pares: la página lo marca para no presentarlo como
   oficializado. */
ALTER TABLE semillero ADD COLUMN IF NOT EXISTS en_evaluacion BOOLEAN NOT NULL DEFAULT FALSE;

DELETE FROM semillero
WHERE nombre IN ('IoT Wayuu', 'CiberSeg', 'DataCaribe', 'WebDev IS', 'AlgoLab');

DELETE FROM grupo_investigacion
WHERE nombre IN ('GITUG', 'WayuuLab', 'Caribe.AI');

INSERT INTO grupo_investigacion (orden, nombre, nombre_completo, categoria, lider, sede, descripcion, color, gruplac_url)
SELECT v.orden, v.nombre, v.nombre_completo, v.categoria, v.lider, v.sede, v.descripcion, v.color, v.gruplac_url
FROM (VALUES
  (0, 'Innovemos', 'Innovemos, Gerencia & Tecnología', 'A', 'Hobber Berrio Caballero', 'maicao',
   'Promover el desarrollo tecnológico de la región, a través del fortalecimiento de las capacidades de innovación de entidades públicas, privadas y académicas.',
   'var(--ug-azul)', 'https://scienti.minciencias.gov.co/gruplac/jsp/visualiza/visualizagr.jsp?nro=00000000014715'),
  (1, 'Universidad Paralela', 'Grupo de investigación Universidad Paralela', 'B', 'Sandy Romero Cuello', 'riohacha',
   'Producir y desarrollar conocimiento que permita un cambio en el proceso docente educativo; buscar y producir herramientas que permitan un cambio en el docente de la Universidad de La Guajira en su quehacer pedagógico.',
   'var(--ug-amarillo)', 'https://scienti.minciencias.gov.co/gruplac/jsp/visualiza/visualizagr.jsp?nro=00000000003518'),
  (2, 'IPAITUG', 'Grupo de investigación IPAITUG', 'B', '', 'riohacha', '', 'var(--ug-flamingo)', ''),
  (3, 'Nuevos Vestigios', 'Grupo de investigación Nuevos Vestigios', 'C', '', 'riohacha', '', 'var(--ug-marino)', '')
) AS v(orden, nombre, nombre_completo, categoria, lider, sede, descripcion, color, gruplac_url)
WHERE NOT EXISTS (
  SELECT 1 FROM grupo_investigacion g WHERE lower(btrim(g.nombre)) = lower(btrim(v.nombre))
);

INSERT INTO semillero (orden, nombre, sede, lider, grupo_id, en_evaluacion)
SELECT v.orden, v.nombre, v.sede, v.lider,
       (SELECT g.id FROM grupo_investigacion g WHERE lower(g.nombre) = lower(v.grupo)),
       v.en_evaluacion
FROM (VALUES
  (0, 'Semillero de Investigación de Ingeniería de Sistemas (SIIS)', 'riohacha', 'Nayeli Mejia Riveira', 'Universidad Paralela', FALSE),
  (1, 'Sembrando Futuro', 'maicao', 'Diego Madrid Orrego', 'Innovemos', FALSE),
  (2, 'Guajira Tech', 'riohacha', 'Roger David Pimienta Barros', 'IPAITUG', FALSE),
  (3, 'SIIS2', 'riohacha', 'Carlos Raul Deluquez Garizado', 'Universidad Paralela', FALSE),
  (4, 'Ingeniería I+D+i', 'riohacha', 'Katy Cecilia Herrera Estrada', 'Universidad Paralela', FALSE),
  (5, 'Alfacode', 'riohacha', 'Robert Damian Quintero Laverde', 'Universidad Paralela', FALSE),
  (6, 'R.E.D Tech (Robótica, Electrónica y Desarrollo Tecnológico)', 'riohacha', 'Henrry David Rios Meza', 'Innovemos', FALSE),
  (7, 'Pensamiento Computacional y Ciudadanía Digital', 'riohacha', 'David Fernandez Perez', 'Nuevos Vestigios', FALSE),
  (8, 'Metáforas', 'riohacha', 'Julio Miguel Hoyos Salgado', 'Universidad Paralela', FALSE),
  (9, 'Innovation to Software', 'maicao', 'Arturo Javier Acosta Alfaro', 'Innovemos', TRUE)
) AS v(orden, nombre, sede, lider, grupo, en_evaluacion)
WHERE NOT EXISTS (
  SELECT 1 FROM semillero s WHERE lower(btrim(s.nombre)) = lower(btrim(v.nombre))
);
