/* Home page + Programa + Pensum + Perfil egresado */

const { useState: useStateH, useEffect: useEffectH } = React;

function Hero({ variant }) {
  const { go } = useRoute();
  if (variant === "v1") {
    return (
      <section className="hero">
        <WayuuBackdrop variant="a" />
        <div className="inner">
          <div className="hero-eyebrow-row">
            <span className="chip"><I.sparkle /> Acreditación de alta calidad vigente</span>
            <span className="chip">Res. MEN 02872/2018 · SNIES 17579</span>
          </div>
          <h1>Ingeniería<br/>con raíces<br/><em style={{ color: "var(--accent-deep)", fontStyle: "normal" }}>en el desierto.</em></h1>
          <p className="lede">
            En la Universidad de La Guajira formamos ingenieros de sistemas que resuelven con código, pensamiento crítico y una identidad que florece entre la arena, el mar y la sabiduría wayuu.
          </p>
          <div className="hero-cta">
            <button className="btn accent" onClick={() => go("acreditacion")}>Ver acreditación CNA <I.arrow /></button>
            <button className="btn ghost" onClick={() => go("programa")}>Conoce el programa</button>
          </div>
          <div className="hero-stats">
            <div className="stat"><div className="n">169</div><div className="l">Créditos académicos</div></div>
            <div className="stat"><div className="n">10</div><div className="l">Semestres · presencial diurno</div></div>
            <div className="stat"><div className="n">17579</div><div className="l">Código SNIES del programa</div></div>
            <div className="stat"><div className="n">12/12</div><div className="l">Factores CNA en autoevaluación</div></div>
          </div>
        </div>
      </section>
    );
  }
  if (variant === "v2") {
    return (
      <section className="hero v2">
        <div className="inner">
          <div>
            <div className="hero-eyebrow-row">
              <span className="chip"><I.sparkle /> Acreditación CNA · 12 factores</span>
            </div>
            <h1>El código también se teje.</h1>
            <p className="lede">
              Ingeniería de Sistemas en UniGuajira: una carrera donde el rigor técnico se encuentra con la identidad caribeña. Seis semestres de fundamentos, cuatro de profundización, un propósito: resolver lo que importa aquí.
            </p>
            <div className="hero-cta">
              <button className="btn accent" onClick={() => go("acreditacion")}>Ver acreditación <I.arrow /></button>
              <button className="btn ghost" onClick={() => go("pensum")}>Plan de estudios</button>
            </div>
          </div>
          <div className="image-panel">
            <div style={{ position: "absolute", inset: 0 }}><WayuuBackdrop variant="b" /></div>
            <div style={{ position: "absolute", inset: 24, background: "var(--paper)", borderRadius: 18, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div className="eyebrow">Proyecto destacado</div>
                <h3 style={{ marginTop: 10, fontSize: 24 }}>ArenaNet: IoT para monitoreo de salinas en Manaure</h3>
              </div>
              <div>
                <Placeholder label="Fotografía · Salinas de Manaure" aspect="16/10" />
                <div style={{ marginTop: 14, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", letterSpacing: ".1em" }}>
                  SEMILLERO · IOT WAYUU · 2025
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  // v3
  return (
    <section className="hero v3">
      <WayuuBackdrop variant="b" />
      <div className="inner">
        <div className="hero-eyebrow-row" style={{ justifyContent: "center" }}>
          <span className="chip"><I.sparkle /> Una carrera, una identidad</span>
        </div>
        <h1>Piensa como ingeniero.<br/><span style={{ color: "var(--accent-deep)" }}>Teje como wayuu.</span></h1>
        <p className="lede">
          Ingeniería de Sistemas en la Universidad de La Guajira: donde la lógica se cruza con el territorio.
        </p>
        <div className="hero-cta">
          <button className="btn accent" onClick={() => go("estudiantes")}>Comunidad estudiantil <I.arrow /></button>
          <button className="btn ghost" onClick={() => go("programa")}>Ver programa</button>
        </div>
        <div style={{ marginTop: 80 }}>
          <WayuuBand height={40} />
        </div>
      </div>
    </section>
  );
}

function Ticker() {
  const items = [
    "Acreditación de alta calidad en curso · CNA 2026",
    "Acreditación CNA — 12/12 factores en autoevaluación",
    "Semillero IoT Wayuu presenta en IEEE Colombia",
    "Hackathon Guajira Tech 2026 · 15–17 mayo",
    "Nuevo laboratorio de ciberseguridad inaugurado",
    "Convenio con Cluster TIC Caribe firmado",
  ];
  return (
    <div className="ticker">
      <div className="ticker-track">
        {[...items, ...items].map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  );
}

function HomeFeatures() {
  const cards = [
    { eyebrow: "01 · Formación", title: "Un pensum que respira", body: "Diez semestres que combinan fundamentos de computación, ingeniería de software, datos, redes e IA — con electivas en IoT aplicado, bioinformática marina y ciencia de datos territorial." },
    { eyebrow: "02 · Investigación", title: "Tres grupos, una región", body: "GITUG, WayuuLab y Caribe.AI articulan 14 semilleros activos y proyectos con comunidades wayuu, pescadores y salineros." },
    { eyebrow: "03 · Territorio", title: "Problemas reales, soluciones de código", body: "Cada estudiante participa en al menos un proyecto con aliado externo: alcaldía, gremio, ONG o empresa regional." },
  ];
  return (
    <section className="section">
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Qué te llevas de aquí</div>
            <h2>Un ingeniero con criterio técnico <em style={{ color: "var(--accent-deep)", fontStyle: "normal" }}>y arraigo territorial.</em></h2>
          </div>
          <p className="desc">
            No formamos programadores genéricos. Formamos ingenieros de sistemas que saben leer un problema del Caribe y resolverlo con la mejor herramienta —sea Python, un diseño de red o una conversación con una comunidad.
          </p>
        </div>
        <div className="grid-3">
          {cards.map((c, i) => (
            <div key={i} className="card" style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 280 }}>
              <div className="eyebrow">{c.eyebrow}</div>
              <h3>{c.title}</h3>
              <p style={{ color: "var(--ink-2)", fontSize: 15 }}>{c.body}</p>
              <div style={{ marginTop: "auto", paddingTop: 16 }}>
                <WayuuGlyph size={36} color="var(--accent)" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeCNAPreview() {
  const { go } = useRoute();
  return (
    <section className="section" style={{ background: "var(--paper-2)", borderTop: "1px solid color-mix(in oklab, var(--ink) 8%, transparent)", borderBottom: "1px solid color-mix(in oklab, var(--ink) 8%, transparent)" }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow" style={{ color: "var(--ug-flamingo-deep)" }}>● Autoevaluación 2026</div>
            <h2>Acreditación CNA — <br/>doce factores, una carrera.</h2>
          </div>
          <p className="desc">
            Estamos en proceso de acreditación de alta calidad bajo el Acuerdo 02 de 2020. Explora el tablero completo con evidencias, avances y compromisos por factor.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 40, alignItems: "center" }} className="cna-preview-grid">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {Array.from({ length: 12 }).map((_, i) => {
              const status = i < 6 ? "pleno" : i < 10 ? "alto" : "desarrollo";
              const color = status === "pleno" ? "var(--ug-azul)" : status === "alto" ? "var(--ug-amarillo)" : "var(--ug-flamingo)";
              return (
                <div key={i} style={{ aspectRatio: "1/1", background: color, borderRadius: 10, display: "grid", placeItems: "center", color: "var(--ug-negro)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22 }}>
                  {i + 1}
                </div>
              );
            })}
          </div>
          <div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
              <span className="chip" style={{ background: "color-mix(in oklab, var(--ug-azul) 30%, transparent)", borderColor: "transparent" }}>Cumplimiento pleno · 6</span>
              <span className="chip" style={{ background: "color-mix(in oklab, var(--ug-amarillo) 30%, transparent)", borderColor: "transparent" }}>Cumplimiento alto · 4</span>
              <span className="chip" style={{ background: "color-mix(in oklab, var(--ug-flamingo) 30%, transparent)", borderColor: "transparent" }}>En desarrollo · 2</span>
            </div>
            <p style={{ fontSize: 17, color: "var(--ink-2)", marginBottom: 24 }}>
              Tu próxima visita como par evaluador empieza aquí: tablero interactivo con las 12 dimensiones del CNA, evidencias documentales, planes de mejoramiento y cronograma.
            </p>
            <button className="btn" onClick={() => go("acreditacion")}>Ir al tablero CNA <I.arrow /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeMissions() {
  const { go } = useRoute();
  const items = [
    { c: "#62a9b6", t: "Investigación", d: "Tres grupos MinCiencias, catorce semilleros y producción indexada con impacto territorial.", l: "investigacion", label: "Azul mar" },
    { c: "#e2a542", t: "Extensión y Proyección Social", d: "Convenios con comunidades wayuu, alcaldías y sector TIC del Caribe colombiano.", l: "extension", label: "Amarillo desierto" },
    { c: "#cc5e50", t: "Internacionalización", d: "Movilidad entrante y saliente, cooperación académica y currículo internacionalizado.", l: "internacionalizacion", label: "Rosado flamingo" },
    { c: "#1a2744", t: "Tablero de Convocatorias", d: "Oportunidades abiertas de investigación, extensión, movilidad y estudiantes.", l: "convocatorias", label: "Azul marino" },
  ];
  return (
    <section className="section">
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Funciones misionales</div>
            <h2>Cuatro columnas que sostienen la carrera.</h2>
          </div>
        </div>
        <div className="grid-4">
          {items.map((it, i) => {
            const darkBg = it.c === "#1a2744";
            const fg = darkBg ? "#ffffff" : "var(--ug-negro)";
            return (
              <button key={i} onClick={() => go(it.l)}
                      style={{ textAlign: "left", padding: 28, border: 0, cursor: "pointer", background: it.c, color: fg, borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: 18, minHeight: 280, position: "relative", overflow: "hidden", transition: "transform .2s ease" }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-3px)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", opacity: 0.7 }}>0{i+1} · {it.label}</div>
                <h3 style={{ fontSize: 26, color: fg, letterSpacing: "-0.01em" }}>{it.t}</h3>
                <p style={{ fontSize: 14, color: fg, opacity: 0.85, lineHeight: 1.5 }}>{it.d}</p>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: fg, opacity: 0.9 }}>
                  Proyectos · Convocatorias · Eventos <I.arrow />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HomeConvocatorias() {
  const { go } = useRoute();
  const convos = [
    { tag: "Estudiantes", title: "Inscripción opciones de grado", deadline: "30 Jun 2026", status: "abierta", body: "Ventana de inscripción de modalidad de trabajo de grado 2026-II." },
    { tag: "Movilidad", title: "Intercambio UNAM · México", deadline: "15 Jul 2026", status: "abierta", body: "Semestre de movilidad académica para estudiantes de 7º a 9º." },
    { tag: "Investigación", title: "Jóvenes Investigadores MinCiencias", deadline: "28 May 2026", status: "por cerrar", body: "Convocatoria interna para vincular egresados a grupos de investigación." },
    { tag: "Extensión", title: "Hackathon Guajira Tech 2026", deadline: "15 May 2026", status: "abierta", body: "48 horas de código para soluciones al turismo sostenible en el cabo." },
  ];
  return (
    <section className="section" style={{ background: "var(--paper-2)" }}>
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Tablero de convocatorias</div>
            <h2>Oportunidades abiertas ahora.</h2>
          </div>
          <p className="desc">Movilidad, investigación, extensión y opciones para estudiantes. Filtrá, postulate y seguí el estado desde aquí.</p>
        </div>
        <div className="grid-2">
          {convos.map((c, i) => (
            <div key={i} className="card" style={{ background: "var(--paper)", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="chip">{c.tag}</span>
                <span className="chip" style={{
                  background: c.status === "abierta" ? "color-mix(in oklab, var(--ug-azul) 30%, transparent)" : "color-mix(in oklab, var(--ug-flamingo) 30%, transparent)",
                  borderColor: "transparent"
                }}>{c.status}</span>
              </div>
              <h3 style={{ fontSize: 22, marginTop: 4 }}>{c.title}</h3>
              <p style={{ fontSize: 14, color: "var(--ink-2)" }}>{c.body}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 14, borderTop: "1px solid color-mix(in oklab, var(--ink) 8%, transparent)" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".1em", color: "var(--ink-3)", textTransform: "uppercase" }}>Cierra {c.deadline}</div>
                <button className="btn ghost" style={{ padding: "6px 14px", fontSize: 13 }}>Ver <I.arrow /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Home({ heroVariant }) {
  return (
    <div className="page-in">
      <Hero variant={heroVariant} />
      <Ticker />
      <HomeFeatures />
      <HomeCNAPreview />
      <HomeMissions />
      <HomeConvocatorias />
    </div>
  );
}

// ========= PROGRAMA =========
function Programa() {
  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: "clamp(60px, 8vw, 110px)" }}>
        <div className="inner">
          <div className="eyebrow">Presentación del programa</div>
          <h1 style={{ marginTop: 14, maxWidth: "18ch" }}>Ingeniería de Sistemas que se teje con el territorio.</h1>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 60, marginTop: 60, alignItems: "start" }} className="programa-grid">
            <div>
              <p style={{ fontSize: 18, color: "var(--ink-2)", marginBottom: 20 }}>
                Nuestro programa forma ingenieros capaces de diseñar, implementar y evaluar sistemas computacionales desde una mirada integral: técnica rigurosa, sensibilidad territorial y ética profesional.
              </p>
              <p style={{ fontSize: 18, color: "var(--ink-2)", marginBottom: 20 }}>
                Pertinencia significa entender que La Guajira necesita ingenieros que sepan de IoT para monitorear salinas y pozos, de datos para evaluar programas sociales, de software para digitalizar microempresas caribeñas — y que dominen también lo global.
              </p>
            </div>
            <aside style={{ background: "var(--paper-2)", borderRadius: "var(--radius-lg)", padding: 28, border: "1px solid color-mix(in oklab, var(--ink) 8%, transparent)" }}>
              <div className="eyebrow">Ficha técnica</div>
              <dl style={{ marginTop: 16, display: "grid", gap: 14 }}>
                {[
                  ["Título", "Ingeniero(a) de Sistemas"],
                  ["Nivel", "Pregrado profesional"],
                  ["Duración", "10 semestres"],
                  ["Créditos", "169 créditos"],
                  ["Modalidad", "Presencial — Diurno"],
                  ["Registro calificado", "Res. 02872 del 21 feb 2018"],
                  ["Acreditación alta calidad", "Res. 014528 del 28 jul 2022"],
                  ["SNIES", "17579"],
                  ["Ciudad", "Riohacha, La Guajira"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 20, fontSize: 14, paddingBottom: 12, borderBottom: "1px solid color-mix(in oklab, var(--ink) 7%, transparent)" }}>
                    <dt style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase" }}>{k}</dt>
                    <dd style={{ margin: 0, fontWeight: 500, textAlign: "right" }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <ProgramaMisionVision />
      <ProgramaObjetivos />

      <section className="section" style={{ paddingTop: 0 }} id="plan">
        <div className="inner">
          <div className="section-head">
            <div className="title">
              <div className="eyebrow">Plan de estudios interactivo</div>
              <h2>169 créditos · 10 semestres · filtros por área.</h2>
            </div>
            <p className="desc">Tocá cualquier curso para ver su microcurrículo, créditos y prerrequisitos.</p>
          </div>
        </div>
        <PensumEmbed />
      </section>

      <ProgramaPerfiles />
      <ProgramaResoluciones />
      <ProgramaDireccion />
    </div>
  );
}

function ProgramaMisionVision() {
  return (
    <section className="section" style={{ background: "var(--paper-2)" }} id="mision">
      <div className="inner">
        <div className="grid-2">
          <div className="card" style={{ background: "var(--paper)", padding: 36 }}>
            <div className="eyebrow" style={{ color: "var(--ug-azul-deep)" }}>● Misión</div>
            <h2 style={{ marginTop: 14, fontSize: 28 }}>Formar ingenieros con criterio técnico y arraigo territorial.</h2>
            <p style={{ fontSize: 16, color: "var(--ink-2)", marginTop: 18 }}>
              Formar ingenieros de sistemas competentes, éticos y socialmente responsables, capaces de diseñar, implementar y administrar soluciones informáticas pertinentes al desarrollo de La Guajira, la región Caribe y el país, con sensibilidad por la diversidad cultural y el cuidado del medio ambiente.
            </p>
          </div>
          <div className="card" style={{ background: "var(--paper)", padding: 36 }}>
            <div className="eyebrow" style={{ color: "var(--ug-flamingo-deep)" }}>● Visión</div>
            <h2 style={{ marginTop: 14, fontSize: 28 }}>Referente en ingeniería pertinente al Caribe colombiano.</h2>
            <p style={{ fontSize: 16, color: "var(--ink-2)", marginTop: 18 }}>
              En 2030 el programa de Ingeniería de Sistemas será reconocido como referente académico e investigativo en el Caribe colombiano, con acreditación de alta calidad renovada, producción científica indexada y egresados que lideren la transformación digital del territorio.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgramaObjetivos() {
  return (
    <section className="section" id="objetivos">
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Objetivos del programa</div>
            <h2>Lo que promete la carrera.</h2>
          </div>
        </div>
        <div className="grid-3">
          {[
            { t: "Pensar computacionalmente", d: "Modelar problemas con abstracción, algoritmos y estructuras de datos apropiadas." },
            { t: "Construir software con oficio", d: "Ingeniería de software, arquitectura limpia, pruebas y despliegue continuo." },
            { t: "Leer los datos del territorio", d: "Ciencia de datos aplicada a salud pública, turismo, agro y conservación del Caribe." },
            { t: "Diseñar redes y sistemas", d: "Infraestructura, ciberseguridad y soluciones IoT para contextos con recursos limitados." },
            { t: "Actuar con ética y territorio", d: "Compromiso con la diversidad cultural, la sostenibilidad y los derechos de los pueblos." },
            { t: "Emprender con criterio", d: "Modelos de negocio, propiedad intelectual y ecosistema TIC del Caribe colombiano." },
          ].map((it, i) => (
            <div key={i} className="card">
              <div style={{ display: "flex", gap: 12, alignItems: "start", marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent)", display: "grid", placeItems: "center", color: "var(--ug-negro)", flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700 }}>{String(i+1).padStart(2,'0')}</div>
                <h3 style={{ fontSize: 19 }}>{it.t}</h3>
              </div>
              <p style={{ color: "var(--ink-2)", fontSize: 14 }}>{it.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgramaPerfiles() {
  return (
    <section className="section" style={{ background: "var(--paper-2)" }} id="perfiles">
      <div className="inner">
        <div className="grid-2">
          <div>
            <div className="eyebrow">Perfil del aspirante</div>
            <h2 style={{ marginTop: 12, fontSize: 32 }}>¿Para quién es esta carrera?</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: "24px 0 0", display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                "Curiosidad por cómo funcionan las tecnologías digitales.",
                "Habilidades para el razonamiento lógico, matemático y abstracto.",
                "Interés por resolver problemas del entorno con herramientas computacionales.",
                "Disposición al trabajo en equipo y la comunicación efectiva.",
                "Compromiso con la diversidad cultural del territorio guajiro y caribeño.",
              ].map((p, i) => (
                <li key={i} style={{ display: "flex", gap: 12, alignItems: "start", fontSize: 15, color: "var(--ink-2)" }}>
                  <I.check /> {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="eyebrow">Perfil del egresado</div>
            <h2 style={{ marginTop: 12, fontSize: 32 }}>¿En qué se desempeñará?</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: "24px 0 0", display: "flex", flexDirection: "column", gap: 10 }}>
              {["Desarrollador(a) full-stack", "Ingeniero(a) de datos", "Analista de ciberseguridad", "Arquitecto(a) de software", "Líder técnico de proyectos TIC", "Consultor(a) de transformación digital", "Investigador(a) en IA aplicada", "Emprendedor(a) tecnológico(a)"].map((r, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, padding: "10px 14px", background: "var(--paper)", borderRadius: 10, border: "1px solid color-mix(in oklab, var(--ink) 7%, transparent)" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: "var(--accent)", display: "grid", placeItems: "center", color: "var(--ug-negro)", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{String(i+1).padStart(2,'0')}</div>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgramaResoluciones() {
  const docs = [
    { eyebrow: "Registro calificado", t: "Resolución N.º 02872", d: "21 de febrero de 2018", body: "Otorgamiento del registro calificado al programa de Ingeniería de Sistemas de la Universidad de La Guajira por parte del Ministerio de Educación Nacional.", color: "var(--ug-azul)" },
    { eyebrow: "Acreditación de alta calidad", t: "Resolución N.º 014528", d: "28 de julio de 2022", body: "Otorgamiento de la acreditación de alta calidad, vigente. Reconocimiento a la calidad académica, investigativa y de extensión del programa.", color: "var(--ug-amarillo)" },
  ];
  return (
    <section className="section" id="resoluciones">
      <div className="inner">
        <div className="section-head">
          <div className="title">
            <div className="eyebrow">Resoluciones</div>
            <h2>Documentos oficiales del programa.</h2>
          </div>
        </div>
        <div className="grid-2">
          {docs.map((d, i) => (
            <div key={i} className="card" style={{ padding: 0, overflow: "hidden", background: "var(--paper-2)" }}>
              <div style={{ height: 120, background: d.color, padding: 24, color: "var(--ug-negro)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase" }}>{d.eyebrow}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 600, letterSpacing: "-0.02em" }}>{d.t}</div>
              </div>
              <div style={{ padding: 28 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: ".1em", color: "var(--ink-3)", textTransform: "uppercase" }}>Fecha · {d.d}</div>
                <p style={{ fontSize: 15, color: "var(--ink-2)", marginTop: 14, marginBottom: 22 }}>{d.body}</p>
                <button className="btn ghost" style={{ padding: "8px 16px", fontSize: 13 }}><I.download /> Descargar PDF</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgramaDireccion() {
  return (
    <section className="section" style={{ background: "var(--paper-2)" }} id="direccion">
      <div className="inner">
        <div className="grid-2">
          <div>
            <div className="eyebrow">Dirección del programa</div>
            <h2 style={{ marginTop: 12, fontSize: 32 }}>Adanud Segundo Meza Valle</h2>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: ".15em", color: "var(--ink-3)", textTransform: "uppercase", marginTop: 8 }}>Director · Ingeniería de Sistemas</div>
            <p style={{ fontSize: 16, color: "var(--ink-2)", marginTop: 24, maxWidth: "52ch" }}>
              Lidera la gestión académica, la autoevaluación con fines de acreditación, la coordinación de los comités curricular y de autoevaluación, y la articulación del programa con las funciones misionales de la Universidad de La Guajira.
            </p>
          </div>
          <div className="card" style={{ background: "var(--paper)", padding: 32 }}>
            <div className="eyebrow">Contacto institucional</div>
            <dl style={{ margin: "20px 0 0", display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                ["Correo", "ingsistemas@uniguajira.edu.co"],
                ["Teléfono", "+57 (605) 7282729"],
                ["Extensiones", "240, 241"],
                ["Sede", "Bloque 1 — segundo piso"],
                ["Dirección", "Km 3+354 Vía Maicao, Riohacha"],
                ["Atención", "Lun–Vie 8:00 a. m. – 5:30 p. m."],
              ].map(([k,v]) => (
                <div key={k} style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 16, fontSize: 14, paddingBottom: 12, borderBottom: "1px solid color-mix(in oklab, var(--ink) 7%, transparent)" }}>
                  <dt style={{ color: "var(--ink-3)", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase" }}>{k}</dt>
                  <dd style={{ margin: 0, fontWeight: 500 }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========= PENSUM =========
// Total: 169 créditos · 10 semestres
const PENSUM = [
  // Semestre 1 — 16 cr
  [{n:"Cálculo diferencial",c:4,a:"basicas"},{n:"Lógica de programación",c:4,a:"ingenieria"},{n:"Introducción a la ingeniería",c:2,a:"socio"},{n:"Inglés I",c:2,a:"socio"},{n:"Comunicación escrita",c:2,a:"socio"},{n:"Competencias ciudadanas",c:2,a:"socio"}],
  // Semestre 2 — 17 cr
  [{n:"Cálculo integral",c:4,a:"basicas"},{n:"Álgebra lineal",c:3,a:"basicas"},{n:"Prog. orientada a objetos",c:4,a:"ingenieria"},{n:"Cultura wayuu y territorio",c:2,a:"socio"},{n:"Inglés II",c:2,a:"socio"},{n:"Geometría analítica",c:2,a:"basicas"}],
  // Semestre 3 — 17 cr
  [{n:"Ecuaciones diferenciales",c:3,a:"basicas"},{n:"Estructuras de datos",c:4,a:"ingenieria"},{n:"Física mecánica",c:4,a:"basicas"},{n:"Estadística descriptiva",c:3,a:"basicas"},{n:"Ética profesional",c:3,a:"socio"}],
  // Semestre 4 — 17 cr
  [{n:"Probabilidad y estadística",c:3,a:"basicas"},{n:"Algoritmos avanzados",c:4,a:"ingenieria"},{n:"Bases de datos",c:4,a:"ingenieria"},{n:"Física electromagnética",c:4,a:"basicas"},{n:"Economía para ingenieros",c:2,a:"socio"}],
  // Semestre 5 — 18 cr
  [{n:"Análisis numérico",c:3,a:"basicas"},{n:"Ing. de software I",c:4,a:"ingenieria"},{n:"Sistemas operativos",c:4,a:"ingenieria"},{n:"Redes de computadores",c:4,a:"ingenieria"},{n:"Investigación de operaciones",c:3,a:"basicas"}],
  // Semestre 6 — 16 cr
  [{n:"Ing. de software II",c:4,a:"ingenieria"},{n:"Bases de datos avanzadas",c:3,a:"ingenieria"},{n:"Ciberseguridad fundamentos",c:3,a:"ingenieria"},{n:"Arquitectura de computadores",c:4,a:"ingenieria"},{n:"Metodología de investigación",c:2,a:"socio"}],
  // Semestre 7 — 17 cr
  [{n:"Inteligencia artificial",c:4,a:"ingenieria"},{n:"Desarrollo web avanzado",c:4,a:"ingenieria"},{n:"Gestión de proyectos TIC",c:3,a:"socio"},{n:"Electiva profundización I",c:4,a:"profundizacion"},{n:"Inglés técnico",c:2,a:"socio"}],
  // Semestre 8 — 17 cr
  [{n:"Ciencia de datos",c:4,a:"profundizacion"},{n:"IoT y sistemas embebidos",c:4,a:"profundizacion"},{n:"Computación en la nube",c:3,a:"profundizacion"},{n:"Electiva profundización II",c:4,a:"profundizacion"},{n:"Emprendimiento TIC",c:2,a:"socio"}],
  // Semestre 9 — 17 cr
  [{n:"Trabajo de grado I",c:4,a:"profundizacion"},{n:"Seminario de investigación",c:3,a:"profundizacion"},{n:"Electiva profundización III",c:4,a:"profundizacion"},{n:"Legislación informática",c:3,a:"socio"},{n:"Electiva libre I",c:3,a:"profundizacion"}],
  // Semestre 10 — 17 cr
  [{n:"Trabajo de grado II",c:6,a:"profundizacion"},{n:"Práctica profesional",c:8,a:"profundizacion"},{n:"Electiva libre II",c:3,a:"profundizacion"}],
];

function Pensum() {
  const [selected, setSelected] = useStateH(null);
  const [filter, setFilter] = useStateH("all");
  const total = PENSUM.flat().reduce((a, c) => a + c.c, 0);
  const areaLabels = { basicas: "Ciencias básicas", ingenieria: "Ingeniería aplicada", socio: "Socio-humanística", profundizacion: "Profundización" };

  return (
    <div className="page-in">
      <section className="section" style={{ paddingTop: "clamp(60px, 8vw, 110px)", paddingBottom: 40 }}>
        <div className="inner">
          <div className="eyebrow">Plan de estudios</div>
          <h1 style={{ marginTop: 14, maxWidth: "16ch" }}>Diez semestres. Cada curso, una pieza del tejido.</h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginTop: 40, alignItems: "center" }}>
            <div className="chip"><b style={{ marginRight: 6 }}>{total}</b> créditos totales</div>
            <div className="chip"><b style={{ marginRight: 6 }}>{PENSUM.flat().length}</b> asignaturas</div>
            <div className="chip">10 semestres · 5 años</div>
            <div style={{ flex: 1 }} />
            <button className="btn ghost" style={{ padding: "8px 16px", fontSize: 13 }}><I.download /> Descargar PDF</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
            {[{k:"all",l:"Todas"},{k:"basicas",l:"Ciencias básicas"},{k:"ingenieria",l:"Ingeniería"},{k:"socio",l:"Socio-humanística"},{k:"profundizacion",l:"Profundización"}].map(f => (
              <button key={f.k} onClick={()=>setFilter(f.k)}
                className="chip"
                style={{
                  cursor: "pointer",
                  background: filter === f.k ? "var(--ink)" : undefined,
                  color: filter === f.k ? "var(--paper)" : undefined,
                  borderColor: filter === f.k ? "var(--ink)" : undefined,
                }}>
                {f.l}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section style={{ padding: "0 var(--gutter) 40px" }}>
        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
          <div className="pensum">
            {PENSUM.map((sem, si) => (
              <div key={si} className="sem-col">
                <div className="sem-head">Sem · {String(si+1).padStart(2,'0')}</div>
                {sem.map((course, ci) => {
                  const dimmed = filter !== "all" && course.a !== filter;
                  return (
                    <button key={ci}
                      className={"course" + (selected && selected.si === si && selected.ci === ci ? " active" : "")}
                      data-area={course.a}
                      style={{ opacity: dimmed ? 0.3 : 1, textAlign: "left" }}
                      onClick={()=>setSelected({ si, ci, course })}>
                      {course.n}
                      <span className="cr">{course.c} cr · {areaLabels[course.a]}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
      {selected && (
        <>
          <div className="drawer-backdrop" onClick={()=>setSelected(null)} />
          <aside className="drawer">
            <div className="drawer-head">
              <div>
                <div className="eyebrow">Sem {String(selected.si+1).padStart(2,'0')} · {areaLabels[selected.course.a]}</div>
                <h2 style={{ marginTop: 8, fontSize: 30 }}>{selected.course.n}</h2>
              </div>
              <button className="icon-btn" onClick={()=>setSelected(null)}><I.close /></button>
            </div>
            <div className="drawer-body">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
                <span className="chip">{selected.course.c} créditos</span>
                <span className="chip">64 horas TD · {selected.course.c * 32} horas TI</span>
                <span className="chip">Obligatoria</span>
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 10 }}>Descripción</h3>
              <p style={{ color: "var(--ink-2)", marginBottom: 24 }}>
                Curso que desarrolla las competencias centrales del área {areaLabels[selected.course.a].toLowerCase()} en el marco del programa. Integra fundamentos teóricos con ejercicios aplicados al contexto caribeño.
              </p>
              <h3 style={{ fontSize: 16, marginBottom: 10 }}>Resultados de aprendizaje</h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: "var(--ink-2)", marginBottom: 24 }}>
                <li>Aplicar conceptos clave del área a problemas reales.</li>
                <li>Diseñar soluciones respaldadas por buenas prácticas.</li>
                <li>Evaluar críticamente alternativas técnicas y metodológicas.</li>
                <li>Comunicar resultados con rigor a audiencias diversas.</li>
              </ul>
              <h3 style={{ fontSize: 16, marginBottom: 10 }}>Prerrequisitos</h3>
              <p style={{ color: "var(--ink-2)" }}>
                {selected.si === 0 ? "Ninguno — asignatura de primer semestre." : `Asignaturas aprobadas hasta el semestre ${selected.si}.`}
              </p>
              <div style={{ marginTop: 32, display: "flex", gap: 10 }}>
                <button className="btn"><I.download /> Microcurrículo PDF</button>
                <button className="btn ghost" onClick={()=>setSelected(null)}>Cerrar</button>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

Object.assign(window, { Home, Programa, Pensum, Hero, PensumEmbed });

// Embeddable pensum (for use inside Programa page, without the big hero)
function PensumEmbed() {
  const [selected, setSelected] = useStateH(null);
  const [filter, setFilter] = useStateH("all");
  const areaLabels = { basicas: "Ciencias básicas", ingenieria: "Ingeniería aplicada", socio: "Socio-humanística", profundizacion: "Profundización" };
  return (
    <>
      <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "0 var(--gutter)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {[{k:"all",l:"Todas"},{k:"basicas",l:"Ciencias básicas"},{k:"ingenieria",l:"Ingeniería"},{k:"socio",l:"Socio-humanística"},{k:"profundizacion",l:"Profundización"}].map(f => (
            <button key={f.k} onClick={()=>setFilter(f.k)}
              className="chip"
              style={{
                cursor: "pointer",
                background: filter === f.k ? "var(--ink)" : undefined,
                color: filter === f.k ? "var(--paper)" : undefined,
                borderColor: filter === f.k ? "var(--ink)" : undefined,
              }}>
              {f.l}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 var(--gutter) 40px" }}>
        <div style={{ maxWidth: "var(--max-w)", margin: "0 auto" }}>
          <div className="pensum">
            {PENSUM.map((sem, si) => {
              const semTotal = sem.reduce((a,c)=>a+c.c,0);
              return (
                <div key={si} className="sem-col">
                  <div className="sem-head">Sem · {String(si+1).padStart(2,'0')} · {semTotal} cr</div>
                  {sem.map((course, ci) => {
                    const dimmed = filter !== "all" && course.a !== filter;
                    return (
                      <button key={ci}
                        className={"course" + (selected && selected.si === si && selected.ci === ci ? " active" : "")}
                        data-area={course.a}
                        style={{ opacity: dimmed ? 0.3 : 1, textAlign: "left" }}
                        onClick={()=>setSelected({ si, ci, course })}>
                        {course.n}
                        <span className="cr">{course.c} cr · {areaLabels[course.a]}</span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {selected && (
        <>
          <div className="drawer-backdrop" onClick={()=>setSelected(null)} />
          <aside className="drawer">
            <div className="drawer-head">
              <div>
                <div className="eyebrow">Sem {String(selected.si+1).padStart(2,'0')} · {areaLabels[selected.course.a]}</div>
                <h2 style={{ marginTop: 8, fontSize: 30 }}>{selected.course.n}</h2>
              </div>
              <button className="icon-btn" onClick={()=>setSelected(null)}><I.close /></button>
            </div>
            <div className="drawer-body">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
                <span className="chip">{selected.course.c} créditos</span>
                <span className="chip">{selected.course.c * 48} horas TI</span>
                <span className="chip">Obligatoria</span>
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 10 }}>Descripción</h3>
              <p style={{ color: "var(--ink-2)", marginBottom: 24 }}>
                Curso del área {areaLabels[selected.course.a].toLowerCase()} que integra fundamentos teóricos con ejercicios aplicados al contexto caribeño.
              </p>
              <h3 style={{ fontSize: 16, marginBottom: 10 }}>Resultados de aprendizaje</h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: "var(--ink-2)" }}>
                <li>Aplicar conceptos clave del área a problemas reales.</li>
                <li>Diseñar soluciones respaldadas por buenas prácticas.</li>
                <li>Comunicar resultados con rigor a audiencias diversas.</li>
              </ul>
              <div style={{ marginTop: 32, display: "flex", gap: 10 }}>
                <button className="btn"><I.download /> Microcurrículo PDF</button>
                <button className="btn ghost" onClick={()=>setSelected(null)}>Cerrar</button>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
