/* New standalone pages: Resoluciones, Dirección/Contacto, Extensión, Internacionalización, Convocatorias */

const { useState: useStateN } = React;

// ========== RESOLUCIONES (página independiente) ==========
function ProgramaResolucionesPage() {
  const docs = [
    { eyebrow: "Registro calificado", t: "Resolución N.º 02872", d: "21 de febrero de 2018", vig: "7 años", body: "Otorgamiento del registro calificado al programa de Ingeniería de Sistemas de la Universidad de La Guajira por parte del Ministerio de Educación Nacional (MEN).", color: "var(--ug-azul)", autoridad: "Ministerio de Educación Nacional" },
    { eyebrow: "Acreditación de alta calidad", t: "Resolución N.º 014528", d: "28 de julio de 2022", vig: "6 años", body: "Otorgamiento de la acreditación de alta calidad por el CNA. Reconocimiento a la calidad académica, investigativa y de extensión del programa de Ingeniería de Sistemas.", color: "var(--ug-amarillo)", autoridad: "Consejo Nacional de Acreditación (CNA)" },
  ];
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: "clamp(60px, 8vw, 110px)" }}>
        <div className="inner">
          <div className="eyebrow">Programa · Resoluciones</div>
          <h1 style={{ marginTop: 14, maxWidth: "20ch" }}>Marco legal del programa.</h1>
          <p style={{ fontSize: 18, color: "var(--ink-2)", marginTop: 24, maxWidth: "58ch" }}>
            Actos administrativos que respaldan la oferta académica de Ingeniería de Sistemas ante el Ministerio de Educación Nacional y el sistema de aseguramiento de la calidad.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 32 }}>
            <div className="chip"><b style={{ marginRight: 6 }}>SNIES</b> 17579</div>
            <div className="chip">Registro vigente</div>
            <div className="chip">Acreditado en alta calidad</div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="inner">
          <div className="grid-2">
            {docs.map((d, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: "hidden", background: "var(--paper-2)" }}>
                <div style={{ height: 140, background: d.color, padding: 24, color: "var(--ug-negro)", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
                  <WayuuBackdrop variant="a" />
                  <div style={{ position: "relative", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase" }}>{d.eyebrow}</div>
                  <div style={{ position: "relative", fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 600, letterSpacing: "-0.02em" }}>{d.t}</div>
                </div>
                <div style={{ padding: 28 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".1em", color: "var(--ink-3)", textTransform: "uppercase" }}>Fecha · {d.d}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".1em", color: "var(--ink-3)", textTransform: "uppercase", marginTop: 6 }}>Vigencia · {d.vig}</div>
                  <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 10 }}>{d.autoridad}</div>
                  <p style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 18, marginBottom: 22 }}>{d.body}</p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button className="btn" style={{ padding: "8px 16px", fontSize: 13 }}><I.download /> Descargar PDF</button>
                    <button className="btn ghost" style={{ padding: "8px 16px", fontSize: 13 }}><I.external /> Ver en SACES</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Otros actos administrativos</div>
              <h2>Resoluciones rectorales y del consejo académico.</h2>
            </div>
          </div>
          <div style={{ background: "var(--paper)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1.8fr 1fr auto", padding: "14px 24px", background: "var(--paper-2)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--ink-3)" }}>
              <div>Documento</div><div>Asunto</div><div>Fecha</div><div></div>
            </div>
            {[
              { t: "Acuerdo Consejo Académico 045/2024", a: "Aprobación reforma curricular Ingeniería de Sistemas", f: "Ago 2024" },
              { t: "Resolución Rectoral 0238/2024", a: "Adopción del PEP actualizado", f: "Oct 2024" },
              { t: "Acuerdo Consejo Superior 018/2021", a: "Reglamento estudiantil vigente", f: "Jun 2021" },
              { t: "Resolución Rectoral 0412/2023", a: "Designación del director del programa", f: "Nov 2023" },
              { t: "Acuerdo Consejo Académico 012/2023", a: "Política de opciones de grado", f: "Mar 2023" },
              { t: "Resolución MEN 014528/2022", a: "Acreditación de alta calidad", f: "Jul 2022" },
              { t: "Resolución MEN 02872/2018", a: "Registro calificado del programa", f: "Feb 2018" },
            ].map((r, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2.2fr 1.8fr 1fr auto", padding: "16px 24px", alignItems: "center", borderTop: "1px solid color-mix(in oklab, var(--ink) 7%, transparent)", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 6, background: "var(--paper-2)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, color: "var(--ink-3)" }}>PDF</div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{r.t}</div>
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{r.a}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>{r.f}</div>
                <button className="btn ghost" style={{ padding: "6px 14px", fontSize: 13 }}><I.download /></button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ========== DIRECCIÓN Y CONTACTO (página independiente) ==========
function ProgramaContactoPage() {
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: "clamp(60px, 8vw, 110px)" }}>
        <div className="inner">
          <div className="eyebrow">Programa · Dirección y contacto</div>
          <h1 style={{ marginTop: 14, maxWidth: "18ch" }}>Adanud Segundo Meza Valle</h1>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: ".15em", color: "var(--ink-3)", textTransform: "uppercase", marginTop: 12 }}>Director · Ingeniería de Sistemas</div>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 60, marginTop: 60, alignItems: "start" }} className="programa-grid">
            <div>
              <p style={{ fontSize: 17, color: "var(--ink-2)" }}>
                Lidera la gestión académica, la autoevaluación con fines de acreditación, la coordinación de los comités curricular y de autoevaluación, y la articulación del programa con las funciones misionales de la Universidad de La Guajira.
              </p>
              <p style={{ fontSize: 17, color: "var(--ink-2)", marginTop: 18 }}>
                Desde la dirección se impulsa el plan de mejoramiento 2022–2026, la ejecución de la reforma curricular y la consolidación de alianzas con el sector externo para prácticas, proyectos y transferencia tecnológica.
              </p>
              <div style={{ marginTop: 36, padding: 28, background: "var(--paper-2)", borderRadius: 14 }}>
                <div className="eyebrow">Horario de atención a estudiantes</div>
                <div style={{ marginTop: 14, fontSize: 15, color: "var(--ink-2)", lineHeight: 1.8 }}>
                  <b>Lunes a viernes</b> · 8:00 a. m. – 12:00 m. y 2:00 p. m. – 5:30 p. m.<br/>
                  <b>Cita previa:</b> Sec. Académica · <span style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>ext. 241</span>
                </div>
              </div>
            </div>
            <div className="card" style={{ background: "var(--paper-2)", padding: 32 }}>
              <div className="eyebrow">Contacto institucional</div>
              <dl style={{ margin: "22px 0 0", display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  ["Correo", "ingsistemas@uniguajira.edu.co"],
                  ["Dirección", "direccion.is@uniguajira.edu.co"],
                  ["Teléfono", "+57 (605) 7282729"],
                  ["Extensiones", "240, 241"],
                  ["Sede", "Bloque 1 — segundo piso"],
                  ["Dirección física", "Km 3+354 Vía Maicao"],
                  ["Ciudad", "Riohacha, La Guajira"],
                  ["Código postal", "440003"],
                ].map(([k,v]) => (
                  <div key={k} style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 16, fontSize: 14, paddingBottom: 12, borderBottom: "1px solid color-mix(in oklab, var(--ink) 7%, transparent)" }}>
                    <dt style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase" }}>{k}</dt>
                    <dd style={{ margin: 0, fontWeight: 500, wordBreak: "break-word" }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Estructura del programa</div>
              <h2>Equipo directivo y de coordinación.</h2>
            </div>
          </div>
          <div className="grid-4">
            {[
              { n: "Adanud S. Meza Valle", r: "Director del programa", e: "direccion.is@uniguajira.edu.co", ext: "240", color: "var(--ug-azul)" },
              { n: "Claudia Mendoza", r: "Secretaria académica", e: "secretariais@uniguajira.edu.co", ext: "241", color: "var(--ug-amarillo)" },
              { n: "Dra. Luz Marina Ipuana", r: "Coord. autoevaluación CNA", e: "autoevaluacion.is@uniguajira.edu.co", ext: "245", color: "var(--ug-flamingo)" },
              { n: "Dr. Héctor Brito Mendoza", r: "Coord. investigación · GITUG", e: "hbrito@uniguajira.edu.co", ext: "248", color: "var(--ug-marino)" },
              { n: "MSc. Andrea Bolaños Curvelo", r: "Coord. extensión y semilleros", e: "abolanos@uniguajira.edu.co", ext: "249", color: "var(--ug-azul)" },
              { n: "MSc. Jorge Epieyú Palmar", r: "Coord. currículo", e: "curriculo.is@uniguajira.edu.co", ext: "246", color: "var(--ug-amarillo)" },
            ].map((p, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: "hidden", background: "var(--paper)" }}>
                <div style={{ aspectRatio: "4/3", background: p.color, position: "relative", display: "grid", placeItems: "center" }}>
                  <WayuuBackdrop variant="a" />
                  <div style={{ position: "relative", fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 600, color: "var(--ug-negro)" }}>
                    {p.n.split(" ").map(w => w[0]).filter(c => /[A-ZÁÉÍÓÚ]/.test(c)).slice(0,2).join("")}
                  </div>
                </div>
                <div style={{ padding: 18 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--ink-3)" }}>{p.r}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, marginTop: 6 }}>{p.n}</div>
                  <div className="rule" style={{ margin: "12px 0 10px" }} />
                  <div style={{ fontSize: 11, color: "var(--ink-2)", wordBreak: "break-word" }}>✉ {p.e}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-2)", marginTop: 4, fontFamily: "var(--font-mono)" }}>☎ ext. {p.ext}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">¿Cómo llegar?</div>
              <h2>Sede UniGuajira · Riohacha.</h2>
            </div>
          </div>
          <div className="grid-2">
            <div className="card" style={{ padding: 0, overflow: "hidden", aspectRatio: "4/3", background: "var(--ug-azul-soft)", position: "relative" }}>
              <WayuuBackdrop variant="b" />
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", padding: 30 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, color: "var(--ug-negro)" }}>Bloque 1 · 2.º piso</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: ".15em", color: "var(--ug-negro)", marginTop: 10, opacity: .75 }}>KM 3+354 · VÍA MAICAO</div>
                  <div style={{ marginTop: 24 }}>
                    <button className="btn" style={{ padding: "10px 18px", fontSize: 13 }}><I.external /> Abrir en Google Maps</button>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { t: "En carro particular", d: "Desde el centro de Riohacha, tomar la vía a Maicao y avanzar 3,3 km. La entrada principal queda a la derecha." },
                { t: "Transporte público", d: "Rutas urbanas desde el Parque Padilla y la Av. Los Estudiantes hasta el portal universitario." },
                { t: "Para visitantes externos", d: "Registrar la visita en portería con identificación. Parqueadero gratuito disponible." },
              ].map((x, i) => (
                <div key={i} className="card" style={{ background: "var(--paper-2)" }}>
                  <div className="eyebrow" style={{ color: "var(--accent-deep)" }}>● {x.t}</div>
                  <p style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 10 }}>{x.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ========== EXTENSIÓN Y PROYECCIÓN SOCIAL ==========
function Extension() {
  const convenios = [
    { emp: "Cluster TIC Caribe", tipo: "Empresarial", desde: "2022", focus: "Prácticas profesionales, proyectos de innovación abierta, bolsa de empleo.", color: "var(--ug-azul)" },
    { emp: "Alcaldía de Riohacha", tipo: "Público", desde: "2023", focus: "Consultoría en transformación digital municipal y ciberseguridad.", color: "var(--ug-amarillo)" },
    { emp: "Alcaldía de Manaure", tipo: "Público", desde: "2024", focus: "Monitoreo IoT de salinas y datos territoriales.", color: "var(--ug-flamingo)" },
    { emp: "Ecopetrol Digital", tipo: "Empresarial", desde: "2023", focus: "Prácticas de datos, ciberseguridad industrial, cátedras.", color: "var(--ug-marino)" },
    { emp: "Fundación Activos Colombia", tipo: "Tercer sector", desde: "2022", focus: "Proyectos sociales con ingeniería de datos para organizaciones sin ánimo de lucro.", color: "var(--ug-azul)" },
    { emp: "Cámara de Comercio de La Guajira", tipo: "Empresarial", desde: "2021", focus: "Digitalización de microempresas y acompañamiento en modelos de negocio TIC.", color: "var(--ug-amarillo)" },
  ];
  const proyectos = [
    { t: "ArenaNet", d: "Red IoT de monitoreo de salinas en Manaure con aliado municipal.", i: "6 comunidades · 48 sensores", color: "var(--ug-amarillo)" },
    { t: "CaboTour", d: "Plataforma de rutas turísticas para el Cabo de la Vela con impacto comunitario.", i: "4 posadas · 380 visitantes", color: "var(--ug-azul)" },
    { t: "MercadoGuajira", d: "Marketplace digital para artesanas wayuu del corregimiento de Aremasain.", i: "42 artesanas activas", color: "var(--ug-flamingo)" },
    { t: "EscudoUG", d: "Programa de concientización y auditoría para alcaldías de la Media Guajira.", i: "3 municipios · 120 funcionarios", color: "var(--ug-marino)" },
  ];
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: "clamp(60px, 8vw, 110px)" }}>
        <div className="inner">
          <div className="eyebrow">Funciones misionales · Extensión</div>
          <h1 style={{ marginTop: 14, maxWidth: "22ch" }}>Ingeniería que sale del aula y aterriza en el territorio.</h1>
          <p style={{ fontSize: 18, color: "var(--ink-2)", marginTop: 24, maxWidth: "58ch" }}>
            Convenios con empresas, entidades públicas y organizaciones sociales, educación continua y proyectos de transferencia tecnológica con impacto medible en La Guajira.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 32 }}>
            <div className="chip"><b style={{ marginRight: 6 }}>18</b> convenios vigentes</div>
            <div className="chip"><b style={{ marginRight: 6 }}>135</b> practicantes 2025</div>
            <div className="chip"><b style={{ marginRight: 6 }}>12</b> proyectos activos</div>
            <div className="chip"><b style={{ marginRight: 6 }}>4</b> municipios intervenidos</div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Convenios activos</div>
              <h2>Empresas, gobiernos y organizaciones aliadas.</h2>
            </div>
            <p className="desc">Alianzas formales que abren oportunidades de práctica, consultoría y empleo.</p>
          </div>
          <div className="grid-3">
            {convenios.map((c, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: "hidden", background: "var(--paper-2)" }}>
                <div style={{ height: 100, background: c.color, padding: 20, color: "var(--ug-negro)", display: "flex", alignItems: "end", position: "relative", overflow: "hidden" }}>
                  <WayuuBackdrop variant="a" />
                  <div style={{ position: "relative", fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>{c.emp}</div>
                </div>
                <div style={{ padding: 22 }}>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <span className="chip" style={{ fontSize: 10 }}>{c.tipo}</span>
                    <span className="chip" style={{ fontSize: 10 }}>Desde {c.desde}</span>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--ink-2)" }}>{c.focus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Proyectos de proyección social</div>
              <h2>Impacto verificable en comunidades.</h2>
            </div>
          </div>
          <div className="grid-2">
            {proyectos.map((p, i) => (
              <div key={i} className="card" style={{ background: "var(--paper)", display: "grid", gridTemplateColumns: "120px 1fr", gap: 20 }}>
                <div style={{ borderRadius: 10, background: p.color, position: "relative", overflow: "hidden" }}>
                  <WayuuBackdrop variant="b" />
                </div>
                <div>
                  <h3 style={{ fontSize: 20 }}>{p.t}</h3>
                  <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 10 }}>{p.d}</p>
                  <div style={{ marginTop: 14, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".1em", color: "var(--accent-deep)", textTransform: "uppercase" }}>● {p.i}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Educación continua</div>
              <h2>Diplomados y cursos abiertos.</h2>
            </div>
          </div>
          <div style={{ background: "var(--paper)", borderRadius: 14, overflow: "hidden" }}>
            {[
              { t: "Diplomado en Ciberseguridad Ofensiva", h: "120 horas", m: "Híbrido", f: "Ago – Nov 2026" },
              { t: "Diplomado en Ciencia de Datos con Python", h: "100 horas", m: "Presencial", f: "Sep – Dic 2026" },
              { t: "Curso de DevOps y AWS", h: "48 horas", m: "Virtual", f: "Jul 2026" },
              { t: "Curso de Inteligencia Artificial Generativa", h: "40 horas", m: "Virtual", f: "Ago 2026" },
              { t: "Diplomado en Transformación Digital del Sector Público", h: "80 horas", m: "Híbrido", f: "Oct – Dic 2026" },
            ].map((c, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2.4fr 1fr 1fr 1fr auto", padding: "20px 28px", alignItems: "center", borderTop: i > 0 ? "1px solid color-mix(in oklab, var(--ink) 7%, transparent)" : "none", gap: 16 }}>
                <div style={{ fontWeight: 500, fontSize: 16 }}>{c.t}</div>
                <div className="chip" style={{ fontSize: 11 }}>{c.h}</div>
                <div className="chip" style={{ fontSize: 11 }}>{c.m}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)" }}>{c.f}</div>
                <button className="btn ghost" style={{ padding: "6px 14px", fontSize: 13 }}>Inscribirme <I.arrow /></button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ========== INTERNACIONALIZACIÓN ==========
function Internacionalizacion() {
  const redes = [
    { n: "UNAM", pais: "México", tipo: "Intercambio académico", desde: "2019", color: "var(--ug-azul)" },
    { n: "Universitat Politècnica de València", pais: "España", tipo: "Doble titulación maestría", desde: "2021", color: "var(--ug-amarillo)" },
    { n: "Universidad del Norte", pais: "Colombia", tipo: "Movilidad + investigación", desde: "2018", color: "var(--ug-flamingo)" },
    { n: "Universidade Federal do Rio de Janeiro", pais: "Brasil", tipo: "Red de investigación", desde: "2022", color: "var(--ug-marino)" },
    { n: "Universidad Autónoma de Chile", pais: "Chile", tipo: "Intercambio académico", desde: "2023", color: "var(--ug-azul)" },
    { n: "Tecnológico de Monterrey", pais: "México", tipo: "Profesor visitante", desde: "2024", color: "var(--ug-amarillo)" },
  ];
  const movilidad = [
    { p: "Estudiantes salientes 2025-I", n: 7, d: "Intercambio académico de un semestre" },
    { p: "Estudiantes salientes 2025-II", n: 9, d: "6 intercambio · 3 pasantía investigativa" },
    { p: "Estudiantes entrantes 2025", n: 4, d: "De UNAM, UPV y UFRJ" },
    { p: "Docentes en movilidad 2025", n: 6, d: "Ponencias internacionales y estancias" },
    { p: "Profesores visitantes 2025", n: 3, d: "Cátedras de IA y ciberseguridad" },
  ];
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: "clamp(60px, 8vw, 110px)" }}>
        <div className="inner">
          <div className="eyebrow">Funciones misionales · Internacionalización</div>
          <h1 style={{ marginTop: 14, maxWidth: "20ch" }}>Raíces en La Guajira, horizontes en el mundo.</h1>
          <p style={{ fontSize: 18, color: "var(--ink-2)", marginTop: 24, maxWidth: "58ch" }}>
            Movilidad académica, dobles titulaciones, redes de investigación y cooperación internacional — oportunidades reales para estudiantes y docentes del programa.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Redes y convenios internacionales</div>
              <h2>Seis universidades aliadas en tres continentes.</h2>
            </div>
          </div>
          <div className="grid-3">
            {redes.map((r, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: "hidden", background: "var(--paper-2)" }}>
                <div style={{ aspectRatio: "16/9", background: r.color, position: "relative", display: "grid", placeItems: "center", overflow: "hidden" }}>
                  <WayuuBackdrop variant="a" />
                  <div style={{ position: "relative", fontFamily: "var(--font-display)", fontSize: 44, fontWeight: 600, color: "var(--ug-negro)", letterSpacing: "-0.04em" }}>
                    {r.n.split(" ").map(w => w[0]).filter(c => /[A-ZÁÉÍÓÚÀ]/.test(c)).slice(0,3).join("")}
                  </div>
                </div>
                <div style={{ padding: 22 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--ink-3)" }}>{r.pais} · desde {r.desde}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, marginTop: 6 }}>{r.n}</div>
                  <div className="rule" style={{ margin: "14px 0 10px" }} />
                  <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{r.tipo}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Movilidad académica 2025</div>
              <h2>Números del último año.</h2>
            </div>
          </div>
          <div className="grid-4">
            {movilidad.map((m, i) => (
              <div key={i} className="card" style={{ background: "var(--paper)" }}>
                <div className="eyebrow">{m.p}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 56, fontWeight: 500, letterSpacing: "-0.03em", color: "var(--accent-deep)", marginTop: 12 }}>{m.n}</div>
                <p style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 10 }}>{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="inner">
          <div className="grid-2">
            <div>
              <div className="eyebrow">Oportunidades para estudiantes</div>
              <h2 style={{ marginTop: 12, fontSize: 32 }}>¿Cómo puedes participar?</h2>
              <ul style={{ listStyle: "none", padding: 0, margin: "24px 0 0", display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  "Intercambio académico de un semestre con reconocimiento de créditos.",
                  "Pasantía investigativa en grupos de universidades aliadas.",
                  "Doble titulación en maestría con UPV (España).",
                  "Escuelas de verano internacionales.",
                  "Participación en eventos académicos con ponencia.",
                  "Voluntariados técnicos en proyectos con aliados globales.",
                ].map((p, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, alignItems: "start", fontSize: 15, color: "var(--ink-2)" }}>
                    <I.check /> {p}
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn accent">Postularme <I.arrow /></button>
                <button className="btn ghost"><I.download /> Guía de movilidad</button>
              </div>
            </div>
            <div className="card" style={{ background: "var(--paper-2)", padding: 32 }}>
              <div className="eyebrow">Oficina de Relaciones Internacionales</div>
              <h3 style={{ marginTop: 12, fontSize: 24 }}>Coordinación y acompañamiento</h3>
              <dl style={{ margin: "22px 0 0", display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  ["Enlace del programa", "Dra. Luz Marina Ipuana"],
                  ["Correo", "ori.is@uniguajira.edu.co"],
                  ["Teléfono", "+57 (605) 7282729 ext. 145"],
                  ["Atención", "Lun–Vie · 9:00 a. m. – 5:00 p. m."],
                  ["Ubicación", "Bloque administrativo · 1.º piso"],
                ].map(([k,v]) => (
                  <div key={k} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 16, fontSize: 14, paddingBottom: 12, borderBottom: "1px solid color-mix(in oklab, var(--ink) 7%, transparent)" }}>
                    <dt style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase" }}>{k}</dt>
                    <dd style={{ margin: 0, fontWeight: 500 }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ========== CONVOCATORIAS ==========
function Convocatorias() {
  const [tab, setTab] = useStateN("all");
  const convos = [
    { cat: "Investigación", t: "Jóvenes Investigadores 2026", s: "Abierta", d: "28 may 2026", p: "Estudiantes de 6.º a 10.º semestre", desc: "Vinculación semestral remunerada a grupos de investigación. Cupos: 6.", color: "var(--ug-azul)" },
    { cat: "Internacionalización", t: "Intercambio UNAM 2026-II", s: "Abierta", d: "15 jul 2026", p: "Estudiantes con promedio ≥ 4.0", desc: "Un semestre en Ciudad de México con homologación de créditos.", color: "var(--ug-amarillo)" },
    { cat: "Extensión", t: "Hackathon Guajira Tech 2026", s: "Abierta", d: "15 may 2026", p: "Todos los estudiantes", desc: "Reto de 48 horas con Cluster TIC Caribe. Premio $8M y prácticas aseguradas.", color: "var(--ug-flamingo)" },
    { cat: "Extensión", t: "Práctica profesional 2026-II", s: "Abierta", d: "30 jun 2026", p: "Estudiantes de 9.º semestre", desc: "22 empresas aliadas con cupos garantizados en el Caribe y Bogotá.", color: "var(--ug-marino)" },
    { cat: "Investigación", t: "Semilleros 2026-II", s: "Abierta", d: "10 ago 2026", p: "Estudiantes de 2.º a 8.º semestre", desc: "14 semilleros activos con plazas en IA, IoT, Ciberseguridad y HCI.", color: "var(--ug-azul)" },
    { cat: "Docentes", t: "Convocatoria docente TC 2026", s: "Abierta", d: "12 jun 2026", p: "PhD o MSc en áreas afines", desc: "Dos plazas de tiempo completo en Ciencia de Datos y Redes.", color: "var(--ug-amarillo)" },
    { cat: "Estímulos", t: "Beca de excelencia académica", s: "Próxima", d: "15 ago 2026", p: "Promedio ≥ 4.5", desc: "Cubrimiento del 100% de matrícula durante el semestre 2026-II.", color: "var(--ug-flamingo)" },
    { cat: "Extensión", t: "Diplomado en Ciberseguridad", s: "Próxima", d: "1 ago 2026", p: "Egresados y profesionales TIC", desc: "120 horas híbrido · precio especial para egresados del programa.", color: "var(--ug-marino)" },
    { cat: "Investigación", t: "Proyecto MinCiencias 2026", s: "Cerrada", d: "20 mar 2026", p: "Grupos de investigación", desc: "Proyectos en IA aplicada al Caribe · resultado en julio 2026.", color: "var(--ug-azul)" },
  ];
  const filtered = tab === "all" ? convos : convos.filter(c => tab === "abierta" ? c.s === "Abierta" : tab === "proxima" ? c.s === "Próxima" : c.s === "Cerrada");
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: "clamp(60px, 8vw, 110px)" }}>
        <div className="inner">
          <div className="eyebrow">Funciones misionales · Convocatorias</div>
          <h1 style={{ marginTop: 14, maxWidth: "18ch" }}>Oportunidades abiertas, ahora mismo.</h1>
          <p style={{ fontSize: 18, color: "var(--ink-2)", marginTop: 24, maxWidth: "58ch" }}>
            Un único lugar con todas las convocatorias del programa: investigación, intercambios, prácticas, becas, hackatones y vinculación docente.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 36 }}>
            {[["all","Todas"],["abierta","Abiertas"],["proxima","Próximas"],["cerrada","Cerradas"]].map(([k,l]) => (
              <button key={k} className="chip" onClick={()=>setTab(k)} style={{
                cursor: "pointer",
                background: tab===k ? "var(--ink)" : undefined,
                color: tab===k ? "var(--paper)" : undefined,
                borderColor: tab===k ? "var(--ink)" : undefined,
              }}>{l}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="inner">
          <div className="grid-2">
            {filtered.map((c, i) => {
              const statusColor = c.s === "Abierta" ? "var(--ug-azul)" : c.s === "Próxima" ? "var(--ug-amarillo)" : "var(--ug-flamingo)";
              return (
                <div key={i} className="card" style={{ padding: 0, overflow: "hidden", background: "var(--paper-2)", display: "flex", flexDirection: "column" }}>
                  <div style={{ height: 110, background: c.color, padding: 20, color: "var(--ug-negro)", display: "flex", justifyContent: "space-between", alignItems: "end", position: "relative", overflow: "hidden" }}>
                    <WayuuBackdrop variant="a" />
                    <div style={{ position: "relative" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase" }}>{c.cat}</div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, marginTop: 6, letterSpacing: "-0.01em" }}>{c.t}</div>
                    </div>
                    <div style={{ position: "relative", padding: "6px 12px", background: "var(--ug-negro)", color: "var(--paper)", borderRadius: 999, fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: ".15em", textTransform: "uppercase" }}>
                      ● {c.s}
                    </div>
                  </div>
                  <div style={{ padding: 22, flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span className="chip" style={{ fontSize: 10 }}>Cierre · {c.d}</span>
                      <span className="chip" style={{ fontSize: 10 }}>{c.p}</span>
                    </div>
                    <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 14, flex: 1 }}>{c.desc}</p>
                    <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
                      <button className="btn" style={{ padding: "8px 16px", fontSize: 13 }} disabled={c.s === "Cerrada"}>Ver bases <I.arrow /></button>
                      {c.s === "Abierta" && <button className="btn ghost" style={{ padding: "8px 16px", fontSize: 13 }}>Postularme</button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Suscríbete</div>
              <h2>Recibe nuevas convocatorias en tu correo.</h2>
            </div>
            <p className="desc">Te avisaremos cuando haya una nueva oportunidad relevante para tu perfil.</p>
          </div>
          <form className="card" style={{ background: "var(--paper)", padding: 28, display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 14, alignItems: "end" }} onSubmit={(e)=>e.preventDefault()}>
            <div className="field" style={{ margin: 0 }}><label>Correo electrónico</label><input type="email" placeholder="tu@correo.com" /></div>
            <div className="field" style={{ margin: 0 }}><label>Tipo de convocatoria</label>
              <select><option>Todas</option><option>Investigación</option><option>Internacionalización</option><option>Extensión</option><option>Becas</option></select>
            </div>
            <button className="btn accent" type="submit">Suscribirme <I.arrow /></button>
          </form>
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { ProgramaResolucionesPage, ProgramaContactoPage, Extension, Internacionalizacion, Convocatorias });
