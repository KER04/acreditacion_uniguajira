-- 013_grado — Lo que necesita quien terminó materias y está en trámite de
-- grado: la normativa que rige el trámite y las ideas de investigación que
-- ofrecen los docentes como punto de partida para el trabajo de grado.
--
-- Por qué una vista aparte de "Graduados": en el uso colombiano son dos
-- momentos distintos y dos necesidades distintas. El *graduado* ya tiene el
-- título y busca red, bolsa de empleo y actualización de datos —eso ya existía
-- y solo cambia de nombre—. El *egresado* terminó el plan y está en el trámite:
-- necesita saber qué modalidades puede escoger, qué acuerdo la reglamenta, qué
-- prácticas hay abiertas y sobre qué puede investigar. Mezclarlos obligaba a
-- quien está en trámite a leerse una página escrita para otra etapa.
--
-- Dos de los cuatro bloques de esa vista NO nacen aquí, a propósito:
--   · modalidades de grado    -> modalidades_grado (migración 002)
--   · convocatorias de práctica -> convocatoria WHERE categoria = 'Prácticas'
-- Duplicarlos habría dado dos catálogos que se contradicen en cuanto alguien
-- edite uno solo. La vista los lee de donde ya viven.

/* ─── Normativa del trámite de grado ────────────────────────────── */

CREATE TABLE IF NOT EXISTS normativa_grado (
  id             SERIAL PRIMARY KEY,
  titulo         TEXT        NOT NULL,
  descripcion    TEXT        NOT NULL DEFAULT '',

  -- "Acuerdo", "Resolución"… y su número tal como se cita ("015 de 2019").
  -- Van separados del título porque la vista los muestra como etiqueta y
  -- porque el número no siempre cabe en el nombre del documento.
  tipo           TEXT        NOT NULL DEFAULT 'Acuerdo',
  numero         TEXT        NOT NULL DEFAULT '',
  anio           INTEGER,
  expedida_por   TEXT        NOT NULL DEFAULT '',

  -- Mismo patrón que documentos_estudiantes: el archivo puede estar en la base
  -- o ser un enlace externo, y el front consume `url` sin saber cuál es.
  url            TEXT        NOT NULL DEFAULT '',
  archivo_id     BIGINT      REFERENCES archivos(id) ON DELETE SET NULL,

  -- Una norma derogada no se borra: se sigue citando en trámites viejos.
  vigente        BOOLEAN     NOT NULL DEFAULT TRUE,

  orden          INTEGER     NOT NULL DEFAULT 0,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT normativa_titulo_no_vacio CHECK (length(btrim(titulo)) >= 3),
  CONSTRAINT normativa_tipo_valido CHECK (tipo IN (
    'Acuerdo', 'Resolución', 'Circular', 'Reglamento', 'Guía', 'Formato', 'Ley', 'Decreto')),
  -- 1976 es la primera promoción del programa; el tope solo descarta erratas.
  CONSTRAINT normativa_anio_valido CHECK (anio IS NULL OR anio BETWEEN 1976 AND 2100)
);

CREATE INDEX IF NOT EXISTS normativa_orden_idx ON normativa_grado (vigente DESC, orden ASC, id ASC);

DROP TRIGGER IF EXISTS normativa_actualizada ON normativa_grado;
CREATE TRIGGER normativa_actualizada BEFORE UPDATE ON normativa_grado
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();


/* ─── Ideas de investigación ────────────────────────────────────── */

CREATE TABLE IF NOT EXISTS idea_investigacion (
  id             SERIAL PRIMARY KEY,
  titulo         TEXT        NOT NULL,
  descripcion    TEXT        NOT NULL DEFAULT '',

  -- Línea de investigación del programa. Texto y no catálogo porque las líneas
  -- las redefine cada actualización curricular y no hay tabla que las guarde.
  linea          TEXT        NOT NULL DEFAULT '',

  -- Quién la propone y a qué modalidad de grado apunta. Ambas opcionales: una
  -- idea puede publicarse sin tutor asignado todavía.
  docente_id     INTEGER     REFERENCES docente(id) ON DELETE SET NULL,
  modalidad_id   INTEGER     REFERENCES modalidades_grado(id) ON DELETE SET NULL,

  -- Si alguien ya la tomó. Se guarda y no se deduce: nada en el calendario lo
  -- dice, solo lo sabe el docente que la ofreció.
  estado         TEXT        NOT NULL DEFAULT 'Disponible',
  dificultad     TEXT        NOT NULL DEFAULT 'Intermedia',

  -- Igual que los requisitos de modalidades_grado: se lee y se escribe entera.
  palabras       TEXT[]      NOT NULL DEFAULT '{}',

  -- A quién escribirle si el docente no está asignado o prefiere otro canal.
  contacto       TEXT        NOT NULL DEFAULT '',

  orden          INTEGER     NOT NULL DEFAULT 0,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT idea_titulo_no_vacio CHECK (length(btrim(titulo)) >= 3),
  CONSTRAINT idea_estado_valido CHECK (estado IN ('Disponible', 'Tomada', 'En curso', 'Terminada')),
  CONSTRAINT idea_dificultad_valida CHECK (dificultad IN ('Inicial', 'Intermedia', 'Avanzada'))
);

-- El portal lista primero lo que todavía se puede tomar.
CREATE INDEX IF NOT EXISTS idea_orden_idx  ON idea_investigacion (estado, orden ASC, id DESC);
CREATE INDEX IF NOT EXISTS idea_docente_idx ON idea_investigacion (docente_id);

DROP TRIGGER IF EXISTS idea_actualizada ON idea_investigacion;
CREATE TRIGGER idea_actualizada BEFORE UPDATE ON idea_investigacion
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();
