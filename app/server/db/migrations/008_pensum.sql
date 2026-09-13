-- 008_pensum — El plan de estudios pasa de src/data/pensum.json a la base.
--
-- Tres tablas en vez de una, y la razón está en los datos: al comparar la malla
-- vigente con la propuesta de actualización, de las 13 materias que se llaman
-- igual en ambas, 10 cambian de semestre o de créditos. "Desarrollo Web" vale
-- 3 créditos en la vigente y 4 en la propuesta; "Álgebra Lineal" está en 2.º
-- semestre en una y en 1.º en la otra.
--
-- Es decir: el nombre, el área y el campo son de la MATERIA; el semestre, los
-- créditos y las horas son de la materia DENTRO DE UN PLAN. Guardarlos en la
-- misma tabla obligaría a duplicar la materia por cada malla, que es justo lo
-- que impide responder "¿qué cambió entre un plan y otro?".
--
-- Los totales (créditos por semestre, créditos del plan) NO se guardan: se
-- suman al leer. En el JSON estaban persistidos y hoy cuadran por suerte;
-- descuadran en cuanto alguien agrega una materia y olvida el número.

/* ─── Catálogo de materias ──────────────────────────────────────── */

CREATE TABLE IF NOT EXISTS materia (
  id             SERIAL PRIMARY KEY,
  nombre         TEXT NOT NULL,

  -- La malla vigente trae código institucional (273111); la propuesta todavía
  -- no. Opcional a propósito: no vale bloquear el registro por un dato que
  -- nadie ha asignado aún.
  codigo         TEXT NOT NULL DEFAULT '',

  area           TEXT NOT NULL DEFAULT '',
  campo          TEXT NOT NULL DEFAULT '',

  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT materia_nombre_no_vacio CHECK (length(btrim(nombre)) >= 3),
  CONSTRAINT materia_area_valida CHECK (area IN (
    '', 'Ciencias Básicas', 'Ciencias Básicas de Ingeniería',
    'Perfil Profesional', 'Complementaria', 'Investigativo')),
  CONSTRAINT materia_campo_valido CHECK (campo IN (
    '', 'Básico General Científico Disciplinar',
    'Básico Específico Profesional', 'Socio Humanístico'))
);

-- Dos materias no pueden llamarse igual: el catálogo se elige de una lista y
-- tener "Cálculo I" repetido lo vuelve inservible. Se compara en minúsculas
-- porque la fuente escribe "Lógica Y Teoría De Conjuntos" y "Lógica y Teoría
-- de Conjuntos" para la misma materia.
-- No se usa unaccent(): no está marcada IMMUTABLE y PostgreSQL no la admite
-- dentro de un índice. Las diferencias de tildes se resuelven al normalizar
-- el nombre antes de insertar.
CREATE UNIQUE INDEX IF NOT EXISTS materia_nombre_idx
  ON materia (lower(btrim(nombre)));

-- El código, cuando existe, también es único.
CREATE UNIQUE INDEX IF NOT EXISTS materia_codigo_idx
  ON materia (codigo) WHERE codigo <> '';

CREATE INDEX IF NOT EXISTS materia_area_idx ON materia (area, nombre);

DROP TRIGGER IF EXISTS materia_actualizada ON materia;
CREATE TRIGGER materia_actualizada
  BEFORE UPDATE ON materia
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();


/* ─── Planes de estudio ─────────────────────────────────────────── */

CREATE TABLE IF NOT EXISTS plan_estudio (
  id             SERIAL PRIMARY KEY,
  nombre         TEXT NOT NULL,

  -- Solo un plan rige a la vez; los demás quedan como histórico o propuesta.
  vigente        BOOLEAN NOT NULL DEFAULT FALSE,
  num_semestres  SMALLINT NOT NULL DEFAULT 10,

  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT plan_nombre_no_vacio CHECK (length(btrim(nombre)) >= 3),
  CONSTRAINT plan_semestres_validos CHECK (num_semestres BETWEEN 1 AND 14)
);

CREATE UNIQUE INDEX IF NOT EXISTS plan_nombre_idx ON plan_estudio (lower(nombre));

-- Un solo plan vigente. Lo impone la base porque "dos mallas vigentes" no es
-- un estado que la aplicación deba poder crear ni por error.
CREATE UNIQUE INDEX IF NOT EXISTS plan_unico_vigente_idx
  ON plan_estudio (vigente) WHERE vigente;

DROP TRIGGER IF EXISTS plan_actualizado ON plan_estudio;
CREATE TRIGGER plan_actualizado
  BEFORE UPDATE ON plan_estudio
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();


/* ─── La materia dentro de un plan ──────────────────────────────── */

CREATE TABLE IF NOT EXISTS plan_materia (
  id           SERIAL PRIMARY KEY,
  plan_id      INTEGER NOT NULL REFERENCES plan_estudio(id) ON DELETE CASCADE,

  -- RESTRICT y no CASCADE: si alguien borra una materia del catálogo teniéndola
  -- puesta en una malla, es un error y la base debe frenarlo, no vaciar el
  -- semestre en silencio.
  materia_id   INTEGER NOT NULL REFERENCES materia(id) ON DELETE RESTRICT,

  semestre     SMALLINT NOT NULL,
  creditos     SMALLINT NOT NULL DEFAULT 0,
  horas_semana SMALLINT NOT NULL DEFAULT 0,

  -- Posición dentro del semestre, para que la malla se dibuje siempre igual.
  orden        SMALLINT NOT NULL DEFAULT 0,

  CONSTRAINT plan_materia_semestre_valido CHECK (semestre BETWEEN 1 AND 14),
  -- Cero es legítimo: cátedras institucionales y prácticas sin creditizar.
  CONSTRAINT plan_materia_creditos_validos CHECK (creditos BETWEEN 0 AND 12),
  CONSTRAINT plan_materia_horas_validas CHECK (horas_semana BETWEEN 0 AND 40),

  -- La misma materia no puede aparecer dos veces en la misma malla.
  CONSTRAINT plan_materia_unica UNIQUE (plan_id, materia_id)
);

-- Se lee siempre agrupado por plan y semestre, en orden de presentación.
CREATE INDEX IF NOT EXISTS plan_materia_orden_idx
  ON plan_materia (plan_id, semestre, orden, id);

CREATE INDEX IF NOT EXISTS plan_materia_materia_idx ON plan_materia (materia_id);
