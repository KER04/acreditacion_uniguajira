-- 029_cuadro_honor_2026_1 — Cuadro de honor real del periodo 2026-I.
--
-- Sale del reporte académico del periodo 2026-1 (todos los estudiantes del
-- programa en las dos sedes, ordenados por promedio del semestre). Se toman
-- los diez primeros de cada sede tal como vienen en el reporte, sin filtrar
-- por número de materias. Del reporte solo se publica nombre, sede, semestre
-- y promedio del semestre: código y documento de identidad no se cargan.
--
-- Los nombres venían en mayúsculas y sin tildes; se pasan a nombre propio. Las
-- tildes que falten se corrigen desde el panel.
--
-- Sustituye los diez estudiantes de ejemplo que sembraba seed.js, borrando
-- solo esos nombres exactos, y la foto que alguno tuviera asignada.

CREATE TEMP TABLE _honor_ejemplo ON COMMIT DROP AS
SELECT id, foto_id FROM cuadro_honor WHERE nombre IN (
  'María José Iguarán Pushaina',
  'Luis Enrique Gutiérrez Epiayú',
  'Carolina Brito Mendoza',
  'Samuel Cotes Jr.',
  'Andrea Uriana Jayariyú',
  'Jorge David Palmar',
  'Nayely Bolaños Curvelo',
  'Héctor Mengual Solano',
  'Catalina Ipuana Pérez',
  'Pablo Ramírez Jusayú'
);

DELETE FROM cuadro_honor WHERE id IN (SELECT id FROM _honor_ejemplo);
DELETE FROM archivos WHERE id IN (SELECT foto_id FROM _honor_ejemplo WHERE foto_id IS NOT NULL);

/* Se insertan en el orden del reporte: a igual promedio, la página desempata
   por id, así que el orden de inserción es el del Excel. Idempotente: no
   duplica a quien ya esté en el periodo con el mismo nombre. */
INSERT INTO cuadro_honor (nombre, promedio, semestre, periodo, sede)
SELECT v.nombre, v.promedio, v.semestre, v.periodo, v.sede
FROM (VALUES
  (1, 'Luis Miguel Vergara Suarez', 4.80, 10, '2026-I', 'riohacha'),
  (2, 'Ines Figueroa Sarmiento', 4.60, 10, '2026-I', 'riohacha'),
  (3, 'Karyn Julieth Movil Estacio', 4.60, 10, '2026-I', 'riohacha'),
  (4, 'Alex Valdelamar Bustamante', 4.60, 6, '2026-I', 'riohacha'),
  (5, 'Jose Juan Cantillo Moscote', 4.60, 2, '2026-I', 'riohacha'),
  (6, 'Iann Barros Cotes', 4.50, 10, '2026-I', 'riohacha'),
  (7, 'Fabio de Jesus Romero Gomez', 4.50, 10, '2026-I', 'riohacha'),
  (8, 'Cristian Andres Vargas Hernandez', 4.50, 9, '2026-I', 'riohacha'),
  (9, 'Jose Carlos Barreto Toro', 4.50, 6, '2026-I', 'riohacha'),
  (10, 'Maria Jose Cujia Gamez', 4.50, 6, '2026-I', 'riohacha'),
  (11, 'Angel David Guzman Arroyo', 5.00, 10, '2026-I', 'maicao'),
  (12, 'Daniel Andres Sierra Torres', 4.80, 10, '2026-I', 'maicao'),
  (13, 'Johansen Enrique Chapman Lopez', 4.80, 8, '2026-I', 'maicao'),
  (14, 'Luis Felipe Zapata Perez', 4.70, 9, '2026-I', 'maicao'),
  (15, 'Sebastian David Cotes Perez', 4.70, 3, '2026-I', 'maicao'),
  (16, 'Naren Enrique Marin Moscote', 4.70, 3, '2026-I', 'maicao'),
  (17, 'Sebastian Josue Pimienta Chica', 4.70, 3, '2026-I', 'maicao'),
  (18, 'Jhon Frank Figueroa Arzuga', 4.60, 10, '2026-I', 'maicao'),
  (19, 'Over Jose Manjarres Olmedo', 4.60, 10, '2026-I', 'maicao'),
  (20, 'Renzo Damian Sanchez Lopez', 4.60, 10, '2026-I', 'maicao')
) AS v(puesto, nombre, promedio, semestre, periodo, sede)
WHERE NOT EXISTS (
  SELECT 1 FROM cuadro_honor h WHERE h.periodo = v.periodo AND lower(h.nombre) = lower(v.nombre)
)
ORDER BY v.puesto;
