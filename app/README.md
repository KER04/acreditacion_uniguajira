# Ingeniería de Sistemas · UniGuajira — Ajustes del 9 de septiembre de 2026

Registro de todo lo que se tocó en la jornada del **9 de septiembre de 2026**
(sesión de 18:59 a 01:20 del día siguiente).

El hilo conductor del día fue sacar el proyecto del modo "todo quemado en el
código": el token de administrador, los datos del módulo Estudiantes y los
archivos adjuntos dejaron de vivir en el bundle o en el disco y pasaron a
**PostgreSQL**.

---

## 1. Base de datos: PostgreSQL entra al proyecto

Hasta ayer el backend leía y escribía archivos JSON en `src/data/`. Ahora hay
una base real detrás, con migraciones versionadas y semilla idempotente.

**Piezas nuevas**

| Archivo | Qué hace |
|---|---|
| [app/server/db/pool.js](app/server/db/pool.js) | Pool de `pg` configurado por `.env`, helper `query()`, `withTransaction()` y `checkConnection()` |
| [app/server/db/create.js](app/server/db/create.js) | Crea la base si no existe (se conecta a `postgres` porque `CREATE DATABASE` no corre desde dentro de sí misma) |
| [app/server/db/migrate.js](app/server/db/migrate.js) | Corre las migraciones pendientes en orden alfabético; cada una en su transacción y registrada en `_migraciones` |
| [app/server/db/seed.js](app/server/db/seed.js) | Primer administrador + contenido inicial del módulo Estudiantes. Idempotente: no duplica |
| [app/server/db/importar-docentes.js](app/server/db/importar-docentes.js) | Importa la planilla de docentes de la facultad, normalizando nombres y desglosando la formación. Idempotente: identifica por correo, así que reimportar actualiza en vez de duplicar |
| [app/server/db/datos/docentes-planilla.json](app/server/db/datos/docentes-planilla.json) | La planilla misma, versionada. Es la fuente con la que se pobló el directorio; estar en el repo es lo que hace que `db:setup` deje la base igual en cualquier máquina |

**Scripts de npm añadidos** en [app/package.json](app/package.json):

```
npm run db:create            # crea la base
npm run db:migrate           # aplica migraciones pendientes
npm run db:seed              # siembra admin y contenido inicial
npm run db:importar-docentes # carga el directorio docente desde la planilla versionada
npm run db:setup             # los cuatro de corrido
```

Tras un `git pull` que traiga migraciones nuevas hay que correr `npm run db:migrate`
a mano: ni el pull ni `npm run dev` lo hacen solos. `db:setup` es seguro de
repetir —los cuatro pasos son idempotentes— así que ante la duda, ese.

El importador acepta otra planilla como argumento y tiene modo de prueba:

```
npm run db:importar-docentes -- --simular            # muestra qué haría, sin escribir
npm run db:importar-docentes -- planilla-nueva.json  # importa otra planilla
```

**Dependencias nuevas:** `pg`, `dotenv`, `cookie-parser`, `multer`.

### Migraciones

- **[001_auth.sql](app/server/db/migrations/001_auth.sql)** — tablas `usuarios` y
  `sesiones`. Índice único sobre `lower(email)`, roles restringidos a
  `admin | editor | docente`, y la función `tocar_actualizado_en()` que reutilizan
  todas las tablas para mantener `actualizado_en`.
- **[002_estudiantes.sql](app/server/db/migrations/002_estudiantes.sql)** — los
  cuatro bloques del módulo: `cuadro_honor`, `calendario_academico`,
  `modalidades_grado` y `documentos_estudiantes`.
- **[003_tipos_estudiantes.sql](app/server/db/migrations/003_tipos_estudiantes.sql)** —
  corrección de tipos para que la columna diga la verdad sobre el dato:
  `semestre` pasa de `TEXT` (un `8º` que era un número disfrazado de texto) a
  `SMALLINT` con rango 1–10, el período se restringe al formato `2026-I` /
  `2026-II`, y se prohíben nombres y títulos vacíos.
- **[004_tipos_documento.sql](app/server/db/migrations/004_tipos_documento.sql)** —
  se amplía `documentos_estudiantes.tipo` con `XLS`, `PPT` y `PPTX`: la subida ya
  los aceptaba, pero la restricción los rechazaba al guardar.
- **[005_archivos_en_base.sql](app/server/db/migrations/005_archivos_en_base.sql)** —
  tabla única `archivos` (contenido en base64) más `documentos_honor`, y las
  columnas `archivo_id` / `foto_id` que la referencian.
- **[006_docentes.sql](app/server/db/migrations/006_docentes.sql)** — el cuerpo
  docente sale de `src/data/docentes.json` y pasa a la base, en dos tablas:
  `docente` y `docente_formacion`. La formación va aparte porque es una lista
  por persona y venía aplastada en un solo campo de texto; separarla permite
  contar doctorados y maestrías —lo que pide el Factor 3 del CNA— sin analizar
  cadenas. El texto original de la planilla se conserva en `docente.posgrado`.

  Las fotos **no** llegan por aquí: en la planilla son enlaces de Google Drive,
  no imágenes, así que hay que subirlas desde el panel de administración.

### Configuración

Nuevo [app/.env.example](app/.env.example) con la conexión a PostgreSQL, el
nombre y duración de la cookie de sesión, y las credenciales del primer
administrador (solo las usa `db:seed`).

---

## 2. Autenticación real: se elimina el token quemado

Antes el panel se abría comparando la cadena `sistemas2024`, que además viajaba
dentro del bundle del cliente. Eso desapareció.

- **[app/server/utils/password.js](app/server/utils/password.js)** — hash con
  **scrypt** del core de Node (sin sumar `bcrypt` como dependencia). Formato
  `scrypt$N$r$p$salt$hash`: guardar los parámetros junto al hash permite subir el
  coste más adelante sin invalidar las contraseñas ya existentes. La verificación
  usa `timingSafeEqual`.
- **[app/server/utils/sesiones.js](app/server/utils/sesiones.js)** — sesiones en
  base de datos. El navegador solo recibe un token aleatorio en cookie
  `httpOnly` + `sameSite: lax`; en la tabla se guarda **únicamente su SHA-256**,
  así que un dump de la base no permite suplantar a nadie.
- **[app/server/middleware/auth.js](app/server/middleware/auth.js)** —
  `cargarUsuario` (resuelve `req.usuario` sin cortar las peticiones públicas),
  `requireAuth`, `requireRol(...)` y `requireAdmin`.
- **[app/server/routes/auth.js](app/server/routes/auth.js)** — `POST /login`,
  `POST /logout`, `GET /me`, `POST /password`. Incluye:
  - freno a la fuerza bruta: 5 intentos por IP+correo en ventana de 15 min → 429;
  - **hash señuelo**, para que un correo inexistente tarde lo mismo que una
    contraseña equivocada y no se puedan enumerar las cuentas registradas;
  - al cambiar la contraseña se cierran todas las demás sesiones del usuario.

**Front:** nueva pantalla [app/src/pages/admin/Login.jsx](app/src/pages/admin/Login.jsx),
y [app/src/pages/admin/index.jsx](app/src/pages/admin/index.jsx) consulta
`/api/auth/me` al montar (la cookie es invisible para JavaScript, así que la
única forma de saber si la sesión sigue abierta es preguntárselo al servidor).

---

## 3. Módulo Estudiantes migrado a la base

[app/server/routes/estudiantes.js](app/server/routes/estudiantes.js) reemplaza al
JSON. Se eliminó `src/data/estudiantes.json`, y las modalidades de grado y los
documentos —que estaban escritos a mano dentro del propio componente de React,
donde nadie podía editarlos sin tocar código— ahora se administran desde el panel.

- CRUD genérico (`GET/POST/PATCH/DELETE`) montado sobre cada una de las cuatro tablas.
- `bloquesEstudiantes()` sirve los cuatro bloques de una vez; lo consumen tanto
  `GET /api/estudiantes` como el endpoint agregado `/api/all`.
- Los errores del motor (violación de CHECK, de FK, etc.) se traducen a mensajes
  que el panel puede mostrar, en vez de un 500 opaco.
- `to_char` en las consultas de fecha, para que el driver no convierta `DATE` en
  un `Date` de la zona local y corra los días.

Panel rehecho en [app/src/pages/admin/tabs/TabEstudiantes.jsx](app/src/pages/admin/tabs/TabEstudiantes.jsx)
y vista pública en [app/src/pages/comunidad/Estudiantes.jsx](app/src/pages/comunidad/Estudiantes.jsx)
(podio, tabla, ficha individual con foto y documentos descargables, filtro por
los períodos que existen de verdad en la base).

---

## 4. Validación compartida entre panel y API

Nuevo [app/shared/validacion.js](app/shared/validacion.js): un solo archivo, sin
nada de Node ni de navegador, que importan **tanto React como Express**. Si el
formulario y el servidor validaran por separado, tarde o temprano uno aceptaría
lo que el otro rechaza.

Contiene los rangos del dominio (semestre 1–10, promedio 0–5, sedes, tipos de
calendario y de documento), validadores que devuelven `null` o un mensaje en
español, los `ESQUEMAS` por recurso, las `REGLAS_CRUZADAS`, y utilidades como
`pesoLegible()`, `nombreDesdeArchivo()`, `tipoDesdeArchivo()` y `ordinalSemestre()`.

Las tres capas quedan alineadas: formulario → esquema compartido → restricción
`CHECK` en la tabla como última red.

---

## 5. Archivos guardados dentro de PostgreSQL

Los adjuntos ya no quedan sueltos en `public/docs/`. El motivo: un respaldo de la
base se lleva todo, y borrar un registro ya no deja un archivo huérfano ni un
enlace roto apuntando a un fichero que no existe.

- **[app/server/utils/archivos.js](app/server/utils/archivos.js)** — multer en
  memoria; el buffer va directo a la columna `contenido` en base64 (Postgres la
  comprime de forma transparente vía TOAST). Límites: 10 MB para documentos,
  3 MB para fotos. Incluye `borrarSiHuerfano()` y `borrarHuerfanosAntiguos()`
  para los adjuntos que quedan sin dueño cuando alguien sube algo y luego no
  llega a guardar el formulario.
- **[app/server/routes/archivos.js](app/server/routes/archivos.js)** —
  `GET /api/archivos/:id` (inline) y `/:id/descargar` (attachment). Público a
  propósito: son los documentos y las fotos que el sitio muestra. El nombre va en
  `filename*` (RFC 5987) para que las tildes sobrevivan, y el `Cache-Control` es
  inmutable porque el contenido de un id nunca cambia.
- Corregido un bug de nombres: busboy entrega el original en latin1, así que
  `Guía.pdf` llegaba como `GuÃ­a.pdf` (`nombreOriginalUtf8`).
- En [app/server/middleware/upload.js](app/server/middleware/upload.js) se añadió
  `fijarTipo`: sin él multer caía en `images/general` mientras el endpoint
  devolvía `/docs/estudiantes/...`, o sea que el archivo se guardaba en un sitio
  y el enlace apuntaba a otro.

---

## 6. Servidor: arranque, CORS y manejo de errores

En [app/server/index.js](app/server/index.js):

- `cors` con `credentials: true` y `cookie-parser`; `cargarUsuario` corre antes
  de cualquier ruta.
- Proxy de Vite hacia `:3001` en [app/vite.config.js](app/vite.config.js), para
  que el front y la API queden en el mismo origen y la cookie viaje sola.
- Al arrancar: verifica la conexión a PostgreSQL y avisa con un mensaje claro si
  falla, limpia las sesiones caducadas y barre los archivos huérfanos. El barrido
  se repite cada 24 h con un timer `unref()`, que no impide apagar el proceso.
- **Manejador de errores** al final: Express 4 no captura los rechazos de
  promesas por su cuenta, así que un handler async que fallara devolvía un stack
  en HTML. Ahora responde JSON y respeta el código del middleware (400 para un
  JSON mal formado, en vez de disfrazarlo de fallo del servidor).

---

## 7. Identidad visual institucional

- Logos y favicon reales en `app/public/images/marca/`: `logo-horizontal.webp`,
  `logo-vertical.webp`, `logo-50-anios.webp` y `favicon.webp`.
- [app/index.html](app/index.html): título y descripción del programa (SNIES
  17579), favicon, `theme-color` `#01616c` y las tipografías institucionales
  Montserrat (texto) y Roboto (títulos).
- [app/src/styles/tokens.css](app/src/styles/tokens.css) reescrito con los valores
  de la identidad publicada: teal `#62a9b6`, cabecera `#01616c`, terracota
  `#cc5e50`, ámbar `#f5a539`, página en gris muy claro con las tarjetas en blanco
  (al revés de la relación que tenía el tema crema anterior). Se conservaron los
  **nombres** de las variables para no romper los cientos de usos repartidos por
  los componentes: solo cambian los valores.
- [app/src/components/Header.jsx](app/src/components/Header.jsx) usa el logo
  institucional en su versión blanca, la pensada para fondo teal.
- [app/src/components/Icons.jsx](app/src/components/Icons.jsx): set de iconos SVG
  centralizado.

---

## 8. Corrección de los modales fuera de pantalla

Nuevo [app/src/components/Portal.jsx](app/src/components/Portal.jsx), aplicado en
[Estudiantes.jsx](app/src/pages/comunidad/Estudiantes.jsx),
[Pensum.jsx](app/src/pages/programa/Pensum.jsx) y
[Programa.jsx](app/src/pages/programa/Programa.jsx).

Las páginas llevan la animación `.page-in`, y en Chrome un elemento con animación
sobre `transform` y `fill-mode: forwards` sigue siendo bloque contenedor aunque su
estado final sea `transform: none`. Un overlay `fixed` dentro de la página se
posicionaba entonces respecto a la página y no a la ventana, y aparecía desplazado
o fuera de la pantalla según el scroll. El portal monta los modales directamente
en `<body>`.

---

## 9. Errores de guardado visibles en el panel

Antes los fallos de guardado morían en un `catch` vacío y el usuario no se
enteraba de nada. [app/src/context/DataContext.jsx](app/src/context/DataContext.jsx)
guarda el último error y [app/src/pages/admin/index.jsx](app/src/pages/admin/index.jsx)
lo muestra en un aviso descartable (sesión caducada, validación rechazada,
backend caído).

El contexto también distingue ahora qué claves ya viven en PostgreSQL (`EN_BASE`)
y cuáles siguen en JSON, y para las primeras relee la colección desde la base tras
cada cambio, para recibir ids, orden y campos calculados.

---

## Cómo levantar el proyecto después de estos cambios

```bash
cd app
cp .env.example .env      # completar PGPASSWORD y ADMIN_PASSWORD
npm install
npm run db:setup          # crea la base + migra + siembra + importa docentes
npm run dev               # backend en :3001 y front en :5173
```

Si ya tenías la base creada y solo estás actualizando tras un `git pull`:

```bash
cd app
npm install
npm run db:setup          # es idempotente: aplica lo que falte y no duplica nada
npm run dev
```

---

## Lo que quedó pendiente

- Once routers siguen leyendo de archivos JSON (`docentes`, `egresados`,
  `noticias`, `convocatorias`, `eventos`, `programa`, `sedes`, `acreditacion`,
  `investigacion`, `extension`, `internacionalizacion`). Por eso se conservó el
  nombre `requireAdmin` en el middleware: es el que todos ellos importan.
- El endpoint genérico `POST /api/upload/:tipo` todavía escribe a disco; solo el
  módulo Estudiantes usa el guardado en base.
- Los roles `editor` y `docente` existen en la restricción de la tabla `usuarios`,
  pero aún no tienen permisos diferenciados.
