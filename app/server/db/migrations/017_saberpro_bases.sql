-- 017_saberpro_bases — El puntaje aprobatorio deja de ser un número suelto.
--
-- Hasta ahora la opción de grado se decidía con `puntaje_minimo` (un global) y
-- `minimo_por_modulo` (un mismo piso para las cinco competencias). El reporte
-- que entrega la facultad no funciona así: su última columna trae una fórmula
-- que compara CADA competencia contra su propia base
--
--   =IF(AND([LECTURA CRÍTICA]>=152, [COMUNICACIÓN ESCRITA]>=149,
--           [RAZONAMIENTO CUANTITATIVO]>=143, [COMPETENCIAS CIUDADANAS]>=144,
--           [INGLÉS]>=153), "Supero la Media", "No supero la Media")
--
-- Esas cinco cifras son las medias de referencia del examen, y son la
-- condición real: se aprueba quien iguala o supera la suya en todas. Un piso
-- único no puede representarlas, así que cada una tiene su columna.
--
-- El aprobatorio GENERAL es el promedio de las cinco, no un número aparte: es
-- lo que da el acumulado de las competencias, y por eso va como columna
-- generada. Escribirlo a mano permitiría que dejara de cuadrar con sus bases.

ALTER TABLE saberpro_parametros
  ADD COLUMN IF NOT EXISTS base_lectura_critica           SMALLINT,
  ADD COLUMN IF NOT EXISTS base_comunicacion_escrita      SMALLINT,
  ADD COLUMN IF NOT EXISTS base_razonamiento_cuantitativo SMALLINT,
  ADD COLUMN IF NOT EXISTS base_competencias_ciudadanas   SMALLINT,
  ADD COLUMN IF NOT EXISTS base_ingles                    SMALLINT,
  -- De dónde salieron: el archivo y la fecha en que se leyó. Sin esto, dentro
  -- de un año nadie sabrá si las cifras son las del reporte o las tecleó
  -- alguien.
  ADD COLUMN IF NOT EXISTS bases_origen        TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bases_actualizado_en TIMESTAMPTZ;

COMMENT ON COLUMN saberpro_parametros.base_lectura_critica IS
  'Puntaje aprobatorio de la competencia; sale de la fórmula del reporte del ICFES';

/* El aprobatorio general: promedio de las cinco bases, con un decimal.
   Es NULL mientras falte alguna, porque un promedio de cuatro no es el
   promedio del examen y publicarlo sería peor que no publicar nada. */
ALTER TABLE saberpro_parametros DROP COLUMN IF EXISTS base_global;
ALTER TABLE saberpro_parametros
  ADD COLUMN base_global NUMERIC(4,1) GENERATED ALWAYS AS (
    CASE WHEN base_lectura_critica IS NOT NULL
          AND base_comunicacion_escrita IS NOT NULL
          AND base_razonamiento_cuantitativo IS NOT NULL
          AND base_competencias_ciudadanas IS NOT NULL
          AND base_ingles IS NOT NULL
         THEN round((base_lectura_critica + base_comunicacion_escrita
                   + base_razonamiento_cuantitativo + base_competencias_ciudadanas
                   + base_ingles) / 5.0, 1)
    END
  ) STORED;

ALTER TABLE saberpro_parametros
  DROP CONSTRAINT IF EXISTS saberpro_bases_rango;
ALTER TABLE saberpro_parametros ADD CONSTRAINT saberpro_bases_rango CHECK (
      (base_lectura_critica           IS NULL OR base_lectura_critica           BETWEEN 0 AND 300)
  AND (base_comunicacion_escrita      IS NULL OR base_comunicacion_escrita      BETWEEN 0 AND 300)
  AND (base_razonamiento_cuantitativo IS NULL OR base_razonamiento_cuantitativo BETWEEN 0 AND 300)
  AND (base_competencias_ciudadanas   IS NULL OR base_competencias_ciudadanas   BETWEEN 0 AND 300)
  AND (base_ingles                    IS NULL OR base_ingles                    BETWEEN 0 AND 300)
);
