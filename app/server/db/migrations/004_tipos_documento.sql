-- 004_tipos_documento — Amplía los tipos admitidos en documentos_estudiantes.
--
-- La subida de archivos acepta ppt/pptx/xls, pero la restricción solo permitía
-- PDF, DOC, DOCX, XLSX, ZIP y Enlace: subir una presentación fallaba al guardar.

ALTER TABLE documentos_estudiantes
  DROP CONSTRAINT IF EXISTS documentos_tipo_valido;

ALTER TABLE documentos_estudiantes
  ADD CONSTRAINT documentos_tipo_valido
  CHECK (tipo IN ('PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX', 'ZIP', 'Enlace'));
