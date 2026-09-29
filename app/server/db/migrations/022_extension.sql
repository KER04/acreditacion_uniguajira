-- 022_extension — Convenios, proyectos y educación continua.
--
-- Sustituye src/data/extension.json. Como pasaba con Investigación (019),
-- había dos fuentes que no coincidían: el JSON (proyectos y alianzas), que no
-- leía nadie, y una copia escrita a mano en Extension.jsx (convenios, cifras y
-- cursos), que era lo que se veía. Ahora la página lee de aquí y las cifras
-- del titular se cuentan, no se escriben.

/* ─── Convenios ─────────────────────────────────────────────────── */

CREATE TABLE IF NOT EXISTS convenio_extension (
  id             SERIAL PRIMARY KEY,
  organizacion   TEXT        NOT NULL,
  -- Qué clase de aliado es. Se muestra como etiqueta y sirve para agrupar.
  sector         TEXT        NOT NULL DEFAULT 'Empresarial',
  -- Cómo se llama el acto: "Convenio marco", "Convenio de prácticas"…
  tipo           TEXT        NOT NULL DEFAULT '',
  descripcion    TEXT        NOT NULL DEFAULT '',
  anio_inicio    INTEGER,
  -- Vigente no se guarda: se deduce de aquí. Sin fecha = indefinido.
  fecha_fin      DATE,
  -- El documento del convenio o la página del aliado.
  url            TEXT        NOT NULL DEFAULT '',
  color          TEXT        NOT NULL DEFAULT 'var(--ug-azul)',
  orden          INTEGER     NOT NULL DEFAULT 0,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT convenio_organizacion_no_vacia CHECK (length(btrim(organizacion)) >= 2),
  CONSTRAINT convenio_sector_valido CHECK (sector IN ('Empresarial', 'Público', 'Tercer sector', 'Académico')),
  CONSTRAINT convenio_anio_valido   CHECK (anio_inicio IS NULL OR anio_inicio BETWEEN 1976 AND 2100),
  CONSTRAINT convenio_orden_valido  CHECK (orden BETWEEN 0 AND 999)
);

DROP TRIGGER IF EXISTS convenio_extension_actualizado ON convenio_extension;
CREATE TRIGGER convenio_extension_actualizado BEFORE UPDATE ON convenio_extension
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();


/* ─── Proyectos de extensión ────────────────────────────────────── */

CREATE TABLE IF NOT EXISTS proyecto_extension (
  id             SERIAL PRIMARY KEY,
  titulo         TEXT        NOT NULL,
  descripcion    TEXT        NOT NULL DEFAULT '',
  -- A quién llega: la comunidad o el sector, y dónde.
  comunidad      TEXT        NOT NULL DEFAULT '',
  municipio      TEXT        NOT NULL DEFAULT '',
  sede           TEXT        NOT NULL DEFAULT 'riohacha',
  estado         TEXT        NOT NULL DEFAULT 'En ejecución',
  fecha_inicio   DATE,
  fecha_fin      DATE,
  -- Se lee y se escribe entera, como las líneas de los grupos.
  integrantes    TEXT[]      NOT NULL DEFAULT '{}',
  orden          INTEGER     NOT NULL DEFAULT 0,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT proyecto_ext_titulo_no_vacio CHECK (length(btrim(titulo)) >= 3),
  CONSTRAINT proyecto_ext_sede_valida     CHECK (sede IN ('ambas', 'riohacha', 'maicao')),
  CONSTRAINT proyecto_ext_estado_valido   CHECK (estado IN ('Formulación', 'En ejecución', 'Finalizado')),
  CONSTRAINT proyecto_ext_fechas          CHECK (fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin >= fecha_inicio),
  CONSTRAINT proyecto_ext_orden_valido    CHECK (orden BETWEEN 0 AND 999)
);

DROP TRIGGER IF EXISTS proyecto_extension_actualizado ON proyecto_extension;
CREATE TRIGGER proyecto_extension_actualizado BEFORE UPDATE ON proyecto_extension
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();


/* ─── Educación continua ────────────────────────────────────────── */

CREATE TABLE IF NOT EXISTS curso_extension (
  id               SERIAL PRIMARY KEY,
  titulo           TEXT        NOT NULL,
  tipo             TEXT        NOT NULL DEFAULT 'Curso',
  descripcion      TEXT        NOT NULL DEFAULT '',
  horas            INTEGER,
  modalidad        TEXT        NOT NULL DEFAULT 'Presencial',
  fecha_inicio     DATE,
  fecha_fin        DATE,
  -- Sin enlace no hay botón «Inscribirme»: antes había uno que no hacía nada.
  url_inscripcion  TEXT        NOT NULL DEFAULT '',
  -- Un curso terminado no se borra (sirve de historial); se oculta.
  activo           BOOLEAN     NOT NULL DEFAULT TRUE,
  orden            INTEGER     NOT NULL DEFAULT 0,
  creado_en        TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT curso_ext_titulo_no_vacio CHECK (length(btrim(titulo)) >= 3),
  CONSTRAINT curso_ext_tipo_valido     CHECK (tipo IN ('Diplomado', 'Curso', 'Taller', 'Seminario')),
  CONSTRAINT curso_ext_modalidad       CHECK (modalidad IN ('Presencial', 'Virtual', 'Híbrido')),
  CONSTRAINT curso_ext_horas_valido    CHECK (horas IS NULL OR horas BETWEEN 1 AND 2000),
  CONSTRAINT curso_ext_fechas          CHECK (fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin >= fecha_inicio),
  CONSTRAINT curso_ext_orden_valido    CHECK (orden BETWEEN 0 AND 999)
);

DROP TRIGGER IF EXISTS curso_extension_actualizado ON curso_extension;
CREATE TRIGGER curso_extension_actualizado BEFORE UPDATE ON curso_extension
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();
