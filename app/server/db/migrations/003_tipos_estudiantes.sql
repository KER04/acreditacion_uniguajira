-- 003_tipos_estudiantes — Ajusta los tipos para que la columna diga la verdad
-- sobre el dato que guarda.
--
-- `semestre` era TEXT y contenía cosas como '8º': un número disfrazado de texto,
-- que permitía escribir letras y hacía imposible ordenar o filtrar por semestre.
-- Pasa a SMALLINT con rango 1–10, y el ordinal ('8º') se compone en la vista.

ALTER TABLE cuadro_honor
  ALTER COLUMN semestre DROP DEFAULT;

-- Convierte '8º' -> 8 y deja NULL lo que no tenga dígitos.
ALTER TABLE cuadro_honor
  ALTER COLUMN semestre TYPE SMALLINT
  USING NULLIF(regexp_replace(semestre, '[^0-9]', '', 'g'), '')::SMALLINT;

ALTER TABLE cuadro_honor
  ADD CONSTRAINT honor_semestre_valido
  CHECK (semestre IS NULL OR (semestre >= 1 AND semestre <= 10));

-- El período académico solo tiene dos formas válidas: 2026-I y 2026-II.
-- Se admite la cadena vacía porque el campo es opcional.
ALTER TABLE cuadro_honor
  ADD CONSTRAINT honor_periodo_valido
  CHECK (periodo = '' OR periodo ~ '^\d{4}-(I|II)$');

ALTER TABLE calendario_academico
  ADD CONSTRAINT calendario_periodo_valido
  CHECK (periodo = '' OR periodo ~ '^\d{4}-(I|II)$');

-- El promedio ya era NUMERIC(3,2) con rango 0–5; solo falta impedir el nombre
-- vacío o con dígitos, que la aplicación ya rechaza pero la tabla permitía.
ALTER TABLE cuadro_honor
  ADD CONSTRAINT honor_nombre_no_vacio
  CHECK (length(btrim(nombre)) >= 3);

ALTER TABLE calendario_academico
  ADD CONSTRAINT calendario_titulo_no_vacio
  CHECK (length(btrim(titulo)) >= 3);

ALTER TABLE modalidades_grado
  ADD CONSTRAINT modalidades_nombre_no_vacio
  CHECK (length(btrim(nombre)) >= 3);

ALTER TABLE documentos_estudiantes
  ADD CONSTRAINT documentos_nombre_no_vacio
  CHECK (length(btrim(nombre)) >= 3);

ALTER TABLE documentos_estudiantes
  ADD CONSTRAINT documentos_tipo_valido
  CHECK (tipo IN ('PDF', 'DOC', 'DOCX', 'XLSX', 'ZIP', 'Enlace'));
