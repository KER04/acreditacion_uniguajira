-- 026_contacto — Dirección y contacto del programa: sedes, organigrama y la
-- presentación de la dirección.
--
-- Sustituye src/data/sedes.json y la copia escrita a mano en Contacto.jsx.
-- Lo que había no cuadraba con la universidad (páginas oficiales del programa
-- en Riohacha y en Maicao, consultadas el 2026-09-28):
--   · Riohacha estaba en «Bloque 1, segundo piso»; la oficina es Bloque 6,
--     primer piso. El correo del área es ingsistemasrio@, no ingsistemas@.
--   · Maicao decía «Calle 15 No. 14-37» y «Coordinador por designar»; es
--     Calle 16 N.º 28a-80, y la coordinadora es Diana Margarita Escobar Méndez.
--   · El organigrama traía cuatro coordinadores y una secretaria que no
--     aparecen en ninguna publicación (los mismos nombres de ejemplo que usaba
--     Investigación). Se quitan; se cargan solo el director y la coordinadora
--     de Maicao, enlazados a su ficha del directorio de docentes (014).
--   · El horario se contradecía (5:30 p. m. en la página, 6:00 p. m. en el
--     JSON) y no lo publica la universidad: se deja vacío.

/* ─── Sedes ─────────────────────────────────────────────────────── */

CREATE TABLE IF NOT EXISTS contacto_sede (
  sede           TEXT        PRIMARY KEY,
  nombre         TEXT        NOT NULL DEFAULT '',
  -- Dónde está la oficina dentro del campus ("Bloque 6 – primer piso").
  ubicacion      TEXT        NOT NULL DEFAULT '',
  direccion      TEXT        NOT NULL DEFAULT '',
  ciudad         TEXT        NOT NULL DEFAULT '',
  correo         TEXT        NOT NULL DEFAULT '',
  telefono       TEXT        NOT NULL DEFAULT '',
  extension      TEXT        NOT NULL DEFAULT '',
  horario        TEXT        NOT NULL DEFAULT '',
  -- La página oficial del programa en esa sede.
  url            TEXT        NOT NULL DEFAULT '',
  orden          INTEGER     NOT NULL DEFAULT 0,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT contacto_sede_valida CHECK (sede IN ('riohacha', 'maicao'))
);

DROP TRIGGER IF EXISTS contacto_sede_actualizada ON contacto_sede;
CREATE TRIGGER contacto_sede_actualizada BEFORE UPDATE ON contacto_sede
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();

/* ─── Organigrama ───────────────────────────────────────────────── */

CREATE TABLE IF NOT EXISTS cargo_programa (
  id             SERIAL PRIMARY KEY,
  nombre         TEXT        NOT NULL,
  cargo          TEXT        NOT NULL,
  -- Define la fila del organigrama: el tamaño de la tarjeta dice la jerarquía.
  nivel          TEXT        NOT NULL DEFAULT 'coordinacion',
  sede           TEXT        NOT NULL DEFAULT 'riohacha',
  area           TEXT        NOT NULL DEFAULT '',
  descripcion    TEXT        NOT NULL DEFAULT '',
  correo         TEXT        NOT NULL DEFAULT '',
  extension      TEXT        NOT NULL DEFAULT '',
  ubicacion      TEXT        NOT NULL DEFAULT '',
  -- Si es docente del programa, su foto y su ficha salen del directorio.
  docente_id     INTEGER     REFERENCES docente(id) ON DELETE SET NULL,
  orden          INTEGER     NOT NULL DEFAULT 0,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT cargo_nombre_no_vacio CHECK (length(btrim(nombre)) >= 3),
  CONSTRAINT cargo_cargo_no_vacio  CHECK (length(btrim(cargo)) >= 3),
  CONSTRAINT cargo_nivel_valido    CHECK (nivel IN ('direccion', 'coordinacion', 'apoyo')),
  CONSTRAINT cargo_sede_valida     CHECK (sede IN ('ambas', 'riohacha', 'maicao')),
  CONSTRAINT cargo_orden_valido    CHECK (orden BETWEEN 0 AND 999)
);

DROP TRIGGER IF EXISTS cargo_programa_actualizado ON cargo_programa;
CREATE TRIGGER cargo_programa_actualizado BEFORE UPDATE ON cargo_programa
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();

/* ─── Presentación de la dirección (fila única) ─────────────────── */

CREATE TABLE IF NOT EXISTS contacto_programa (
  id             SMALLINT    PRIMARY KEY DEFAULT 1,
  presentacion   TEXT        NOT NULL DEFAULT '',
  ejes           TEXT[]      NOT NULL DEFAULT '{}',
  horario        TEXT        NOT NULL DEFAULT '',
  nota_cita      TEXT        NOT NULL DEFAULT '',
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT contacto_programa_fila_unica CHECK (id = 1)
);

DROP TRIGGER IF EXISTS contacto_programa_actualizado ON contacto_programa;
CREATE TRIGGER contacto_programa_actualizado BEFORE UPDATE ON contacto_programa
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();

/* ─── Datos (páginas oficiales del programa en cada sede) ───────── */

INSERT INTO contacto_sede (sede, nombre, ubicacion, direccion, ciudad, correo, telefono, extension, url, orden)
VALUES
  ('riohacha', 'Sede Riohacha', 'Bloque 6 – primer piso', 'Km 3 + 354 vía Maicao', 'Riohacha, La Guajira',
   'ingsistemasrio@uniguajira.edu.co', '+57 (605) 728 2729', '',
   'https://uniguajira.edu.co/ofertas-academicas/facultades/facultad-de-ingenieria/programa-de-ingenieria-de-sistemas/', 0),
  ('maicao', 'Sede Maicao', 'Bloque Administrativo – primer piso', 'Calle 16 N.º 28a-80', 'Maicao, La Guajira',
   'ingenieriamaicao@uniguajira.edu.co', '+57 (605) 728 2729', '307',
   'https://uniguajira.edu.co/universidad-de-la-guajira/sedes-uniguajira/sede-maicao/oferta-academica-sede-maicao/facultades-sede-maicao/facultad-de-ingenieria-sede-maicao/programa-de-ingenieria-de-sistemas-sede-maicao/', 1)
ON CONFLICT (sede) DO NOTHING;

INSERT INTO cargo_programa (nombre, cargo, nivel, sede, area, descripcion, correo, ubicacion, docente_id, orden)
SELECT v.nombre, v.cargo, v.nivel, v.sede, v.area, v.descripcion, v.correo, v.ubicacion,
       (SELECT id FROM docente WHERE lower(email) = v.correo), v.orden
  FROM (VALUES
    ('Adanud Segundo Meza Valle', 'Director del programa', 'direccion', 'riohacha', 'Dirección',
     'Dirige el programa de Ingeniería de Sistemas en la sede Riohacha.',
     'asmeza@uniguajira.edu.co', 'Bloque 6 – primer piso', 0),
    ('Diana Margarita Escobar Méndez', 'Coordinadora del programa · Sede Maicao', 'direccion', 'maicao', 'Coordinación sede Maicao',
     'Coordina el programa de Ingeniería de Sistemas en la sede Maicao.',
     'descobarm@uniguajira.edu.co', 'Bloque Administrativo – primer piso', 1)
  ) AS v(nombre, cargo, nivel, sede, area, descripcion, correo, ubicacion, orden)
 WHERE NOT EXISTS (SELECT 1 FROM cargo_programa);

INSERT INTO contacto_programa (id, presentacion, ejes)
VALUES (1,
  'La dirección lidera la gestión académica del programa, la autoevaluación con fines de acreditación, la coordinación de los comités curricular y de autoevaluación, y la articulación del programa con las funciones misionales de la Universidad de La Guajira.',
  ARRAY['Plan de mejoramiento', 'Actualización curricular', 'Autoevaluación y acreditación', 'Prácticas profesionales'])
ON CONFLICT (id) DO NOTHING;
