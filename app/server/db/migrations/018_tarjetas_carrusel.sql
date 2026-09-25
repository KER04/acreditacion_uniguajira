-- 018_tarjetas_carrusel — El carrusel de tarjetas deja de ser de la propuesta.
--
-- Nació en /pensum-propuesto, colgando del plan de estudios (`plan_tarjeta`).
-- Ahora Saber Pro quiere el mismo costado para contar su puntaje aprobatorio,
-- y hay dos caminos: copiar la tabla con otro nombre, o reconocer que las
-- tarjetas nunca fueron del plan sino de la PÁGINA que las muestra.
--
-- Se hace lo segundo. Copiar habría duplicado también las rutas, el panel y el
-- componente, y a la tercera página serían tres copias divergiendo. Lo que
-- cambia es solo de qué cuelga la fila: antes de un plan, ahora de una sección
-- del sitio.
--
-- La sección es texto y no una clave foránea a una tabla de secciones: las
-- páginas del sitio las decide el código, no un registro que alguien pueda
-- borrar dejando tarjetas huérfanas. La lista blanca vive en la API.

CREATE TABLE IF NOT EXISTS tarjeta_carrusel (
  id         SERIAL PRIMARY KEY,

  -- Qué página la muestra: 'pensum-propuesto', 'saber-pro', …
  seccion    TEXT NOT NULL,

  titulo     TEXT NOT NULL DEFAULT '',
  texto      TEXT NOT NULL DEFAULT '',
  pie        TEXT NOT NULL DEFAULT '',

  imagen_id  INTEGER REFERENCES archivos(id) ON DELETE SET NULL,
  imagen_url TEXT NOT NULL DEFAULT '',

  orden      SMALLINT NOT NULL DEFAULT 0,
  visible    BOOLEAN  NOT NULL DEFAULT TRUE,
  -- Sin texto: la tarjeta es la imagen, y `titulo` pasa a ser su descripción
  -- para lectores de pantalla.
  solo_imagen BOOLEAN NOT NULL DEFAULT FALSE,

  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT carrusel_seccion_no_vacia CHECK (length(btrim(seccion)) >= 3),
  CONSTRAINT carrusel_titulo_no_vacio
    CHECK (length(btrim(titulo)) >= 3 OR (solo_imagen AND btrim(titulo) = '')),
  CONSTRAINT carrusel_texto_razonable CHECK (length(texto) <= 600),
  CONSTRAINT carrusel_pie_razonable   CHECK (length(pie) <= 80),
  CONSTRAINT carrusel_solo_imagen_con_imagen
    CHECK (NOT solo_imagen OR imagen_id IS NOT NULL OR btrim(imagen_url) <> '')
);

CREATE INDEX IF NOT EXISTS tarjeta_carrusel_orden_idx
  ON tarjeta_carrusel (seccion, orden, id);

DROP TRIGGER IF EXISTS tarjeta_carrusel_actualizada ON tarjeta_carrusel;
CREATE TRIGGER tarjeta_carrusel_actualizada
  BEFORE UPDATE ON tarjeta_carrusel
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();


/* ─── Se muda lo que ya estaba publicado ────────────────────────── */

-- Las tarjetas del plan en trámite pasan a ser las de su página. Se copian con
-- su id de archivo: la imagen subida sigue siendo la misma fila de `archivos`,
-- así que nada que esté publicado cambia de dirección.
INSERT INTO tarjeta_carrusel (seccion, titulo, texto, pie, imagen_id, imagen_url, orden, visible, solo_imagen, creado_en)
SELECT 'pensum-propuesto', t.titulo, t.texto, t.pie, t.imagen_id, t.imagen_url,
       t.orden, t.visible, t.solo_imagen, t.creado_en
  FROM plan_tarjeta t
 WHERE NOT EXISTS (SELECT 1 FROM tarjeta_carrusel c WHERE c.seccion = 'pensum-propuesto');

-- La vieja se va: dos tablas con las mismas tarjetas es la forma segura de que
-- dentro de un mes nadie sepa cuál manda.
DROP TABLE IF EXISTS plan_tarjeta;
