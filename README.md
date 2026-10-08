# Ingeniería de Sistemas · Universidad de La Guajira

Sitio web del programa de **Ingeniería de Sistemas** de la Universidad de La
Guajira (SNIES 17579), pensado como vitrina pública del programa y como soporte
del proceso de **acreditación de alta calidad ante el CNA**.

En producción: **[www.uniguajiracreditacion.com](https://www.uniguajiracreditacion.com)**

El sitio tiene dos caras:

- **Pública:** programa, pensum, docentes, estudiantes, egresados, Saber Pro,
  investigación, extensión, internacionalización, convocatorias, noticias,
  contacto y los factores de acreditación con su plan de mejoramiento.
- **Panel de administración** (`/admin`): el equipo del programa edita todo ese
  contenido sin tocar código.

---

## Tecnologías

| Capa | Herramienta |
|---|---|
| Front | React 18 + React Router 6, empaquetado con Vite 5 |
| API | Node 20 + Express 4 |
| Datos | PostgreSQL 16 con `pg` y SQL plano (sin ORM) |
| Despliegue | Railway (`app/railway.json`) |

Todo el proyecto es JavaScript plano (sin TypeScript).

---

## Estructura

```
app/
├── src/                 Front en React
│   ├── pages/           Una carpeta por sección: programa, comunidad, misionales, acreditacion, admin
│   ├── components/      Piezas compartidas (Header, Footer, Portal, carruseles…)
│   ├── context/         DataContext (datos del sitio) y sesion.js (fetchApi con renovación de sesión)
│   └── styles/          tokens.css con la paleta institucional
├── server/              API en Express
│   ├── routes/          Un router por módulo
│   ├── db/migrations/   Migraciones SQL numeradas (001_…, 002_…)
│   ├── db/              migrate.js, seed.js e importadores de contenido inicial
│   └── utils/           recurso() (CRUD genérico), archivos, sesiones, contraseñas
├── shared/
│   └── validacion.js    Reglas de validación que usan TANTO el panel como la API
└── public/              Logos, imágenes de marca, vídeos y descargas estáticas
```

Fuera de `app/` hay material de apoyo que no entra en el build: el prototipo
original del diseño (`src/`, `styles/`, `Sitio Ingenieria Sistemas.html`) y
documentos fuente de la acreditación (`documentos_temp/`).

---

## Puesta en marcha

Requisitos: **Node 20+** y **PostgreSQL 16** (instalado o en Docker).

```bash
cd app
npm install
cp .env.example .env      # completar al menos PGPASSWORD (y PGPORT si no es 5432)
npm run db:setup          # crea la base, migra, siembra el admin e importa el contenido inicial
npm run dev               # API en :3001 y front en :5173
```

`db:setup` imprime **una sola vez** la contraseña generada del administrador
(`admin@uniguajira.edu.co`). Cópiala, o fíjala antes con `ADMIN_PASSWORD` en
`.env`. El panel está en `http://localhost:5173/admin`.

La guía detallada (Docker, qué hacer si algo falla, qué archivos no viajan en
git) está en **[PUESTA-EN-MARCHA.md](PUESTA-EN-MARCHA.md)**.

### Después de cada `git pull`

```bash
cd app
npm install          # si cambió package.json
npm run db:migrate   # si llegaron migraciones nuevas
```

En local, ni el `pull` ni `npm run dev` aplican migraciones solos. Si la API
responde `relation "..." does not exist`, falta este paso.

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | API con recarga + front de Vite |
| `npm run build` | Compila el front a `app/dist/` |
| `npm start` | Producción: aplica migraciones y sirve API + front compilado |
| `npm run db:migrate` | Aplica las migraciones pendientes (idempotente) |
| `npm run db:seed` | Crea el primer administrador y el contenido base |
| `npm run db:setup` | Todo lo anterior más los importadores; seguro de repetir |

---

## Cómo está organizado el código

**Sesión.** Cookie `httpOnly`, nada de JWT ni tokens en `localStorage`. Un
acceso corto de 15 minutos más un refresco rotativo. En la base solo se guarda
el SHA-256 de cada token. En el front, todas las llamadas al API pasan por
`fetchApi` (`src/context/sesion.js`), que renueva la sesión cuando hace falta.

**Archivos subidos.** Los documentos y fotos que sube el panel se guardan
**dentro de PostgreSQL** (tabla `archivos`) y se sirven por
`GET /api/archivos/:id`. Así un respaldo de la base se lleva todo, y borrar un
registro no deja enlaces rotos. Los vídeos no van a la base: se guarda el id
de YouTube o una URL externa.

**Validación.** `app/shared/validacion.js` es la única fuente de reglas. Lo
importan el formulario de React y el router de Express, y la migración repite lo
mismo como `CHECK` en la tabla.

**Datos reales, con fuente.** El contenido cargado sale de lo que publica la
universidad (informe de autoevaluación, presentaciones de los factores, páginas
oficiales). Donde no hay fuente fiable, el campo se deja vacío en vez de
inventarlo: es material que revisa el CNA.

---

## Añadir o migrar un módulo

1. Crear la migración `app/server/db/migrations/NNN_nombre.sql` con el
   **siguiente número libre**. Debe ser idempotente (`IF NOT EXISTS`), porque
   el migrador la registra en `_migraciones` y no la vuelve a correr.
2. Escribir el router en `server/routes/` usando la fábrica `recurso()` de
   `server/utils/recurso.js`.
3. Añadir el esquema de validación a `shared/validacion.js`.
4. En `src/context/DataContext.jsx`: añadir la clave a `EN_BASE` y vaciar sus
   datos de `INITIAL`. Si cambia la forma de los datos, subir la versión de la
   clave de `localStorage` (`uniguajira_data_vN`).
5. Mover la semilla a `server/db/seed.js` y borrar el JSON de `src/data/` que
   quede obsoleto.
6. Si el módulo se edita desde el panel, darle su pestaña en `src/pages/admin/`.
   Para listas sencillas sirve el formulario genérico `PanelLista.jsx`.

Siguen leyendo archivos JSON, pendientes de migrar: **acreditación** y la
**ficha del programa**.

---

## Despliegue

Railway despliega automáticamente cada push a `master`. La configuración está
en `app/railway.json`:

- **Root Directory del servicio: `app`.** En la raíz del repo no hay
  `package.json`, así que sin esto la compilación falla en segundos.
- Build: `npm run build`. Arranque: `npm start`, que corre las migraciones antes
  de levantar el servidor.
- Healthcheck: `GET /api/programa`.

Variables de entorno en Railway:

| Variable | Para qué |
|---|---|
| `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` | Conexión al Postgres del proyecto |
| `NODE_ENV=production` | La pone `npm start` |
| `STORAGE_DIR` | Ruta del volumen persistente. Lo que el panel escribe a disco sobrevive a los redespliegues |
| `SESSION_*`, `REFRESH_*` | Opcionales; ver `app/.env.example` |

`.env` nunca se sube al repositorio.

---

## Créditos

Desarrollado por estudiantes del programa de Ingeniería de Sistemas de la
Universidad de La Guajira. La identidad visual (paleta, tipografías Montserrat
y Roboto, logos) es la publicada por la universidad. Las fotos de países en
`public/images/paises/` son de Wikimedia Commons con licencia libre; sus
créditos se muestran en el sitio.
