/* Comunidad: Estudiantes, Docentes (nuevo con horarios/docs), Egresados */

const { useState: useStateC } = React;

// ============ ESTUDIANTES ============
function Estudiantes() {
  const [tab, setTab] = useStateC("calendario");
  const tabs = [
    { id: "calendario", l: "Calendario" },
    { id: "honor", l: "Cuadro de Honor" },
    { id: "reglamento", l: "Reglamento" },
    { id: "grado", l: "Opciones de grado" },
    { id: "docs", l: "Documentos" },
  ];
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: "clamp(60px, 8vw, 110px)", paddingBottom: 30 }}>
        <div className="inner">
          <div className="eyebrow">Comunidad · Estudiantes</div>
          <h1 style={{ marginTop: 14, maxWidth: "20ch" }}>Todo lo que necesitas, en un solo lugar.</h1>
          <p style={{ fontSize: 18, color: "var(--ink-2)", marginTop: 24, maxWidth: "58ch" }}>
            Calendario, fechas clave, cuadro de honor, reglamento y modalidades de grado — organizado para que no pierdas tiempo buscando.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 36 }}>
            {tabs.map(t => (
              <button key={t.id} className="chip" onClick={()=>setTab(t.id)}
                style={{ cursor: "pointer",
                  background: tab === t.id ? "var(--ink)" : undefined,
                  color: tab === t.id ? "var(--paper)" : undefined,
                  borderColor: tab === t.id ? "var(--ink)" : undefined,
                }}>{t.l}</button>
            ))}
          </div>
        </div>
      </section>

      {tab === "calendario" && <EstCalendario />}
      {tab === "honor" && <EstHonor />}
      {tab === "reglamento" && <EstReglamento />}
      {tab === "grado" && <EstGrado />}
      {tab === "docs" && <EstDocs />}
    </div>
  );
}

function EstCalendario() {
  const semestre = [
    { f: "22 Ago – 02 Sep", t: "Matrícula académica", tipo: "admin", prog: 100 },
    { f: "05 Sep", t: "Inicio de clases 2026-II", tipo: "clases" },
    { f: "19 Sep", t: "Último día cambios de asignatura", tipo: "admin" },
    { f: "17 – 22 Oct", t: "Primer parcial (30%)", tipo: "eval", hl: true },
    { f: "07 Nov", t: "Receso académico", tipo: "clases" },
    { f: "28 Nov – 03 Dic", t: "Segundo parcial (30%)", tipo: "eval", hl: true },
    { f: "12 – 17 Dic", t: "Evaluación final (40%)", tipo: "eval", hl: true },
    { f: "22 Dic", t: "Ingreso de notas finales", tipo: "admin" },
    { f: "14 Feb 2027", t: "Ceremonia de grados", tipo: "grado", hl: true },
  ];
  return (
    <section className="section" style={{ paddingTop: 30 }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Calendario académico 2026-II</div>
            <h2 style={{ marginTop: 10 }}>Las fechas que no puedes perder.</h2>
          </div>
          <p className="desc">Descarga el calendario completo en PDF o sincronízalo con tu Google Calendar.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }} className="cal-grid">
          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>Cronograma semestral</div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 10, top: 10, bottom: 10, width: 2, background: "color-mix(in oklab, var(--ink) 12%, transparent)" }} />
              {semestre.map((e, i) => {
                const color = e.tipo === "eval" ? "var(--ug-flamingo)" : e.tipo === "grado" ? "var(--ug-amarillo)" : e.tipo === "clases" ? "var(--ug-azul)" : "var(--ink-3)";
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 16, padding: "10px 0", position: "relative", alignItems: "start" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 999, background: color, border: "3px solid var(--paper)", zIndex: 1, marginTop: 2 }} />
                    <div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".12em", color: "var(--ink-3)", textTransform: "uppercase" }}>{e.f}</div>
                      <div style={{ fontSize: 16, marginTop: 4, fontWeight: e.hl ? 600 : 400 }}>{e.t}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>Vista de calendario · Octubre 2026</div>
            <MiniMonth month="Octubre 2026" start={3} days={31} marks={{ 17: "p", 20: "p", 22: "p" }} legendLabel="Primer parcial" />
            <div style={{ marginTop: 24 }}>
              <MiniMonth month="Noviembre 2026" start={6} days={30} marks={{ 28: "p", 30: "p" }} legendLabel="Segundo parcial" />
            </div>
            <div style={{ marginTop: 32, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn"><I.download /> Calendario PDF</button>
              <button className="btn ghost">+ Google Calendar</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniMonth({ month, start, days, marks, legendLabel }) {
  const names = ["L","M","X","J","V","S","D"];
  const cells = [];
  for (let i = 0; i < start; i++) cells.push(null);
  for (let i = 1; i <= days; i++) cells.push(i);
  return (
    <div style={{ background: "var(--paper-2)", borderRadius: 14, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18 }}>{month}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".1em", color: "var(--ug-flamingo-deep)", textTransform: "uppercase" }}>● {legendLabel}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {names.map(n => <div key={n} style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".1em", color: "var(--ink-3)", padding: 6 }}>{n}</div>)}
        {cells.map((d, i) => (
          <div key={i} style={{
            aspectRatio: "1/1", display: "grid", placeItems: "center", fontSize: 13,
            background: d && marks[d] ? "var(--ug-flamingo)" : "transparent",
            color: d && marks[d] ? "var(--paper)" : "var(--ink-2)",
            borderRadius: 8, fontWeight: d && marks[d] ? 600 : 400,
          }}>
            {d || ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function EstHonor() {
  const top = [
    { p: 1, n: "María José Iguarán Pushaina", s: "8º", prom: 4.92, color: "var(--ug-amarillo)" },
    { p: 2, n: "Luis Enrique Gutiérrez Epiayú", s: "6º", prom: 4.88, color: "var(--ug-azul)" },
    { p: 3, n: "Carolina Brito Mendoza", s: "10º", prom: 4.85, color: "var(--ug-flamingo)" },
    { p: 4, n: "Samuel Cotes Jr.", s: "4º", prom: 4.80 },
    { p: 5, n: "Andrea Uriana Jayariyú", s: "8º", prom: 4.78 },
    { p: 6, n: "Jorge David Palmar", s: "2º", prom: 4.76 },
    { p: 7, n: "Nayely Bolaños Curvelo", s: "6º", prom: 4.75 },
    { p: 8, n: "Héctor Mengual Solano", s: "10º", prom: 4.72 },
    { p: 9, n: "Catalina Ipuana Pérez", s: "4º", prom: 4.70 },
    { p: 10, n: "Pablo Ramírez Jusayú", s: "8º", prom: 4.68 },
  ];
  return (
    <section className="section" style={{ paddingTop: 30 }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Cuadro de Honor · 2026-I</div>
            <h2 style={{ marginTop: 10 }}>Mejores promedios del semestre.</h2>
          </div>
          <p className="desc">Reconocemos a los estudiantes con promedio ponderado superior a 4.60 que aprobaron todas sus asignaturas en primera oportunidad.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 40 }} className="podium">
          {top.slice(0, 3).map((e, i) => (
            <div key={i} className="card" style={{ background: "var(--paper-2)", textAlign: "center", padding: "32px 20px", border: `2px solid ${e.color}` }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 72, fontWeight: 500, lineHeight: 1, color: e.color, letterSpacing: "-0.04em" }}>
                {e.p === 1 ? "1°" : e.p === 2 ? "2°" : "3°"}
              </div>
              <div style={{ width: 80, height: 80, borderRadius: 999, background: "color-mix(in oklab, " + e.color + " 25%, var(--paper))", margin: "20px auto", display: "grid", placeItems: "center", fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600 }}>
                {e.n.split(" ").slice(0,2).map(x => x[0]).join("")}
              </div>
              <div style={{ fontWeight: 600, fontSize: 17 }}>{e.n}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".12em", color: "var(--ink-3)", textTransform: "uppercase", marginTop: 6 }}>Semestre {e.s}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, marginTop: 14, color: e.color }}>{e.prom.toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ background: "var(--paper-2)", padding: 0, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 100px 100px", padding: "14px 24px", background: "var(--paper)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--ink-3)" }}>
            <div>Puesto</div><div>Estudiante</div><div>Semestre</div><div style={{ textAlign: "right" }}>Promedio</div>
          </div>
          {top.slice(3).map((e, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr 100px 100px", padding: "16px 24px", borderTop: "1px solid color-mix(in oklab, var(--ink) 7%, transparent)", alignItems: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--ink-3)" }}>{e.p}</div>
              <div style={{ fontWeight: 500 }}>{e.n}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-2)" }}>Sem {e.s}</div>
              <div style={{ textAlign: "right", fontFamily: "var(--font-display)", fontSize: 18 }}>{e.prom.toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, padding: 28, background: "var(--paper-2)", borderRadius: 14 }}>
          <div className="eyebrow">Histórico</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 16 }}>
            {["2024-I","2024-II","2025-I","2025-II"].map((p, i) => (
              <button key={p} className="btn ghost" style={{ justifyContent: "space-between" }}>{p} <I.arrow /></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const REGLAMENTO = [
  { t: "Capítulo I · Disposiciones generales", s: "Objeto, ámbito de aplicación y principios que orientan el reglamento estudiantil.", art: "Art. 1 – 5" },
  { t: "Capítulo II · Admisiones", s: "Requisitos de inscripción, criterios de selección, traslados y transferencias.", art: "Art. 6 – 18" },
  { t: "Capítulo III · Matrícula", s: "Proceso de matrícula académica, financiera, novedades y devoluciones.", art: "Art. 19 – 32" },
  { t: "Capítulo IV · Régimen académico", s: "Asistencia, evaluaciones, promoción, repitencia y cancelaciones de asignatura.", art: "Art. 33 – 58" },
  { t: "Capítulo V · Derechos y deberes", s: "Derechos fundamentales del estudiante, deberes académicos y convivencia.", art: "Art. 59 – 70" },
  { t: "Capítulo VI · Régimen disciplinario", s: "Faltas, procedimiento disciplinario, sanciones y recursos.", art: "Art. 71 – 94" },
  { t: "Capítulo VII · Distinciones y estímulos", s: "Cuadro de honor, menciones, becas de excelencia y otros reconocimientos.", art: "Art. 95 – 102" },
  { t: "Capítulo VIII · Graduación", s: "Requisitos de grado, modalidades de trabajo de grado y ceremonia.", art: "Art. 103 – 118" },
];

function EstReglamento() {
  const [open, setOpen] = useStateC(0);
  return (
    <section className="section" style={{ paddingTop: 30 }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Reglamento estudiantil</div>
            <h2 style={{ marginTop: 10 }}>Acuerdo 018 de 2021 · Consejo Superior.</h2>
          </div>
          <p className="desc">Navega por capítulo, descarga el texto completo o consulta un artículo específico.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 40 }} className="reg-grid">
          <div>
            {REGLAMENTO.map((c, i) => (
              <div key={i} style={{ borderTop: i === 0 ? "1px solid color-mix(in oklab, var(--ink) 10%, transparent)" : "none", borderBottom: "1px solid color-mix(in oklab, var(--ink) 10%, transparent)" }}>
                <button onClick={()=>setOpen(open === i ? -1 : i)}
                  style={{ width: "100%", padding: "22px 4px", background: "transparent", border: 0, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, textAlign: "left" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".12em", color: "var(--ink-3)" }}>{c.art}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 20, marginTop: 6, fontWeight: 500 }}>{c.t}</div>
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: 999, background: open === i ? "var(--ink)" : "transparent", border: open === i ? "none" : "1px solid color-mix(in oklab, var(--ink) 20%, transparent)", color: open === i ? "var(--paper)" : "var(--ink)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    {open === i ? "–" : "+"}
                  </div>
                </button>
                {open === i && (
                  <div style={{ padding: "0 4px 22px", color: "var(--ink-2)", fontSize: 15, lineHeight: 1.6 }}>
                    {c.s} Este capítulo desarrolla los lineamientos, procedimientos y criterios aplicables, junto con las responsabilidades de las partes involucradas. Consulta el texto completo del reglamento para los artículos específicos.
                    <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                      <button className="btn ghost" style={{ padding: "6px 14px", fontSize: 12 }}>Ver capítulo completo</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <aside>
            <div style={{ background: "var(--paper-2)", borderRadius: 14, padding: 22, position: "sticky", top: 100 }}>
              <div className="eyebrow">Documento completo</div>
              <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 10, marginBottom: 16 }}>
                Acuerdo 018 de 2021 · 42 páginas
              </p>
              <button className="btn accent" style={{ width: "100%", justifyContent: "center", marginBottom: 8 }}><I.download /> Descargar PDF</button>
              <button className="btn ghost" style={{ width: "100%", justifyContent: "center" }}><I.search /> Buscar artículo</button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function EstGrado() {
  const modalidades = [
    { t: "Trabajo de investigación", d: "Monografía asociada a grupo de investigación del programa, con tutor y sustentación pública.", req: ["Haber aprobado 140 créditos", "Propuesta avalada por comité", "Tutor vinculado a grupo activo", "Sustentación pública"], dur: "2 semestres", color: "var(--ug-azul)" },
    { t: "Proyecto aplicado", d: "Desarrollo de un producto de software, prototipo IoT o sistema que resuelva un problema concreto con aliado externo.", req: ["Problema validado con organización", "Carta de compromiso del aliado", "Plan de trabajo aprobado", "Entrega funcional + documentación"], dur: "2 semestres", color: "var(--ug-amarillo)" },
    { t: "Práctica profesional extendida", d: "Vinculación laboral de 8 meses con empresa o institución, con informe técnico y evaluación del jefe inmediato.", req: ["Convenio vigente con empresa", "Mínimo 8 meses · 40 h/sem", "Informe técnico final", "Evaluación de desempeño"], dur: "8 meses", color: "var(--ug-flamingo)" },
    { t: "Cursar posgrado", d: "Aprobación de tres asignaturas de la Maestría en Ingeniería de la Universidad con promedio igual o superior a 4.0.", req: ["Admisión a maestría", "Aprobar 3 cursos ≥ 4.0", "Certificación académica", "Paz y salvo"], dur: "1 – 2 semestres", color: "var(--ug-negro)" },
    { t: "Emprendimiento", d: "Creación y operación de una empresa de base tecnológica por al menos 12 meses con plan de negocio.", req: ["Empresa constituida", "12 meses de operación", "Plan de negocio validado", "Indicadores de tracción"], dur: "12 – 18 meses", color: "var(--ug-azul)" },
    { t: "Semillero de investigación", d: "Permanencia activa en semillero por mínimo tres semestres con productos verificables y ponencia.", req: ["Mín. 3 semestres en semillero", "Ponencia en evento académico", "Producto verificable", "Aval del director del semillero"], dur: "Mínimo 3 sem.", color: "var(--ug-amarillo)" },
  ];
  return (
    <section className="section" style={{ paddingTop: 30 }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Modalidades de grado</div>
            <h2 style={{ marginTop: 10 }}>Seis caminos válidos hacia tu título.</h2>
          </div>
          <p className="desc">Elige la modalidad que mejor se alinea a tu perfil y a lo que quieres hacer después de graduarte. Todas exigen paz y salvo financiero y dominio de lengua extranjera (B1).</p>
        </div>
        <div className="grid-3">
          {modalidades.map((m, i) => (
            <div key={i} className="card" style={{ background: "var(--paper-2)", display: "flex", flexDirection: "column", gap: 14, minHeight: 340 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: m.color }} />
              <h3 style={{ fontSize: 20 }}>{m.t}</h3>
              <p style={{ fontSize: 14, color: "var(--ink-2)" }}>{m.d}</p>
              <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid color-mix(in oklab, var(--ink) 8%, transparent)" }}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Requisitos</div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {m.req.map((r, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "start", gap: 8, fontSize: 13, color: "var(--ink-2)" }}>
                      <I.check /> {r}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 14, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".1em", color: "var(--ink-3)", textTransform: "uppercase" }}>
                  Duración · {m.dur}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EstDocs() {
  const docs = [
    { g: "Académicos", items: [
      ["Reglamento estudiantil 2021", "PDF · 1.8 MB"],
      ["Calendario académico 2026-II", "PDF · 420 KB"],
      ["Plan de estudios completo", "PDF · 720 KB"],
      ["Microcurrículos por asignatura", "ZIP · 8.4 MB"],
      ["Formato cancelación asignatura", "DOC · 42 KB"],
    ]},
    { g: "Trabajo de grado", items: [
      ["Guía de trabajo de grado", "PDF · 960 KB"],
      ["Formato de propuesta", "DOC · 110 KB"],
      ["Acta de sustentación", "DOC · 48 KB"],
      ["Rúbrica de evaluación", "PDF · 380 KB"],
    ]},
    { g: "Prácticas y extensión", items: [
      ["Convenio marco tipo", "PDF · 1.2 MB"],
      ["Carta de presentación", "DOC · 36 KB"],
      ["Bitácora de práctica", "PDF · 540 KB"],
      ["Evaluación de desempeño", "PDF · 310 KB"],
    ]},
    { g: "Bienestar y apoyos", items: [
      ["Subsidios y becas 2026", "PDF · 680 KB"],
      ["Servicios de salud mental", "PDF · 220 KB"],
      ["Apoyo alimentario", "PDF · 180 KB"],
    ]},
  ];
  return (
    <section className="section" style={{ paddingTop: 30 }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Documentos descargables</div>
            <h2 style={{ marginTop: 10 }}>Formatos, guías y reglamentos.</h2>
          </div>
        </div>
        <div className="grid-2">
          {docs.map((g, i) => (
            <div key={i} className="card" style={{ background: "var(--paper-2)" }}>
              <div className="eyebrow" style={{ color: "var(--accent-deep)" }}>● {g.g}</div>
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 0 }}>
                {g.items.map(([n, s], j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: j < g.items.length - 1 ? "1px solid color-mix(in oklab, var(--ink) 7%, transparent)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 6, background: "var(--paper)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--ink-3)" }}>
                        {s.split("·")[0].trim()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{n}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)", letterSpacing: ".08em", marginTop: 2 }}>{s}</div>
                      </div>
                    </div>
                    <button className="icon-btn" style={{ width: 34, height: 34 }}><I.download /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============ DOCENTES (ampliado con horarios + docs) ============
const DOC_PLANTA = [
  { n: "Dra. Luz Marina Ipuana", r: "Directora de Programa", a: "IA aplicada · Datos territoriales", e: "direccion.is@uniguajira.edu.co", h: "Lun–Mié · 2:00–4:00 pm · Oficina 4-302", cat: "Titular" },
  { n: "MSc. Jorge Epieyú Palmar", r: "Docente tiempo completo", a: "Ingeniería de software · DevOps", e: "jepalmar@uniguajira.edu.co", h: "Mar y Jue · 10:00–12:00 am · Lab Software", cat: "Asociado" },
  { n: "Dr. Héctor Brito Mendoza", r: "Investigador GITUG", a: "Ciberseguridad · Redes", e: "hbrito@uniguajira.edu.co", h: "Lun y Vie · 3:00–5:00 pm · Oficina 4-205", cat: "Titular" },
  { n: "MSc. Catalina Uriana Iguarán", r: "Docente tiempo completo", a: "Bases de datos · Ingeniería web", e: "cuiguaran@uniguajira.edu.co", h: "Mié · 9:00–11:00 am · Oficina 4-210", cat: "Asistente" },
  { n: "Dr. Samuel Cotes Ramírez", r: "Investigador Caribe.AI", a: "Machine learning · Visión", e: "scotes@uniguajira.edu.co", h: "Mar y Jue · 2:00–4:00 pm · Lab IA", cat: "Asociado" },
  { n: "MSc. Andrea Bolaños Curvelo", r: "Coord. semilleros", a: "IoT · Sistemas embebidos", e: "abolanos@uniguajira.edu.co", h: "Lun y Mié · 10:00–12:00 am · Lab Hardware", cat: "Asistente" },
  { n: "Dr. Pablo Mengual Solano", r: "Docente tiempo completo", a: "Algoritmos · Ciencias básicas", e: "pmengual@uniguajira.edu.co", h: "Mar y Vie · 8:00–10:00 am · Oficina 4-207", cat: "Asociado" },
  { n: "MSc. Nayely Uriana Jayariyú", r: "Docente tiempo completo", a: "HCI · Diseño interacción", e: "nuriana@uniguajira.edu.co", h: "Jue · 1:00–4:00 pm · Oficina 4-215", cat: "Asistente" },
];

function DocentesPage() {
  const [q, setQ] = useStateC("");
  const [area, setArea] = useStateC("all");
  const filtered = DOC_PLANTA.filter(d => {
    const matchQ = !q || d.n.toLowerCase().includes(q.toLowerCase()) || d.a.toLowerCase().includes(q.toLowerCase());
    const matchA = area === "all" || d.cat.toLowerCase() === area;
    return matchQ && matchA;
  });
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: "clamp(60px, 8vw, 110px)" }}>
        <div className="inner">
          <div className="eyebrow">Comunidad · Docentes</div>
          <h1 style={{ marginTop: 14, maxWidth: "18ch" }}>Quienes enseñan aquí, hacen también.</h1>
          <p style={{ fontSize: 18, color: "var(--ink-2)", marginTop: 24, maxWidth: "58ch" }}>
            Directorio completo con áreas de trabajo, correos institucionales y horarios de atención a estudiantes.
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 36, alignItems: "center" }}>
            <div className="chip"><b style={{ marginRight: 6 }}>28</b> docentes</div>
            <div className="chip"><b style={{ marginRight: 6 }}>9</b> doctorados</div>
            <div className="chip"><b style={{ marginRight: 6 }}>17</b> maestrías</div>
            <div style={{ flex: 1 }} />
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar por nombre o área..."
              style={{ padding: "10px 14px", borderRadius: 999, border: "1px solid color-mix(in oklab, var(--ink) 15%, transparent)", background: "var(--paper-2)", minWidth: 260, font: "inherit" }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            {[["all","Todas las categorías"],["titular","Titular"],["asociado","Asociado"],["asistente","Asistente"]].map(([k,l])=>(
              <button key={k} className="chip" onClick={()=>setArea(k)} style={{
                cursor: "pointer",
                background: area===k ? "var(--ink)" : undefined,
                color: area===k ? "var(--paper)" : undefined,
                borderColor: area===k ? "var(--ink)" : undefined,
              }}>{l}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="inner">
          <div className="grid-2">
            {filtered.map((d, i) => (
              <div key={i} className="card" style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 20, background: "var(--paper-2)" }}>
                <div style={{ width: 100, height: 100, borderRadius: 14, background: ["var(--ug-amarillo-soft)","var(--ug-azul-soft)","var(--ug-flamingo-soft)","var(--paper-3)"][i%4], position: "relative", overflow: "hidden" }}>
                  <WayuuBackdrop variant="a" />
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--ink-3)" }}>{d.r}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginTop: 4, letterSpacing: "-0.01em" }}>{d.n}</div>
                  <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 6 }}>{d.a}</div>
                  <div style={{ marginTop: 12, fontSize: 12, color: "var(--ink-2)" }}>✉ {d.e}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-2)" }}>🕑 {d.h}</div>
                  <div style={{ marginTop: 12 }}>
                    <span className="chip" style={{ fontSize: 10 }}>{d.cat}</span>
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
              <div className="eyebrow">Documentos institucionales</div>
              <h2 style={{ marginTop: 10 }}>Recursos para el cuerpo docente.</h2>
            </div>
          </div>
          <div className="grid-3">
            {[
              ["Estatuto profesoral", "Acuerdo 045 de 2020", "PDF · 1.2 MB"],
              ["Plan de desarrollo profesoral", "2024 – 2028", "PDF · 780 KB"],
              ["Formato de autoevaluación docente", "Vigencia 2026", "DOC · 64 KB"],
              ["Guía para puntos salariales", "Sistema interno UniGuajira", "PDF · 420 KB"],
              ["Reglamento de propiedad intelectual", "Acuerdo 022 de 2019", "PDF · 640 KB"],
              ["Políticas de investigación", "VCTI UniGuajira", "PDF · 580 KB"],
              ["Manual de identidad visual", "Versión 2023", "PDF · 3.4 MB"],
              ["Formato de registro de producción", "CvLac interno", "DOC · 58 KB"],
              ["Política de bienestar docente", "Vigente 2026", "PDF · 390 KB"],
            ].map(([t, s, sz], i) => (
              <div key={i} style={{ padding: "20px 22px", background: "var(--paper)", borderRadius: 12, display: "flex", alignItems: "start", gap: 14, border: "1px solid color-mix(in oklab, var(--ink) 7%, transparent)" }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: "var(--paper-2)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, color: "var(--ink-3)", flexShrink: 0 }}>{sz.split("·")[0].trim()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 15 }}>{t}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>{s}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".08em", color: "var(--ink-3)", marginTop: 4 }}>{sz}</div>
                </div>
                <button className="icon-btn" style={{ width: 32, height: 32 }}><I.download /></button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ============ EGRESADOS ============
function Egresados() {
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: "clamp(60px, 8vw, 110px)" }}>
        <div className="inner">
          <div className="eyebrow">Comunidad · Egresados</div>
          <h1 style={{ marginTop: 14, maxWidth: "22ch" }}>Lo que construyen nuestros egresados nos representa.</h1>
          <p style={{ fontSize: 18, color: "var(--ink-2)", marginTop: 24, maxWidth: "58ch" }}>
            Más de 860 egresados forman una red activa que hoy lidera equipos, funda empresas y continúa estudiando — dentro y fuera del Caribe.
          </p>
        </div>
      </section>

      <EgrDestacados />
      <EgrBolsa />
      <EgrActualizar />
    </div>
  );
}

function EgrDestacados() {
  const egr = [
    { n: "Diana Cotes Ramírez", y: "2018", r: "Head of Data", c: "Grupo Éxito", ciudad: "Bogotá", color: "var(--ug-azul)", q: "Estudié aquí, pero el mundo cabe en La Guajira. Solo hay que saber mirarlo." },
    { n: "Luis Enrique Ariza", y: "2015", r: "Senior SWE", c: "Globant", ciudad: "Medellín", color: "var(--ug-amarillo)", q: "La ingeniería te da el método; La Guajira te da el alma." },
    { n: "Nayely Epieyú Pushaina", y: "2020", r: "CTO & Co-founder", c: "TejerData SAS", ciudad: "Riohacha", color: "var(--ug-flamingo)", q: "Volví para fundar una empresa donde mis tías wayuu venden por internet." },
    { n: "Samuel Palmar Iguarán", y: "2012", r: "Security Architect", c: "BBVA Digital", ciudad: "Ciudad de México", color: "var(--ug-azul)", q: "Ningún framework me enseñó tanto como sustentar una tesis frente a mis profesores." },
    { n: "Carolina Brito Solano", y: "2019", r: "PhD Researcher", c: "MIT Media Lab", ciudad: "Cambridge, MA", color: "var(--ug-flamingo)", q: "Hago investigación en interfaces culturalmente situadas. Mi pregrado me dio ese marco." },
    { n: "Jorge Mengual Jayariyú", y: "2016", r: "Lead Engineer", c: "Rappi", ciudad: "Bogotá", color: "var(--ug-amarillo)", q: "Llegué a Bogotá pensando que me faltaba algo. Me faltaba menos de lo que creía." },
  ];
  return (
    <section className="section" style={{ paddingTop: 40 }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Egresados destacados</div>
            <h2 style={{ marginTop: 10 }}>Seis historias entre cientos.</h2>
          </div>
        </div>
        <div className="grid-3">
          {egr.map((e, i) => (
            <div key={i} className="card" style={{ padding: 0, overflow: "hidden", background: "var(--paper-2)", display: "flex", flexDirection: "column" }}>
              <div style={{ aspectRatio: "4/3", background: e.color, position: "relative", overflow: "hidden" }}>
                <WayuuBackdrop variant="b" />
                <div style={{ position: "absolute", inset: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div style={{ background: "var(--ug-negro)", color: "var(--paper)", padding: "4px 10px", borderRadius: 999, fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: ".12em", textTransform: "uppercase", alignSelf: "start" }}>
                    Promoción {e.y}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--ug-negro)", lineHeight: 1.1 }}>{e.n}</div>
                </div>
              </div>
              <div style={{ padding: 22, flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: "var(--ink-3)" }}>{e.r}</div>
                <div style={{ fontWeight: 500, marginTop: 4 }}>{e.c} · {e.ciudad}</div>
                <p style={{ fontSize: 14, color: "var(--ink-2)", marginTop: 14, flex: 1, fontStyle: "italic", borderLeft: "2px solid " + e.color, paddingLeft: 12 }}>"{e.q}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EgrBolsa() {
  const ofertas = [
    { emp: "Cluster TIC Caribe", p: "Desarrollador(a) Full-stack Jr.", loc: "Barranquilla · Híbrido", tipo: "Tiempo completo", s: "$3.2M – $4.5M", t: ["React","Node","Postgres"] },
    { emp: "Ecopetrol Digital", p: "Analista de datos", loc: "Bogotá · Presencial", tipo: "Tiempo completo", s: "$4.0M – $5.5M", t: ["Python","SQL","PowerBI"] },
    { emp: "TejerData SAS", p: "Ingeniero(a) DevOps", loc: "Riohacha · Remoto", tipo: "Tiempo completo", s: "$5.0M – $7.0M", t: ["AWS","K8s","CI/CD"] },
    { emp: "Alcaldía de Riohacha", p: "Coord. transformación digital", loc: "Riohacha · Presencial", tipo: "Contrato 12m", s: "$6.5M", t: ["Gestión","TIC pública"] },
    { emp: "Sura Tecnología", p: "Practicante de ciberseguridad", loc: "Medellín · Híbrido", tipo: "Práctica 6m", s: "SMLV + aux.", t: ["SIEM","Auditoría"] },
    { emp: "Fundación Activos", p: "Data engineer social", loc: "Bogotá · Remoto", tipo: "Medio tiempo", s: "$2.8M", t: ["ETL","Python"] },
  ];
  return (
    <section className="section" style={{ background: "var(--paper-2)" }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Bolsa de empleo</div>
            <h2 style={{ marginTop: 10 }}>Ofertas exclusivas para la red.</h2>
          </div>
          <p className="desc">Empresas aliadas que priorizan a egresados del programa. Actualizada semanalmente.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {ofertas.map((o, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr auto", gap: 24, padding: "24px 0", borderBottom: "1px solid color-mix(in oklab, var(--ink) 10%, transparent)", borderTop: i === 0 ? "1px solid color-mix(in oklab, var(--ink) 10%, transparent)" : "none", alignItems: "center" }} className="job-row">
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".15em", color: "var(--ink-3)", textTransform: "uppercase" }}>{o.emp}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}>{o.loc}</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.01em" }}>{o.p}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {o.t.map((tg, j) => <span key={j} className="chip" style={{ fontSize: 10, padding: "3px 8px" }}>{tg}</span>)}
                </div>
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-2)" }}>{o.tipo}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16 }}>{o.s}</div>
              <button className="btn ghost" style={{ padding: "8px 16px", fontSize: 13 }}>Aplicar <I.arrow /></button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
          <button className="btn">Ver todas las ofertas <I.arrow /></button>
        </div>
      </div>
    </section>
  );
}

function EgrActualizar() {
  const [sent, setSent] = useStateC(false);
  return (
    <section className="section">
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Actualiza tus datos</div>
            <h2 style={{ marginTop: 10 }}>Cuéntanos dónde estás hoy.</h2>
          </div>
          <p className="desc">Actualizar tus datos nos permite mejorar la pertinencia del programa, certificar tu experiencia, y conectarte con ofertas relevantes para tu perfil actual.</p>
        </div>

        {sent ? (
          <div className="card" style={{ background: "var(--ug-azul)", color: "var(--ug-negro)", textAlign: "center", padding: "60px 20px", border: "none" }}>
            <div style={{ width: 72, height: 72, borderRadius: 999, background: "var(--ug-negro)", color: "var(--paper)", margin: "0 auto 24px", display: "grid", placeItems: "center" }}>
              <I.check />
            </div>
            <h3 style={{ fontSize: 28, color: "var(--ug-negro)" }}>¡Gracias por actualizarte!</h3>
            <p style={{ marginTop: 14, fontSize: 16, maxWidth: "42ch", margin: "14px auto 0" }}>
              Recibirás una confirmación por correo y entrarás en la lista de distribución del boletín bimestral de egresados.
            </p>
          </div>
        ) : (
          <form className="card" style={{ background: "var(--paper-2)", padding: 32 }} onSubmit={(e)=>{ e.preventDefault(); setSent(true); }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="eg-form">
              <div className="field"><label>Nombres y apellidos</label><input /></div>
              <div className="field"><label>Documento de identidad</label><input /></div>
              <div className="field"><label>Año de grado</label><input placeholder="AAAA" /></div>
              <div className="field"><label>Correo personal</label><input type="email" /></div>
              <div className="field"><label>Celular / WhatsApp</label><input /></div>
              <div className="field"><label>Ciudad actual</label><input /></div>
              <div className="field"><label>Empresa u organización</label><input /></div>
              <div className="field"><label>Cargo actual</label><input /></div>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Formación posterior</label>
                <select>
                  <option>Ninguna</option>
                  <option>Especialización</option>
                  <option>Maestría en curso</option>
                  <option>Maestría terminada</option>
                  <option>Doctorado en curso</option>
                  <option>Doctorado terminado</option>
                </select>
              </div>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>Cuéntanos en una línea qué estás haciendo hoy</label>
                <textarea rows="3" placeholder="Opcional — puede ser destacado en la web"></textarea>
              </div>
            </div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <label style={{ display: "flex", gap: 10, alignItems: "start", fontSize: 13, color: "var(--ink-2)", maxWidth: "55ch" }}>
                <input type="checkbox" style={{ marginTop: 4 }} defaultChecked />
                Autorizo el tratamiento de mis datos conforme a la política de la Universidad de La Guajira.
              </label>
              <button className="btn accent" type="submit">Enviar actualización <I.arrow /></button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

Object.assign(window, { Estudiantes, DocentesPage, Egresados });
