-- 006_docentes — El cuerpo docente pasa de src/data/docentes.json a la base.
--
-- Dos tablas, no una: la formación académica es una lista por docente y venía
-- aplastada en un solo campo de texto ("Especialista en X, magíster en Y,
-- doctorante en Z"). Separarla permite contar cuántos tienen doctorado o
-- maestría —lo que pide el Factor 3 del CNA— sin analizar cadenas.
--
-- El texto original de la planilla se conserva en `docente.posgrado`: partirlo
-- es una operación con pérdida, y si un corte queda mal se corrige sin haber
-- destruido la fuente. Además la tarjeta lo usa como resumen.

CREATE TABLE IF NOT EXISTS docente (
  id              SERIAL PRIMARY KEY,
  nombre          TEXT NOT NULL,

  -- Tipo de vinculación contractual, que es lo que registra la facultad.
  -- No es el escalafón (titular/asociado/asistente): son cosas distintas y esa
  -- fuente no lo trae. Vacío = todavía sin registrar, y la vista lo pinta gris.
  vinculacion     TEXT NOT NULL DEFAULT '',
  sede            TEXT NOT NULL DEFAULT 'riohacha',

  email           TEXT NOT NULL DEFAULT '',
  cvlac_url       TEXT NOT NULL DEFAULT '',
  orcid_url       TEXT NOT NULL DEFAULT '',
  scholar_url     TEXT NOT NULL DEFAULT '',

  -- Texto tal cual viene de la planilla; la versión estructurada va aparte.
  posgrado        TEXT NOT NULL DEFAULT '',

  dedicacion      TEXT NOT NULL DEFAULT '',
  oficina         TEXT NOT NULL DEFAULT '',
  extension       TEXT NOT NULL DEFAULT '',
  horario         TEXT NOT NULL DEFAULT '',

  grupo           TEXT NOT NULL DEFAULT '',
  grupo_categoria TEXT NOT NULL DEFAULT '',
  semillero       TEXT NOT NULL DEFAULT '',

  foto_id         BIGINT REFERENCES archivos(id) ON DELETE SET NULL,

  -- Retirar a alguien del directorio sin borrar su historial.
  activo          BOOLEAN NOT NULL DEFAULT TRUE,

  creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT docente_nombre_no_vacio   CHECK (length(btrim(nombre)) >= 3),
  CONSTRAINT docente_vinculacion_valida CHECK (vinculacion IN ('', 'planta', 'catedratico', 'ocasional')),
  CONSTRAINT docente_sede_valida        CHECK (sede IN ('riohacha', 'maicao')),
  CONSTRAINT docente_categoria_grupo_valida
    CHECK (grupo_categoria IN ('', 'A1', 'A', 'B', 'C', 'Reconocido'))
);

-- Un mismo correo no puede quedar cargado dos veces; sin correo no se bloquea
-- a nadie, porque la planilla puede traer docentes sin él.
CREATE UNIQUE INDEX IF NOT EXISTS docente_email_idx
  ON docente (lower(email)) WHERE email <> '';

-- El directorio público se lista alfabéticamente y filtrado por sede.
CREATE INDEX IF NOT EXISTS docente_orden_idx ON docente (activo, sede, nombre);

DROP TRIGGER IF EXISTS docente_actualizado ON docente;
CREATE TRIGGER docente_actualizado
  BEFORE UPDATE ON docente
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();


-- Títulos de posgrado. Al borrar al docente se van con él (CASCADE): no tienen
-- sentido por separado.
CREATE TABLE IF NOT EXISTS docente_formacion (
  id          SERIAL PRIMARY KEY,
  docente_id  INTEGER NOT NULL REFERENCES docente(id) ON DELETE CASCADE,
  titulo      TEXT NOT NULL,

  -- Nivel normalizado. La planilla escribe el mismo grado de seis maneras
  -- ("Magister", "Magíster", "MSc.", "Maestría"...); esta columna es la que
  -- permite contar sin adivinar.
  nivel       TEXT NOT NULL DEFAULT '',
  institucion TEXT NOT NULL DEFAULT '',
  anio        SMALLINT,

  -- "doctorante", "(en curso)", "(Proceso de grado)" en la fuente.
  en_curso    BOOLEAN NOT NULL DEFAULT FALSE,
  orden       SMALLINT NOT NULL DEFAULT 0,

  CONSTRAINT formacion_titulo_no_vacio CHECK (length(btrim(titulo)) >= 3),
  CONSTRAINT formacion_nivel_valido
    CHECK (nivel IN ('', 'especializacion', 'maestria', 'doctorado', 'posdoctorado', 'otro')),
  -- La universidad se fundó en 1977; el margen superior deja registrar un
  -- título que se obtendrá el año entrante.
  CONSTRAINT formacion_anio_valido
    CHECK (anio IS NULL OR (anio >= 1950 AND anio <= EXTRACT(YEAR FROM now())::int + 1))
);

-- Se leen siempre agrupados por docente y en el orden en que se muestran.
CREATE INDEX IF NOT EXISTS formacion_docente_idx
  ON docente_formacion (docente_id, orden, id);
