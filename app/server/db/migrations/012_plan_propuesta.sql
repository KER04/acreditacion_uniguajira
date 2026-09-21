-- 012_plan_propuesta — La propuesta de actualización curricular entra a la
-- base, con sus metadatos de trámite y con prerrequisitos.
--
-- La propuesta no necesita tablas propias: es otra fila de plan_estudio con
-- vigente = false. Esa es la razón por la que en la 008 el semestre y los
-- créditos quedaron en plan_materia y no en materia — las 17 asignaturas que
-- comparten las dos mallas son una sola fila del catálogo, con créditos
-- distintos en cada plan.
--
-- Lo que sí falta es dónde guardar lo que rodea a una propuesta: en qué punto
-- del trámite va, contra qué plan se compara y qué se cursa por fuera de la
-- malla.

/* ─── Metadatos del plan ────────────────────────────────────────── */

ALTER TABLE plan_estudio
  ADD COLUMN IF NOT EXISTS titulo TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS etapa_tramite TEXT NOT NULL DEFAULT '',
  -- Lo que se cursa sin créditos: deportes, wayuunaiki, Saber Pro. Arreglo
  -- nativo como en modalidades_grado: se lee y se escribe entero.
  ADD COLUMN IF NOT EXISTS extracurriculares TEXT[] NOT NULL DEFAULT '{}',
  -- Una propuesta se entiende contra la malla que reemplaza.
  ADD COLUMN IF NOT EXISTS comparado_con INTEGER REFERENCES plan_estudio(id) ON DELETE SET NULL;

COMMENT ON COLUMN plan_estudio.titulo IS 'Nombre largo para la vista pública; `nombre` es el corto e identifica';
COMMENT ON COLUMN plan_estudio.etapa_tramite IS 'Clave de la etapa actual; apunta a plan_tramite.clave';


/* ─── Etapas del trámite ────────────────────────────────────────── */

-- Una tabla y no un arreglo JSON: cada etapa tiene clave, nombre y una
-- explicación que la vista pública muestra, y el panel las edita por separado.
CREATE TABLE IF NOT EXISTS plan_tramite (
  id      SERIAL PRIMARY KEY,
  plan_id INTEGER  NOT NULL REFERENCES plan_estudio(id) ON DELETE CASCADE,
  clave   TEXT     NOT NULL,
  etapa   TEXT     NOT NULL,
  detalle TEXT     NOT NULL DEFAULT '',
  orden   SMALLINT NOT NULL DEFAULT 0,

  CONSTRAINT tramite_clave_no_vacia CHECK (length(btrim(clave)) > 0),
  CONSTRAINT tramite_etapa_no_vacia CHECK (length(btrim(etapa)) >= 3),
  CONSTRAINT tramite_clave_unica UNIQUE (plan_id, clave)
);

CREATE INDEX IF NOT EXISTS plan_tramite_orden_idx ON plan_tramite (plan_id, orden, id);


/* ─── Prerrequisitos ────────────────────────────────────────────── */

-- Son del PLAN, no de la materia: en una malla Cálculo II puede exigir
-- Cálculo I y en otra no. Por eso la llave lleva plan_id.
--
-- Que el prerrequisito esté en un semestre anterior no se puede exigir con un
-- CHECK —haría falta una subconsulta— así que lo valida la API. La base sí
-- impide lo que puede: que una materia sea prerrequisito de sí misma y que la
-- misma pareja se registre dos veces.
CREATE TABLE IF NOT EXISTS plan_prerrequisito (
  plan_id          INTEGER NOT NULL REFERENCES plan_estudio(id) ON DELETE CASCADE,
  materia_id       INTEGER NOT NULL REFERENCES materia(id)      ON DELETE CASCADE,
  prerrequisito_id INTEGER NOT NULL REFERENCES materia(id)      ON DELETE CASCADE,
  tipo             TEXT    NOT NULL DEFAULT 'prerrequisito',
  creado_en        TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (plan_id, materia_id, prerrequisito_id),
  CONSTRAINT prerrequisito_no_circular CHECK (materia_id <> prerrequisito_id),
  CONSTRAINT prerrequisito_tipo_valido CHECK (tipo IN ('prerrequisito', 'correquisito'))
);

-- Para dibujar las flechas hacia atrás: "¿de qué es prerrequisito esta materia?"
CREATE INDEX IF NOT EXISTS prerrequisito_inverso_idx
  ON plan_prerrequisito (plan_id, prerrequisito_id);


/* ─── El plan vigente estrena metadatos ─────────────────────────── */

UPDATE plan_estudio
   SET titulo = COALESCE(NULLIF(titulo, ''), 'Plan de estudios vigente'),
       etapa_tramite = 'aprobado'
 WHERE vigente;
