-- 020_refresh_tokens — Sesión corta + token de refresco con rotación.
--
-- Hasta aquí una sola cookie valía 7 días: si alguien la copiaba (un equipo
-- compartido, una extensión maliciosa, un proxy) tenía el panel una semana
-- entera y nada lo delataba. Ahora son dos piezas:
--
--   · `sesiones` pasa a ser el token de ACCESO: vive minutos y viaja en cada
--     petición a la API.
--   · `refresh_tokens` guarda el token de REFRESCO: vive días, solo viaja a
--     /api/auth y se cambia por uno nuevo cada vez que se usa (rotación).
--
-- Todos los refrescos que nacen de un mismo login forman una FAMILIA. Si
-- aparece un refresco que ya se había cambiado, alguien más tiene una copia:
-- se revoca la familia entera y los dos, dueño e intruso, vuelven al login.
-- Como en `sesiones`, se guarda el SHA-256 del token, nunca el token.

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id        INTEGER     NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  familia           UUID        NOT NULL,
  token_hash        TEXT        NOT NULL UNIQUE,
  -- Caducidad por inactividad: cada rotación la empuja hacia delante...
  expira_en         TIMESTAMPTZ NOT NULL,
  -- ...pero nunca más allá de esta, fijada en el login. Sin tope, un panel
  -- que se usa a diario no volvería a pedir contraseña jamás.
  familia_expira_en TIMESTAMPTZ NOT NULL,
  -- Cuándo se cambió por el siguiente. Un token con esto relleno que vuelve a
  -- presentarse es la señal de robo.
  usado_en          TIMESTAMPTZ,
  revocado_en       TIMESTAMPTZ,
  user_agent        TEXT,
  ip                TEXT,
  creado_en         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT refresh_tope_coherente CHECK (expira_en <= familia_expira_en)
);

CREATE INDEX IF NOT EXISTS refresh_usuario_idx ON refresh_tokens (usuario_id);
CREATE INDEX IF NOT EXISTS refresh_familia_idx ON refresh_tokens (familia);
CREATE INDEX IF NOT EXISTS refresh_expira_idx  ON refresh_tokens (familia_expira_en);

-- La sesión de acceso sabe de qué familia salió, para poder matarla junto con
-- ella al cerrar sesión o al detectar un robo. NULL en las sesiones que ya
-- existían antes de esta migración: caducan solas.
ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS familia UUID;
CREATE INDEX IF NOT EXISTS sesiones_familia_idx ON sesiones (familia);
