-- 009_egresados — El módulo Egresados pasa de src/data/egresados.json a la base.
--
-- Cuatro tablas, porque son cuatro cosas distintas que antes no existían o
-- vivían aplastadas en un arreglo:
--
--   egresado                quién es y qué hace hoy (lo que el JSON llamaba
--                           "destacados", con claves de una letra: n, y, r, c, q).
--   oferta_empleo           la vacante. En el JSON era una fila de tabla con
--                           cinco campos; ahora tiene el cuerpo completo que
--                           necesita una página propia.
--   postulacion             quién aplicó a una vacante. No existía: el botón
--                           "Aplicar" de la bolsa no hacía nada.
--   actualizacion_egresado  el formulario de "actualiza tus datos", que se
--                           enviaba a ninguna parte y solo pintaba un ✓.
--
-- Sobre el vídeo de la tarjeta destacada: NO se guarda el binario. Un MP4 de
-- 30 s en base64 dentro de `archivos` son decenas de MB por fila, y toda la
-- fila viaja por memoria cada vez que se lee. Se guarda el identificador de
-- YouTube (11 caracteres) y, si algún día hay un MP4 en un CDN propio, su URL.
-- La miniatura sale gratis de i.ytimg.com, así que el póster solo se sube
-- cuando se quiere un fotograma distinto del que elige YouTube.

CREATE TABLE IF NOT EXISTS egresado (
  id             SERIAL PRIMARY KEY,
  nombre         TEXT NOT NULL,

  -- Año de grado como texto: la planilla trae "2018" pero también "2018-II".
  anio_grado     TEXT NOT NULL DEFAULT '',
  cargo          TEXT NOT NULL DEFAULT '',
  empresa        TEXT NOT NULL DEFAULT '',
  ciudad         TEXT NOT NULL DEFAULT '',
  pais           TEXT NOT NULL DEFAULT '',
  sede           TEXT NOT NULL DEFAULT 'riohacha',

  testimonio     TEXT NOT NULL DEFAULT '',
  linkedin_url   TEXT NOT NULL DEFAULT '',

  -- Color de la tarjeta: un token de la paleta, no un hex suelto, para que
  -- siga al tema claro/oscuro y al acento elegido.
  color          TEXT NOT NULL DEFAULT 'var(--ug-azul)',

  foto_id        BIGINT REFERENCES archivos(id) ON DELETE SET NULL,

  -- Vídeo del testimonio: identificador de YouTube o URL de un MP4 externo.
  video_youtube  TEXT NOT NULL DEFAULT '',
  video_url      TEXT NOT NULL DEFAULT '',
  -- Fotograma propio. Sin él se usa la miniatura de YouTube, que no ocupa nada.
  poster_id      BIGINT REFERENCES archivos(id) ON DELETE SET NULL,

  -- El que abre la sección a ancho completo con el vídeo de fondo.
  destacado      BOOLEAN NOT NULL DEFAULT FALSE,
  orden          INTEGER NOT NULL DEFAULT 0,
  activo         BOOLEAN NOT NULL DEFAULT TRUE,

  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT egresado_nombre_no_vacio CHECK (length(btrim(nombre)) >= 3),
  CONSTRAINT egresado_sede_valida     CHECK (sede IN ('ambas', 'riohacha', 'maicao')),
  -- Un id de YouTube son 11 caracteres de [A-Za-z0-9_-]. Guardar la URL entera
  -- obligaría a analizarla en cada render del front.
  CONSTRAINT egresado_youtube_valido  CHECK (video_youtube = '' OR video_youtube ~ '^[A-Za-z0-9_-]{11}$'),
  CONSTRAINT egresado_orden_valido    CHECK (orden >= 0 AND orden <= 999)
);

CREATE INDEX IF NOT EXISTS egresado_orden_idx
  ON egresado (activo, destacado DESC, orden ASC, id ASC);

DROP TRIGGER IF EXISTS egresado_actualizado ON egresado;
CREATE TRIGGER egresado_actualizado BEFORE UPDATE ON egresado
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();


CREATE TABLE IF NOT EXISTS oferta_empleo (
  id                SERIAL PRIMARY KEY,
  cargo             TEXT NOT NULL,
  empresa           TEXT NOT NULL DEFAULT '',
  ubicacion         TEXT NOT NULL DEFAULT '',
  modalidad         TEXT NOT NULL DEFAULT 'Presencial',
  tipo_contrato     TEXT NOT NULL DEFAULT 'Tiempo completo',
  salario           TEXT NOT NULL DEFAULT '',
  vacantes          INTEGER NOT NULL DEFAULT 1,

  -- El cuerpo de la vacante. Cada bloque es texto libre y el front parte por
  -- saltos de línea para pintar viñetas, así que nadie tiene que pelearse con
  -- un editor de listas en el panel.
  descripcion       TEXT NOT NULL DEFAULT '',
  responsabilidades TEXT NOT NULL DEFAULT '',
  requisitos        TEXT NOT NULL DEFAULT '',
  beneficios        TEXT NOT NULL DEFAULT '',

  -- Tecnologías. TEXT[] y no una tabla aparte: nunca se consultan por su cuenta.
  tags              TEXT[] NOT NULL DEFAULT '{}',

  contacto_email    TEXT NOT NULL DEFAULT '',
  -- Si la empresa tiene su propio portal, el botón lleva allí en lugar de al
  -- formulario de la página.
  url_externa       TEXT NOT NULL DEFAULT '',

  fecha_publicacion DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_cierre      DATE,
  estado            TEXT NOT NULL DEFAULT 'abierta',

  creado_en         TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT oferta_cargo_no_vacio    CHECK (length(btrim(cargo)) >= 3),
  CONSTRAINT oferta_estado_valido     CHECK (estado IN ('abierta', 'cerrada', 'borrador')),
  CONSTRAINT oferta_modalidad_valida  CHECK (modalidad IN ('Presencial', 'Remoto', 'Híbrido')),
  CONSTRAINT oferta_contrato_valido
    CHECK (tipo_contrato IN ('Tiempo completo', 'Medio tiempo', 'Práctica', 'Contrato por obra', 'Prestación de servicios')),
  CONSTRAINT oferta_vacantes_positivo CHECK (vacantes >= 1 AND vacantes <= 999),
  CONSTRAINT oferta_cierre_coherente  CHECK (fecha_cierre IS NULL OR fecha_cierre >= fecha_publicacion)
);

CREATE INDEX IF NOT EXISTS oferta_orden_idx
  ON oferta_empleo (estado, fecha_publicacion DESC, id DESC);

DROP TRIGGER IF EXISTS oferta_actualizada ON oferta_empleo;
CREATE TRIGGER oferta_actualizada BEFORE UPDATE ON oferta_empleo
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();


-- Quién aplicó. La hoja de vida va a `archivos` como cualquier otro adjunto.
CREATE TABLE IF NOT EXISTS postulacion (
  id            SERIAL PRIMARY KEY,
  oferta_id     INTEGER NOT NULL REFERENCES oferta_empleo(id) ON DELETE CASCADE,

  nombre        TEXT NOT NULL,
  documento     TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL,
  telefono      TEXT NOT NULL DEFAULT '',
  anio_grado    TEXT NOT NULL DEFAULT '',
  linkedin_url  TEXT NOT NULL DEFAULT '',
  mensaje       TEXT NOT NULL DEFAULT '',

  hoja_vida_id  BIGINT REFERENCES archivos(id) ON DELETE SET NULL,

  estado        TEXT NOT NULL DEFAULT 'recibida',
  notas         TEXT NOT NULL DEFAULT '',

  creado_en     TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT postulacion_nombre_no_vacio CHECK (length(btrim(nombre)) >= 3),
  CONSTRAINT postulacion_email_valido    CHECK (email ~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'),
  CONSTRAINT postulacion_estado_valido
    CHECK (estado IN ('recibida', 'revisada', 'preseleccionada', 'descartada'))
);

-- Nadie se postula dos veces a la misma vacante con el mismo correo.
CREATE UNIQUE INDEX IF NOT EXISTS postulacion_unica_idx
  ON postulacion (oferta_id, lower(email));
CREATE INDEX IF NOT EXISTS postulacion_orden_idx
  ON postulacion (oferta_id, creado_en DESC);


-- "Cuéntanos dónde estás hoy". Antes el formulario no enviaba nada a ninguna parte.
CREATE TABLE IF NOT EXISTS actualizacion_egresado (
  id                  SERIAL PRIMARY KEY,
  nombre              TEXT NOT NULL,
  documento           TEXT NOT NULL DEFAULT '',
  anio_grado          TEXT NOT NULL DEFAULT '',
  email               TEXT NOT NULL,
  telefono            TEXT NOT NULL DEFAULT '',
  ciudad              TEXT NOT NULL DEFAULT '',
  empresa             TEXT NOT NULL DEFAULT '',
  cargo               TEXT NOT NULL DEFAULT '',
  formacion_posterior TEXT NOT NULL DEFAULT 'Ninguna',
  resumen             TEXT NOT NULL DEFAULT '',

  -- Habeas data: se guarda la respuesta, no se da por supuesta.
  autoriza_datos      BOOLEAN NOT NULL DEFAULT FALSE,
  -- Para que la coordinación marque lo ya incorporado a la base de egresados.
  atendida            BOOLEAN NOT NULL DEFAULT FALSE,

  creado_en           TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT actualizacion_nombre_no_vacio CHECK (length(btrim(nombre)) >= 3),
  CONSTRAINT actualizacion_email_valido    CHECK (email ~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'),
  CONSTRAINT actualizacion_formacion_valida
    CHECK (formacion_posterior IN ('Ninguna', 'Especialización', 'Maestría en curso', 'Maestría terminada', 'Doctorado en curso', 'Doctorado terminado'))
);

CREATE INDEX IF NOT EXISTS actualizacion_orden_idx
  ON actualizacion_egresado (atendida, creado_en DESC);
