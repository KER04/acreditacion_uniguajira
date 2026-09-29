-- 027_foto_cargo — Foto propia para las personas del organigrama de /contacto.
--
-- Hasta aquí la foto solo podía salir de la ficha del docente vinculado, así
-- que alguien que no es docente (una secretaria, un coordinador administrativo)
-- nunca tenía foto. Ahora cada cargo puede llevar la suya, guardada en la
-- tabla `archivos` como el resto de imágenes (migración 005). Si no la tiene,
-- se sigue usando la del docente vinculado.

ALTER TABLE cargo_programa
  ADD COLUMN IF NOT EXISTS foto_id BIGINT REFERENCES archivos(id) ON DELETE SET NULL;
