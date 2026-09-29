-- 019_investigacion — Grupos, semilleros y producción del programa.
--
-- Sustituye src/data/investigacion.json. Hasta aquí había DOS fuentes que no
-- coincidían: el JSON (tres grupos, cinco semilleros) que editaba el panel y
-- leía la portada, y una copia escrita a mano dentro de Investigacion.jsx
-- (tres grupos, catorce semilleros con otros nombres, cinco publicaciones) que
-- era lo que de verdad veía quien abría /investigacion. Un cambio hecho en el
-- panel no llegaba nunca a la página que lo enlaza. Ahora las dos leen de aquí.
--
-- El `proyectos` del JSON no se migra: ninguna página lo mostraba ni ninguna
-- pestaña lo editaba, y el proyecto que sí se ve en la portada vive en
-- `inicio.proyectoDestacado`.

/* ─── Grupos de investigación ───────────────────────────────────── */

CREATE TABLE IF NOT EXISTS grupo_investigacion (
  id              SERIAL PRIMARY KEY,
  -- La sigla con la que se conoce el grupo ("GITUG"). Es lo que se cita y lo
  -- que eligen los semilleros al asociarse, por eso es única.
  nombre          TEXT        NOT NULL,
  nombre_completo TEXT        NOT NULL DEFAULT '',
  -- Categoría en la última medición de MinCiencias. '' = sin categoría
  -- todavía; mismo catálogo que docente.grupo_categoria (migración 006).
  categoria       TEXT        NOT NULL DEFAULT '',
  -- Se lee y se escribe entera, como los requisitos de modalidades_grado.
  lineas          TEXT[]      NOT NULL DEFAULT '{}',
  lider           TEXT        NOT NULL DEFAULT '',
  sede            TEXT        NOT NULL DEFAULT 'riohacha',
  descripcion     TEXT        NOT NULL DEFAULT '',
  color           TEXT        NOT NULL DEFAULT 'var(--ug-azul)',
  -- La ficha pública del grupo en GrupLAC: es la evidencia que revisa un par
  -- del CNA, y la categoría escrita aquí no vale sin ella.
  gruplac_url     TEXT        NOT NULL DEFAULT '',
  orden           INTEGER     NOT NULL DEFAULT 0,
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT grupo_nombre_no_vacio  CHECK (length(btrim(nombre)) >= 2),
  CONSTRAINT grupo_categoria_valida CHECK (categoria IN ('', 'A1', 'A', 'B', 'C', 'Reconocido')),
  CONSTRAINT grupo_sede_valida      CHECK (sede IN ('ambas', 'riohacha', 'maicao')),
  CONSTRAINT grupo_orden_valido     CHECK (orden BETWEEN 0 AND 999)
);

CREATE UNIQUE INDEX IF NOT EXISTS grupo_nombre_unico ON grupo_investigacion (lower(btrim(nombre)));

DROP TRIGGER IF EXISTS grupo_investigacion_actualizado ON grupo_investigacion;
CREATE TRIGGER grupo_investigacion_actualizado BEFORE UPDATE ON grupo_investigacion
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();


/* ─── Semilleros ────────────────────────────────────────────────── */

CREATE TABLE IF NOT EXISTS semillero (
  id             SERIAL PRIMARY KEY,
  nombre         TEXT        NOT NULL,
  -- En el JSON el grupo era su nombre escrito a mano, así que renombrar un
  -- grupo dejaba a sus semilleros apuntando a algo que ya no existía. Borrar
  -- el grupo no borra el semillero: queda "sin grupo" hasta que lo reasignen.
  grupo_id       INTEGER     REFERENCES grupo_investigacion(id) ON DELETE SET NULL,
  lider          TEXT        NOT NULL DEFAULT '',
  sede           TEXT        NOT NULL DEFAULT 'riohacha',
  descripcion    TEXT        NOT NULL DEFAULT '',
  integrantes    INTEGER,
  orden          INTEGER     NOT NULL DEFAULT 0,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT semillero_nombre_no_vacio    CHECK (length(btrim(nombre)) >= 2),
  CONSTRAINT semillero_sede_valida        CHECK (sede IN ('ambas', 'riohacha', 'maicao')),
  CONSTRAINT semillero_integrantes_valido CHECK (integrantes IS NULL OR integrantes BETWEEN 0 AND 500),
  CONSTRAINT semillero_orden_valido       CHECK (orden BETWEEN 0 AND 999)
);

CREATE INDEX IF NOT EXISTS semillero_grupo_idx ON semillero (grupo_id);

DROP TRIGGER IF EXISTS semillero_actualizado ON semillero;
CREATE TRIGGER semillero_actualizado BEFORE UPDATE ON semillero
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();


/* ─── Producción destacada ──────────────────────────────────────── */

CREATE TABLE IF NOT EXISTS produccion_investigacion (
  id             SERIAL PRIMARY KEY,
  titulo         TEXT        NOT NULL,
  tipo           TEXT        NOT NULL DEFAULT 'Artículo',
  anio           INTEGER     NOT NULL,
  -- Dónde salió, tal como se cita: "Sensors · Q1", "CHI 2025 · Yokohama".
  medio          TEXT        NOT NULL DEFAULT '',
  autores        TEXT        NOT NULL DEFAULT '',
  grupo_id       INTEGER     REFERENCES grupo_investigacion(id) ON DELETE SET NULL,
  -- DOI o enlace al texto. Sin él la entrada es una afirmación, no una prueba.
  url            TEXT        NOT NULL DEFAULT '',
  orden          INTEGER     NOT NULL DEFAULT 0,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT produccion_titulo_no_vacio CHECK (length(btrim(titulo)) >= 3),
  CONSTRAINT produccion_tipo_valido CHECK (tipo IN (
    'Artículo', 'Ponencia', 'Libro', 'Capítulo de libro', 'Software', 'Patente', 'Otro')),
  -- 1976 es la primera promoción del programa; el tope solo descarta erratas.
  CONSTRAINT produccion_anio_valido  CHECK (anio BETWEEN 1976 AND 2100),
  CONSTRAINT produccion_orden_valido CHECK (orden BETWEEN 0 AND 999)
);

CREATE INDEX IF NOT EXISTS produccion_orden_idx ON produccion_investigacion (anio DESC, orden ASC, id DESC);

DROP TRIGGER IF EXISTS produccion_actualizada ON produccion_investigacion;
CREATE TRIGGER produccion_actualizada BEFORE UPDATE ON produccion_investigacion
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();
