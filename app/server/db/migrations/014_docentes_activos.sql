-- 014_docentes_activos — el directorio completo de docentes del programa.
--
-- Los 70 docentes activos en Riohacha o Maicao según la planilla de la
-- facultad (Docentes_Ingenieria_Sistemas.xlsx), con su formación desglosada.
--
-- Por qué una migración y no solo el importador: `npm run db:importar-docentes`
-- sigue siendo el camino para actualizar el directorio cuando llegue una planilla
-- nueva. Esto es para que un `git pull` + `db:migrate` deje la base al día sin
-- tener que acordarse de un segundo comando.
--
-- Solo inserta lo que falta. El docente se identifica por su correo y no se toca
-- si ya existe: en la base de cada quien puede haber fotos subidas, horarios y
-- correcciones hechas desde el panel, y esto no viene a pisarlas. Por lo mismo la
-- formación solo se carga para el docente que no tenga ninguna.

-- Adanud Segundo Meza Valle
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Adanud Segundo Meza Valle', 'catedratico', 'riohacha', 'asmeza@uniguajira.edu.co', '', 'Maestria en gestion en la tecnologia y la innovacion'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'asmeza@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Maestria en gestion en la tecnologia y la innovacion', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'asmeza@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Alexander David Mercado Mendoza
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Alexander David Mercado Mendoza', 'catedratico', 'riohacha', 'adavidmercado@uniguajira.edu.co', '', 'Maestria en gestion de la tecnologia y la innovacion'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'adavidmercado@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Maestria en gestion de la tecnologia y la innovacion', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'adavidmercado@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Alfonso Rafael Rocha Martinez
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Alfonso Rafael Rocha Martinez', 'catedratico', 'maicao', 'arocha@uniguajira.edu.co', '', 'Especializacion en evaluacion escolar; Maestria en informatica educativa'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'arocha@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especializacion en evaluacion escolar', 'especializacion', '', false, 0),
    ('Maestria en informatica educativa', 'maestria', '', false, 1)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'arocha@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Andres David Solano Barliza
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Andres David Solano Barliza', 'planta', 'riohacha', 'andresolano@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001485657', 'Especialista en Informática para el Aprendizaje en Red; Especialista en Analítica y Big Data; Magíster en Pedagogía de las TIC; Doctor en Tecnologías de la Información y Comunicación-TIC; Doctor en Ingeniería Informática y Matemáticas de la seguridad'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'andresolano@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especialista en Informática para el Aprendizaje en Red', 'especializacion', '', false, 0),
    ('Especialista en Analítica y Big Data', 'especializacion', '', false, 1),
    ('Magíster en Pedagogía de las TIC', 'maestria', '', false, 2),
    ('Doctor en Tecnologías de la Información y Comunicación-TIC', 'doctorado', '', false, 3),
    ('Doctor en Ingeniería Informática y Matemáticas de la seguridad', 'doctorado', '', false, 4)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'andresolano@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Andres David Vides Prado
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Andres David Vides Prado', 'planta', 'maicao', 'avides@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0000016072', 'Magister en Energías Renovables en sistemas eléctrico. Doctorado en Ingeniería (Proceso de grado)'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'avides@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Magister en Energías Renovables en sistemas eléctrico', 'maestria', '', false, 0),
    ('Doctorado en Ingeniería', 'doctorado', '', true, 1)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'avides@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Angel Andres Fernandez Bueno
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Angel Andres Fernandez Bueno', 'catedratico', 'riohacha', 'anfernandezb@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001608191', 'Especialista en administración de las TICs'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'anfernandezb@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especialista en administración de las TICs', 'especializacion', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'anfernandezb@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Antonio Jose Gonzalez Liñan
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Antonio Jose Gonzalez Liñan', 'catedratico', 'riohacha', 'ajgonzalez@uniguajira.edu.co', '', 'Maestria en ingenieria ingenieria en sistemas y computacion'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'ajgonzalez@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Maestria en ingenieria ingenieria en sistemas y computacion', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'ajgonzalez@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Arnulfo Antonio Marin Alvarez
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Arnulfo Antonio Marin Alvarez', 'ocasional', 'maicao', 'amarina@uniguajira.edu.co', '', 'Especializacion gerencia en gobierno y gestion publica'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'amarina@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especializacion gerencia en gobierno y gestion publica', 'especializacion', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'amarina@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Arturo Javier Acosta Alfaro
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Arturo Javier Acosta Alfaro', 'ocasional', 'maicao', 'aacostaa@uniguajira.edu.co', '', 'Maestria en gestion de la tecnologia y la innovacion'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'aacostaa@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Maestria en gestion de la tecnologia y la innovacion', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'aacostaa@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Aslin Gonzalo Botello Plata
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Aslin Gonzalo Botello Plata', 'planta', 'riohacha', 'aslin.botello@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001388302', 'Especialización en Educación Superior; Especialización en Bases de Datos y Seguridad; Maestría en Energías Alternativas y Eficiencia Energética; Maestría en Gerencia de Investigación y Desarrollo Tecnológico; Doctorado en Ingeniería (en curso, Universidad de Cartagena)'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'aslin.botello@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especialización en Educación Superior', 'especializacion', '', false, 0),
    ('Especialización en Bases de Datos y Seguridad', 'especializacion', '', false, 1),
    ('Maestría en Energías Alternativas y Eficiencia Energética', 'maestria', '', false, 2),
    ('Maestría en Gerencia de Investigación y Desarrollo Tecnológico', 'maestria', '', false, 3),
    ('Doctorado en Ingeniería', 'doctorado', 'Universidad de Cartagena', true, 4)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'aslin.botello@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Breitner Bladimir Paez Martinez
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Breitner Bladimir Paez Martinez', 'ocasional', 'maicao', 'bpaezm@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0002069424', 'Especialista en redes de computadores, Magister en Dirección y Gestión de Proyectos'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'bpaezm@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especialista en redes de computadores', 'especializacion', '', false, 0),
    ('Magister en Dirección y Gestión de Proyectos', 'maestria', '', false, 1)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'bpaezm@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Bryan Jose Otero Arrieta
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Bryan Jose Otero Arrieta', 'catedratico', 'riohacha', 'botero@uniguajira.edu.co', '', 'Maestria en gestion de la tecnologia y la innovacion'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'botero@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Maestria en gestion de la tecnologia y la innovacion', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'botero@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Carlos Alberto Cordoba Ordoñez
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Carlos Alberto Cordoba Ordoñez', 'catedratico', 'maicao', 'ccordoba@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0002304778', 'Magister en Telematica'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'ccordoba@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Magister en Telematica', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'ccordoba@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Carlos Antonio Salas Solano
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Carlos Antonio Salas Solano', 'catedratico', 'riohacha', 'csalas@uniguajira.edu.co', '', 'Especializacion en redes en computadores; Scientiarum en telemática'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'csalas@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especializacion en redes en computadores', 'especializacion', '', false, 0),
    ('Scientiarum en telemática', '', '', false, 1)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'csalas@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Carlos Manuel Palacio Manjarrez
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Carlos Manuel Palacio Manjarrez', 'ocasional', 'maicao', 'cpalaciosm@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001570344', 'Espcializacion en Ingenieria de software y Magister en Gobierno de TI'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'cpalaciosm@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Espcializacion en Ingenieria de software', 'especializacion', '', false, 0),
    ('Magister en Gobierno de TI', 'maestria', '', false, 1)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'cpalaciosm@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Carmen Sofia Moreno Rivera
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Carmen Sofia Moreno Rivera', 'catedratico', 'maicao', 'csmoreno@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0002016865', 'Magister en Tecnología Aplicadas a la Educación'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'csmoreno@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Magister en Tecnología Aplicadas a la Educación', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'csmoreno@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Cesar Luis Julio Ibañez
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Cesar Luis Julio Ibañez', 'catedratico', 'riohacha', 'cjulio@uniguajira.edu.co', '', 'Maestria en pedagogia en las tecnologias en la informacion y la comunicacion'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'cjulio@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Maestria en pedagogia en las tecnologias en la informacion y la comunicacion', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'cjulio@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- David Fernandez Perez
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'David Fernandez Perez', 'ocasional', 'riohacha', 'dfernandez@uniguajira.edu.co', 'https://share.google/as7Fyv6h42A4v6NXw', 'Administracion de empresas; Administracion y direccion en empresas; Especializacion en administracion en la informatica educativa; Especializacion en pedagogia para el desarrollo en el aprendizaje autonomo'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'dfernandez@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Administracion de empresas', '', '', false, 0),
    ('Administracion y direccion en empresas', '', '', false, 1),
    ('Especializacion en administracion en la informatica educativa', 'especializacion', '', false, 2),
    ('Especializacion en pedagogia para el desarrollo en el aprendizaje autonomo', 'especializacion', '', false, 3)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'dfernandez@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Diana Margarita Escobar Mendez
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Diana Margarita Escobar Mendez', 'ocasional', 'maicao', 'descobarm@uniguajira.edu.co', '', 'Maestria en gestion de la tecnologia y la innovacion'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'descobarm@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Maestria en gestion de la tecnologia y la innovacion', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'descobarm@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Diego Mauricio Madrid Orrego
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Diego Mauricio Madrid Orrego', 'ocasional', 'maicao', 'dmadrid@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001579167', 'Magister en gestión de la tecnología y la innovación'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'dmadrid@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Magister en gestión de la tecnología y la innovación', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'dmadrid@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Edilver Barros Maestre
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Edilver Barros Maestre', 'catedratico', 'riohacha', 'edilverbm@uniguajira.edu.co', '', 'Especializacion en administracion en la informatica educativa; Maestría en gestión de la tecnología educativa'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'edilverbm@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especializacion en administracion en la informatica educativa', 'especializacion', '', false, 0),
    ('Maestría en gestión de la tecnología educativa', 'maestria', '', false, 1)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'edilverbm@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Eduardo Luis Lara Ortega
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Eduardo Luis Lara Ortega', 'catedratico', 'maicao', 'eduardolara@uniguajira.edu.co', '', 'Maestria en informatica educativa; Maestria en informatica educativa'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'eduardolara@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Maestria en informatica educativa', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'eduardolara@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Eduardo Sierra Fragozo
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Eduardo Sierra Fragozo', 'ocasional', 'riohacha', 'elsierra@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0002399745', 'Magister en inteligencia artificial'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'elsierra@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Magister en inteligencia artificial', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'elsierra@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Fabio Orlando Moya Camacho
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Fabio Orlando Moya Camacho', 'planta', 'riohacha', 'fmoya@uniguajira.edu.co', '', 'Doctor en ciencias gerenciales; Magister en informática educativa; Post- Doctorado gerencia de las organizaciones'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'fmoya@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Doctor en ciencias gerenciales', 'doctorado', '', false, 0),
    ('Magister en informática educativa', 'maestria', '', false, 1),
    ('Post- Doctorado gerencia de las organizaciones', 'posdoctorado', '', false, 2)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'fmoya@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Farith Perez Saez
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Farith Perez Saez', 'planta', 'maicao', 'fperezs@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0000025448', 'Magister scientarium en telematica'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'fperezs@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Magister scientarium en telematica', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'fperezs@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Gonzalo Beltran Alvarado
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Gonzalo Beltran Alvarado', 'planta', 'riohacha', 'gbeltrana@uniguajira.edu.co', '', 'Doctorado en ciencia aplicada; Especializacion en auditoria a los sistemas en informacion; Especializacion en planeacion educativa y planes en desarrollo; Magister en informática educativa'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'gbeltrana@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Doctorado en ciencia aplicada', 'doctorado', '', false, 0),
    ('Especializacion en auditoria a los sistemas en informacion', 'especializacion', '', false, 1),
    ('Especializacion en planeacion educativa y planes en desarrollo', 'especializacion', '', false, 2),
    ('Magister en informática educativa', 'maestria', '', false, 3)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'gbeltrana@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Gustavo Javier Redondo Cujia
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Gustavo Javier Redondo Cujia', 'catedratico', 'riohacha', 'gjredondo@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001652675', 'Maestría en gestión de la tecnología y la innovación'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'gjredondo@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Maestría en gestión de la tecnología y la innovación', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'gjredondo@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Hector Jose Mejia Bueno
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Hector Jose Mejia Bueno', 'catedratico', 'riohacha', 'hjosemejia@uniguajira.edu.co', '', 'Especializacion en seguridad informatica'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'hjosemejia@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especializacion en seguridad informatica', 'especializacion', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'hjosemejia@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Henrry David Rios Meza
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Henrry David Rios Meza', 'ocasional', 'riohacha', 'hrrios@uniguajira.edu.co', '', 'Maestría en tecnología e innovación educativa'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'hrrios@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Maestría en tecnología e innovación educativa', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'hrrios@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Jaider Quintero Mendoza
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Jaider Quintero Mendoza', 'planta', 'riohacha', 'jquintero@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001440670', 'Dr Gestion de la Tecnologia y la Innovacion / Magister en Telecomunicaciones / Esp. en Gerencia Financiera'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'jquintero@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Dr Gestion de la Tecnologia y la Innovacion', 'doctorado', '', false, 0),
    ('Magister en Telecomunicaciones', 'maestria', '', false, 1),
    ('Esp. en Gerencia Financiera', 'especializacion', '', false, 2)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'jquintero@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Jair Salcedo Andrade
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Jair Salcedo Andrade', 'planta', 'riohacha', 'jairsalcedo@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001525623', 'Msc. en Informática Educativa'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'jairsalcedo@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Msc. en Informática Educativa', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'jairsalcedo@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Jenier Javier Suarez Marquez
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Jenier Javier Suarez Marquez', 'catedratico', 'riohacha', 'jjaviersuarez@uniguajira.edu.co', '', 'Maestria en gestion en la tecnologia y la innovacion'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'jjaviersuarez@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Maestria en gestion en la tecnologia y la innovacion', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'jjaviersuarez@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Jesus Gabriel Arevalo Aguilar
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Jesus Gabriel Arevalo Aguilar', 'planta', 'riohacha', 'jarevalo@uniguajira.edu.co', '', 'Ingenieria en sistemas y computacion'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'jarevalo@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Ingenieria en sistemas y computacion', '', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'jarevalo@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Jhon Jairo Suarez Bonilla
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Jhon Jairo Suarez Bonilla', 'catedratico', 'riohacha', 'jjsuarez@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001666620', 'Magister en educación - Especialista en aplicación de TIC para la enseñanza'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'jjsuarez@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Magister en educación', 'maestria', '', false, 0),
    ('Especialista en aplicación de TIC para la enseñanza', 'especializacion', '', false, 1)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'jjsuarez@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Jorge Luis Peralta Moscote
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Jorge Luis Peralta Moscote', 'catedratico', 'riohacha', 'jperalta@uniguajira.edu.co', '', 'Maestria en finanzas'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'jperalta@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Maestria en finanzas', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'jperalta@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Jorge Luis Rodriguez Zuñiga
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Jorge Luis Rodriguez Zuñiga', 'catedratico', 'maicao', 'jrodriguezz@uniguajira.edu.co', '', 'Magister en telecomunicaciones'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'jrodriguezz@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Magister en telecomunicaciones', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'jrodriguezz@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Jose de Jesus Gamez Pimienta
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Jose de Jesus Gamez Pimienta', 'catedratico', 'riohacha', 'jgamez@uniguajira.edu.co', '', 'Administracion en informatica'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'jgamez@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Administracion en informatica', '', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'jgamez@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Jose Manuel Gonzalez Perez
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Jose Manuel Gonzalez Perez', 'catedratico', 'maicao', 'jmgonzalezp@uniguajira.edu.co', '', 'Ingeniería del software y sistemas informáticos'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'jmgonzalezp@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Ingeniería del software y sistemas informáticos', '', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'jmgonzalezp@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Jose Maria Dueñas Meza
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Jose Maria Dueñas Meza', 'catedratico', 'riohacha', 'jodume@uniguajira.edu.co', '', 'Especializacion en administracion en la informatica educativa; Magister en informática educativa'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'jodume@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especializacion en administracion en la informatica educativa', 'especializacion', '', false, 0),
    ('Magister en informática educativa', 'maestria', '', false, 1)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'jodume@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Juan Camilo Suarez Cantero
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Juan Camilo Suarez Cantero', 'catedratico', 'maicao', 'jcamilosuarez@uniguajira.edu.co', '', 'Especialista en visual analytics y big data'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'jcamilosuarez@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especialista en visual analytics y big data', 'especializacion', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'jcamilosuarez@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Juan Carlos Melo Gutierrez
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Juan Carlos Melo Gutierrez', 'catedratico', 'riohacha', 'jcmelo@uniguajira.edu.co', '', ''
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'jcmelo@uniguajira.edu.co');

-- Karen Dayana Charris Miranda
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Karen Dayana Charris Miranda', 'ocasional', 'maicao', 'kdayanacharris@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0000216277', 'Especialización en Visual Analytics y Big Data'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'kdayanacharris@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especialización en Visual Analytics y Big Data', 'especializacion', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'kdayanacharris@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Katty Cecilia Herrera Estrada
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Katty Cecilia Herrera Estrada', 'planta', 'riohacha', 'katyherrera@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001449531', 'Magister en Pedagogia de las TIC, Candidata a Doctor del Doctorado en Innovacion'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'katyherrera@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Magister en Pedagogia de las TIC', 'maestria', '', false, 0),
    ('Candidata a Doctor del Doctorado en Innovacion', 'doctorado', '', true, 1)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'katyherrera@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Leaneth Rafaelina Pitre Ruiz
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Leaneth Rafaelina Pitre Ruiz', 'planta', 'riohacha', 'lrpitrer@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001568138', 'Especialista en telecomunicaciones - Magister en telematica - Doctorante en ciencia, tecnologia e innovacion'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'lrpitrer@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especialista en telecomunicaciones', 'especializacion', '', false, 0),
    ('Magister en telematica', 'maestria', '', false, 1),
    ('Doctorante en ciencia, tecnologia e innovacion', 'doctorado', '', true, 2)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'lrpitrer@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Lisseth Paola Castañeda Vega
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Lisseth Paola Castañeda Vega', 'planta', 'riohacha', 'lcastanedav@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001511642', 'DOCTORADO EN GESTION EN LA TECNOLOGIA Y LA INNOVACION; ESPECIALISTA EN GESTIÓN DE LA INNOVACIÓN TECNOLÓGICA; Magíster en Gestión Tecnológica'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'lcastanedav@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Doctorado en gestion en la tecnologia y la innovacion', 'doctorado', '', false, 0),
    ('Especialista en gestión de la innovación tecnológica', 'especializacion', '', false, 1),
    ('Magíster en Gestión Tecnológica', 'maestria', '', false, 2)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'lcastanedav@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Luis Rafael Viecco Rivadeneira
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Luis Rafael Viecco Rivadeneira', 'planta', 'riohacha', 'lviecco@uniguajira.edu.co', '', 'Especialista en redes de computadores; Gobierno de TI'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'lviecco@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especialista en redes de computadores', 'especializacion', '', false, 0),
    ('Gobierno de TI', '', '', false, 1)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'lviecco@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Margarita Hamburger Gonzalez
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Margarita Hamburger Gonzalez', 'catedratico', 'riohacha', 'mhamburger@uniguajira.edu.co', '', 'Especialista en Docencia Universitaria y Magíster en Administración y Planificación Educativa'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'mhamburger@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especialista en Docencia Universitaria', 'especializacion', '', false, 0),
    ('Magíster en Administración y Planificación Educativa', 'maestria', '', false, 1)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'mhamburger@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Marlon Rafael Alarcon Bonivento
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Marlon Rafael Alarcon Bonivento', 'catedratico', 'riohacha', 'mralarcon@uniguajira.edu.co', '', ''
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'mralarcon@uniguajira.edu.co');

-- Marlyn Alicia Aaron Gonzalvez
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Marlyn Alicia Aaron Gonzalvez', 'planta', 'riohacha', 'maaron@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0000229512', 'Maestria en pedagogia en las tecnologias en la informacion y la comunicacion'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'maaron@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Maestria en pedagogia en las tecnologias en la informacion y la comunicacion', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'maaron@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Martinez Gaitan Giovanni
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Martinez Gaitan Giovanni', 'catedratico', 'maicao', 'gmartinezg@uniguajira.edu.co', '', 'Maestría en ciencias de la educación mención gerencia educativa'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'gmartinezg@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Maestría en ciencias de la educación mención gerencia educativa', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'gmartinezg@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Miguel Humberto Romero Acuña
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Miguel Humberto Romero Acuña', 'planta', 'riohacha', 'mhromero@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001524053', 'Magister en Telemática y Telecomunicaciones'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'mhromero@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Magister en Telemática y Telecomunicaciones', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'mhromero@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Miyail Rafael Jimenez Escudero
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Miyail Rafael Jimenez Escudero', 'catedratico', 'maicao', 'mjimeneze@uniguajira.edu.co', '', 'Maestria en informatica educativa'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'mjimeneze@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Maestria en informatica educativa', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'mjimeneze@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Nayeli Mejia Riveira
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Nayeli Mejia Riveira', 'planta', 'riohacha', 'nmejia@uniguajira.edu.co', '', 'Doctora en gestión de la tecnología y la innovación; Maestria en telematica; Maestria en telematica'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'nmejia@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Doctora en gestión de la tecnología y la innovación', 'doctorado', '', false, 0),
    ('Maestria en telematica', 'maestria', '', false, 1)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'nmejia@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Nurys Correa Diaz
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Nurys Correa Diaz', 'catedratico', 'maicao', 'nacorrea@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001826827', 'Especialización en aplicación de las TIC para la enseñanza; Maestría en tecnologías digitales; Doctorado en educación'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'nacorrea@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especialización en aplicación de las TIC para la enseñanza', 'especializacion', '', false, 0),
    ('Maestría en tecnologías digitales', 'maestria', '', false, 1),
    ('Doctorado en educación', 'doctorado', '', false, 2)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'nacorrea@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Orozco Castillo Cristian
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Orozco Castillo Cristian', 'ocasional', 'riohacha', 'cforozco@uniguajira.edu.co', '', 'Especializacion en administracion en la informatica educativa; Maestria en informatica educativa'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'cforozco@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especializacion en administracion en la informatica educativa', 'especializacion', '', false, 0),
    ('Maestria en informatica educativa', 'maestria', '', false, 1)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'cforozco@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Rafael Enrique Griego Barros
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Rafael Enrique Griego Barros', 'ocasional', 'riohacha', 'regriego@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001556133', 'Maestria en gestion de la tecnologia y la innovacion'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'regriego@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Maestria en gestion de la tecnologia y la innovacion', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'regriego@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Remberto Paternina Barboza
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Remberto Paternina Barboza', 'catedratico', 'maicao', 'rpaterninab@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001665875', 'Mg. en Educación'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'rpaterninab@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Mg. en Educación', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'rpaterninab@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Robert Damian Quintero Laverde
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Robert Damian Quintero Laverde', 'ocasional', 'riohacha', 'rdamianquintero@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0002176975', 'Magister en gestion de la tecnologia y la innovacion'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'rdamianquintero@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Magister en gestion de la tecnologia y la innovacion', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'rdamianquintero@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Roger David Pimienta Barros
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Roger David Pimienta Barros', 'planta', 'riohacha', 'rdpimientab@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001613235', 'MSC. En ingeniería de control y automatización'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'rdpimientab@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('MSC. En ingeniería de control y automatización', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'rdpimientab@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Ronald Antonio Torres Mendoza
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Ronald Antonio Torres Mendoza', 'catedratico', 'maicao', 'ratorres@uniguajira.edu.co', '', 'Maestria en informatica educativa; Maestria en informatica educativa'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'ratorres@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Maestria en informatica educativa', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'ratorres@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Rosa Margarita Cuentas Hernandez
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Rosa Margarita Cuentas Hernandez', 'catedratico', 'riohacha', 'rmcuentash@uniguajira.edu.co', '', 'Especializacion en gerencia informatica; Robotica, programacion y diseño e impresion 3d aplicaddos a la educacion'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'rmcuentash@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especializacion en gerencia informatica', 'especializacion', '', false, 0),
    ('Robotica, programacion y diseño e impresion 3d aplicaddos a la educacion', '', '', false, 1)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'rmcuentash@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Ruth Paola Amaya Marmol
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Ruth Paola Amaya Marmol', 'catedratico', 'riohacha', 'ramayam@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001612744', 'Maestrante en Diseño, gestión y dirección de proyectos'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'ramayam@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Maestrante en Diseño, gestión y dirección de proyectos', 'maestria', '', true, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'ramayam@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Sandy Elena Romero Cuello
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Sandy Elena Romero Cuello', 'planta', 'riohacha', 'sromero@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001390249', 'Especialización en Administración de Empresas, Maestria en Telemática y Doctorado en Gestión de la Tecnología'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'sromero@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especialización en Administración de Empresas', 'especializacion', '', false, 0),
    ('Maestria en Telemática', 'maestria', '', false, 1),
    ('Doctorado en Gestión de la Tecnología', 'doctorado', '', false, 2)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'sromero@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Sara Luz Villero Contreras
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Sara Luz Villero Contreras', 'ocasional', 'maicao', 'svillero@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0000111593', 'MSc Gerencia de Proyectos de Investigación y Desarrollo'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'svillero@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('MSc Gerencia de Proyectos de Investigación y Desarrollo', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'svillero@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Sergio Elias Perez Camargo
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Sergio Elias Perez Camargo', 'catedratico', 'riohacha', 'seperez@uniguajira.edu.co', 'https://scienti.minciencias.gov.co/cvlac/visualizador/generarCurriculoCv.do?cod_rh=0001722704', 'Especialización en ingeniería de software'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'seperez@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especialización en ingeniería de software', 'especializacion', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'seperez@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Silfred Martinez Villanueva
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Silfred Martinez Villanueva', 'catedratico', 'riohacha', 'snmartinez@uniguajira.edu.co', '', ''
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'snmartinez@uniguajira.edu.co');

-- Slayder Dario Gutierrez Villarreal
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Slayder Dario Gutierrez Villarreal', 'ocasional', 'maicao', 'sdgutierrez@uniguajira.edu.co', '', 'Especializacion en inteligencia artificial; Maestría en gestión de la tecnología e innovación'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'sdgutierrez@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especializacion en inteligencia artificial', 'especializacion', '', false, 0),
    ('Maestría en gestión de la tecnología e innovación', 'maestria', '', false, 1)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'sdgutierrez@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Walfin Velasco Gonzalez
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Walfin Velasco Gonzalez', 'catedratico', 'riohacha', 'wvelasco@uniguajira.edu.co', '', 'Especializacion en administracion en la informatica educativa; Especializacion en auditoria en sistemas; Maestria en pedagogia en las tecnologias en la informacion y la comunicacion'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'wvelasco@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Especializacion en administracion en la informatica educativa', 'especializacion', '', false, 0),
    ('Especializacion en auditoria en sistemas', 'especializacion', '', false, 1),
    ('Maestria en pedagogia en las tecnologias en la informacion y la comunicacion', 'maestria', '', false, 2)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'wvelasco@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Yainiris Paola del Toro Mejia
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Yainiris Paola del Toro Mejia', 'catedratico', 'riohacha', 'ydel@uniguajira.edu.co', '', 'Maestria en gestion de la tecnologia y la innovacion'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'ydel@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Maestria en gestion de la tecnologia y la innovacion', 'maestria', '', false, 0)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'ydel@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);

-- Yisset Andrea Pimienta Zapata
INSERT INTO docente (nombre, vinculacion, sede, email, cvlac_url, posgrado)
SELECT 'Yisset Andrea Pimienta Zapata', 'catedratico', 'riohacha', 'ypimientaz@uniguajira.edu.co', '', 'Esp. en Gerencia en Finanzas - Esp. en Gerencia Estratégica para el Desarrollo'
 WHERE NOT EXISTS (SELECT 1 FROM docente WHERE lower(email) = 'ypimientaz@uniguajira.edu.co');
INSERT INTO docente_formacion (docente_id, titulo, nivel, institucion, anio, en_curso, orden)
SELECT d.id, t.titulo, t.nivel, t.institucion, NULL, t.en_curso, t.orden
  FROM docente d
  CROSS JOIN (VALUES
    ('Esp. en Gerencia en Finanzas', 'especializacion', '', false, 0),
    ('Esp. en Gerencia Estratégica para el Desarrollo', 'especializacion', '', false, 1)
  ) AS t(titulo, nivel, institucion, en_curso, orden)
 WHERE lower(d.email) = 'ypimientaz@uniguajira.edu.co'
   AND NOT EXISTS (SELECT 1 FROM docente_formacion f WHERE f.docente_id = d.id);
