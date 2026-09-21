# Puesta en marcha

Qué hacer después de clonar el repositorio o de traer cambios con `git pull`.

Los pasos de este documento están verificados: se ejecutaron sobre una base
vacía y sobre un clon sin los archivos que no viajan en git.

---

## Requisitos

- **Node 20** o superior.
- **PostgreSQL 16**, propio o en Docker.

Si usas Docker:

```bash
docker run --name pg-uniguajira \
  -e POSTGRES_PASSWORD=tu-contraseña \
  -p 5433:5432 -d postgres:16
```

El puerto 5433 es para no chocar con un PostgreSQL instalado en la máquina, que
suele ocupar el 5432. Usa el que te sirva y anótalo en `.env`.

---

## Primera vez

```bash
git clone <repo> && cd ing-sistemas-uniguajira/app
npm install

cp .env.example .env      # y edita PGPORT, PGPASSWORD y PGDATABASE
npm run db:setup

npm run dev
```

`db:setup` crea la base, aplica las 13 migraciones, siembra el usuario
administrador y carga el contenido inicial. Al terminar deberías ver algo así:

```
13 migracion(es) aplicada(s).
  usuario   admin@uniguajira.edu.co creado (rol admin)
  ATENCION: contraseña generada, no vuelve a mostrarse:
      ················
  docentes nuevos       31
  noticias           6 nuevas
  eventos            4 nuevas
  convocatorias      6 nuevas
  en la base: 56 materias, 169 créditos
```

> **Copia esa contraseña.** Se genera al azar y no se vuelve a mostrar. Si la
> pierdes, borra el usuario de la tabla `usuarios` y repite `npm run db:seed`.
> Puedes fijarla tú de antemano poniendo `ADMIN_PASSWORD` en `.env`.

Con eso, `npm run dev` levanta el backend en el 3001 y el front en el 5173. El
panel está en `/admin`.

---

## Después de un `git pull`

```bash
cd app
npm install        # solo si cambió package.json
npm run db:migrate # SIEMPRE que el pull traiga migraciones nuevas
```

**Ni el `pull` ni `npm run dev` aplican migraciones solos.** Si el backend
arranca contra una base sin migrar, las rutas fallan con errores de columna o
tabla inexistente.

`db:migrate` es seguro de repetir: cada migración se aplica una sola vez y
queda registrada en la tabla `_migraciones`.

Si además quieres recargar el contenido inicial (no borra nada, solo actualiza
lo que reconoce):

```bash
npm run db:importar-docentes
npm run db:importar-contenidos
npm run db:importar-pensum
```

---

## Qué hay en la base

Trece migraciones, 27 tablas. Lo que ya no vive en archivos JSON:

| Migración | Qué trae |
|---|---|
| `001_auth` | `usuarios`, `sesiones`. Login con cookie de sesión |
| `002`–`004` | Módulo Estudiantes: cuadro de honor, calendario, modalidades, documentos |
| `005_archivos_en_base` | `archivos`: los adjuntos se guardan en la base, no en disco |
| `006_docentes` | `docente` y `docente_formacion` |
| `007_contenidos` | `noticia`, `evento`, `convocatoria` |
| `008_pensum` | `materia`, `plan_estudio`, `plan_materia` |
| `009_egresados` | `egresado`, `oferta_empleo`, `postulacion`, `actualizacion_egresado` |
| `010_saberpro` | `saberpro_resultado` y `saberpro_parametros` |
| `011_infraestructura` | `recurso_infraestructura` |
| `012_plan_propuesta` | `plan_tramite`, `plan_prerrequisito` y la propuesta curricular |
| `013_grado` | `normativa_grado`, `idea_investigacion`: la vista Egresados |

Siguen en archivos JSON, por ahora: acreditación CNA, grupos y semilleros,
extensión, internacionalización, y la ficha del programa.

---

## Archivos que no viajan en git

Dos cosas están deliberadamente fuera del repositorio, y conviene saber por qué:

**El contenido publicado** (`src/data/noticias.json`, `eventos.json`,
`convocatorias.json`). Vivían en git y eso significaba que un `git pull` podía
revertir lo que alguien acabara de publicar. Ahora la verdad está en
PostgreSQL. Para poder reconstruir la base tras clonar, la copia original quedó
en `server/db/datos/*-original.json`, y de ahí la leen los importadores.

**Los archivos subidos desde el panel** (`public/images/docentes/`,
`public/images/noticias/`, `public/docs/`, `public/presentaciones/`). Son
contenido, no código. Los logos de `public/images/marca` sí están versionados.

Consecuencia práctica: al clonar verás el sitio con el contenido inicial, no
con las fotos ni los documentos que se hayan subido en otra máquina.

---

## Si algo falla

**`ECONNREFUSED` al arrancar** — PostgreSQL no responde. Revisa que el
contenedor esté arriba (`docker ps`) y que `PGPORT` de `.env` coincida con el
puerto publicado.

**`relation "..." does not exist`** — falta correr `npm run db:migrate`.

**`EADDRINUSE: port 3001`** — ya hay un backend corriendo. En Windows con WSL
puede estar dentro de WSL aunque no lo veas desde PowerShell.

**El panel muestra un aviso ámbar** diciendo que ves datos guardados en el
navegador: el backend no respondió. Lo que hay en pantalla es caché y puede
estar desactualizado; no guardes cambios hasta que vuelva la conexión.

**El panel muestra un aviso rojo** al guardar: el servidor rechazó el cambio.
El mensaje dice por qué (sesión caducada, validación, o una pestaña sin
conectar).
