-- 007_contenidos — Noticias, eventos y convocatorias pasan de archivos JSON
-- a la base.
--
-- Por qué estos tres y por qué ahora: son el contenido que más se edita y el
-- único que escribían varias personas a la vez. El flujo anterior mandaba el
-- arreglo completo con un PUT y reescribía src/data/*.json, lo que traía dos
-- problemas que ninguna validación podía evitar: si dos editores guardaban a
-- la vez el último pisaba al otro sin aviso, y como esos archivos están
-- versionados, cada publicación ensuciaba el árbol de git y un `git pull`
-- podía revertir contenido que nadie había commiteado.
--
-- Decisiones de tipos, todas por el mismo motivo: en el JSON las fechas eran
-- texto en español ("28 may 2026") y no se podían ordenar ni comparar.
--   · fecha/fecha_apertura/fecha_cierre  -> DATE
--   · hora ("8:00 AM")                   -> TIME
--   · requisitos (arreglo)               -> TEXT[], como en modalidades_grado:
--     siempre se lee y se escribe entero junto a su convocatoria.
--
-- Las categorías llevan CHECK, y eso obligó a normalizarlas. La lista del
-- panel mezclaba mayúsculas ('investigación') con los valores reales del
-- contenido ('Investigación'), de modo que una noticia desaparecía al filtrar
-- por su propia categoría: el filtro compara con ===. Aquí queda una sola
-- forma canónica y el panel se alinea con ella.
--
-- La imagen sigue el patrón de docente.foto_id: el binario vive en `archivos`
-- y aquí solo queda la referencia. `imagen_url` se conserva para las imágenes
-- externas que ya existían y para poder enlazar algo que no está en la base.

/* ─── Noticias ──────────────────────────────────────────────────── */

CREATE TABLE IF NOT EXISTS noticia (
  id             SERIAL PRIMARY KEY,
  titulo         TEXT        NOT NULL,
  resumen        TEXT        NOT NULL DEFAULT '',
  cuerpo         TEXT        NOT NULL DEFAULT '',
  categoria      TEXT        NOT NULL DEFAULT 'Institucional',
  fecha          DATE        NOT NULL,

  -- Unidad que publica ("Comunicaciones IS"), no una persona: por eso es
  -- texto libre y no una referencia a usuarios.
  autor          TEXT        NOT NULL DEFAULT '',
  sede           TEXT        NOT NULL DEFAULT 'ambas',

  imagen_id      BIGINT      REFERENCES archivos(id) ON DELETE SET NULL,
  imagen_url     TEXT        NOT NULL DEFAULT '',

  -- Permite preparar una noticia sin que salga en el portal.
  publicada      BOOLEAN     NOT NULL DEFAULT TRUE,

  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT noticia_titulo_no_vacio CHECK (length(btrim(titulo)) >= 3),
  CONSTRAINT noticia_sede_valida     CHECK (sede IN ('ambas', 'riohacha', 'maicao')),
  CONSTRAINT noticia_categoria_valida CHECK (categoria IN (
    'Académico', 'Investigación', 'Extensión', 'Institucional',
    'Acreditación', 'Egresados', 'Docencia'))
);

-- El portal lista por fecha descendente y filtra por sede y categoría.
CREATE INDEX IF NOT EXISTS noticia_orden_idx ON noticia (publicada, fecha DESC, id DESC);
CREATE INDEX IF NOT EXISTS noticia_sede_idx  ON noticia (sede, fecha DESC);

DROP TRIGGER IF EXISTS noticia_actualizada ON noticia;
CREATE TRIGGER noticia_actualizada
  BEFORE UPDATE ON noticia
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();


/* ─── Eventos ───────────────────────────────────────────────────── */

CREATE TABLE IF NOT EXISTS evento (
  id              SERIAL PRIMARY KEY,
  titulo          TEXT        NOT NULL,
  descripcion     TEXT        NOT NULL DEFAULT '',
  categoria       TEXT        NOT NULL DEFAULT 'Académico',

  fecha           DATE        NOT NULL,
  -- Un evento puede durar varios días (la Semana de la Ingeniería) o varias
  -- horas (un hackatón de 48). El JSON solo guardaba el inicio.
  fecha_fin       DATE,
  hora            TIME,
  hora_fin        TIME,

  lugar           TEXT        NOT NULL DEFAULT '',
  ponente         TEXT        NOT NULL DEFAULT '',
  sede            TEXT        NOT NULL DEFAULT 'ambas',

  imagen_id       BIGINT      REFERENCES archivos(id) ON DELETE SET NULL,
  imagen_url      TEXT        NOT NULL DEFAULT '',
  url_inscripcion TEXT        NOT NULL DEFAULT '',

  -- Solo lo que NO se deduce de la fecha. Si un evento es próximo, está en
  -- curso o ya pasó se calcula comparando con hoy; persistirlo obligaría a
  -- que alguien lo fuera cambiando a mano y la cartelera mentiría sola.
  estado          TEXT        NOT NULL DEFAULT 'programado',

  creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT evento_titulo_no_vacio CHECK (length(btrim(titulo)) >= 3),
  CONSTRAINT evento_sede_valida     CHECK (sede IN ('ambas', 'riohacha', 'maicao')),
  CONSTRAINT evento_estado_valido   CHECK (estado IN ('programado', 'cancelado', 'aplazado')),
  CONSTRAINT evento_categoria_valida CHECK (categoria IN (
    'Académico', 'Cultural', 'Investigación', 'Extensión', 'Institucional',
    'Deportivo', 'Competencia', 'Taller', 'Laboral')),
  CONSTRAINT evento_rango_coherente CHECK (fecha_fin IS NULL OR fecha_fin >= fecha)
);

CREATE INDEX IF NOT EXISTS evento_orden_idx ON evento (fecha DESC, id DESC);
CREATE INDEX IF NOT EXISTS evento_sede_idx  ON evento (sede, fecha DESC);

DROP TRIGGER IF EXISTS evento_actualizado ON evento;
CREATE TRIGGER evento_actualizado
  BEFORE UPDATE ON evento
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();


/* ─── Convocatorias ─────────────────────────────────────────────── */

CREATE TABLE IF NOT EXISTS convocatoria (
  id              SERIAL PRIMARY KEY,
  titulo          TEXT        NOT NULL,
  descripcion     TEXT        NOT NULL DEFAULT '',
  categoria       TEXT        NOT NULL DEFAULT 'Investigación',

  -- Se conserva como campo editable, a diferencia del estado de los eventos:
  -- aquí la dirección puede querer cerrar una convocatoria antes de la fecha
  -- o dejarla abierta unos días más, y eso no se deduce del calendario.
  estado          TEXT        NOT NULL DEFAULT 'Abierta',

  fecha_apertura  DATE,
  fecha_cierre    DATE,

  dirigida_a      TEXT        NOT NULL DEFAULT 'Estudiantes',
  sede            TEXT        NOT NULL DEFAULT 'ambas',

  -- Igual que en modalidades_grado: la lista se lee y se escribe entera.
  requisitos      TEXT[]      NOT NULL DEFAULT '{}',

  url_postulacion TEXT        NOT NULL DEFAULT '',
  documento_url   TEXT        NOT NULL DEFAULT '',

  creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT convocatoria_titulo_no_vacio CHECK (length(btrim(titulo)) >= 3),
  CONSTRAINT convocatoria_sede_valida     CHECK (sede IN ('ambas', 'riohacha', 'maicao')),
  CONSTRAINT convocatoria_estado_valido   CHECK (estado IN ('Abierta', 'Próxima', 'Cerrada')),
  CONSTRAINT convocatoria_categoria_valida CHECK (categoria IN (
    'Investigación', 'Internacionalización', 'Extensión', 'Prácticas',
    'Estímulos', 'Becas', 'Eventos')),
  CONSTRAINT convocatoria_rango_coherente
    CHECK (fecha_apertura IS NULL OR fecha_cierre IS NULL OR fecha_cierre >= fecha_apertura)
);

-- Se listan por cierre próximo primero, que es el orden útil para el estudiante.
CREATE INDEX IF NOT EXISTS convocatoria_orden_idx ON convocatoria (fecha_cierre ASC NULLS LAST, id DESC);
CREATE INDEX IF NOT EXISTS convocatoria_sede_idx  ON convocatoria (sede, fecha_cierre);

DROP TRIGGER IF EXISTS convocatoria_actualizada ON convocatoria;
CREATE TRIGGER convocatoria_actualizada
  BEFORE UPDATE ON convocatoria
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();
