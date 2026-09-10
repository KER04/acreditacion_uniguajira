-- 005_archivos_en_base — El contenido de los archivos pasa a vivir en la base,
-- codificado en base64, en vez de quedar suelto en public/docs/.
--
-- Motivo: un respaldo de la base se lleva todo, y borrar un registro ya no deja
-- un archivo huérfano ni un enlace roto apuntando a un fichero que no existe.
--
-- Una sola tabla `archivos` sirve a todos los módulos; cada tabla que necesite
-- un adjunto guarda solo su id. Así no hay que repetir el mecanismo cada vez.

CREATE TABLE IF NOT EXISTS archivos (
  id              BIGSERIAL PRIMARY KEY,
  nombre_original TEXT        NOT NULL,
  extension       TEXT        NOT NULL,
  mime            TEXT        NOT NULL,
  bytes           INTEGER     NOT NULL,
  -- El archivo en base64. Postgres comprime este campo de forma transparente
  -- (TOAST), así que el coste real es menor que el 33% teórico del base64.
  contenido       TEXT        NOT NULL,
  subido_por      INTEGER     REFERENCES usuarios(id) ON DELETE SET NULL,
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT archivos_bytes_positivo CHECK (bytes > 0),
  CONSTRAINT archivos_contenido_no_vacio CHECK (length(contenido) > 0)
);

CREATE INDEX IF NOT EXISTS archivos_creado_idx ON archivos (creado_en DESC);

-- Documentos del módulo: el adjunto sustituye a la ruta en disco.
-- `url` se conserva para los enlaces externos (tipo 'Enlace').
ALTER TABLE documentos_estudiantes
  ADD COLUMN IF NOT EXISTS archivo_id BIGINT REFERENCES archivos(id) ON DELETE SET NULL;

-- Foto del estudiante destacado. La columna foto_url existía sin usarse nunca.
ALTER TABLE cuadro_honor
  ADD COLUMN IF NOT EXISTS foto_id BIGINT REFERENCES archivos(id) ON DELETE SET NULL;

-- Documentos propios de cada estudiante del cuadro de honor.
-- Al borrar al estudiante se van sus documentos (CASCADE), pero el archivo en sí
-- se limpia aparte para no borrar por accidente algo compartido.
CREATE TABLE IF NOT EXISTS documentos_honor (
  id             SERIAL PRIMARY KEY,
  honor_id       INTEGER     NOT NULL REFERENCES cuadro_honor(id) ON DELETE CASCADE,
  archivo_id     BIGINT      REFERENCES archivos(id) ON DELETE SET NULL,
  nombre         TEXT        NOT NULL,
  descripcion    TEXT        NOT NULL DEFAULT '',
  tipo           TEXT        NOT NULL DEFAULT 'PDF',
  peso           TEXT        NOT NULL DEFAULT '',
  orden          INTEGER     NOT NULL DEFAULT 0,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT doc_honor_nombre_no_vacio CHECK (length(btrim(nombre)) >= 3),
  CONSTRAINT doc_honor_tipo_valido
    CHECK (tipo IN ('PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX', 'ZIP', 'Enlace'))
);

CREATE INDEX IF NOT EXISTS doc_honor_estudiante_idx ON documentos_honor (honor_id, orden);

DROP TRIGGER IF EXISTS doc_honor_actualizado ON documentos_honor;
CREATE TRIGGER doc_honor_actualizado BEFORE UPDATE ON documentos_honor
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();
