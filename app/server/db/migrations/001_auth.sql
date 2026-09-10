-- 001_auth — Usuarios del panel y sesiones respaldadas por cookie httpOnly.
-- Reemplaza el token quemado 'sistemas2024' que vivía en el código fuente.

-- Marca actualizado_en en cada UPDATE. La reutilizan todas las tablas.
CREATE OR REPLACE FUNCTION tocar_actualizado_en() RETURNS TRIGGER AS $fn$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS usuarios (
  id             SERIAL PRIMARY KEY,
  email          TEXT        NOT NULL,
  nombre         TEXT        NOT NULL,
  password_hash  TEXT        NOT NULL,
  rol            TEXT        NOT NULL DEFAULT 'admin',
  activo         BOOLEAN     NOT NULL DEFAULT TRUE,
  ultimo_acceso  TIMESTAMPTZ,
  creado_en      TIMESTAMPTZ NOT NULL DEFAULT now(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT usuarios_rol_valido CHECK (rol IN ('admin', 'editor', 'docente')),
  CONSTRAINT usuarios_email_con_formato CHECK (position('@' IN email) > 1)
);

-- El correo identifica al usuario y no distingue mayúsculas.
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_email_unico ON usuarios (lower(email));

DROP TRIGGER IF EXISTS usuarios_actualizado ON usuarios;
CREATE TRIGGER usuarios_actualizado BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION tocar_actualizado_en();

-- Una fila por sesión abierta. Guardamos el SHA-256 del token, nunca el token:
-- si alguien lee la tabla no puede suplantar a nadie.
CREATE TABLE IF NOT EXISTS sesiones (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id INTEGER     NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash TEXT        NOT NULL UNIQUE,
  expira_en  TIMESTAMPTZ NOT NULL,
  user_agent TEXT,
  ip         TEXT,
  creada_en  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sesiones_usuario_idx ON sesiones (usuario_id);
CREATE INDEX IF NOT EXISTS sesiones_expira_idx  ON sesiones (expira_en);
