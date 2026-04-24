/* Remaining pages: Docentes, Investigación, Proyectos, Noticias, Admisiones, Recursos, Contacto, Egresado, Admin */

const { useState: useStateS } = React;

// ========= DOCENTES =========
const DOCENTES = [
  { n: "Dra. Luz Marina Ipuana", r: "Directora de Programa", a: "IA aplicada · Datos territoriales", t: "PhD. en Ciencias de la Computación · Universitat Politècnica de València", cat: "Titular" },
  { n: "MSc. Jorge Epieyú Palmar", r: "Docente tiempo completo", a: "Ingeniería de software · DevOps", t: "Magíster en Ingeniería de Software · Universidad del Norte", cat: "Asociado" },
  { n: "Dr. Héctor Brito Mendoza", r: "Investigador principal GITUG", a: "Ciberseguridad · Redes", t: "PhD. Telecomunicaciones · Universidad de Zaragoza", cat: "Titular" },
  { n: "MSc. Catalina Uriana Iguarán", r: "Docente tiempo completo", a: "Bases de datos · Ingeniería web", t: "Magíster en Ciencias Computacionales · UniAndes", cat: "Asistente" },
  { n: "Dr. Samuel Cotes Ramírez", r: "Investigador Caribe.AI", a: "Machine learning · Visión computacional", t: "PhD. en Informática · UFRJ, Brasil", cat: "Asociado" },
  { n: "MSc. Andrea Bolaños Curvelo", r: "Coordinadora semilleros", a: "IoT · Sistemas embebidos", t: "Magíster en Automatización · Universidad del Valle", cat: "Asistente" },
  { n: "Dr. Pablo Mengual Solano", r: "Docente tiempo completo", a: "Algoritmos · Ciencias básicas", t: "PhD. Matemática Aplicada · Universidad Nacional", cat: "Asociado" },
  { n: "MSc. Nayely Uriana Jayariyú", r: "Docente tiempo completo", a: "HCI · Diseño interacción", t: "Magíster en Diseño e Interacción · UPB", cat: "Asistente" },
];

function Docentes() {
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: "clamp(60px, 8vw, 110px)" }}>
        <div className="inner">
          <div className="eyebrow">Docentes</div>
          <h1 style={{ marginTop: 14, maxWidth: "18ch" }}>Quienes enseñan aquí, hacen también.</h1>
          <p style={{ fontSize: 18, color: "var(--ink-2)", marginTop: 24, maxWidth: "58ch" }}>
            Una planta docente cualificada, mayoritariamente con posgrado, que combina carrera académica, investigación activa y vínculos con el sector productivo caribeño.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 40 }}>
            <div className="chip"><b style={{ marginRight: 6 }}>28</b> docentes</div>
            <div className="chip"><b style={{ marginRight: 6 }}>14</b> tiempo completo</div>
            <div className="chip"><b style={{ marginRight: 6 }}>9</b> con doctorado</div>
            <div className="chip"><b style={{ marginRight: 6 }}>17</b> con maestría</div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="inner">
          <div className="grid-4">
            {DOCENTES.map((d, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: "hidden", background: "var(--paper)" }}>
                <div style={{ aspectRatio: "1/1", background: ["var(--ug-amarillo-soft)","var(--ug-azul-soft)","var(--ug-flamingo-soft)","var(--paper-3)"][i%4], position: "relative" }}>
                  <WayuuBackdrop variant="a" />
                  <div style={{ position: "absolute", inset: "auto 0 0 0", padding: 16 }}>
                    <div style={{ background: "var(--paper)", padding: "4px 10px", display: "inline-flex", borderRadius: 999, fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                      {d.cat}
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: ".15em", textTransform: "uppercase", color: "var(--ink-3)" }}>{d.r}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginTop: 6, letterSpacing: "-0.01em" }}>{d.n}</div>
                  <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 10 }}>{d.a}</div>
                  <div className="rule" style={{ margin: "14px 0 12px" }} />
                  <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>{d.t}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ========= INVESTIGACIÓN =========
function Investigacion() {
  const grupos = [
    { n: "GITUG", t: "Grupo de Investigación en Tecnologías UniGuajira", cat: "A1 · MinCiencias", lines: ["Ciberseguridad", "Redes y sistemas", "Infraestructura TIC"], lead: "Dr. Héctor Brito Mendoza", color: "var(--ug-azul)" },
    { n: "WayuuLab", t: "Computación, cultura y territorio", cat: "B · MinCiencias", lines: ["IoT aplicado", "Etnoinformática", "Conservación y datos"], lead: "Dra. Luz Marina Ipuana", color: "var(--ug-amarillo)" },
    { n: "Caribe.AI", t: "Inteligencia artificial para el Caribe", cat: "B · MinCiencias", lines: ["Machine learning", "Visión computacional", "IA ética"], lead: "Dr. Samuel Cotes Ramírez", color: "var(--ug-flamingo)" },
  ];
  const semilleros = ["IoT Wayuu", "Seguridad Mar", "DataTerritorio", "IA para la Salud", "Robótica Educativa", "DevUG", "Bioinformática marina", "Accesibilidad y HCI", "Visualización", "Blockchain Social", "Fintech Guajira", "EduTech", "GreenCode", "Mujeres en TI"];
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: "clamp(60px, 8vw, 110px)" }}>
        <div className="inner">
          <div className="eyebrow">Investigación e innovación</div>
          <h1 style={{ marginTop: 14, maxWidth: "20ch" }}>Tres grupos, catorce semilleros, una región que se investiga a sí misma.</h1>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="inner">
          <div className="grid-3">
            {grupos.map((g, i) => (
              <div key={i} className="card" style={{ background: "var(--paper-2)", padding: 0, overflow: "hidden" }}>
                <div style={{ height: 120, background: g.color, padding: 20, color: "var(--ug-negro)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase" }}>{g.cat}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 600, letterSpacing: "-0.02em" }}>{g.n}</div>
                </div>
                <div style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 18 }}>{g.t}</h3>
                  <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {g.lines.map((l, j) => <span key={j} className="chip" style={{ fontSize: 11 }}>{l}</span>)}
                  </div>
                  <div className="rule" style={{ margin: "18px 0 14px" }} />
                  <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Director · {g.lead}</div>
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
              <div className="eyebrow">Semilleros activos</div>
              <h2>Catorce formas de aprender investigando.</h2>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {semilleros.map((s, i) => (
              <div key={i} style={{ padding: "16px 18px", background: "var(--paper)", borderRadius: 10, border: "1px solid color-mix(in oklab, var(--ink) 7%, transparent)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".15em", color: "var(--ink-3)" }}>{String(i+1).padStart(2,'0')}</div>
                  <div style={{ fontWeight: 500, marginTop: 4 }}>{s}</div>
                </div>
                <I.arrow />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Producción destacada 2024–2025</div>
              <h2>Lo que publicamos.</h2>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { y: "2025", t: "Anomaly detection in salinas: a case study in Manaure", v: "IEEE Latin America · Q2" },
              { y: "2025", t: "Ethno-informatics: designing with Wayuu communities", v: "CHI 2025 · Yokohama" },
              { y: "2024", t: "Low-power IoT for artisanal fishermen in La Guajira", v: "Sensors · Q1" },
              { y: "2024", t: "Un modelo de madurez en ciberseguridad para universidades del Caribe", v: "Computación y Sistemas · Q3" },
              { y: "2024", t: "Redes neuronales gráficas para rutas turísticas en el cabo", v: "Journal of Tourism Futures · Q2" },
            ].map((p, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: 24, padding: "22px 0", borderBottom: "1px solid color-mix(in oklab, var(--ink) 10%, transparent)", alignItems: "center" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)", letterSpacing: ".1em" }}>{p.y}</div>
                <div style={{ fontSize: 17, letterSpacing: "-0.01em" }}>{p.t}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", letterSpacing: ".1em" }}>{p.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ========= PROYECTOS =========
function Proyectos() {
  const items = [
    { cat: "IoT", t: "ArenaNet", d: "Monitoreo distribuido de salinas en Manaure con sensores de bajo costo", color: "var(--ug-amarillo)", tags: ["Arduino", "LoRa", "React"] },
    { cat: "Datos", t: "CaboTour", d: "Plataforma de rutas turísticas para el Cabo de la Vela con impacto comunitario", color: "var(--ug-azul)", tags: ["Python", "Maps", "GTM"] },
    { cat: "IA", t: "PescaIA", d: "Detección automática de especies y monitoreo de captura para pescadores artesanales", color: "var(--ug-flamingo)", tags: ["PyTorch", "YOLO", "Edge"] },
    { cat: "Software", t: "MercadoGuajira", d: "Marketplace digital para artesanas wayuu del corregimiento de Aremasain", color: "var(--ug-azul)", tags: ["Next.js", "Stripe", "i18n"] },
    { cat: "Ciber", t: "EscudoUG", d: "Auditoría y programa de concientización para alcaldías de la Media Guajira", color: "var(--ug-amarillo)", tags: ["SIEM", "Training"] },
    { cat: "Salud", t: "SaludCabo", d: "Triage digital para puestos de salud rurales con operación offline", color: "var(--ug-flamingo)", tags: ["Flutter", "SQLite", "PWA"] },
  ];
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: "clamp(60px, 8vw, 110px)" }}>
        <div className="inner">
          <div className="eyebrow">Proyectos estudiantiles</div>
          <h1 style={{ marginTop: 14, maxWidth: "20ch" }}>Código que sale del aula y aterriza en el territorio.</h1>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="inner">
          <div className="grid-3">
            {items.map((p, i) => (
              <div key={i} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ aspectRatio: "4/3", background: p.color, position: "relative", overflow: "hidden" }}>
                  <WayuuBackdrop variant="b" />
                  <div style={{ position: "absolute", inset: 20, display: "flex", alignItems: "end" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 500, letterSpacing: "-0.03em", color: "var(--ug-negro)", lineHeight: 1 }}>{p.t}</div>
                  </div>
                  <div style={{ position: "absolute", top: 18, right: 18, background: "var(--ug-negro)", color: "var(--paper)", padding: "6px 12px", borderRadius: 999, fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: ".12em", textTransform: "uppercase" }}>
                    {p.cat}
                  </div>
                </div>
                <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                  <p style={{ fontSize: 15, color: "var(--ink-2)", flex: 1 }}>{p.d}</p>
                  <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {p.tags.map((t, j) => <span key={j} className="chip" style={{ fontSize: 11, padding: "3px 8px" }}>{t}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ========= NOTICIAS =========
function Noticias() {
  const news = [
    { d: "12 abr 2026", cat: "Investigación", t: "Semillero IoT Wayuu presenta ponencia en IEEE Colombia 2026", s: "El estudiante Luis Enrique Gutiérrez presentó resultados del proyecto ArenaNet en el encuentro nacional." },
    { d: "05 abr 2026", cat: "Acreditación", t: "Avanza el proceso de autoevaluación con miras a acreditación CNA", s: "El programa completó la recolección documental de los 12 factores y entra en fase de redacción del informe." },
    { d: "28 mar 2026", cat: "Egresados", t: "Egresada de Ingeniería de Sistemas lidera área de datos en empresa global", s: "Diana Cotes (2018) asumió recientemente el cargo de Head of Data en una multinacional con sede en Bogotá." },
    { d: "14 mar 2026", cat: "Extensión", t: "Firmado convenio con Cluster TIC del Caribe", s: "La alianza permitirá a estudiantes acceder a prácticas profesionales en empresas del gremio regional." },
    { d: "01 mar 2026", cat: "Docencia", t: "Nuevo laboratorio de ciberseguridad habilitado en el bloque 4", s: "Dotación con 20 estaciones, rack para cyber-range y licencias académicas de herramientas SIEM." },
  ];
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: "clamp(60px, 8vw, 110px)" }}>
        <div className="inner">
          <div className="eyebrow">Noticias y eventos</div>
          <h1 style={{ marginTop: 14, maxWidth: "18ch" }}>Lo que pasa en el programa.</h1>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="inner">
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 40 }} className="news-grid">
            <article className="card" style={{ padding: 0, overflow: "hidden", background: "var(--paper-2)" }}>
              <div style={{ aspectRatio: "16/9", background: "var(--ug-flamingo)", position: "relative", overflow: "hidden" }}>
                <WayuuBackdrop variant="a" />
                <div style={{ position: "absolute", top: 24, left: 24, background: "var(--ug-negro)", color: "var(--paper)", padding: "6px 14px", borderRadius: 999, fontSize: 11, fontFamily: "var(--font-mono)", letterSpacing: ".15em", textTransform: "uppercase" }}>
                  Destacado
                </div>
              </div>
              <div style={{ padding: 32 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: ".15em", color: "var(--ink-3)", textTransform: "uppercase" }}>{news[0].d} · {news[0].cat}</div>
                <h2 style={{ marginTop: 14, fontSize: 32, maxWidth: "22ch" }}>{news[0].t}</h2>
                <p style={{ marginTop: 14, fontSize: 16, color: "var(--ink-2)" }}>{news[0].s}</p>
                <button className="btn ghost" style={{ marginTop: 24, padding: "8px 16px", fontSize: 13 }}>Leer nota <I.arrow /></button>
              </div>
            </article>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {news.slice(1).map((n, i) => (
                <div key={i} style={{ padding: "22px 0", borderBottom: "1px solid color-mix(in oklab, var(--ink) 10%, transparent)" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".15em", color: "var(--ink-3)", textTransform: "uppercase" }}>{n.d} · {n.cat}</div>
                  <h3 style={{ marginTop: 10, fontSize: 20, letterSpacing: "-0.01em" }}>{n.t}</h3>
                  <p style={{ marginTop: 10, fontSize: 14, color: "var(--ink-2)" }}>{n.s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ========= ADMISIONES =========
function Admisiones() {
  const [step, setStep] = useStateS(0);
  const steps = ["Datos personales", "Académico", "Financiación", "Confirmación"];
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: "clamp(60px, 8vw, 110px)" }}>
        <div className="inner">
          <div className="eyebrow">Admisiones 2026-II</div>
          <h1 style={{ marginTop: 14, maxWidth: "18ch" }}>Postúlate en cinco minutos.</h1>
          <p style={{ fontSize: 18, color: "var(--ink-2)", marginTop: 24, maxWidth: "58ch" }}>
            Inscripción abierta hasta el 30 de junio de 2026. Inicio de clases: 22 de agosto.
          </p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="inner">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 40 }} className="adm-grid">
            <aside>
              <div style={{ background: "var(--paper-2)", borderRadius: 14, padding: 24, position: "sticky", top: 100 }}>
                <div className="eyebrow">Tu progreso</div>
                <ol style={{ listStyle: "none", padding: 0, margin: "16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
                  {steps.map((s, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 10px", borderRadius: 8, background: step === i ? "var(--paper)" : "transparent", fontWeight: step === i ? 600 : 400 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 999, background: step > i ? "var(--ug-azul)" : step === i ? "var(--accent)" : "transparent", border: step < i ? "1px solid color-mix(in oklab, var(--ink) 25%, transparent)" : "none", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--ug-negro)" }}>
                        {step > i ? "✓" : i+1}
                      </div>
                      <span style={{ fontSize: 14 }}>{s}</span>
                    </li>
                  ))}
                </ol>
                <div className="rule" style={{ margin: "16px 0" }} />
                <div style={{ fontSize: 13, color: "var(--ink-2)" }}>
                  <b>Documentos necesarios:</b> diploma bachiller, ICFES, cédula, foto carnet.
                </div>
              </div>
            </aside>
            <div className="card" style={{ background: "var(--paper-2)" }}>
              {step === 0 && (
                <>
                  <h3>Datos personales</h3>
                  <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div className="field"><label>Nombres</label><input placeholder="María José" /></div>
                    <div className="field"><label>Apellidos</label><input placeholder="Iguarán Pushaina" /></div>
                    <div className="field"><label>Documento</label><input placeholder="1049634xxxx" /></div>
                    <div className="field"><label>Fecha nacimiento</label><input type="date" /></div>
                    <div className="field"><label>Correo</label><input type="email" placeholder="tu@correo.com" /></div>
                    <div className="field"><label>Celular</label><input placeholder="+57" /></div>
                    <div className="field" style={{ gridColumn: "1 / -1" }}><label>Autorreconocimiento étnico</label><select><option>Wayuu</option><option>Afrocolombiano</option><option>No aplica</option><option>Otro</option></select></div>
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <h3>Información académica</h3>
                  <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div className="field"><label>Colegio</label><input placeholder="Institución educativa" /></div>
                    <div className="field"><label>Año de grado</label><input placeholder="2025" /></div>
                    <div className="field"><label>Puntaje ICFES global</label><input placeholder="0 - 500" /></div>
                    <div className="field"><label>Jornada deseada</label><select><option>Diurna</option><option>Nocturna</option></select></div>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <h3>Financiación y apoyos</h3>
                  <div style={{ marginTop: 20, display: "grid", gap: 14 }}>
                    <div className="field"><label>Tipo de aspirante</label><select><option>Regular</option><option>Beneficiario de programa étnico</option><option>Víctima del conflicto</option><option>Generación E</option></select></div>
                    <div className="field"><label>¿Requiere subsidio transporte?</label><select><option>Sí</option><option>No</option></select></div>
                    <div className="field"><label>Estrato socioeconómico</label><select><option>1</option><option>2</option><option>3</option><option>4+</option></select></div>
                  </div>
                </>
              )}
              {step === 3 && (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <div style={{ width: 80, height: 80, borderRadius: 999, background: "var(--ug-azul)", display: "grid", placeItems: "center", margin: "0 auto 24px", color: "var(--ug-negro)" }}>
                    <I.check />
                  </div>
                  <h3 style={{ fontSize: 28 }}>¡Postulación recibida!</h3>
                  <p style={{ marginTop: 14, fontSize: 16, color: "var(--ink-2)", maxWidth: "40ch", marginLeft: "auto", marginRight: "auto" }}>
                    Tu código de inscripción es <b>IS-2026-0428-0173</b>. Te contactaremos por correo en los próximos 3 días hábiles.
                  </p>
                </div>
              )}
              <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between" }}>
                <button className="btn ghost" onClick={()=>setStep(Math.max(0, step-1))} disabled={step===0} style={{ opacity: step===0 ? 0.4 : 1 }}>Anterior</button>
                <button className="btn accent" onClick={()=>setStep(Math.min(3, step+1))}>{step < 2 ? "Continuar" : step === 2 ? "Enviar" : "Finalizar"} <I.arrow /></button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ========= RECURSOS =========
function Recursos() {
  const items = [
    { g: "Estudiantes actuales", items: ["Horarios y calendario académico", "Plataforma Moodle institucional", "Bibliotecas y bases de datos", "Biblioteca Scopus + IEEE Xplore", "Reglamento estudiantil", "Certificados y notas en línea"] },
    { g: "Docentes", items: ["Portal docente · cargas y notas", "Normativa docente", "Convocatorias internas de investigación", "Servicios de IT y laboratorios", "Manual de identidad institucional", "Reserva de espacios"] },
    { g: "Egresados", items: ["Bolsa de empleo", "Red de egresados", "Certificaciones", "Educación continua · diplomados", "Carnet de egresado", "Eventos alumni"] },
    { g: "Empresas", items: ["Oferta de prácticas", "Proyectos de consultoría", "Alianza con semilleros", "Contratación directa de egresados", "Convenios marco", "Hacklab y innovación abierta"] },
  ];
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: "clamp(60px, 8vw, 110px)" }}>
        <div className="inner">
          <div className="eyebrow">Recursos</div>
          <h1 style={{ marginTop: 14, maxWidth: "20ch" }}>Todo lo que necesitas, organizado por quien eres.</h1>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="inner">
          <div className="grid-2">
            {items.map((g, i) => (
              <div key={i} className="card">
                <div className="eyebrow" style={{ color: "var(--accent-deep)" }}>● {g.g}</div>
                <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0", display: "flex", flexDirection: "column", gap: 0 }}>
                  {g.items.map((it, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid color-mix(in oklab, var(--ink) 7%, transparent)" }}>
                      <span>{it}</span>
                      <I.external />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ========= CONTACTO =========
function Contacto() {
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: "clamp(60px, 8vw, 110px)" }}>
        <div className="inner">
          <div className="eyebrow">Contacto</div>
          <h1 style={{ marginTop: 14, maxWidth: "18ch" }}>Hablemos.</h1>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 60, marginTop: 60 }} className="contact-grid">
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {[
                  { h: "Dirección del programa", l: "Dra. Luz Marina Ipuana", e: "direccion.is@uniguajira.edu.co", t: "+57 (605) 728 2729 ext. 125" },
                  { h: "Admisiones", l: "Oficina de Admisiones y Registro", e: "admisiones@uniguajira.edu.co", t: "+57 (605) 728 2729 ext. 200" },
                  { h: "Investigación", l: "Vicerrectoría de Investigaciones", e: "investigaciones@uniguajira.edu.co", t: "+57 (605) 728 2729 ext. 140" },
                  { h: "Campus", l: "Km 5 Vía a Maicao · Bloque 4", e: "Riohacha, La Guajira", t: "Lun–Vie 8:00 a.m. – 5:30 p.m." },
                ].map((c, i) => (
                  <div key={i} style={{ paddingBottom: 24, borderBottom: "1px solid color-mix(in oklab, var(--ink) 10%, transparent)" }}>
                    <div className="eyebrow">{c.h}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 22, marginTop: 8, fontWeight: 500 }}>{c.l}</div>
                    <div style={{ marginTop: 8, color: "var(--ink-2)" }}>{c.e}</div>
                    <div style={{ color: "var(--ink-2)" }}>{c.t}</div>
                  </div>
                ))}
              </div>
            </div>
            <form className="card" style={{ background: "var(--paper-2)" }} onSubmit={(e)=>e.preventDefault()}>
              <h3>Escríbenos</h3>
              <div style={{ marginTop: 20 }}>
                <div className="field"><label>Nombre</label><input /></div>
                <div className="field"><label>Correo</label><input type="email" /></div>
                <div className="field"><label>Motivo</label>
                  <select><option>Información de admisiones</option><option>Vinculación empresarial</option><option>Investigación</option><option>Prensa</option><option>Otro</option></select>
                </div>
                <div className="field"><label>Mensaje</label><textarea rows="5" /></div>
                <button className="btn accent" style={{ width: "100%", justifyContent: "center" }}>Enviar mensaje <I.arrow /></button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

// ========= ADMIN (login + panel) =========
function AdminLogin({ onOk }) {
  const [u, setU] = useStateS("admin");
  const [p, setP] = useStateS("");
  const [err, setErr] = useStateS("");
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 40, background: "var(--paper-2)", position: "relative", overflow: "hidden" }}>
      <WayuuBackdrop variant="b" />
      <div style={{ width: 420, maxWidth: "100%", background: "var(--paper)", borderRadius: "var(--radius-lg)", padding: 36, boxShadow: "var(--shadow-lg)", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--ug-negro)", display: "grid", placeItems: "center" }}>
            <WayuuGlyph size={22} color="var(--ug-amarillo)" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>Panel administrador</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".18em", color: "var(--ink-3)", textTransform: "uppercase" }}>Ingeniería de Sistemas · UniGuajira</div>
          </div>
        </div>
        <form onSubmit={(e)=>{ e.preventDefault(); if (u && p.length >= 4) onOk(u); else setErr("Credenciales inválidas"); }}>
          <div className="field"><label>Usuario institucional</label><input value={u} onChange={e=>setU(e.target.value)} /></div>
          <div className="field"><label>Contraseña</label><input type="password" value={p} onChange={e=>setP(e.target.value)} placeholder="demo1234" /></div>
          {err && <div style={{ color: "var(--ug-flamingo-deep)", fontSize: 13, marginBottom: 12 }}>{err}</div>}
          <button type="submit" className="btn accent" style={{ width: "100%", justifyContent: "center" }}>Iniciar sesión <I.arrow /></button>
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "var(--ink-3)" }}>
            Demo · usuario: <b>admin</b> · pass: <b>demo1234</b>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminPanel({ user, onOut }) {
  const [tab, setTab] = useStateS("dashboard");
  const tabs = [
    { id: "dashboard", l: "Dashboard" },
    { id: "convos", l: "Convocatorias" },
    { id: "noticias", l: "Noticias" },
    { id: "docentes", l: "Docentes" },
    { id: "cna", l: "Acreditación CNA" },
    { id: "config", l: "Configuración" },
  ];
  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="logo">
          <div style={{ fontSize: 14, opacity: 0.6, fontFamily: "var(--font-mono)", letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 6 }}>Admin</div>
          Ing. de Sistemas
        </div>
        <nav className="admin-nav" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {tabs.map(t => (
            <button key={t.id} className={tab === t.id ? "on" : ""} onClick={()=>setTab(t.id)}>{t.l}</button>
          ))}
        </nav>
        <div style={{ position: "absolute", bottom: 20, left: 16, right: 16 }}>
          <div style={{ padding: "12px 10px", fontSize: 12, color: "rgba(246,239,227,.5)", fontFamily: "var(--font-mono)", letterSpacing: ".1em" }}>@{user}</div>
          <button className="btn ghost" style={{ width: "100%", justifyContent: "center", borderColor: "rgba(255,255,255,.15)", color: "var(--paper)" }} onClick={onOut}>Cerrar sesión</button>
        </div>
      </aside>
      <main className="admin-main">
        {tab === "dashboard" && <AdminDashboard />}
        {tab === "convos" && <AdminConvos />}
        {tab === "noticias" && <AdminNews />}
        {tab === "docentes" && <AdminDocentes />}
        {tab === "cna" && <AdminCNA />}
        {tab === "config" && <AdminConfig />}
      </main>
    </div>
  );
}

function AdminDashboard() {
  const kpis = [
    { l: "Aspirantes 2026-II", v: "412", d: "+18% vs 2025-II", c: "var(--ug-azul)" },
    { l: "Estudiantes activos", v: "1.240", d: "94% permanencia", c: "var(--ug-amarillo)" },
    { l: "Factores CNA listos", v: "10/12", d: "En redacción", c: "var(--ug-flamingo)" },
    { l: "Convocatorias abiertas", v: "07", d: "3 cierran esta semana", c: "var(--ink)" },
  ];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 24 }}>
        <div>
          <div className="eyebrow">Resumen general</div>
          <h2 style={{ marginTop: 10 }}>Hola, Luz Marina.</h2>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-3)", letterSpacing: ".1em" }}>23 ABR 2026 · 10:42</div>
      </div>
      <div className="grid-4">
        {kpis.map((k, i) => (
          <div key={i} style={{ background: "var(--paper)", borderRadius: 14, padding: 22, border: "1px solid color-mix(in oklab, var(--ink) 8%, transparent)" }}>
            <div style={{ width: 8, height: 8, borderRadius: 999, background: k.c, display: "inline-block", marginBottom: 14 }} />
            <div className="eyebrow">{k.l}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 40, marginTop: 10, letterSpacing: "-0.02em" }}>{k.v}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>{k.d}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 32, background: "var(--paper)", borderRadius: 14, padding: 24 }}>
        <div className="eyebrow">Actividad reciente</div>
        <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            "Andrea Bolaños publicó noticia: Semillero IoT Wayuu en IEEE",
            "Nueva convocatoria: Hackathon Guajira Tech 2026 (Extensión)",
            "Factor 11 · subida de 3 nuevas evidencias documentales",
            "Jorge Epieyú actualizó la ficha del curso Ing. de software II",
          ].map((a, i) => (
            <li key={i} style={{ padding: "14px 0", borderBottom: "1px solid color-mix(in oklab, var(--ink) 7%, transparent)", display: "flex", justifyContent: "space-between", gap: 20 }}>
              <span>{a}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", letterSpacing: ".1em" }}>HACE {i+1}H</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AdminConvos() {
  const rows = [
    { t: "Inscripciones 2026-II", s: "Abierta", d: "30 jun", a: "412 aspirantes" },
    { t: "Intercambio UNAM", s: "Abierta", d: "15 jul", a: "28 postulantes" },
    { t: "Jóvenes Investigadores", s: "Por cerrar", d: "28 may", a: "6 postulantes" },
    { t: "Hackathon Guajira Tech", s: "Abierta", d: "15 may", a: "87 inscritos" },
  ];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 24 }}>
        <div>
          <div className="eyebrow">Gestión de convocatorias</div>
          <h2 style={{ marginTop: 10 }}>Convocatorias activas</h2>
        </div>
        <button className="btn accent">+ Nueva convocatoria</button>
      </div>
      <div style={{ background: "var(--paper)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", padding: "14px 24px", background: "var(--paper-2)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--ink-3)" }}>
          <div>Título</div><div>Estado</div><div>Cierre</div><div>Postulaciones</div><div></div>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr auto", padding: "16px 24px", alignItems: "center", borderTop: "1px solid color-mix(in oklab, var(--ink) 7%, transparent)" }}>
            <div style={{ fontWeight: 500 }}>{r.t}</div>
            <div><span className="chip" style={{ fontSize: 11, background: r.s === "Abierta" ? "color-mix(in oklab, var(--ug-azul) 30%, transparent)" : "color-mix(in oklab, var(--ug-flamingo) 30%, transparent)", borderColor: "transparent" }}>{r.s}</span></div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-2)" }}>{r.d}</div>
            <div style={{ fontSize: 14 }}>{r.a}</div>
            <button className="btn ghost" style={{ padding: "6px 14px", fontSize: 13 }}>Editar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminNews() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 24 }}>
        <div><div className="eyebrow">Contenido</div><h2 style={{ marginTop: 10 }}>Noticias y eventos</h2></div>
        <button className="btn accent">+ Nueva nota</button>
      </div>
      <div style={{ background: "var(--paper)", borderRadius: 14, padding: 24 }}>
        <p style={{ color: "var(--ink-2)" }}>Editor visual con vista previa en vivo, programación de publicación, categorías y gestión de destacados. (Demo)</p>
      </div>
    </div>
  );
}

function AdminDocentes() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 24 }}>
        <div><div className="eyebrow">Planta docente</div><h2 style={{ marginTop: 10 }}>28 docentes registrados</h2></div>
        <button className="btn accent">+ Vincular</button>
      </div>
      <div className="grid-3">
        {DOCENTES.slice(0,6).map((d, i) => (
          <div key={i} className="card" style={{ background: "var(--paper)", display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 999, background: ["var(--ug-amarillo-soft)","var(--ug-azul-soft)","var(--ug-flamingo-soft)"][i%3] }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{d.n}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{d.cat}</div>
            </div>
            <button className="icon-btn" style={{ width: 32, height: 32 }}><I.arrow /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminCNA() {
  return (
    <div>
      <div className="eyebrow">CNA</div>
      <h2 style={{ marginTop: 10, marginBottom: 24 }}>Gestión de factores</h2>
      <div style={{ background: "var(--paper)", borderRadius: 14, padding: 24 }}>
        <p style={{ color: "var(--ink-2)", marginBottom: 24 }}>Carga evidencias, actualiza calificaciones, gestiona compromisos y genera reportes PDF del informe de autoevaluación.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
          {FACTORES.map(f => (
            <div key={f.n} style={{ padding: 14, background: "var(--paper-2)", borderRadius: 10, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".15em", color: "var(--ink-3)" }}>F{String(f.n).padStart(2,'0')}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, marginTop: 6 }}>{f.score.toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminConfig() {
  return (
    <div>
      <div className="eyebrow">Configuración</div>
      <h2 style={{ marginTop: 10, marginBottom: 24 }}>Preferencias del sitio</h2>
      <div className="card" style={{ background: "var(--paper)" }}>
        <p style={{ color: "var(--ink-2)" }}>Marca, accesos, integraciones (Moodle, SNIES, MinCiencias), roles y permisos.</p>
      </div>
    </div>
  );
}

function Admin() {
  const [user, setUser] = useStateS(null);
  if (!user) return <AdminLogin onOk={setUser} />;
  return <AdminPanel user={user} onOut={()=>setUser(null)} />;
}

Object.assign(window, { Docentes, Investigacion, Proyectos, Noticias, Admisiones, Recursos, Contacto, Admin });
