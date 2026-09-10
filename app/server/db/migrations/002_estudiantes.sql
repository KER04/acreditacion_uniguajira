-- 002_estudiantes — Los cuatro bloques del módulo Estudiantes que hasta ahora
-- vivían en src/data/estudiantes.json (y, en el caso del calendario, quemados
-- dentro del propio componente de React).

CREATE TABLE IF NOT EXISTS cuadro_honor (
  id             SERIAL PRIMARY KEY,
  nombre         TEXT         NOT NULL,
  promedio       NUMERIC(3,2) NOT NULL,
  semestre       TEXT         NOT NULL DEFAULT '',
  periodo        TEXT         NOT NULL DEFAULT '',
  sede           TEXT         NOT NULL DEFAULT 'riohacha',
  foto_url       TEXT         NOT NULL DEFAULT '',
  creado_en      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT honor_promedio_valido CHECK (promedio >= 0 AND promedio <= 5),
  CONSTRAINT honor_sede_valida     CHECK (sede IN ('riohacha', 'maicao'))
);

-- El listado público siempre sale ordenado por promedio.
CREATE INDEX IF NOT EXISTS honor_orden_idx ON cuadro_honor (periodo, promedio DESC);

CREATE TABLE IF NOT EXISTS calendario_academico (
  id             SERIAL PRIMARY KEY,
  titulo         TEXT        NOT NULL,
  fecha_inicio   DATE        NOT NULL,
  fecha_fin      DATE,
  tipo           TEXT        NOT NULL DEFAULT 'academico',
  periodo        TEXT        NOT NULL DEFAULT '',
  sede           TEXT        NOT NULL DEFAULT 'ambas',
  destacado      BOOLEAN     NOT NULL DEFAULT FALSE,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT calendario_tipo_valido CHECK (tipo IN ('academico', 'administrativo', 'evaluacion', 'grado', 'otro')),
  CONSTRAINT calendario_sede_valida CHECK (sede IN ('ambas', 'riohacha', 'maicao')),
  -- Un rango de fechas no puede terminar antes de empezar.
  CONSTRAINT calendario_rango_coherente CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);

CREATE INDEX IF NOT EXISTS calendario_fecha_idx ON calendario_academico (fecha_inicio);

CREATE TABLE IF NOT EXISTS modalidades_grado (
  id             SERIAL PRIMARY KEY,
  nombre         TEXT        NOT NULL,
  descripcion    TEXT        NOT NULL DEFAULT '',
  -- Lista de requisitos: un arreglo nativo evita una tabla hija para algo
  -- que siempre se lee y se escribe entero junto a su modalidad.
  requisitos     TEXT[]      NOT NULL DEFAULT '{}',
  duracion       TEXT        NOT NULL DEFAULT '',
  color          TEXT        NOT NULL DEFAULT 'var(--ug-azul)',
  documento_url  TEXT        NOT NULL DEFAULT '',
  orden          INTEGER     NOT NULL DEFAULT 0,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documentos_estudiantes (
  id             SERIAL PRIMARY KEY,
  nombre         TEXT        NOT NULL,
  descripcion    TEXT        NOT NULL DEFAULT '',
  url            TEXT        NOT NULL DEFAULT '',
  tipo           TEXT        NOT NULL DEFAULT 'PDF',
  -- Encabezado bajo el que se agrupa el documento en la página pública.
  grupo          TEXT        NOT NULL DEFAULT 'Académicos',
  peso           TEXT        NOT NULL DEFAULT '',
  orden          INTEGER     NOT NULL DEFAULT 0,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS documentos_est_grupo_idx ON documentos_estudiantes (grupo, orden);

DROP TRIGGER IF EXISTS honor_actualizado ON cuadro_honor;
CREATE TRIGGER honor_actualizado BEFORE UPDATE ON cuadro_honor
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();

DROP TRIGGER IF EXISTS calendario_actualizado ON calendario_academico;
CREATE TRIGGER calendario_actualizado BEFORE UPDATE ON calendario_academico
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();

DROP TRIGGER IF EXISTS modalidades_actualizado ON modalidades_grado;
CREATE TRIGGER modalidades_actualizado BEFORE UPDATE ON modalidades_grado
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();

DROP TRIGGER IF EXISTS documentos_est_actualizado ON documentos_estudiantes;
CREATE TRIGGER documentos_est_actualizado BEFORE UPDATE ON documentos_estudiantes
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();
