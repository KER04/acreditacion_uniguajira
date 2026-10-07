-- 033_logros_semillero — Página propia de un semillero con sus logros.
--
-- Un semillero que quiera mostrar lo que ha conseguido tiene ahora:
--   · `slug`: la dirección de su página (/investigacion/semillero/alfacode).
--     Solo los semilleros con slug tienen página; el resto sigue siendo una
--     tarjeta en /investigacion.
--   · semillero_logro: competencias, premios y reconocimientos, con puesto,
--     alcance y participantes.
--   · semillero_foto: la galería de la página, opcionalmente atada a un logro.
--
-- Se siembran los cinco logros de Alfacode tal como vienen en la relación que
-- entregó el semillero (todas hackatones). Solo se corrigieron erratas
-- evidentes: mayúsculas en nombres y apellidos, «Bogota», «Decimo»,
-- «realizo», «colombia 5.0». La relación no trae fechas y no se inventan; el
-- alcance solo se pone donde la relación lo dice (Tech Battle Latam reúne
-- cinco países: internacional).

ALTER TABLE semillero ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS semillero_slug_unico ON semillero (slug) WHERE slug IS NOT NULL;

UPDATE semillero SET slug = 'alfacode'
WHERE lower(btrim(nombre)) = 'alfacode' AND slug IS NULL;

CREATE TABLE IF NOT EXISTS semillero_logro (
  id             SERIAL PRIMARY KEY,
  semillero_id   INTEGER     NOT NULL REFERENCES semillero(id) ON DELETE CASCADE,
  tipo           TEXT        NOT NULL DEFAULT 'Hackatón',
  nombre         TEXT        NOT NULL,
  -- Lo que se ganó, tal como se cita: "Primer lugar a nivel regional".
  resultado      TEXT        NOT NULL DEFAULT '',
  -- El número del puesto, para la medalla: 1 oro, 2 plata, 3 bronce, el
  -- resto mención. NULL si el logro no es un puesto.
  puesto         SMALLINT,
  -- Hasta dónde llegó la competencia: internacional, nacional, regional...
  alcance        TEXT        NOT NULL DEFAULT '',
  lugar          TEXT        NOT NULL DEFAULT '',
  fecha          DATE,
  descripcion    TEXT        NOT NULL DEFAULT '',
  participantes  TEXT[]      NOT NULL DEFAULT '{}',
  orden          INTEGER     NOT NULL DEFAULT 0,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT logro_nombre_no_vacio CHECK (length(btrim(nombre)) >= 3),
  CONSTRAINT logro_puesto_valido   CHECK (puesto IS NULL OR puesto BETWEEN 1 AND 999),
  CONSTRAINT logro_orden_valido    CHECK (orden BETWEEN 0 AND 999)
);
CREATE INDEX IF NOT EXISTS semillero_logro_idx ON semillero_logro (semillero_id, orden);

DROP TRIGGER IF EXISTS semillero_logro_actualizado ON semillero_logro;
CREATE TRIGGER semillero_logro_actualizado BEFORE UPDATE ON semillero_logro
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();

CREATE TABLE IF NOT EXISTS semillero_foto (
  id             SERIAL PRIMARY KEY,
  semillero_id   INTEGER     NOT NULL REFERENCES semillero(id) ON DELETE CASCADE,
  -- La foto puede ser de una competencia concreta; si se borra el logro, la
  -- foto se queda en la galería general.
  logro_id       INTEGER     REFERENCES semillero_logro(id) ON DELETE SET NULL,
  archivo_id     BIGINT      NOT NULL REFERENCES archivos(id) ON DELETE CASCADE,
  pie            TEXT        NOT NULL DEFAULT '',
  orden          INTEGER     NOT NULL DEFAULT 0,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS semillero_foto_idx ON semillero_foto (semillero_id, orden);

/* Los dos primeros lugares van arriba. Idempotente: no duplica un logro
   con el mismo nombre y resultado. */
INSERT INTO semillero_logro (semillero_id, orden, tipo, nombre, resultado, puesto, alcance, lugar, descripcion, participantes)
SELECT s.id, v.orden, 'Hackatón', v.nombre, v.resultado, v.puesto, v.alcance, v.lugar, v.descripcion, v.participantes
FROM semillero s
CROSS JOIN (VALUES
  (0, 'Tech Battle Latam 2025', 'Primer lugar a nivel regional', 1, 'Internacional', 'Virtual',
   'Competencia regional con participantes de Colombia, Perú, Ecuador, Guatemala y Brasil.',
   ARRAY['Darwin David Pérez Muñoz']),
  (2, 'Encuentro de Ecosistemas de Innovación Digital · Colombia 5.0', 'Décimo lugar a nivel nacional', 10, 'Nacional', 'Bogotá',
   'El encuentro de los ecosistemas digitales más importante de Colombia y Latinoamérica, organizado por el Ministerio de Tecnologías de la Información y las Comunicaciones.',
   ARRAY['Jesús David Cueto', 'Fabio Romero', 'Cristian Ramírez', 'Jesús David Herazo']),
  (3, 'Encuentro de Ecosistemas de Innovación Digital · Colombia 5.0', 'Segundo lugar a nivel departamental', 2, 'Departamental', 'Riohacha',
   'El encuentro de los ecosistemas digitales más importante de Colombia y Latinoamérica, organizado por el Ministerio de Tecnologías de la Información y las Comunicaciones.',
   ARRAY['Darwin David Pérez Muñoz', 'Oscar Rodríguez', 'Kevin Salazar']),
  (4, 'Talento Tech · MinTIC', 'Segundo lugar', 2, '', 'Villanueva',
   'Evento organizado por el Ministerio de Tecnologías de la Información y las Comunicaciones (MinTIC), orientado a la búsqueda de soluciones innovadoras que permitan reducir los altos costos de la energía eléctrica, aprovechando las condiciones climáticas y las altas temperaturas de la región como una oportunidad para el desarrollo de alternativas energéticas sostenibles.',
   ARRAY['Darwin David Pérez Muñoz', 'Oscar Rodríguez', 'Kevin Salazar']),
  (1, 'Ring de las Ideas', 'Primer lugar', 1, '', 'Riohacha',
   'Competencia final de desarrollo de software del curso Fortalecimiento de Desarrollo de Software (156 horas), respaldado por el Programa ZASCA, MinComercio y la Universidad Antonio Nariño.',
   ARRAY['Fabio Mejía', 'Sergei Rodríguez', 'Iván Martínez'])
) AS v(orden, nombre, resultado, puesto, alcance, lugar, descripcion, participantes)
WHERE s.slug = 'alfacode'
  AND NOT EXISTS (
    SELECT 1 FROM semillero_logro l
    WHERE l.semillero_id = s.id AND l.nombre = v.nombre AND l.resultado = v.resultado
  );
