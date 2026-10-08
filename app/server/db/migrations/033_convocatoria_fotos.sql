-- 033_convocatoria_fotos — Afiches y fotos de cada convocatoria.
--
-- La universidad publica sus convocatorias y eventos con una pieza gráfica
-- grande (el afiche de la Semana Internacional, por ejemplo) y, a veces, fotos
-- del evento. Hasta ahora la convocatoria era solo texto.
--
-- Varias fotos por convocatoria, en su propia tabla y no como una columna
-- imagen_id: el afiche es la PRIMERA foto según `orden`, así que cambiar cuál
-- es la portada es solo reordenar. El binario vive en `archivos`, como el
-- resto de imágenes del sitio; aquí queda la referencia y un pie de foto.
--
-- ON DELETE CASCADE desde la convocatoria: borrarla se lleva sus fotos. El
-- archivo en sí lo suelta la API con borrarSiHuerfano, igual que noticias.

CREATE TABLE IF NOT EXISTS convocatoria_foto (
  id               SERIAL PRIMARY KEY,
  convocatoria_id  INTEGER  NOT NULL REFERENCES convocatoria(id) ON DELETE CASCADE,
  archivo_id       BIGINT   NOT NULL REFERENCES archivos(id) ON DELETE CASCADE,
  -- Texto alternativo y pie a la vez: lo que un lector de pantalla dice de la foto.
  pie              TEXT     NOT NULL DEFAULT '',
  orden            SMALLINT NOT NULL DEFAULT 0,
  creado_en        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS convocatoria_foto_orden_idx
  ON convocatoria_foto (convocatoria_id, orden, id);
