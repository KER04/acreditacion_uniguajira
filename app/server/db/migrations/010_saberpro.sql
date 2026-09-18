-- 010_saberpro — Resultados Saber Pro del programa.
--
-- La estructura sale del reporte del ICFES (public/docs): cinco módulos
-- genéricos en escala 0–300, un puntaje global, y dos percentiles —contra todo
-- el país y contra el mismo NBC (Núcleo Básico del Conocimiento), que para
-- nosotros es "Ingeniería de Sistemas, Telemática y Afines".
--
-- Dos decisiones que evitan que los datos se contradigan a sí mismos:
--
--  1. `puntaje_global` es COLUMNA GENERADA, no un campo que alguien teclea.
--     El reporte del ICFES lo define como "promedio simple a partir del
--     puntaje de los módulos genéricos", así que aquí se calcula igual. Si se
--     escribiera a mano, tarde o temprano habría una fila cuyo global no
--     cuadra con sus cinco módulos y nadie sabría cuál de los seis números
--     creer.
--
--  2. El umbral para graduarse por puntaje NO se escribe en el código ni se
--     repite en cada consulta: vive en `saberpro_parametros`. Lo fija un
--     acuerdo del Consejo Académico y cambia sin que cambie el software.

CREATE TABLE IF NOT EXISTS saberpro_resultado (
  id             SERIAL PRIMARY KEY,

  estudiante     TEXT     NOT NULL,
  documento      TEXT     NOT NULL DEFAULT '',
  -- Número de registro del examen (EK…). Identifica el reporte, no a la persona.
  registro       TEXT     NOT NULL DEFAULT '',

  anio           SMALLINT NOT NULL,
  periodo        TEXT     NOT NULL DEFAULT '',
  sede           TEXT     NOT NULL DEFAULT 'riohacha',

  -- Los cinco módulos genéricos, 0–300. Obligatorios: sin los cinco no se
  -- puede calcular el global, y un reporte del ICFES siempre los trae.
  lectura_critica           SMALLINT NOT NULL,
  razonamiento_cuantitativo SMALLINT NOT NULL,
  competencias_ciudadanas   SMALLINT NOT NULL,
  comunicacion_escrita      SMALLINT NOT NULL,
  ingles                    SMALLINT NOT NULL,

  -- Promedio simple de los cinco, redondeado, como lo define el ICFES.
  puntaje_global SMALLINT GENERATED ALWAYS AS (
    round((lectura_critica + razonamiento_cuantitativo + competencias_ciudadanas
           + comunicacion_escrita + ingles) / 5.0)::smallint
  ) STORED,

  percentil_nacional SMALLINT,
  percentil_nbc      SMALLINT,
  -- Nivel del Marco Común Europeo que reporta el módulo de inglés.
  nivel_ingles       TEXT NOT NULL DEFAULT '',

  observaciones  TEXT NOT NULL DEFAULT '',

  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT saberpro_estudiante_no_vacio CHECK (length(btrim(estudiante)) >= 3),
  CONSTRAINT saberpro_anio_valido  CHECK (anio BETWEEN 2010 AND 2100),
  CONSTRAINT saberpro_sede_valida  CHECK (sede IN ('riohacha', 'maicao')),
  CONSTRAINT saberpro_lectura_rango      CHECK (lectura_critica BETWEEN 0 AND 300),
  CONSTRAINT saberpro_razonamiento_rango CHECK (razonamiento_cuantitativo BETWEEN 0 AND 300),
  CONSTRAINT saberpro_ciudadanas_rango   CHECK (competencias_ciudadanas BETWEEN 0 AND 300),
  CONSTRAINT saberpro_escrita_rango      CHECK (comunicacion_escrita BETWEEN 0 AND 300),
  CONSTRAINT saberpro_ingles_rango       CHECK (ingles BETWEEN 0 AND 300),
  CONSTRAINT saberpro_percentil_nacional_rango CHECK (percentil_nacional IS NULL OR percentil_nacional BETWEEN 0 AND 100),
  CONSTRAINT saberpro_percentil_nbc_rango      CHECK (percentil_nbc IS NULL OR percentil_nbc BETWEEN 0 AND 100),
  CONSTRAINT saberpro_nivel_ingles_valido
    CHECK (nivel_ingles IN ('', '-A1', 'A1', 'A2', 'B1', 'B2'))
);

-- Un mismo registro del ICFES no puede cargarse dos veces. Sin registro no se
-- bloquea a nadie, porque una carga manual antigua puede no tenerlo.
CREATE UNIQUE INDEX IF NOT EXISTS saberpro_registro_idx
  ON saberpro_resultado (registro) WHERE registro <> '';

-- Las dos consultas del módulo: medias por año, y ranking dentro de un año.
CREATE INDEX IF NOT EXISTS saberpro_anio_idx
  ON saberpro_resultado (anio DESC, puntaje_global DESC);

DROP TRIGGER IF EXISTS saberpro_actualizado ON saberpro_resultado;
CREATE TRIGGER saberpro_actualizado BEFORE UPDATE ON saberpro_resultado
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();


-- Parámetros de la opción de grado por resultado en Saber Pro.
-- Una sola fila: el CHECK sobre la clave primaria lo garantiza.
CREATE TABLE IF NOT EXISTS saberpro_parametros (
  id                 SMALLINT PRIMARY KEY DEFAULT 1,

  -- Puntaje global mínimo. El valor real lo fija el Consejo Académico; este es
  -- un punto de partida que el panel puede cambiar sin tocar código.
  puntaje_minimo     SMALLINT NOT NULL DEFAULT 160,
  -- Exigencia adicional opcional: percentil nacional mínimo. En NULL no aplica.
  percentil_minimo   SMALLINT,
  -- Algunos acuerdos piden además que ningún módulo baje de cierto piso, para
  -- que un global alto no tape una competencia hundida.
  minimo_por_modulo  SMALLINT,

  -- De dónde sale la regla, para que la página pueda citarla.
  norma              TEXT NOT NULL DEFAULT '',
  vigente_desde      DATE,

  actualizado_en     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT saberpro_parametros_fila_unica CHECK (id = 1),
  CONSTRAINT saberpro_puntaje_minimo_rango  CHECK (puntaje_minimo BETWEEN 0 AND 300),
  CONSTRAINT saberpro_percentil_minimo_rango
    CHECK (percentil_minimo IS NULL OR percentil_minimo BETWEEN 0 AND 100),
  CONSTRAINT saberpro_minimo_modulo_rango
    CHECK (minimo_por_modulo IS NULL OR minimo_por_modulo BETWEEN 0 AND 300)
);

INSERT INTO saberpro_parametros (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

DROP TRIGGER IF EXISTS saberpro_parametros_actualizado ON saberpro_parametros;
CREATE TRIGGER saberpro_parametros_actualizado BEFORE UPDATE ON saberpro_parametros
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();
