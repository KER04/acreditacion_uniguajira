-- 011_infraestructura — Recursos de infraestructura tecnológica del programa.
--
-- Qué se guarda: los espacios y servicios con los que cuenta el estudiante
-- —salas de informática, laboratorios, conectividad, plataformas—, cada uno
-- con la cifra que lo describe y el enlace de dónde salió el dato.
--
-- `fuente_url` no es decorativo. Estas cifras las pide el CNA (Factor de
-- recursos de apoyo académico e infraestructura física) y las revisa un par
-- académico: un número sin procedencia no sirve como evidencia, y a los dos
-- años nadie recuerda si el "22 salas" se contó o se copió de algún sitio.
--
-- Las cifras agregadas —cuántas salas, cuántos puestos, cuántos metros— NO se
-- guardan: se suman al consultar. Un total escrito a mano deja de cuadrar con
-- sus partes en cuanto alguien añade una sala y se olvida de actualizarlo.

CREATE TABLE IF NOT EXISTS recurso_infraestructura (
  id             SERIAL PRIMARY KEY,

  nombre         TEXT NOT NULL,
  categoria      TEXT NOT NULL DEFAULT 'espacio',
  descripcion    TEXT NOT NULL DEFAULT '',

  sede           TEXT NOT NULL DEFAULT 'riohacha',
  -- Dónde está físicamente: "Bloque 8, piso 2".
  ubicacion      TEXT NOT NULL DEFAULT '',

  -- Cuántos hay de este recurso (22 salas de informática) y cuántos puestos
  -- tiene cada uno. Separados porque la cifra que interesa es el producto, y
  -- guardarlo ya multiplicado impediría corregir solo una de las dos.
  cantidad       INTEGER,
  capacidad      INTEGER,
  area_m2        INTEGER,

  -- Año de puesta en servicio o de la última ampliación.
  anio           SMALLINT,

  -- Equipamiento y detalles, una línea por punto. El front pinta viñetas.
  equipamiento   TEXT NOT NULL DEFAULT '',

  fuente_url     TEXT NOT NULL DEFAULT '',
  fuente_nombre  TEXT NOT NULL DEFAULT '',

  destacado      BOOLEAN NOT NULL DEFAULT FALSE,
  orden          INTEGER NOT NULL DEFAULT 0,
  activo         BOOLEAN NOT NULL DEFAULT TRUE,

  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT infra_nombre_no_vacio CHECK (length(btrim(nombre)) >= 3),
  CONSTRAINT infra_categoria_valida CHECK (categoria IN (
    'computo', 'laboratorio', 'audiovisual', 'conectividad', 'plataforma', 'espacio'
  )),
  CONSTRAINT infra_sede_valida     CHECK (sede IN ('ambas', 'riohacha', 'maicao', 'fonseca', 'villanueva')),
  CONSTRAINT infra_cantidad_valida  CHECK (cantidad IS NULL OR cantidad BETWEEN 1 AND 10000),
  CONSTRAINT infra_capacidad_valida CHECK (capacidad IS NULL OR capacidad BETWEEN 1 AND 10000),
  CONSTRAINT infra_area_valida      CHECK (area_m2 IS NULL OR area_m2 BETWEEN 1 AND 1000000),
  CONSTRAINT infra_anio_valido      CHECK (anio IS NULL OR anio BETWEEN 1976 AND 2100),
  CONSTRAINT infra_orden_valido     CHECK (orden BETWEEN 0 AND 999)
);

CREATE INDEX IF NOT EXISTS infra_orden_idx
  ON recurso_infraestructura (activo, categoria, orden ASC, id ASC);

DROP TRIGGER IF EXISTS infra_actualizado ON recurso_infraestructura;
CREATE TRIGGER infra_actualizado BEFORE UPDATE ON recurso_infraestructura
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();
