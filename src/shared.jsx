/* Shared components: Header, Footer, Icons, Wayuu pattern, Router */

const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

// ---- Router (hash-based) ----
const RouterCtx = createContext(null);
function useRoute() { return useContext(RouterCtx); }

function Router({ children }) {
  const [hash, setHash] = useState(() => window.location.hash.slice(1) || "inicio");
  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash.slice(1) || "inicio";
      setHash(h);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const go = (r) => { window.location.hash = r; };
  return <RouterCtx.Provider value={{ route: hash, go }}>{children}</RouterCtx.Provider>;
}

// ---- Icons (inline SVG, stroke) ----
const I = {
  menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7h16M4 12h16M4 17h16"/></svg>,
  close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 6l12 12M18 6L6 18"/></svg>,
  arrow: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  sun: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>,
  moon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 14.5A8 8 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/></svg>,
  search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>,
  sparkle: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5z"/></svg>,
  check: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l5 5L20 7"/></svg>,
  download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4v12M7 11l5 5 5-5M4 20h16"/></svg>,
  external: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 4h6v6M20 4l-8 8M19 14v5H5V5h5"/></svg>,
  play: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l14-8z"/></svg>,
};

// ---- Wayuu-inspired SVG pattern (rhombus chevron tiling) ----
function wayuuSvgURL(color = "#e2a542", bg = "transparent") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 28" width="56" height="28">
    <rect width="56" height="28" fill="${bg}"/>
    <g fill="${color}">
      <path d="M14 0 L28 14 L14 28 L0 14 Z"/>
      <path d="M42 0 L56 14 L42 28 L28 14 Z" opacity="0.55"/>
    </g>
    <g stroke="${color}" stroke-width="1" fill="none" opacity="0.6">
      <path d="M0 14 L14 0 M28 14 L42 0 M14 28 L28 14 M42 28 L56 14"/>
    </g>
  </svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

// Large decorative Wayuu band — renders alternating rhombi with 3-color palette
function WayuuBand({ height = 60, colors, className = "" }) {
  const C = colors || ["var(--ug-amarillo)", "var(--ug-flamingo)", "var(--ug-azul)", "var(--ug-negro)"];
  const cells = 24;
  return (
    <svg className={className} viewBox={`0 0 ${cells * 40} 60`} preserveAspectRatio="none"
         style={{ width: "100%", height, display: "block" }}>
      {Array.from({ length: cells }).map((_, i) => {
        const x = i * 40;
        const c = C[i % C.length];
        return (
          <g key={i} fill={c}>
            <path d={`M${x} 0 L${x + 20} 30 L${x} 60 L${x - 20} 30 Z`} opacity={i % 2 === 0 ? 1 : 0.4} />
          </g>
        );
      })}
    </svg>
  );
}

// Decorative large wayuu diamond grid for backgrounds
function WayuuBackdrop({ variant = "a" }) {
  if (variant === "a") {
    return (
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.45 }}
           preserveAspectRatio="xMidYMid slice" viewBox="0 0 1600 900" aria-hidden>
        <defs>
          <pattern id="wp-a" x="0" y="0" width="160" height="80" patternUnits="userSpaceOnUse">
            <g fill="var(--accent)" opacity="0.12">
              <path d="M40 0 L80 40 L40 80 L0 40 Z"/>
              <path d="M120 0 L160 40 L120 80 L80 40 Z"/>
            </g>
            <g stroke="var(--accent)" strokeWidth="1" fill="none" opacity="0.18">
              <path d="M0 40 L40 0 M80 40 L120 0 M40 80 L80 40 M120 80 L160 40"/>
            </g>
          </pattern>
        </defs>
        <rect width="1600" height="900" fill="url(#wp-a)"/>
      </svg>
    );
  }
  // variant b: large concentric diamonds
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.35 }}
         preserveAspectRatio="xMidYMid slice" viewBox="0 0 1600 900" aria-hidden>
      <g fill="none" stroke="var(--accent)" strokeWidth="1.2">
        {[0, 1, 2, 3, 4, 5, 6].map(k => (
          <path key={k}
            d={`M${800} ${450 - (60 + k * 70)} L${800 + (60 + k * 70) * 1.6} ${450} L${800} ${450 + (60 + k * 70)} L${800 - (60 + k * 70) * 1.6} ${450} Z`}
            opacity={0.15 + k * 0.04}
          />
        ))}
      </g>
    </svg>
  );
}

// Small wayuu glyph (decorative)
function WayuuGlyph({ size = 56, color = "var(--ink)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      <g fill={color}>
        <path d="M28 4 L40 16 L28 28 L16 16 Z" opacity="0.9"/>
        <path d="M28 28 L40 40 L28 52 L16 40 Z" opacity="0.45"/>
      </g>
      <g stroke={color} strokeWidth="1" fill="none" opacity="0.6">
        <path d="M28 4 L28 52 M16 16 L40 40 M40 16 L16 40"/>
      </g>
    </svg>
  );
}

// ---- Placeholder image block ----
function Placeholder({ label, aspect = "1/1", style = {} }) {
  return (
    <div className="placeholder" style={{ aspectRatio: aspect, ...style }}>
      <div className="inside">{label}</div>
    </div>
  );
}

// ---- Header ----
const NAV = [
  { id: "inicio", label: "Inicio" },
  { label: "Programa", children: [
    { id: "programa", label: "Presentación", desc: "Misión, visión, objetivos, perfiles" },
    { id: "pensum", label: "Plan de estudios", desc: "169 créditos · 10 semestres · filtros por área" },
    { id: "programa-resoluciones", label: "Resoluciones", desc: "Registro calificado y acreditación" },
    { id: "programa-contacto", label: "Dirección y contacto", desc: "Adanud Segundo Meza Valle" },
  ]},
  { id: "acreditacion", label: "Acreditación", badge: true },
  { label: "Comunidad", children: [
    { id: "estudiantes", label: "Estudiantes", desc: "Calendario, cuadro de honor, reglamento, grados" },
    { id: "docentes", label: "Docentes", desc: "Directorio, horarios de atención, documentos" },
    { id: "egresados", label: "Egresados", desc: "Bolsa de empleo, asociación, actualización" },
  ]},
  { label: "Funciones Misionales", children: [
    { id: "investigacion", label: "Investigación", desc: "Grupos, semilleros y producción" },
    { id: "extension", label: "Extensión y Proyección Social", desc: "Convenios y proyectos con la región" },
    { id: "internacionalizacion", label: "Internacionalización", desc: "Movilidad y cooperación" },
    { id: "convocatorias", label: "Convocatorias", desc: "Oportunidades abiertas" },
  ]},
  { id: "noticias", label: "Noticias" },
];

function Header({ theme, setTheme }) {
  const { route, go } = useRoute();
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(null);
  useEffect(() => { setOpen(false); setDropOpen(null); }, [route]);

  return (
    <header className="app-header">
      <div className="bar">
        <a className="brand" href="#inicio" onClick={(e) => { e.preventDefault(); go("inicio"); }}>
          <div className="brand-mark" aria-hidden><WayuuGlyph size={22} color="var(--ug-amarillo)" /></div>
          <div className="brand-text">
            <div className="t1">Ingeniería de Sistemas</div>
            <div className="t2">Universidad de La Guajira</div>
          </div>
        </a>

        <nav className="nav-links" aria-label="Principal">
          {NAV.map((n, i) => {
            if (n.children) {
              const isActive = n.children.some(c => c.id === route);
              const isOpen = dropOpen === i;
              return (
                <div key={i} className="nav-drop" onMouseEnter={()=>setDropOpen(i)} onMouseLeave={()=>setDropOpen(null)}
                     style={{ position: "relative" }}>
                  <button className={isActive ? "active" : ""}
                          onClick={()=>setDropOpen(isOpen ? null : i)}>
                    {n.label} <span style={{ fontSize: 9, marginLeft: 4, opacity: 0.6 }}>▼</span>
                  </button>
                  {isOpen && (
                    <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 8, background: "var(--paper)",
                                  border: "1px solid color-mix(in oklab, var(--ink) 10%, transparent)",
                                  borderRadius: 14, padding: 8, minWidth: 320, boxShadow: "var(--shadow-lg)", zIndex: 50 }}>
                      {n.children.map(c => (
                        <a key={c.id} href={`#${c.id}`}
                           onClick={(e)=>{ e.preventDefault(); go(c.id); setDropOpen(null); }}
                           style={{ display: "block", padding: "12px 14px", borderRadius: 10,
                                    textDecoration: "none",
                                    color: "var(--ink)",
                                    background: route === c.id ? "color-mix(in oklab, var(--accent) 22%, transparent)" : "transparent" }}>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{c.label}</div>
                          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{c.desc}</div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <a key={n.id}
                 className={route === n.id ? "active" : ""}
                 href={`#${n.id}`}
                 onClick={(e) => { e.preventDefault(); go(n.id); }}>
                {n.label}
                {n.badge && <span style={{ marginLeft: 6, color: "var(--ug-flamingo)" }}>●</span>}
              </a>
            );
          })}
        </nav>

        <div className="nav-cta">
          <button className="icon-btn" aria-label="Buscar" title="Buscar"><I.search /></button>
          <button className="icon-btn" aria-label="Tema" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <I.sun /> : <I.moon />}
          </button>
          <a href="#admin" onClick={(e) => { e.preventDefault(); go("admin"); }}
             className="btn ghost" style={{ padding: "8px 16px", fontSize: 13 }}>
            Admin
          </a>
          <button className="icon-btn mobile-toggle" onClick={() => setOpen(!open)} aria-label="Menú">
            {open ? <I.close /> : <I.menu />}
          </button>
        </div>
      </div>
      <div className={"mobile-menu " + (open ? "open" : "")}>
        {NAV.map((n, i) => {
          if (n.children) {
            return (
              <React.Fragment key={i}>
                <div style={{ padding: "16px 0 4px", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--ink-3)" }}>{n.label}</div>
                {n.children.map(c => (
                  <a key={c.id} href={`#${c.id}`} onClick={(e)=>{ e.preventDefault(); go(c.id); }} style={{ paddingLeft: 12 }}>
                    {c.label}
                  </a>
                ))}
              </React.Fragment>
            );
          }
          return (
            <a key={n.id} href={`#${n.id}`} onClick={(e) => { e.preventDefault(); go(n.id); }}>
              {n.label}
            </a>
          );
        })}
      </div>
    </header>
  );
}

// ---- Footer ----
function Footer() {
  const { go } = useRoute();
  return (
    <footer className="app-footer">
      <div className="inner">
        <div className="top">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <WayuuGlyph size={32} color="var(--ug-amarillo)" />
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>Ingeniería de Sistemas</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.18em", color: "rgba(255,255,255,.8)", textTransform: "uppercase", marginTop: 4 }}>
                  Universidad de La Guajira
                </div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.85)", maxWidth: "34ch", lineHeight: 1.55 }}>
              Formamos ingenieros de sistemas con raíces en el territorio y visión global. Riohacha, La Guajira — Colombia.
            </p>
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 6, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".08em", color: "rgba(255,255,255,.85)" }}>
              <div>SNIES <b style={{ color: "#fff" }}>17579</b></div>
              <div>Reg. calificado Res. <b style={{ color: "#fff" }}>02872 / 21 feb 2018</b></div>
              <div>Acreditación Res. <b style={{ color: "#fff" }}>014528 / 28 jul 2022</b></div>
            </div>
          </div>
          <div>
            <h4>Programa</h4>
            <ul>
              <li><a href="#programa" onClick={(e)=>{e.preventDefault();go("programa");}}>Presentación</a></li>
              <li><a href="#pensum" onClick={(e)=>{e.preventDefault();go("pensum");}}>Plan de estudios</a></li>
              <li><a href="#acreditacion" onClick={(e)=>{e.preventDefault();go("acreditacion");}}>Acreditación CNA</a></li>
              <li><a href="#programa-resoluciones" onClick={(e)=>{e.preventDefault();go("programa-resoluciones");}}>Resoluciones</a></li>
            </ul>
          </div>
          <div>
            <h4>Comunidad</h4>
            <ul>
              <li><a href="#estudiantes" onClick={(e)=>{e.preventDefault();go("estudiantes");}}>Estudiantes</a></li>
              <li><a href="#docentes" onClick={(e)=>{e.preventDefault();go("docentes");}}>Docentes</a></li>
              <li><a href="#egresados" onClick={(e)=>{e.preventDefault();go("egresados");}}>Egresados</a></li>
              <li><a href="#investigacion" onClick={(e)=>{e.preventDefault();go("investigacion");}}>Investigación</a></li>
            </ul>
          </div>
          <div>
            <h4>Contacto</h4>
            <ul>
              <li>Bloque 1 — segundo piso</li>
              <li>Km 3+354 Vía Maicao</li>
              <li>Riohacha, La Guajira</li>
              <li>ingsistemas@uniguajira.edu.co</li>
              <li>+57 (605) 7282729 Ext. 240, 241</li>
              <li style={{ marginTop: 8 }}><b>Director:</b> Adanud S. Meza Valle</li>
            </ul>
          </div>
        </div>
        <div className="bottom">
          <div>© 2026 Universidad de La Guajira · Ingeniería de Sistemas</div>
          <div>SNIES 17579 · Res. MEN 02872 de 2018 · Acreditación Res. 014528 de 2022</div>
        </div>
      </div>
    </footer>
  );
}

// Expose
Object.assign(window, { Router, useRoute, Header, Footer, I, Placeholder, WayuuBand, WayuuBackdrop, WayuuGlyph, wayuuSvgURL });
