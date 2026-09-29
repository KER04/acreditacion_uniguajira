-- 023_extension_datos_reales — Contenido real de /extension, con su fuente.
--
-- Nada de lo que se carga aquí es inventado: cada fila sale de un documento o
-- una noticia publicados por la universidad (consultados el 2026-09-28) y
-- lleva el enlace de donde salió, igual que la infraestructura (011).
--
--   · Proyectos: Tabla 77 «Proyectos de Cooperación Nacional e Internacional»
--     del Factor 5 del informe de autoevaluación del programa (acreditación).
--     El informe no trae fechas; el estado es el que reporta el documento.
--   · Convenios: los que la universidad anunció como convenios que cubren a
--     Ingeniería de Sistemas (IGAC por la Facultad de Ingeniería, Ingsolmep
--     por la sede Maicao).
--   · Cursos: la oferta de educación continuada dirigida al programa.
--
-- Se sustituyen los tres proyectos de ejemplo que sembraba seed.js, borrando
-- solo esos tres títulos exactos. Todo lo demás es idempotente: no duplica
-- si ya existe una fila con el mismo título u organización.

ALTER TABLE proyecto_extension ADD COLUMN IF NOT EXISTS fuente_url TEXT NOT NULL DEFAULT '';

DELETE FROM proyecto_extension WHERE titulo IN (
  'Digitalización de artesanas wayuu',
  'TIC en escuelas rurales de La Guajira',
  'Observatorio digital del empleo Caribe'
);

/* ─── Proyectos (Factor 5, Tabla 77) ────────────────────────────── */

INSERT INTO proyecto_extension (titulo, descripcion, comunidad, municipio, sede, estado, integrantes, fuente_url, orden)
SELECT v.titulo, v.descripcion, v.comunidad, v.municipio, 'riohacha', v.estado, v.integrantes, f.fuente, v.orden
  FROM (VALUES
    ('Tecnologías móviles con comunidades wayuu',
     'Procesos formativos con comunidades educativas indígenas de la etnia wayuu, centrados en reconocer cómo construyen conocimiento a partir de sus propios estilos de aprendizaje y de la cosmovisión con que se relacionan con su entorno. Es el proyecto de cooperación que el informe reporta como vigente.',
     'Seeds of Empowerment · Universidad de Stanford', 'Comunidad indígena de Manzana', 'En ejecución',
     ARRAY['Grupo de investigación Motivar'], 0),
    ('Proyecto Uno a Uno',
     'Proyecto de cooperación del grupo Motivar con la Escuela Normal María Inmaculada de Manaure (Cesar).',
     'Normal María Inmaculada de Manaure', 'Manaure (Cesar)', 'Finalizado',
     ARRAY['Grupo de investigación Motivar'], 1),
    ('Formación para el desarrollo de cuentos digitales',
     'Formación en creación de cuentos digitales en municipios del sur de La Guajira, en cooperación con la Fundación para el Desarrollo Institucional Cerrejón.',
     'Fundación para el Desarrollo Institucional Cerrejón', 'Hatonuevo, Barrancas y Fonseca', 'Finalizado',
     ARRAY['Grupo de investigación Motivar'], 2),
    ('Sistema de información de peajes de Uribía (SIGEP 7000)',
     'Sistema de información para la gestión de los peajes del municipio, desarrollado para la Alcaldía de Uribía.',
     'Alcaldía de Uribía', 'Uribía', 'Finalizado',
     ARRAY['Grupo de investigación Universidad Paralela'], 3),
    ('Sistema de pesaje de báscula',
     'Sistema de pesaje desarrollado en cooperación con la Concesión Santa Marta – Paraguachón.',
     'Concesión Santa Marta – Paraguachón', 'Riohacha', 'Finalizado',
     ARRAY['Grupo de investigación Universidad Paralela'], 4),
    ('Sistema de información de ventas y consumo de tiquetes prepago',
     'Sistema de información para la venta y el consumo de tiquetes prepago de la Concesión Santa Marta – Paraguachón.',
     'Concesión Santa Marta – Paraguachón', 'Riohacha', 'Finalizado',
     ARRAY['Grupo de investigación Universidad Paralela'], 5),
    ('Sistema de atención al cliente de la concesionaria (RAPTOR 7000)',
     'Sistema de información para registrar las atenciones de servicio que la concesionaria presta a sus clientes.',
     'Concesión Santa Marta – Paraguachón', 'Riohacha', 'Finalizado',
     ARRAY['Grupo de investigación Universidad Paralela'], 6)
  ) AS v(titulo, descripcion, comunidad, municipio, estado, integrantes, orden)
  CROSS JOIN (VALUES ('https://uniguajira.edu.co/actualidad/factor-5-visibilidad-nacional-e-internacional-programa-de-ingenieria-de-sistemas/')) AS f(fuente)
 WHERE NOT EXISTS (SELECT 1 FROM proyecto_extension p WHERE p.titulo = v.titulo);

/* ─── Convenios ─────────────────────────────────────────────────── */

-- IGAC: convenio interadministrativo firmado con la Facultad de Ingeniería,
-- anunciado el 7 nov 2025 con vigencia de cuatro años.
INSERT INTO convenio_extension (organizacion, sector, tipo, descripcion, anio_inicio, fecha_fin, url, color, orden)
SELECT 'Instituto Geográfico Agustín Codazzi (IGAC)', 'Público', 'Convenio interadministrativo · Facultad de Ingeniería',
       'Pasantías y prácticas profesionales para estudiantes de la Facultad de Ingeniería, con espacios, orientación técnica y tutores especializados del IGAC. Vigencia de cuatro años.',
       2025, DATE '2029-11-07',
       'https://uniguajira.edu.co/actualidad/convenio-entre-igac-y-uniguajira-abre-puertas-a-nuevas-practicas-profesionales/',
       'var(--ug-azul)', 0
 WHERE NOT EXISTS (SELECT 1 FROM convenio_extension WHERE organizacion LIKE 'Instituto Geográfico Agustín Codazzi%');

-- Ingsolmep: alianza de la sede Maicao anunciada el 7 mar 2024. La noticia no
-- da fecha de fin, así que queda sin vigencia (indefinida) hasta que se sepa.
INSERT INTO convenio_extension (organizacion, sector, tipo, descripcion, anio_inicio, url, color, orden)
SELECT 'Ingsolmep', 'Empresarial', 'Alianza · Sede Maicao',
       'Ingeniería y Soluciones en Equipos Médicos y Sistemas de Potencia. Ofertas laborales para graduados de Ingeniería de Sistemas y pasantías para practicantes del programa.',
       2024,
       'https://uniguajira.edu.co/actualidad/uniguajira-sede-maicao-hace-nuevas-alianzas-en-pro-de-todos-sus-estamentos/',
       'var(--ug-amarillo)', 1
 WHERE NOT EXISTS (SELECT 1 FROM convenio_extension WHERE organizacion = 'Ingsolmep');

/* ─── Educación continua ────────────────────────────────────────── */

INSERT INTO curso_extension (titulo, tipo, descripcion, horas, modalidad, fecha_inicio, url_inscripcion, orden)
SELECT v.titulo, 'Diplomado', v.descripcion, v.horas, 'Virtual', v.inicio, v.url, v.orden
  FROM (VALUES
    ('Tecnologías Emergentes para la Industria 5.0',
     'Diplomado con opción a grado 2027 de la Facultad de Ingeniería, para Ingeniería de Sistemas, Tecnología en Gestión de Redes Informáticas y Tecnología en Desarrollo de Software. Inscripciones hasta el 30 de octubre de 2026; requiere el 90 % de los créditos aprobados.',
     NULL::int, DATE '2027-03-01',
     'https://uniguajira.edu.co/actualidad/diplomados-con-opcion-a-grado-2027-para-estudiantes-de-pregrado/', 0),
    ('Tecnologías Emergentes y Transformación Digital: IA, datos, cloud, ciberseguridad e innovación para el desarrollo territorial',
     'Diplomado con opción a grado 2027 de la Facultad de Ingeniería, para Ingeniería de Sistemas, Tecnología en Gestión de Redes Informáticas y Tecnología en Desarrollo de Software. Inscripciones hasta el 30 de octubre de 2026; requiere el 90 % de los créditos aprobados.',
     NULL::int, DATE '2027-03-01',
     'https://uniguajira.edu.co/actualidad/diplomados-con-opcion-a-grado-2027-para-estudiantes-de-pregrado/', 1),
    ('II Diplomado: Líderes Educativos Digitales, Tecnologías Emergentes e Innovación en la Era de la IA',
     'IA generativa, automatización, realidad virtual y aumentada aplicadas a la educación y a proyectos. Para docentes, estudiantes, graduados y comunidad en general. Inscripción gratuita, por Google Meet.',
     170, NULL::date,
     'https://uniguajira.edu.co/actualidad/ii-diplomado-lideres-educativos-digitales-tecnologias-emergentes-e-innovacion-en-la-era-de-la-inteligencia-artificial/', 2)
  ) AS v(titulo, descripcion, horas, inicio, url, orden)
 WHERE NOT EXISTS (SELECT 1 FROM curso_extension c WHERE c.titulo = v.titulo);
