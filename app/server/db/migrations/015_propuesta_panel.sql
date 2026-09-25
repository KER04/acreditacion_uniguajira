-- 015_propuesta_panel — Lo que la página de la propuesta mostraba escrito a
-- mano pasa a la base, para que el panel pueda editarlo.
--
-- Hasta ahora /pensum-propuesto traía tres cosas quemadas en el JSX: el
-- encabezado (insignia, titular y párrafo de entrada) y las tarjetas del
-- carrusel. Editarlas exigía tocar código y desplegar, que es justo lo que la
-- migración 012 vino a quitar para el resto del plan.
--
-- Las etapas del trámite ya tenían tabla desde la 012, pero no API: el panel
-- solo podía elegir cuál era la actual, no crear ni corregir ninguna. Eso se
-- resuelve en las rutas, no aquí; lo único que falta en la base es el índice
-- que ya existe y una clave de orden estable, que también está.

/* ─── Encabezado editable ───────────────────────────────────────── */

-- Cuatro columnas y no un JSON: cada una es un campo del formulario y se
-- valida por separado. Un JSON obligaría a validar la forma en la API y
-- dejaría la base sin poder exigir nada.
ALTER TABLE plan_estudio
  ADD COLUMN IF NOT EXISTS hero_insignia      TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_titulo        TEXT NOT NULL DEFAULT '',
  -- La segunda mitad del titular, la que la página pinta en color. Va aparte
  -- porque el corte es una decisión de redacción, no de maquetación: quien
  -- escribe decide dónde cambia el tono.
  ADD COLUMN IF NOT EXISTS hero_titulo_acento TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_texto         TEXT NOT NULL DEFAULT '';

COMMENT ON COLUMN plan_estudio.hero_titulo_acento IS 'Segunda mitad del titular, resaltada en color por la vista';


/* ─── Tarjetas infográficas del carrusel ────────────────────────── */

-- Cuelgan del plan y no de la propuesta en abstracto: si mañana hay una
-- segunda propuesta, cada una trae las suyas y el CASCADE las limpia.
--
-- La imagen admite dos orígenes, igual que en noticias y eventos: un archivo
-- subido al panel (imagen_id) o una ruta escrita a mano (imagen_url) para las
-- que ya viven en /public. La vista prefiere el archivo cuando existe.
CREATE TABLE IF NOT EXISTS plan_tarjeta (
  id         SERIAL PRIMARY KEY,
  plan_id    INTEGER NOT NULL REFERENCES plan_estudio(id) ON DELETE CASCADE,

  titulo     TEXT NOT NULL,
  texto      TEXT NOT NULL DEFAULT '',
  -- Pie corto en versalitas: la fuente del dato o la etapa a la que se refiere.
  pie        TEXT NOT NULL DEFAULT '',

  imagen_id  INTEGER REFERENCES archivos(id) ON DELETE SET NULL,
  imagen_url TEXT NOT NULL DEFAULT '',

  orden      SMALLINT NOT NULL DEFAULT 0,
  -- Una tarjeta se puede retirar del carrusel sin borrarla: el trámite avanza
  -- y hay mensajes que dejan de aplicar pero conviene poder devolver.
  visible    BOOLEAN NOT NULL DEFAULT TRUE,

  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT tarjeta_titulo_no_vacio CHECK (length(btrim(titulo)) >= 3),
  CONSTRAINT tarjeta_texto_razonable CHECK (length(texto) <= 600),
  CONSTRAINT tarjeta_pie_razonable   CHECK (length(pie) <= 80)
);

CREATE INDEX IF NOT EXISTS plan_tarjeta_orden_idx ON plan_tarjeta (plan_id, orden, id);

DROP TRIGGER IF EXISTS plan_tarjeta_actualizada ON plan_tarjeta;
CREATE TRIGGER plan_tarjeta_actualizada
  BEFORE UPDATE ON plan_tarjeta
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();


/* ─── El contenido que estaba en el JSX ─────────────────────────── */

-- Se copia tal cual estaba publicado para que la página no cambie al migrar.
-- Solo para el plan en trámite y solo si el campo está vacío: correr la
-- migración dos veces no pisa lo que ya editó alguien.
UPDATE plan_estudio SET
  hero_insignia = COALESCE(NULLIF(hero_insignia, ''),
    'Propuesta de actualización curricular · En trámite, no vigente'),
  hero_titulo = COALESCE(NULLIF(hero_titulo, ''), 'Ocho semestres,'),
  hero_titulo_acento = COALESCE(NULLIF(hero_titulo_acento, ''), 'un plan más corto y más denso.'),
  hero_texto = COALESCE(NULLIF(hero_texto, ''),
    'Esta es la malla que el programa propone para reemplazar la actual. Todavía está en trámite: no rige y ninguna cohorte cursa por ella. Se publica de manera abierta para que estudiantes, docentes, egresados y aspirantes puedan leerla y compararla con el plan vigente mientras avanza su aprobación.')
 WHERE NOT vigente;

-- Las cuatro tarjetas que el carrusel traía escritas en el componente. Se
-- insertan solo si el plan todavía no tiene ninguna, para no duplicarlas.
INSERT INTO plan_tarjeta (plan_id, titulo, texto, pie, imagen_url, orden)
SELECT p.id, t.titulo, t.texto, t.pie, t.imagen_url, t.orden
  FROM plan_estudio p
  CROSS JOIN (VALUES
    ('La propuesta ya está radicada',
     'El documento maestro entró al Ministerio con la malla completa, el perfil de egreso y el plan de transición entre cohortes.',
     'Documento maestro · 2025', '/images/propuesta/infografia-1.svg', 0),
    ('A la espera del concepto de pares',
     'Los pares académicos designados revisan la coherencia entre créditos, resultados de aprendizaje y horas de trabajo independiente.',
     'Aseguramiento de la calidad', '/images/propuesta/infografia-2.svg', 1),
    ('Qué cambia frente al plan vigente',
     'Menos créditos y menos asignaturas, con dos semestres menos de duración: el peso se concentra en los núcleos de software y datos.',
     'Comparación con el plan vigente', '/images/propuesta/infografia-3.svg', 2),
    ('Ninguna cohorte cursa por ella',
     'Mientras el Ministerio no expida la resolución, todas las cohortes siguen matriculando por el plan vigente sin ningún cambio.',
     'Plan vigente en curso', '/images/propuesta/infografia-4.svg', 3)
  ) AS t(titulo, texto, pie, imagen_url, orden)
 WHERE NOT p.vigente
   AND NOT EXISTS (SELECT 1 FROM plan_tarjeta x WHERE x.plan_id = p.id);
