-- 016_tarjeta_solo_imagen — Una tarjeta del carrusel puede ser solo la imagen.
--
-- Hay material que ya viene compuesto: una infografía exportada de Canva, un
-- cuadro comparativo, la línea de tiempo que reparte la oficina. Volver a
-- escribir su contenido como título y párrafo al lado lo repite dos veces y
-- obliga a mantener las dos copias.
--
-- El título no desaparece en ese caso: pasa a ser el texto alternativo que
-- leen los lectores de pantalla, porque una imagen sin descripción no dice
-- nada a quien no puede verla. Por eso sigue existiendo la columna y solo se
-- relaja la exigencia de que tenga tres caracteres.

ALTER TABLE plan_tarjeta
  ADD COLUMN IF NOT EXISTS solo_imagen BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN plan_tarjeta.solo_imagen IS
  'La tarjeta se publica sin texto; `titulo` pasa a ser el alt de la imagen';

-- El título deja de ser obligatorio cuando la tarjeta es solo imagen, pero si
-- se escribe algo sigue teniendo que ser algo legible: dos letras sueltas como
-- alt son tan inútiles como no poner nada.
ALTER TABLE plan_tarjeta DROP CONSTRAINT IF EXISTS tarjeta_titulo_no_vacio;
ALTER TABLE plan_tarjeta ADD CONSTRAINT tarjeta_titulo_no_vacio
  CHECK (length(btrim(titulo)) >= 3 OR (solo_imagen AND btrim(titulo) = ''));

-- Una tarjeta sin texto y sin imagen no es nada: no se puede publicar vacía.
-- La comprobación es de fila, así que la base puede exigirla sin subconsulta.
ALTER TABLE plan_tarjeta DROP CONSTRAINT IF EXISTS tarjeta_solo_imagen_con_imagen;
ALTER TABLE plan_tarjeta ADD CONSTRAINT tarjeta_solo_imagen_con_imagen
  CHECK (NOT solo_imagen OR imagen_id IS NOT NULL OR btrim(imagen_url) <> '');
