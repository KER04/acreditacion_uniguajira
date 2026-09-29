-- 025_resoluciones — Marco legal del programa: los actos administrativos que
-- lo sostienen (registro calificado, acreditación y los demás).
--
-- Sustituye la copia escrita a mano en Resoluciones.jsx. Allí había dos
-- problemas: vigencias que no cuadraban con el resto del sitio (la página decía
-- 6 años para la acreditación; la ficha del programa, 2022–2026) y siete
-- «otros actos» (Acuerdo 045/2024, Resolución Rectoral 0238/2024…) que no
-- aparecen en ninguna publicación de la universidad. Un marco legal con
-- números inventados es justo lo que no puede tener un programa acreditado.
--
-- Se cargan SOLO los dos actos que la página oficial del programa publica
-- (uniguajira.edu.co, consultada el 2026-09-28): el registro calificado 02872
-- de 2018 —que la universidad rotula «vigente»— y la acreditación 014528 de
-- 2022. La vigencia y los PDF se dejan vacíos: la página oficial no publica
-- los enlaces y no hay fuente fiable para el plazo. Se completan desde el panel.

CREATE TABLE IF NOT EXISTS acto_programa (
  id             SERIAL PRIMARY KEY,
  -- Qué papel cumple en el marco legal. Las tarjetas grandes de la página son
  -- el acto más reciente de 'registro' y de 'acreditacion'.
  categoria      TEXT        NOT NULL DEFAULT 'otro',
  tipo           TEXT        NOT NULL DEFAULT 'Resolución',
  -- Tal como se cita: "02872", "014528", "045 de 2024".
  numero         TEXT        NOT NULL DEFAULT '',
  fecha          DATE,
  expedido_por   TEXT        NOT NULL DEFAULT '',
  -- De qué trata, en una línea: "Registro calificado del programa".
  asunto         TEXT        NOT NULL,
  descripcion    TEXT        NOT NULL DEFAULT '',
  -- Plazo tal como lo dice el acto ("7 años"). Texto porque así se cita.
  vigencia       TEXT        NOT NULL DEFAULT '',
  -- Si se conoce, el día que vence: con esto se decide «vigente» o «vencido».
  fecha_fin      DATE,
  -- El documento puede estar en la base o ser un enlace externo (SACES, Drive).
  archivo_id     BIGINT      REFERENCES archivos(id) ON DELETE SET NULL,
  url            TEXT        NOT NULL DEFAULT '',
  orden          INTEGER     NOT NULL DEFAULT 0,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT acto_asunto_no_vacio CHECK (length(btrim(asunto)) >= 3),
  CONSTRAINT acto_categoria_valida CHECK (categoria IN ('registro', 'acreditacion', 'otro')),
  CONSTRAINT acto_tipo_valido CHECK (tipo IN ('Resolución', 'Acuerdo', 'Decreto', 'Circular', 'Ley')),
  CONSTRAINT acto_fechas CHECK (fecha_fin IS NULL OR fecha IS NULL OR fecha_fin >= fecha),
  CONSTRAINT acto_orden_valido CHECK (orden BETWEEN 0 AND 999)
);

CREATE INDEX IF NOT EXISTS acto_programa_orden_idx ON acto_programa (categoria, fecha DESC NULLS LAST);

DROP TRIGGER IF EXISTS acto_programa_actualizado ON acto_programa;
CREATE TRIGGER acto_programa_actualizado BEFORE UPDATE ON acto_programa
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();

INSERT INTO acto_programa (categoria, tipo, numero, fecha, expedido_por, asunto, descripcion, orden)
SELECT * FROM (VALUES
  ('registro', 'Resolución', '02872', DATE '2018-02-21', 'Ministerio de Educación Nacional',
   'Registro calificado del programa',
   'Registro calificado del programa de Ingeniería de Sistemas de la Universidad de La Guajira (SNIES 17579), otorgado por el Ministerio de Educación Nacional. La universidad lo publica como su registro calificado vigente.',
   0),
  ('acreditacion', 'Resolución', '014528', DATE '2022-07-28', 'Ministerio de Educación Nacional',
   'Acreditación en alta calidad',
   'Acreditación en alta calidad del programa de Ingeniería de Sistemas, otorgada por el Ministerio de Educación Nacional previo concepto del Consejo Nacional de Acreditación (CNA).',
   1)
) AS v(categoria, tipo, numero, fecha, expedido_por, asunto, descripcion, orden)
 WHERE NOT EXISTS (SELECT 1 FROM acto_programa);
