-- 028_lineas_investigacion — Líneas de investigación del programa.
--
-- Las diez líneas con su objetivo y sus ejes temáticos, tal como las define
-- el documento «Líneas de investigación de ingeniería de sistemas» del
-- programa. Se corrigieron solo erratas evidentes (acentos, siglas en
-- mayúscula, «matematiza», «M-learnig», «temporalis»); el resto es literal.
--
-- Es una tabla propia y no el `lineas` de grupo_investigacion: aquellas son
-- etiquetas cortas de cada grupo, estas son las líneas del programa, con un
-- objetivo y su lista de ejes. Se editan desde el panel (Funciones
-- misionales → Investigación → Líneas).

CREATE TABLE IF NOT EXISTS linea_investigacion (
  id             SERIAL PRIMARY KEY,
  nombre         TEXT        NOT NULL,
  objetivo       TEXT        NOT NULL DEFAULT '',
  -- Se lee y se escribe entera, como las líneas de un grupo.
  ejes           TEXT[]      NOT NULL DEFAULT '{}',
  orden          INTEGER     NOT NULL DEFAULT 0,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT linea_nombre_no_vacio CHECK (length(btrim(nombre)) >= 3),
  CONSTRAINT linea_orden_valido    CHECK (orden BETWEEN 0 AND 999)
);

CREATE UNIQUE INDEX IF NOT EXISTS linea_nombre_unico ON linea_investigacion (lower(btrim(nombre)));

DROP TRIGGER IF EXISTS linea_investigacion_actualizado ON linea_investigacion;
CREATE TRIGGER linea_investigacion_actualizado BEFORE UPDATE ON linea_investigacion
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();

/* Idempotente: no duplica si ya hay una línea con el mismo nombre. */
INSERT INTO linea_investigacion (orden, nombre, objetivo, ejes)
SELECT v.orden, v.nombre, v.objetivo, v.ejes
FROM (VALUES
  (1, 'Desarrollo de software y sistemas de información',
    'Propiciar la generación de conocimiento, mediante la formulación de problemas, análisis de objetivos y gestión de resultados en proyectos de investigación que involucren la utilización de las nuevas tecnologías, usando métodos y metodologías basados principalmente en modelos informáticos y matemáticos, que faciliten la comprensión de realidades en la búsqueda de los mejores resultados que contribuyan con soluciones pertinentes al desarrollo del país',
    ARRAY[
      'Desarrollo y calidad de software',
      'Ingeniería de requerimientos',
      'Gerencia y planificación de software',
      'Análisis y diseño de información',
      'Construcción y arquitectura de software',
      'Pruebas y validación de software',
      'Ingeniería de ambientes virtuales, desarrollo de software para internet y negocios electrónicos',
      'Tecnología verde',
      'Señales y sistemas'
    ]),
  (2, 'Inteligencia artificial',
    'Adquirir destrezas en el manejo y aplicación de técnicas de inteligencia artificial en el ámbito científico, industrial, educativo y social; Aportar al área de la investigación, el recurso humano y las herramientas pertinentes a su desarrollo científico y tecnológico; Cumplir con el compromiso social; Establecer y consolidar vínculos interinstitucionales que permitan fortalecer la línea de investigación de Inteligencia Artificial en el ámbito científico industrial, educativo y social.',
    ARRAY[
      'Inteligencia artificial y sistemas expertos',
      'Estrategias de navegación',
      'Aprendizaje de conductas',
      'Fusión sensorial',
      'Interfaces basados en emociones',
      'Inteligencia artificial distribuida',
      'Agentes inteligentes y sistemas multiagente',
      'Sistemas emergentes',
      'Visión artificial',
      'Segmentación',
      'Reconocimiento',
      'Tracking',
      'Visión estereoscópica',
      'Reconstrucción 3D',
      'Estrategias perceptuales',
      'Modelos temporales',
      'Estadística bayesiana',
      'Procesamiento de datos masivos'
    ]),
  (3, 'Redes y telemática',
    'Asimilar, adaptar y generar tecnologías telemáticas para aplicarlas al desarrollo de la sociedad colombiana y contribuir al avance del conocimiento en este campo; Utilizar las tecnologías telemáticas en el desarrollo de nuevos servicios de telecomunicación para los usuarios, incrementar la calidad del mismo.',
    ARRAY[
      'Redes inteligentes (arquitectura, servicios, interconexión, interoperabilidad, seguridad)',
      'Entornos de creación de servicios avanzados',
      'Portabilidad del número local',
      'Servicios avanzados de telecomunicaciones (televisión por demanda, red privada virtual, etc.)',
      'Creación de servicios multimedia sobre plataformas de red inteligente',
      'Prestación de servicios de red inteligente a través de internet'
    ]),
  (4, 'Gobernabilidad de TI',
    'Comprender y aplicar la gobernabilidad de TI como parte del gobierno corporativo. Formular e implementar un marco general de política en TI, que oriente la toma de decisiones en el área. Conocer, apropiar e implementar estándares, técnicas y modelos contemporáneos de TI que la conviertan en el factor diferenciador de las organizaciones dentro de su entorno.',
    ARRAY[
      'Gestión y seguridad de la información',
      'Gestión de calidad en las organizaciones',
      'Mejores prácticas para el gobierno y la gestión de TI',
      'Innovaciones y tendencias cibernéticas',
      'Gobierno de TI empresarial'
    ]),
  (5, 'Tecnologías de la informática y la comunicación en la educación',
    'Diseñar, desarrollar e implementar soluciones tecnológicas innovadoras que transformen los procesos de enseñanza-aprendizaje, promoviendo el acceso inclusivo, la personalización y la sostenibilidad educativa mediante la aplicación de principios de ingeniería de sistemas.',
    ARRAY[
      'Comunidades virtuales y e-learning',
      'Redes de aprendizaje',
      'Uso pedagógico de las tecnologías de la información y la comunicación',
      'B-learning',
      'M-learning',
      'Clases invertidas',
      'Tecnologías educativas',
      'Competencia digital docente',
      'Innovación educativa mediada por la tecnología digital'
    ]),
  (6, 'Gestión y aplicación de sistemas en ciencia, tecnología e innovación',
    'Fortalecer las competencias en el desarrollo, gestión e implementación de sistemas tecnológicos y de información que impulsen la innovación y el desarrollo científico, tecnológico y sostenible en distintos sectores.',
    ARRAY[
      'Redes eléctricas inteligentes (smart grids)',
      'Internet de las cosas (IoT) aplicado a la energía',
      'Sistemas de gestión energética (EMS)',
      'Algoritmos de control adaptativo',
      'Sistemas multiagente en energía',
      'Simulación y optimización de plantas de energía renovable',
      'Modelos predictivos para consumo y generación',
      'Gemelos digitales en energías renovables',
      'Sistemas SCADA en energías renovables'
    ]),
  (7, 'Auditoría y seguridad de la información',
    'Investigar y desarrollar metodologías avanzadas para la auditoría, seguridad y resiliencia de sistemas de información, con un enfoque en la detección, mitigación de amenazas cibernéticas, y el cumplimiento normativo en un entorno tecnológico en constante evolución.',
    ARRAY[
      'Integridad de sistemas',
      'Controles internos',
      'Gestión de riesgos',
      'Seguridad de sistemas',
      'Metodologías y técnicas de auditoría de seguridad',
      'Normativas y regulaciones en seguridad de la información',
      'Seguridad en infraestructuras tecnológicas',
      'Protección de datos y privacidad'
    ]),
  (8, 'Ciencia y minería de datos',
    'Investigar en el desarrollo de metodologías y tecnologías avanzadas para la gestión, procesamiento y análisis de grandes volúmenes de datos, con el fin de extraer conocimiento valioso que apoye la toma de decisiones en diversos sectores, garantizando la seguridad, privacidad y eficiencia en el manejo de la información.',
    ARRAY[
      'Técnicas de análisis descriptivo',
      'Herramientas de visualización',
      'Representación gráfica de patrones y tendencias',
      'Modelos supervisados y no supervisados',
      'Redes neuronales y aprendizaje profundo (deep learning)',
      'Evaluación y validación de modelos predictivos',
      'Algoritmos de clustering y clasificación',
      'Detección de patrones y anomalías',
      'Reglas de asociación y análisis de redes',
      'Protección de datos sensibles en entornos de big data',
      'Encriptación y control de acceso',
      'Cumplimiento normativo y gestión de riesgos'
    ]),
  (9, 'Ciencias básicas de la ingeniería',
    'Desarrollar y aplicar métodos matemáticos y físicos avanzados para resolver problemas complejos en ingeniería, con un enfoque en la mejora de la enseñanza y el aprendizaje de las ciencias básicas, la optimización de técnicas de modelado y simulación, y la integración de herramientas computacionales y estadísticas para el análisis de datos.',
    ARRAY[
      'Simulación y modelaje',
      'Modelación matemática',
      'Métodos numéricos y computacionales',
      'Teoría y aplicaciones de ecuaciones diferenciales',
      'Teoría de control y dinámica de sistemas',
      'Matemáticas aplicadas a problemas de ingeniería',
      'Ciencia de datos y machine learning en ingeniería',
      'Fundamentos de física aplicada',
      'Metodología de la investigación en ciencias básicas',
      'Educación y formación en ciencias básicas',
      'Aplicaciones de matemáticas discretas en ingeniería',
      'Estadística y análisis de datos',
      'Matemáticas y física avanzada',
      'Didáctica de las ciencias básicas'
    ]),
  (10, 'Realidad extendida (XR) y tecnologías inmersivas',
    'Investigar, desarrollar y aplicar tecnologías inmersivas avanzadas, como la Realidad Virtual, Realidad Aumentada y Realidad Mixta, con el fin de crear experiencias interactivas que mejoren la interacción humano-computadora, permitan nuevas formas de aprendizaje, entretenimiento y trabajo, y transformen la manera en que las personas interactúan con el entorno digital y físico.',
    ARRAY[
      'Realidad aumentada basada en marcadores',
      'Realidad aumentada sin marcadores',
      'Comprensión del entorno (mapeo y anclajes espaciales)',
      'Modelado 2D holográfico',
      'Modelado 3D holográfico',
      'Tecnología educativa',
      'Competencias digitales',
      'Videojuegos en 2D',
      'Videojuegos en 3D'
    ])
) AS v(orden, nombre, objetivo, ejes)
WHERE NOT EXISTS (
  SELECT 1 FROM linea_investigacion l WHERE lower(btrim(l.nombre)) = lower(btrim(v.nombre))
);
