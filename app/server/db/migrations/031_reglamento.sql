-- 031_reglamento — Documentos de la sección «Reglamento» de /estudiantes.
--
-- Sustituye la copia escrita a mano en Estudiantes.jsx: ocho «capítulos» con
-- resúmenes de relleno, rangos de artículos sin fuente y botones de descarga
-- que no llevaban a nada. Además citaba el Acuerdo 018 de 2021, mientras la
-- presentación del Factor 5 ante los pares (diapositiva «Sistema de
-- evaluación de los estudiantes») cita el Reglamento Estudiantil, Acuerdo 026
-- de 2018.
--
-- La página muestra el documento en un visor de PDF y, al lado, la lista de
-- documentos: hoy es uno solo, pero la tabla admite más (reformas, guías,
-- acuerdos complementarios). El PDF va en `archivos`, como el resto de
-- adjuntos, o como enlace externo.
--
-- Se siembra únicamente el reglamento citado en esa presentación, SIN archivo:
-- no hay copia del PDF en el repositorio. Se sube desde el panel.

CREATE TABLE IF NOT EXISTS reglamento_documento (
  id             SERIAL PRIMARY KEY,
  titulo         TEXT        NOT NULL,
  -- Cómo se cita: "Acuerdo 026 de 2018".
  referencia     TEXT        NOT NULL DEFAULT '',
  expedido_por   TEXT        NOT NULL DEFAULT '',
  fecha          DATE,
  descripcion    TEXT        NOT NULL DEFAULT '',
  archivo_id     BIGINT      REFERENCES archivos(id) ON DELETE SET NULL,
  url            TEXT        NOT NULL DEFAULT '',
  -- El que abre la página por defecto. Si ninguno lo está, el primero.
  principal      BOOLEAN     NOT NULL DEFAULT false,
  orden          INTEGER     NOT NULL DEFAULT 0,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT reglamento_titulo_no_vacio CHECK (length(btrim(titulo)) >= 3),
  CONSTRAINT reglamento_orden_valido CHECK (orden BETWEEN 0 AND 999)
);

CREATE INDEX IF NOT EXISTS reglamento_documento_orden_idx
  ON reglamento_documento (principal DESC, orden ASC, id ASC);

DROP TRIGGER IF EXISTS reglamento_documento_actualizado ON reglamento_documento;
CREATE TRIGGER reglamento_documento_actualizado BEFORE UPDATE ON reglamento_documento
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();

INSERT INTO reglamento_documento (titulo, referencia, descripcion, principal, orden)
SELECT 'Reglamento estudiantil', 'Acuerdo 026 de 2018',
       'Normas que rigen la vida académica de los estudiantes de la Universidad de La Guajira: admisión, matrícula, evaluación, derechos y deberes, régimen disciplinario y grado.',
       true, 0
 WHERE NOT EXISTS (SELECT 1 FROM reglamento_documento);
