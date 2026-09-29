-- 021_produccion_detalle — Cada publicación tiene ahora su propia página.
--
-- En la lista de /investigacion una publicación era una línea: año, título y
-- revista. Al abrirla hace falta decir de qué trata y tener algo que mirar,
-- así que se añaden dos cosas que se editan desde el panel:
--
--   · resumen:    el abstract, o un resumen divulgativo escrito por el programa.
--   · portada_id: una imagen (figura del artículo, foto del proyecto, portada
--                 del libro). Va a la tabla `archivos` como el resto de
--                 adjuntos (migración 005); el barrido de huérfanos descubre
--                 esta columna solo, por ser una FK a archivos.

ALTER TABLE produccion_investigacion
  ADD COLUMN IF NOT EXISTS resumen    TEXT   NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS portada_id BIGINT REFERENCES archivos(id) ON DELETE SET NULL;
