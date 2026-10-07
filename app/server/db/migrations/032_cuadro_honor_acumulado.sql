-- 032_cuadro_honor_acumulado — El cuadro de honor 2026-I pasa a ordenarse
-- por PROMEDIO ACUMULADO en vez del promedio del semestre.
--
-- Mismo reporte académico del periodo 2026-1 que la 029. Cambiar el criterio
-- cambia también quiénes entran, así que se reemplazan los veinte de la 029
-- por los diez mejores acumulados de cada sede. El acumulado viene con un
-- solo decimal y hay muchos empates: se desempata por el promedio del
-- semestre y, si persiste, por el orden del reporte. Lo que se guarda en
-- `promedio` es el acumulado.
--
-- Se borran solo los veinte nombres exactos que cargó la 029 en 2026-I (y
-- sus documentos, por la cascada); lo que se haya cargado a mano no se toca.

DELETE FROM cuadro_honor
WHERE periodo = '2026-I' AND nombre IN (
  'Luis Miguel Vergara Suarez',
  'Ines Figueroa Sarmiento',
  'Karyn Julieth Movil Estacio',
  'Alex Valdelamar Bustamante',
  'Jose Juan Cantillo Moscote',
  'Iann Barros Cotes',
  'Fabio de Jesus Romero Gomez',
  'Cristian Andres Vargas Hernandez',
  'Jose Carlos Barreto Toro',
  'Maria Jose Cujia Gamez',
  'Angel David Guzman Arroyo',
  'Daniel Andres Sierra Torres',
  'Johansen Enrique Chapman Lopez',
  'Luis Felipe Zapata Perez',
  'Sebastian David Cotes Perez',
  'Naren Enrique Marin Moscote',
  'Sebastian Josue Pimienta Chica',
  'Jhon Frank Figueroa Arzuga',
  'Over Jose Manjarres Olmedo',
  'Renzo Damian Sanchez Lopez'
);

/* En el orden del ranking: a igual promedio la página desempata por id. */
INSERT INTO cuadro_honor (nombre, promedio, semestre, periodo, sede)
SELECT v.nombre, v.promedio, v.semestre, v.periodo, v.sede
FROM (VALUES
  (1, 'Jose Francisco Perozo Rodriguez', 4.50, 1, '2026-I', 'riohacha'),
  (2, 'Alex Valdelamar Bustamante', 4.40, 6, '2026-I', 'riohacha'),
  (3, 'Fabio de Jesus Romero Gomez', 4.40, 10, '2026-I', 'riohacha'),
  (4, 'Maria Jose Cujia Gamez', 4.40, 6, '2026-I', 'riohacha'),
  (5, 'Cristian Daniel Ramirez Vega', 4.40, 10, '2026-I', 'riohacha'),
  (6, 'Neider David Perez Hernandez', 4.40, 3, '2026-I', 'riohacha'),
  (7, 'Martín Elías Jiménez Herrera', 4.40, 2, '2026-I', 'riohacha'),
  (8, 'Cristian Andres Vargas Hernandez', 4.30, 9, '2026-I', 'riohacha'),
  (9, 'Jose Carlos Barreto Toro', 4.30, 6, '2026-I', 'riohacha'),
  (10, 'Esneider Naviel Payarez Salgado', 4.30, 10, '2026-I', 'riohacha'),
  (11, 'Sebastian David Cotes Perez', 4.50, 3, '2026-I', 'maicao'),
  (12, 'Sebastian Josue Pimienta Chica', 4.50, 3, '2026-I', 'maicao'),
  (13, 'Gabriel Elias Anillo Cuadrado', 4.50, 3, '2026-I', 'maicao'),
  (14, 'Johannes Garcerant Beleño', 4.50, 2, '2026-I', 'maicao'),
  (15, 'Daniel Andres Sierra Torres', 4.40, 10, '2026-I', 'maicao'),
  (16, 'Naren Enrique Marin Moscote', 4.40, 3, '2026-I', 'maicao'),
  (17, 'Mauro Jose Lozano Chavez', 4.40, 4, '2026-I', 'maicao'),
  (18, 'Javier Jose España Sulbaran', 4.40, 1, '2026-I', 'maicao'),
  (19, 'Yoalvin Alfonso Toro Davila', 4.40, 2, '2026-I', 'maicao'),
  (20, 'Jhojaneth Sicacha Romero', 4.30, 5, '2026-I', 'maicao')
) AS v(puesto, nombre, promedio, semestre, periodo, sede)
WHERE NOT EXISTS (
  SELECT 1 FROM cuadro_honor h WHERE h.periodo = v.periodo AND lower(h.nombre) = lower(v.nombre)
)
ORDER BY v.puesto;
