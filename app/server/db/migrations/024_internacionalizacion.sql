-- 024_internacionalizacion — Convenios internacionales, convocatorias de
-- movilidad, redes académicas y datos de la ORI.
--
-- Sustituye src/data/internacionalizacion.json y la copia escrita a mano en
-- Internacionalizacion.jsx (seis «alianzas» y cuatro becas que no salían de
-- ningún documento). Todo lo que se carga aquí es real y lleva su fuente,
-- consultada el 2026-09-28:
--
--   · Convenios: «Relación de convenios internacionales» de la Facultad de
--     Ingeniería (hoja publicada en uniguajira.edu.co), solo los vigentes que
--     cubren a la facultad. Una fila de la hoja no trae nombre de institución
--     y se omitió. `intercambio` marca los que la ORI lista como destinos.
--   · Convocatorias: las publicadas por la ORI en 2026.
--   · Redes: las que el Factor 5 del informe de autoevaluación del programa
--     declara (IEEE, REDIS, RIBIE, RedDOLAC, CORDIS y ACOFI).
--   · ORI: su página de contacto y la de intercambio internacional.
--
-- NO se migran las movilidades del JSON: eran personas con nombre propio
-- inventadas (y los mismos docentes de ejemplo de Investigación).

/* ─── Convenios internacionales ─────────────────────────────────── */

CREATE TABLE IF NOT EXISTS convenio_internacional (
  id             SERIAL PRIMARY KEY,
  institucion    TEXT        NOT NULL,
  pais           TEXT        NOT NULL,
  tipo           TEXT        NOT NULL DEFAULT 'Marco',
  tema           TEXT        NOT NULL DEFAULT '',
  objeto         TEXT        NOT NULL DEFAULT '',
  -- Si la ORI lo ofrece como destino de intercambio estudiantil.
  intercambio    BOOLEAN     NOT NULL DEFAULT FALSE,
  -- Vigente se deduce: sin fecha, indefinido (la hoja no trae vencimientos).
  fecha_fin      DATE,
  url            TEXT        NOT NULL DEFAULT '',
  orden          INTEGER     NOT NULL DEFAULT 0,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT convenio_int_institucion CHECK (length(btrim(institucion)) >= 2),
  CONSTRAINT convenio_int_pais        CHECK (length(btrim(pais)) >= 2),
  CONSTRAINT convenio_int_tipo        CHECK (tipo IN ('Marco', 'Específico')),
  CONSTRAINT convenio_int_orden       CHECK (orden BETWEEN 0 AND 999)
);

DROP TRIGGER IF EXISTS convenio_internacional_actualizado ON convenio_internacional;
CREATE TRIGGER convenio_internacional_actualizado BEFORE UPDATE ON convenio_internacional
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();

/* ─── Convocatorias de movilidad ────────────────────────────────── */

CREATE TABLE IF NOT EXISTS convocatoria_movilidad (
  id              SERIAL PRIMARY KEY,
  titulo          TEXT        NOT NULL,
  dirigido        TEXT        NOT NULL DEFAULT 'Estudiantes',
  destino         TEXT        NOT NULL DEFAULT '',
  descripcion     TEXT        NOT NULL DEFAULT '',
  beneficios      TEXT        NOT NULL DEFAULT '',
  fecha_apertura  DATE,
  -- Abierta/cerrada se calcula con esto; no hay estado que olvidar cambiar.
  fecha_cierre    DATE,
  url             TEXT        NOT NULL DEFAULT '',
  orden           INTEGER     NOT NULL DEFAULT 0,
  creado_en       TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT convocatoria_mov_titulo   CHECK (length(btrim(titulo)) >= 3),
  CONSTRAINT convocatoria_mov_dirigido CHECK (dirigido IN ('Estudiantes', 'Docentes', 'Estudiantes y docentes', 'Graduados')),
  CONSTRAINT convocatoria_mov_fechas   CHECK (fecha_cierre IS NULL OR fecha_apertura IS NULL OR fecha_cierre >= fecha_apertura),
  CONSTRAINT convocatoria_mov_orden    CHECK (orden BETWEEN 0 AND 999)
);

DROP TRIGGER IF EXISTS convocatoria_movilidad_actualizada ON convocatoria_movilidad;
CREATE TRIGGER convocatoria_movilidad_actualizada BEFORE UPDATE ON convocatoria_movilidad
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();

/* ─── Redes académicas ──────────────────────────────────────────── */

CREATE TABLE IF NOT EXISTS red_academica (
  id             SERIAL PRIMARY KEY,
  sigla          TEXT        NOT NULL,
  nombre         TEXT        NOT NULL DEFAULT '',
  alcance        TEXT        NOT NULL DEFAULT 'Internacional',
  descripcion    TEXT        NOT NULL DEFAULT '',
  url            TEXT        NOT NULL DEFAULT '',
  orden          INTEGER     NOT NULL DEFAULT 0,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT red_sigla   CHECK (length(btrim(sigla)) >= 2),
  CONSTRAINT red_alcance CHECK (alcance IN ('Nacional', 'Internacional')),
  CONSTRAINT red_orden   CHECK (orden BETWEEN 0 AND 999)
);

DROP TRIGGER IF EXISTS red_academica_actualizada ON red_academica;
CREATE TRIGGER red_academica_actualizada BEFORE UPDATE ON red_academica
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();

/* ─── Oficina de Relaciones Internacionales (fila única) ────────── */

CREATE TABLE IF NOT EXISTS ori_contacto (
  id             SMALLINT    PRIMARY KEY DEFAULT 1,
  ubicacion      TEXT        NOT NULL DEFAULT '',
  correos        TEXT[]      NOT NULL DEFAULT '{}',
  telefono       TEXT        NOT NULL DEFAULT '',
  url            TEXT        NOT NULL DEFAULT '',
  requisitos     TEXT[]      NOT NULL DEFAULT '{}',
  pasos          TEXT[]      NOT NULL DEFAULT '{}',
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ori_fila_unica CHECK (id = 1)
);

DROP TRIGGER IF EXISTS ori_contacto_actualizado ON ori_contacto;
CREATE TRIGGER ori_contacto_actualizado BEFORE UPDATE ON ori_contacto
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();

/* ─── Datos ─────────────────────────────────────────────────────── */

INSERT INTO convenio_internacional (institucion, pais, tipo, tema, objeto, intercambio, orden, url)
SELECT v.*, 'https://uniguajira.edu.co/actualidad/convenios-internacionales-de-la-facultad-de-ingenieria/'
  FROM (VALUES
    ('Centro Investigaciones Biológicas de Noroeste de la Paz', 'México', 'Marco', 'Cooperación', 'Establecer un marco permanente y estable de relaciones en cuantas actividades puedan ser de interés recíproco, promover los mecanismos necesarios de intercambio para la comunicación de las respectivas experiencias tanto en el campo científico como docente.', FALSE, 0),
    ('Universidad Rafael Belloso Chacin', 'Venezuela', 'Marco', 'Cooperación Interinstitucional', 'Establecer un marco permanente y estable de relaciones en cuantas actividades puedan ser de interés recíproco, promover los mecanismos necesarios de intercambio para la comunicación de las respectivas experiencias tanto en el campo científico como docente.', TRUE, 1),
    ('Universidad de Cádiz', 'España', 'Marco', 'Cooperación Interinstitucional', 'El objeto del presente Convenio Marco es sentar las bases de la colaboración entre las partes y definir cauces formales de relación entre ellas', TRUE, 2),
    ('Universidad de Murcia', 'España', 'Marco', 'Colaboración académica y científica', 'Facilitar y promover la cooperación entre el SUE CARIBE y la Universidad de Murcia, en los campos de docencia, investigación científica, movilidad de docentes y estudiantes, para cuyo fin las partes se comprometen a: Apoyar y promover la realización de actividades conjuntas docentes y científicos estimulando la formación de equipos de trabajo de las universidades de SUE CARIBE y de la Universidad de Murcia. Favorecer los intercambios de profesores, estudiantes y directivos en proyectos científicos, académicos y administrativos, en los campos de interés para ambas partes. Facilitar las pasantías de estudiantes de investigación, articulando sistemas de becas entre ambas instituciones. Promover la organización en común de congresos, simposios, coloquios o reuniones en áreas o temas de interés para ambas instituciones.', TRUE, 3),
    ('Universidad del Zulia', 'Venezuela', 'Marco', 'Cooperación académica y científica, en el desarrollo de las investigaciones conjuntas en los campos de ciencia y tecnología.', 'Intercambio de profesores y estudiantes para programas académicos, conferencias, investigaciones cientifícas, proyectos editoriales. Organización de eventos académicos, seminarios y simposios. Intercambio de publicaciones, material de estudio, información científico - técnica. Elaboración de artículos científicos, textos y otros materiales.', TRUE, 4),
    ('Universidad de Cádiz (Sue Caribe)', 'España', 'Marco', 'Colaboración', 'Apoyar y promover la realización de actividades conjuntas de carácter docente y científico. Favorecer el intercambio de profesores, estudiantes, directivos de proyectos. Facilitar las pasantías de estudiantes, de investigación, articulando sistemas de becas entre las instituciones extranjeras y la Red. Promover la organización en común de congresos, simposios y coloquios.', TRUE, 5),
    ('Universidad de Castilla - la Mancha (Sue Caribe)', 'España', 'Marco', 'Colaboración académica y científica', 'Apoyar y promover la realización de actividades conjuntas de carácter docente y científico. Favorecer el intercambio de profesores, estudiantes, directivos de proyectos. Facilitar las pasantías de estudiantes, de investigación.', TRUE, 6),
    ('Universidad Veracruzana (Sue Caribe)', 'México', 'Marco', 'Colaboración Académica', 'Intercambio de profesores y estudiantes para el desarrollo de maestrias, doctorados y postdoctorados. Organización de eventos, seminarios y simposios. Publicaciones conjuntas. Elaboración de articulos científicos, textos y otros materiales.', TRUE, 7),
    ('Universidad de Zaragoza', 'España', 'Marco', 'Cooperación científica y académica', 'Establecer un marco institucional para celebrar actividades académicas e investigaciones en conjunto, en actividades como: Intercambio de docentes y alumnos Coordinación de proyectos de investigación y desarrollo tecnológico Cursos de formación y pasantías Programas de Maestrías y Doctorados', TRUE, 8),
    ('Universidad Internacional de la Rioja', 'España', 'Específico', 'Prácticas empresariales', 'Practicas empresariales para estudiantes de posgrados', FALSE, 9),
    ('Instituto de Tecnología de Nueva York', 'Estados Unidos', 'Marco', 'Colaboración Científica, Académica y Cultural', 'Intercambio de docentes y alumnos Coordinación de proyectos de investigación y desarrollo tecnológico Definición y desarrollo de programas de extensión Cursos de formación y pasantías Programas de Maestrías y doctorados Seminarios internacionales', TRUE, 10),
    ('Universidad Técnica Federico Santa María', 'Chile', 'Marco', 'Colaboración Académica', 'Intercambio de profesores y estudiantes para el desarrollo de maestrias, doctorados y postdoctorados. Organización de eventos, seminarios y simposios. Publicaciones conjuntas. Elaboración de articulos científicos, textos y otros materiales.', TRUE, 11),
    ('Universidad Mayor, Real y Pontificia de San Francisco Xavier de Chuquisaca', 'Bolivia', 'Marco', 'Colaboración Académica, Tecnológica, Científica y Cultural', 'Intercambio de estudiantes, docentes, investigadores, gestores y administrativos. Actividades e investigaciones conjuntas. Proyectos conjuntos. Realización de prácticas pre profesionales. Actividades de formación continua y actualización.', TRUE, 12),
    ('Universidad Politécnica de Guanajuato', 'México', 'Marco', 'Colaboración Académica, Tecnológica, Científica y Cultural', 'Formación y especialización de recursos humanos. Investigaciones conjuntas. Desarrollo tecnológico y académico. Intercambio de información. Asesoría técnica o académica. Publicaciones.', TRUE, 13),
    ('Universidad del Centro del Bajío', 'México', 'Marco', 'Colaboración Académica, Tecnológica, Científica y Cultural', 'Cooperación para la realización de actividades académicas, docentes, investigativas, de difusión de la cultura y extensión de servicios en todas aquellas áreas de interés recíproco.', TRUE, 14),
    ('Universidad Federal de Paraná', 'Brasil', 'Marco', 'Cooperación Internacional', 'Intercambio de personal académico y estudiantil con propósitos académicos e investigativos. Participación y coordinación de proyectos de investigación, charlas, conferencias y seminarios.', TRUE, 15),
    ('Universidad Autónoma Metropolitana de los Estados Unidos Mexicanos', 'México', 'Marco', 'Colaboración General de Cooperación', 'Promover el desarrollo de actividades académicas, de docencia, investigación y preservación y difusión de la cultura de las respectivas instituciones. Incrementar la comprensión del entorno de las respectivas instituciones en lo referente a su situación económica, ambiente cultural y posición ante importantes temas sociales.', TRUE, 16),
    ('Universidad Autónoma Metropolitana de los Estados Unidos Mexicanos', 'México', 'Específico', 'Colaboración General de Cooperación', 'Promover el desarrollo de actividades académicas, de docencia, investigación y preservación y difusión de la cultura de las respectivas instituciones. Incrementar la comprensión del entorno de las respectivas instituciones en lo referente a su situación económica, ambiente cultural y posición ante importantes temas sociales.', TRUE, 17),
    ('Missouri State University', 'Estados Unidos', 'Marco', 'Cooperación académica', 'Intercambio de estudiantes y docentes en programas de Inglés y español Actividades conjuntas de investigación, arte y educación de docentes y estudiantes Simposios, congresos, seminarios, cursos, escuelas de verano, talleres', TRUE, 18),
    ('Instituto Tecnológico de Morelia', 'México', 'Marco', 'Cooperación académica', 'Intercambio de estudiantes y docentes en programas de Inglés y español Actividades conjuntas de investigación, arte y educación de docentes y estudiantes Simposios, congresos, seminarios, cursos, escuelas de verano, talleres', TRUE, 19),
    ('Universidad de Quintana Roo', 'México', 'Marco', 'Colaboración académica, científica y tecnológica', 'Desarrollar proyectos de investigación y vinculación conjunta Asesoría y colaboración en materia académica y cultural Estancias de movilidad para estudiantes, docentes y egresados Educación continua', TRUE, 20),
    ('Tecnológico Nacional de México - Campus Instituto Tecnológico de Tijuana', 'México', 'Marco', 'Colaboración académica, científica y tecnológica', 'Formalización y especialización de recursos humanos Investigaciones conjuntas Desarrollo tecnólogico y académico Intercambio de información Asesoría técnica o académica Publicaciones', TRUE, 21),
    ('Universidad Autónoma del Perú', 'Perú', 'Marco', 'Cooperación académica', 'Movilidad estudiantil de pregrado y postgrado en modalidad presencial y virtual Movilidad de docentes en modalidad presencial y virtual Colaboración en investigaciones sobre temas comunes Responsabilidad Social Universitaria', TRUE, 22),
    ('Universidad de Barcelona', 'España', 'Marco', 'Cooperación académica', 'Intercambio de profesores, investigadores y estudiantes Participación en conferencias, seminarios, coloquios y otros Organización de equipos conjuntos de investigación', TRUE, 23),
    ('Universidad Federal de Mato Grosso Do Sul', 'Brasil', 'Marco', 'Cooperación académica', 'Desarrollar proyectos de investigación conjunta Intercambio de personal docente, estudiante y técnico-administrativo Realizar cursos, seminarios y simposios Promover el intercambio de material bibliográfico, publicaciones, etc', FALSE, 24),
    ('Universidad Veracruzana', 'México', 'Marco', 'Cooperación académica', 'Intercambio de información y materiales Intercambio de estudiantes, profesores, ponentes y administrativos Organización y participación en seminarios y conferencias', TRUE, 25),
    ('Observatorio Méxicano de la Crisis', 'México', 'Marco', 'Practicas internacionales', 'Desarrollo de la prácticas profesionales y académicas', FALSE, 26),
    ('WIAR S.A.C', 'Perú', 'Marco', 'Practicas internacionales', 'Desarrollo de la prácticas profesionales y académicas', FALSE, 27),
    ('Universidad Federal de Goiás', 'Brasil', 'Marco', 'Cooperación académica, cultural y científica', 'Proyectos de investigación conjuntos Publicaciones conjuntas Intercambio de profesores e investigadores para misiones de enseñanza o investigación Intercambio de estudiantes', FALSE, 28)
  ) AS v(institucion, pais, tipo, tema, objeto, intercambio, orden)
 WHERE NOT EXISTS (SELECT 1 FROM convenio_internacional);

INSERT INTO convocatoria_movilidad (titulo, dirigido, destino, descripcion, beneficios, fecha_apertura, fecha_cierre, url, orden)
SELECT * FROM (VALUES
  ('Global Teaching Minds: inmersión lingüística y pedagogía EMI', 'Docentes', 'University of Ottawa, Canadá',
   'Convocatoria No. 004 de 2026. Veinte becas (12 para docentes de facultades y programas) para fortalecer el inglés y la enseñanza en inglés (EMI): tres semanas presenciales en Ottawa, sesiones previas en línea y un laboratorio de implementación. Requiere nivel B1, dos años en la institución y pasaporte vigente.',
   'Programa académico, tiquetes aéreos, alojamiento compartido, alimentación, seguro médico, traslados y certificados de la University of Ottawa.',
   DATE '2026-09-11', DATE '2026-09-29',
   'https://uniguajira.edu.co/actualidad/convocatoria-global-teaching-minds-inmersion-linguistica-y-pedagogia-emi-en-canada/', 0),
  ('Global Minds: inmersión lingüística en Canadá', 'Estudiantes', 'University of Ottawa, Canadá',
   'Estudiantes de pregrado de III a VII semestre (promedio mínimo 3.8 en Ingenierías) e inglés A2. Tras una inmersión en campus y un pitch sobre innovación e inteligencia artificial, tres estudiantes viajan a Ottawa a finales del I semestre de 2027.',
   'Matrícula de la inmersión, tiquetes aéreos, alojamiento compartido, seguro médico y certificación internacional.',
   DATE '2026-09-02', DATE '2026-09-09',
   'https://uniguajira.edu.co/actualidad/convocatoria-global-minds-inmersion-linguistica-en-canada/', 1),
  ('Tuna Guajira: intercambios académicos nacionales salientes', 'Estudiantes', 'Universidades colombianas',
   'Convocatoria No. 007 de 2026 de becas para cursar un semestre de intercambio en otra universidad del país.',
   'Apoyo económico para manutención mensual.',
   DATE '2026-05-13', DATE '2026-05-29',
   'https://uniguajira.edu.co/actualidad/tuna-guajira-intercambios-academicos-nacionales-salientes/', 2)
) AS v(titulo, dirigido, destino, descripcion, beneficios, fecha_apertura, fecha_cierre, url, orden)
 WHERE NOT EXISTS (SELECT 1 FROM convocatoria_movilidad);

INSERT INTO red_academica (sigla, nombre, alcance, descripcion, url, orden)
SELECT * FROM (VALUES
  ('IEEE', 'Institute of Electrical and Electronics Engineers', 'Internacional', 'Asociación profesional de ingeniería en la que participan docentes del programa.', 'https://www.ieee.org/', 0),
  ('RIBIE', 'Red Iberoamericana de Informática Educativa', 'Internacional', 'Red de informática educativa en la que participan docentes del programa.', '', 1),
  ('RedDOLAC', 'Red de Docentes de América Latina y del Caribe', 'Internacional', 'Red docente latinoamericana en la que participan docentes del programa.', '', 2),
  ('CORDIS', '', 'Internacional', 'Red en la que participan docentes del programa, según el Factor 5 del informe de autoevaluación.', '', 3),
  ('REDIS', '', 'Nacional', 'Red en la que participan docentes del programa, según el Factor 5 del informe de autoevaluación.', '', 4),
  ('ACOFI', 'Asociación Colombiana de Facultades de Ingeniería', 'Nacional', 'La Facultad de Ingeniería está asociada; sirve de referente para la renovación del plan de estudios del programa.', 'https://acofi.edu.co/', 5)
) AS v(sigla, nombre, alcance, descripcion, url, orden)
 WHERE NOT EXISTS (SELECT 1 FROM red_academica);

INSERT INTO ori_contacto (id, ubicacion, correos, telefono, url, requisitos, pasos)
VALUES (1,
  'Bloque administrativo B, segundo piso · Sede Riohacha, km 3 + 354 vía Maicao',
  ARRAY['ori@uniguajira.edu.co', 'internacionalizacion.curricular@uniguajira.edu.co'],
  '+57 (605) 728 2729, ext. 223',
  'https://uniguajira.edu.co/oficina-de-relaciones-internacionales/',
  ARRAY[
    'Estar cursando entre III y VIII semestre al momento de postular.',
    'Promedio acumulado igual o superior a 3.8 (Facultad de Ingeniería).',
    'No haber tenido procesos disciplinarios en la universidad.',
    'Estar al día con las asignaturas del semestre en curso.',
    'Pasaporte vigente, para intercambios internacionales.'
  ],
  ARRAY[
    'Verifica las asignaturas habilitadas para el semestre en que harías el intercambio.',
    'Revisa el plan de estudios de la universidad de destino e informa a la ORI qué asignaturas cursarías.',
    'Reúne los documentos: hoja de vida, ensayo de motivación, proyecto para aplicar al regreso, cédula, pasaporte, certificado de EPS y formulario RI-F-31.',
    'Matricúlate en Uniguajira el semestre del intercambio para seguir como estudiante activo.',
    'Una vez aceptado, registra y evalúa la movilidad en la plataforma PLATINUM.'
  ])
ON CONFLICT (id) DO NOTHING;
