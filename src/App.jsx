import React, { useState, useEffect, useRef } from "react";

// ============================================================
// PhoneLess — Active-Recall Web Card Prototype
// Apple-grade refined minimalism. Single-file React.
// In-memory state only (production: Postgres + server-side
// lockout/rate-limit/notification — noted in-app where relevant).
// ============================================================

const C = {
  ink: "#1d1d1f",
  sub: "#6e6e73",
  hair: "#d2d2d7",
  bg: "#fbfbfd",
  card: "#ffffff",
  accent: "#0071e3",
  accentInk: "#0058b9",
  ok: "#1d8a4e",
  warn: "#9a6700",
  danger: "#c4302b",
  fill: "#f5f5f7",
};

const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif';

// Global responsive CSS. Inline React styles can't hold media queries,
// so the adaptive rules live here and are injected once on mount.
const RESPONSIVE_CSS = `
  * { box-sizing: border-box; }
  .cc-hero-h1 { font-size: 60px; }
  .cc-section-h2 { font-size: 40px; }
  .cc-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; }
  .cc-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .cc-split { display: grid; grid-template-columns: 1.1fr 1fr; gap: 56px; align-items: center; }
  .cc-dash { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
  .cc-contact-line { display: flex; gap: 12px; }
  .cc-contact-line > input:last-child { max-width: 170px; }

  @media (max-width: 860px) {
    .cc-split { grid-template-columns: 1fr; gap: 36px; }
    .cc-dash { grid-template-columns: 1fr; gap: 22px; }
  }
  @media (max-width: 680px) {
    .cc-hero-h1 { font-size: 40px; }
    .cc-section-h2 { font-size: 30px; }
    .cc-grid-3 { grid-template-columns: 1fr; gap: 26px; }
    .cc-grid-2 { grid-template-columns: 1fr; gap: 16px; }
    .cc-hero-br { display: none; }
    .cc-contact-line { flex-direction: column; gap: 12px; }
    .cc-contact-line > input:last-child { max-width: none; }
    .cc-pad-wide { padding-left: 18px !important; padding-right: 18px !important; }
    .cc-card-inner { padding: 26px 22px !important; }
  }
`;

// ---------- tiny shared atoms ----------
function Btn({ children, onClick, kind = "primary", full, type = "button", disabled }) {
  const base = {
    fontFamily: FONT,
    fontSize: 17,
    fontWeight: 500,
    letterSpacing: "-0.01em",
    padding: "13px 26px",
    borderRadius: 980,
    cursor: disabled ? "default" : "pointer",
    border: "1px solid transparent",
    transition: "all .25s cubic-bezier(.2,.7,.2,1)",
    width: full ? "100%" : "auto",
    opacity: disabled ? 0.45 : 1,
  };
  const kinds = {
    primary: { background: C.accent, color: "#fff" },
    ghost: { background: "transparent", color: C.accent, borderColor: "transparent" },
    quiet: { background: C.fill, color: C.ink },
    danger: { background: "transparent", color: C.danger, borderColor: C.hair },
  };
  const [hover, setHover] = useState(false);
  const hoverStyle =
    hover && !disabled
      ? kind === "primary"
        ? { background: C.accentInk }
        : kind === "quiet"
        ? { background: "#ececef" }
        : { background: "rgba(0,113,227,.06)" }
      : {};
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...kinds[kind], ...hoverStyle }}
    >
      {children}
    </button>
  );
}

function Field({ label, hint, children }) {
  return (
    <label style={{ display: "block", marginBottom: 22 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 7, letterSpacing: "-0.01em" }}>
        {label}
      </div>
      {children}
      {hint && <div style={{ fontSize: 12.5, color: C.sub, marginTop: 6, lineHeight: 1.45 }}>{hint}</div>}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  fontFamily: FONT,
  fontSize: 17,
  padding: "13px 15px",
  borderRadius: 12,
  border: `1px solid ${C.hair}`,
  background: "#fff",
  color: C.ink,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color .2s, box-shadow .2s",
};

function TextInput(props) {
  const [focus, setFocus] = useState(false);
  return (
    <input
      {...props}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={{
        ...inputStyle,
        borderColor: focus ? C.accent : C.hair,
        boxShadow: focus ? `0 0 0 4px rgba(0,113,227,.12)` : "none",
        ...(props.style || {}),
      }}
    />
  );
}

// PhoneLess mark — a phone frame drawn as four corner brackets (the "less":
// the phone isn't fully there) with the user's person glyph held solid inside.
// Reads as both a phone outline and "your person remains"; brackets double
// as a scan/find frame.
function Mark({ size = 26, gradient = true, color = C.ink }) {
  const gid = "plg" + size;
  const stroke = gradient ? `url(#${gid})` : color;
  const glyph = gradient ? `url(#${gid})` : color;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      {gradient && (
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a9bff" />
            <stop offset="1" stopColor="#0071e3" />
          </linearGradient>
        </defs>
      )}
      {/* four corner brackets — phone frame, incomplete */}
      <g stroke={stroke} strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12H16a4 4 0 00-4 4v6" />
        <path d="M42 12h6a4 4 0 014 4v6" />
        <path d="M22 52H16a4 4 0 01-4-4v-6" />
        <path d="M42 52h6a4 4 0 004-4v-6" />
      </g>
      {/* person glyph held solid inside */}
      <circle cx="32" cy="28" r="6.2" fill={glyph} />
      <path d="M21.5 45c0-5.8 4.7-9 10.5-9s10.5 3.2 10.5 9z" fill={glyph} />
    </svg>
  );
}

function Wordmark({ light }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <Mark size={24} gradient />
      <span style={{ fontSize: 21, fontWeight: 600, letterSpacing: "-0.03em" }}>
        <span style={{ color: light ? "#fff" : C.ink }}>Phone</span>
        <span style={{ color: C.accent }}>Less</span>
      </span>
    </div>
  );
}

// ============================================================
export default function App() {
  const [view, setView] = useState("landing"); // landing | setup | dashboard | retrieve | waitlist | terms | privacy
  const [card, setCard] = useState(null); // the saved card
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    const id = "cc-responsive-css";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.textContent = RESPONSIVE_CSS;
      document.head.appendChild(el);
    }
    const t = setTimeout(() => setReveal(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Any time we change to a legal/waitlist view, scroll to top.
  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  return (
    <div style={{ fontFamily: FONT, background: C.bg, color: C.ink, minHeight: "100vh", WebkitFontSmoothing: "antialiased" }}>
      <DemoBanner />
      <Nav view={view} setView={setView} hasCard={!!card} />
      <div style={{ opacity: reveal ? 1 : 0, transition: "opacity .6s ease" }}>
        {view === "landing" && <Landing onStart={() => setView("setup")} onRetrieve={() => setView("retrieve")} onWaitlist={() => setView("waitlist")} />}
        {view === "setup" && (
          <Setup
            existing={card}
            onSave={(c) => {
              setCard(c);
              setView("dashboard");
            }}
            onCancel={() => setView(card ? "dashboard" : "landing")}
          />
        )}
        {view === "dashboard" && card && (
          <Dashboard card={card} onEdit={() => setView("setup")} onTryRetrieve={() => setView("retrieve")} />
        )}
        {view === "retrieve" && <Retrieve card={card} onBack={() => setView(card ? "dashboard" : "landing")} />}
        {view === "waitlist" && <Waitlist onBack={() => setView("landing")} />}
        {view === "terms" && <LegalPage kind="terms" onBack={() => setView("landing")} />}
        {view === "privacy" && <LegalPage kind="privacy" onBack={() => setView("landing")} />}
      </div>
      <Footer setView={setView} />
    </div>
  );
}

// ---------- DEMO BANNER ----------
// Honest status strip: this is a non-functional prototype. Nothing is stored,
// nothing is charged. Critical for a safety product so no one relies on it.
function DemoBanner() {
  return (
    <div style={{ background: "#1d1d1f", color: "#fff", fontSize: 13, lineHeight: 1.5, textAlign: "center", padding: "9px 16px", fontWeight: 500 }}>
      Demo only — nothing you enter is saved and no payment is taken. Do not rely on this in a real emergency.
    </div>
  );
}

// ---------- NAV ----------
function Nav({ view, setView, hasCard }) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(251,251,253,.82)",
        backdropFilter: "saturate(180%) blur(20px)",
        borderBottom: `1px solid ${C.hair}`,
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div onClick={() => setView("landing")} style={{ cursor: "pointer" }}>
          <Wordmark />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 26, fontSize: 14.5, color: C.sub }}>
          <span style={{ cursor: "pointer", color: view === "retrieve" ? C.ink : C.sub }} onClick={() => setView("retrieve")}>
            Find my card
          </span>
          {hasCard ? (
            <span style={{ cursor: "pointer", color: view === "dashboard" ? C.ink : C.sub }} onClick={() => setView("dashboard")}>
              My card
            </span>
          ) : (
            <span style={{ cursor: "pointer", color: C.accent, fontWeight: 500 }} onClick={() => setView("setup")}>
              Set up
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- LANDING ----------
function Landing({ onStart, onRetrieve, onWaitlist }) {
  return (
    <div>
      {/* Hero */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "92px 24px 56px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 13px", borderRadius: 980, background: C.fill, fontSize: 12.5, color: C.sub, marginBottom: 30, fontWeight: 500 }}>
          <span style={{ width: 6, height: 6, borderRadius: 6, background: C.ok, display: "inline-block" }} />
          Quick: can you recall a single loved one’s number right now?
        </div>
        <h1 className="cc-hero-h1" style={{ lineHeight: 1.05, fontWeight: 600, letterSpacing: "-0.035em", margin: "0 0 22px" }}>
          You used to know<br className="cc-hero-br" />
          {" "}their number by heart.
        </h1>
        <p style={{ fontSize: 21, lineHeight: 1.5, color: C.sub, maxWidth: 560, margin: "0 auto 36px", fontWeight: 400 }}>
          Now your phone remembers everyone, so you don’t have to — until the day you lose it. PhoneLess keeps the few people who matter ready to reach from any borrowed phone, even when yours is gone.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn onClick={onStart}>Try the demo — free</Btn>
          <Btn kind="ghost" onClick={onRetrieve}>I need my card now ›</Btn>
        </div>
        <div style={{ fontSize: 13, color: C.sub, marginTop: 18 }}>
          No app to install.{" "}
          <span style={{ color: C.accent, cursor: "pointer", fontWeight: 500 }} onClick={onWaitlist}>
            Reserve your spot for launch ›
          </span>
        </div>
      </section>

      {/* The insight strip */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "8px 24px 70px" }}>
        <div style={{ background: "#fff", border: `1px solid ${C.hair}`, borderRadius: 20, padding: "30px 34px", textAlign: "center" }}>
          <div style={{ fontSize: 17, lineHeight: 1.6, color: C.ink }}>
            A generation ago, you knew a dozen numbers cold. Today most of us can recall{" "}
            <span style={{ fontWeight: 600 }}>one or none</span>. Speed-dial became a contact list, and the contact list lives on one fragile device.{" "}
            <span style={{ color: C.sub }}>Lose the phone and the people inside it become unreachable — right when you need them most.</span>
          </div>
        </div>
      </section>

      {/* Visual: the card */}
      <section style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px 90px" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <PhoneMock />
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: "#fff", borderTop: `1px solid ${C.hair}`, borderBottom: `1px solid ${C.hair}` }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "78px 24px" }}>
          <h2 className="cc-section-h2" style={{ textAlign: "center", fontWeight: 600, letterSpacing: "-0.03em", margin: "0 0 14px" }}>
            Memorize one PIN, not twelve numbers.
          </h2>
          <p style={{ textAlign: "center", fontSize: 18, color: C.sub, margin: "0 auto 56px", maxWidth: 520 }}>
            You set it up once, calmly, today. It waits quietly until the day you need it.
          </p>
          <div className="cc-grid-3">
            <Step n="1" title="Add your people" body="Two or three names and numbers — the people you’d want reached in an emergency." />
            <Step n="2" title="Pick a number you’ll remember" body="Your phone number plus a private PIN, like an ATM card. That’s how you open it later." />
            <Step n="3" title="Open it anywhere" body="Stranded with no phone? Borrow one, go to PhoneLess, enter your number and PIN. Your card appears." />
          </div>
        </div>
      </section>

      {/* Trust / why */}
      <section style={{ maxWidth: 980, margin: "0 auto", padding: "84px 24px" }}>
        <div className="cc-split">
          <div>
            <h2 style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-0.03em", margin: "0 0 18px", lineHeight: 1.1 }}>
              Built to be safe, even though it’s simple.
            </h2>
            <p style={{ fontSize: 17.5, lineHeight: 1.6, color: C.sub, margin: "0 0 26px" }}>
              Your card holds only what you choose to put on it — nothing that could hurt you if a stranger glimpsed it. We keep it that way on purpose.
            </p>
            <TrustRow title="Locks after 3 wrong tries" body="A wrong PIN three times freezes your card for 24 hours. Guessing it is effectively impossible." />
            <TrustRow title="You’re told the moment it’s opened" body="Every time your card is viewed, we alert you by text and email — so you always know." />
            <TrustRow title="No addresses, no documents" body="The card is limited to contacts and a short note. We block sensitive details on purpose." />
          </div>
          <div>
            <ContactCardPreview
              demo
              card={{
                firstName: "Jordan",
                note: "Travelling in Lisbon until the 14th. Allergic to penicillin.",
                contacts: [
                  { name: "Mom (Elena)", phone: "+1 (206) 555\u20130142", rel: "Mother" },
                  { name: "Sam", phone: "+1 (206) 555\u20130198", rel: "Partner" },
                ],
              }}
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ background: "#fff", borderTop: `1px solid ${C.hair}` }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "80px 24px" }}>
          <h2 className="cc-section-h2" style={{ textAlign: "center", fontWeight: 600, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
            Free for what matters most.
          </h2>
          <p style={{ textAlign: "center", fontSize: 18, color: C.sub, margin: "0 auto 52px", maxWidth: 480 }}>
            Your safety card is free, forever. Upgrade only if you want more.
          </p>
          <div className="cc-grid-2" style={{ maxWidth: 760, margin: "0 auto" }}>
            <PlanCard
              name="Card"
              price="Free"
              sub="Forever"
              features={["Your emergency card", "Up to 3 contacts", "Short note + 1 medical flag", "Open-anywhere retrieval", "Lock + open alerts"]}
              cta="Set up free"
              onClick={onStart}
            />
            <PlanCard
              featured
              name="Card+"
              price="$12 / year"
              sub="$1 a month, billed yearly"
              features={["Everything in Card", "A printed backup card, mailed to you", "Up to 8 contacts + family cards", "Share your location with one tap", "Priority support"]}
              cta="Start free, upgrade anytime"
              onClick={onStart}
            />
          </div>
          <p style={{ textAlign: "center", fontSize: 12.5, color: C.sub, marginTop: 24 }}>
            Prototype pricing. The mailed backup card is what most people actually pay for — it’s the piece a phone can’t replace.
          </p>
        </div>
      </section>
    </div>
  );
}

function Step({ n, title, body }) {
  return (
    <div>
      <div style={{ width: 34, height: 34, borderRadius: 34, background: C.fill, color: C.ink, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 15, marginBottom: 16 }}>
        {n}
      </div>
      <h3 style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 8px" }}>{title}</h3>
      <p style={{ fontSize: 15.5, lineHeight: 1.55, color: C.sub, margin: 0 }}>{body}</p>
    </div>
  );
}

function TrustRow({ title, body }) {
  return (
    <div style={{ display: "flex", gap: 13, marginBottom: 18 }}>
      <div style={{ flexShrink: 0, marginTop: 2 }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="9" fill="rgba(29,138,78,.12)" />
          <path d="M6 10.2l2.6 2.5L14 7.5" stroke={C.ok} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</div>
        <div style={{ fontSize: 14.5, color: C.sub, lineHeight: 1.5, marginTop: 2 }}>{body}</div>
      </div>
    </div>
  );
}

function PlanCard({ name, price, sub, features, cta, featured, onClick }) {
  return (
    <div
      style={{
        background: featured ? C.ink : "#fff",
        color: featured ? "#fff" : C.ink,
        border: `1px solid ${featured ? C.ink : C.hair}`,
        borderRadius: 22,
        padding: "32px 30px",
        position: "relative",
      }}
    >
      {featured && (
        <div style={{ position: "absolute", top: 22, right: 24, fontSize: 11.5, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", color: "#9bd0ff" }}>
          Most popular
        </div>
      )}
      <div style={{ fontSize: 21, fontWeight: 600, letterSpacing: "-0.02em" }}>{name}</div>
      <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.03em", marginTop: 10 }}>{price}</div>
      <div style={{ fontSize: 13.5, color: featured ? "rgba(255,255,255,.6)" : C.sub, marginBottom: 22 }}>{sub}</div>
      <div style={{ marginBottom: 26 }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 11, fontSize: 14.5, lineHeight: 1.4 }}>
            <span style={{ color: featured ? "#9bd0ff" : C.accent, fontWeight: 700 }}>&#10003;</span>
            <span style={{ color: featured ? "rgba(255,255,255,.85)" : C.ink }}>{f}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onClick}
        style={{
          width: "100%",
          fontFamily: FONT,
          fontSize: 16,
          fontWeight: 500,
          padding: "12px 20px",
          borderRadius: 980,
          cursor: "pointer",
          border: "none",
          background: featured ? "#fff" : C.accent,
          color: featured ? C.ink : "#fff",
        }}
      >
        {cta}
      </button>
    </div>
  );
}

// phone mockup on hero
function PhoneMock() {
  return (
    <div
      style={{
        width: 300,
        borderRadius: 44,
        background: "#fff",
        border: `1px solid ${C.hair}`,
        boxShadow: "0 40px 80px -30px rgba(0,0,0,.28), 0 8px 24px -12px rgba(0,0,0,.12)",
        padding: 12,
      }}
    >
      <div style={{ borderRadius: 32, overflow: "hidden", background: C.bg, border: `1px solid ${C.fill}` }}>
        <div style={{ background: C.ink, color: "#fff", padding: "20px 20px 18px" }}>
          <Wordmark light />
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", marginTop: 14 }}>Emergency card</div>
          <div style={{ fontSize: 25, fontWeight: 600, letterSpacing: "-0.02em" }}>Jordan’s contacts</div>
        </div>
        <div style={{ padding: 16 }}>
          {[
            { n: "Mom (Elena)", p: "+1 (206) 555\u20130142", r: "Mother" },
            { n: "Sam", p: "+1 (206) 555\u20130198", r: "Partner" },
          ].map((c, i) => (
            <a
              key={i}
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{ display: "block", textDecoration: "none", background: "#fff", border: `1px solid ${C.hair}`, borderRadius: 16, padding: "13px 15px", marginBottom: 10 }}
            >
              <div style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>{c.n}</div>
              <div style={{ fontSize: 13, color: C.sub }}>{c.r}</div>
              <div style={{ fontSize: 16, color: C.accent, fontWeight: 500, marginTop: 5 }}>{c.p}</div>
            </a>
          ))}
          <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.5, padding: "4px 4px 6px" }}>
            “Travelling in Lisbon until the 14th. Allergic to penicillin.”
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- the contact card UI (reused) ----------
function ContactCardPreview({ card, demo }) {
  return (
    <div style={{ borderRadius: 24, overflow: "hidden", border: `1px solid ${C.hair}`, boxShadow: "0 30px 60px -34px rgba(0,0,0,.22)", background: "#fff", maxWidth: 360, margin: "0 auto" }}>
      <div style={{ background: C.ink, color: "#fff", padding: "22px 22px 20px" }}>
        <div style={{ fontSize: 12.5, color: "rgba(255,255,255,.6)", letterSpacing: ".02em" }}>EMERGENCY CARD</div>
        <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 3 }}>
          {card.firstName}’s contacts
        </div>
      </div>
      <div style={{ padding: 18 }}>
        {card.contacts.map((c, i) => (
          <a key={i} href="#" onClick={(e) => e.preventDefault()} style={{ display: "block", textDecoration: "none", background: C.bg, border: `1px solid ${C.hair}`, borderRadius: 16, padding: "14px 16px", marginBottom: 11 }}>
            <div style={{ fontSize: 17, fontWeight: 600, color: C.ink }}>{c.name}</div>
            {c.rel && <div style={{ fontSize: 13.5, color: C.sub }}>{c.rel}</div>}
            <div style={{ fontSize: 18, color: C.accent, fontWeight: 500, marginTop: 6, display: "flex", alignItems: "center", gap: 7 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A14 14 0 013 6a2 2 0 012-2z" stroke={C.accent} strokeWidth="1.7" strokeLinejoin="round"/></svg>
              {c.phone}
            </div>
          </a>
        ))}
        {card.note && (
          <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.55, background: "rgba(154,103,0,.07)", border: "1px solid rgba(154,103,0,.18)", borderRadius: 14, padding: "12px 14px", marginTop: 4 }}>
            {card.note}
          </div>
        )}
        <div style={{ fontSize: 11.5, color: C.sub, textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
          This card auto-closes in 60 seconds.{demo ? " (Preview)" : ""}
        </div>
      </div>
    </div>
  );
}

// ---------- SETUP ----------
const emptyContact = () => ({ name: "", phone: "", rel: "" });

function Setup({ onSave, onCancel, existing }) {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState(existing?.firstName || "");
  const [phone, setPhone] = useState(existing?.phone || "");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [contacts, setContacts] = useState(existing?.contacts?.length ? existing.contacts : [emptyContact(), emptyContact()]);
  const [note, setNote] = useState(existing?.note || "");
  const [medical, setMedical] = useState(existing?.medical || "");
  const [recoveryEmail, setRecoveryEmail] = useState(existing?.recoveryEmail || "");
  const [err, setErr] = useState("");

  const weakPin = (p) => {
    if (!/^\d{4,6}$/.test(p)) return false;
    if (/^(\d)\1+$/.test(p)) return true; // all same
    const seqs = ["0123", "1234", "2345", "3456", "4567", "5678", "6789", "9876", "8765", "4321", "3210"];
    if (seqs.some((s) => p.includes(s))) return true;
    if (/^(19|20)\d\d$/.test(p)) return true; // year
    return false;
  };

  const pinStrength = pin.length === 0 ? null : !/^\d{4,6}$/.test(pin) ? "format" : weakPin(pin) ? "weak" : "ok";

  function updateContact(i, k, v) {
    setContacts((cs) => cs.map((c, idx) => (idx === i ? { ...c, [k]: v } : c)));
  }
  function addContact() {
    if (contacts.length < 3) setContacts((cs) => [...cs, emptyContact()]);
  }
  function removeContact(i) {
    setContacts((cs) => cs.filter((_, idx) => idx !== i));
  }

  function next() {
    setErr("");
    if (step === 0) {
      if (!firstName.trim()) return setErr("Please add a first name for the card.");
      const valid = contacts.filter((c) => c.name.trim() && c.phone.trim());
      if (valid.length < 1) return setErr("Add at least one emergency contact (name and number).");
      setContacts(valid.length ? valid : contacts);
      setStep(1);
    } else if (step === 1) {
      if (!/^[\d+()\-\s]{7,}$/.test(phone)) return setErr("Enter the phone number you’ll remember.");
      if (pinStrength === "format") return setErr("Your PIN should be 4 to 6 digits.");
      if (pinStrength === "weak") return setErr("That PIN is too easy to guess. Avoid 1234, repeated digits, or a birth year.");
      if (pin !== pin2) return setErr("The two PINs don’t match.");
      if (!/^\S+@\S+\.\S+$/.test(recoveryEmail)) return setErr("Add a recovery email so we can alert you and help if you forget your PIN.");
      setStep(2);
    }
  }

  function finish() {
    onSave({
      firstName: firstName.trim(),
      phone: phone.trim(),
      pin,
      contacts: contacts.filter((c) => c.name.trim() && c.phone.trim()),
      note: note.trim(),
      medical: medical.trim(),
      recoveryEmail: recoveryEmail.trim(),
    });
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "60px 24px 100px" }}>
      <Stepper step={step} />
      <div style={{ background: "#fff", border: `1px solid ${C.hair}`, borderRadius: 24, padding: "38px 38px 34px", marginTop: 28, boxShadow: "0 20px 50px -36px rgba(0,0,0,.2)" }}>
        {step === 0 && (
          <>
            <H title="Who’s on your card?" sub="Add the people you’d want reached if something happened. First names are enough." />
            <Field label="Name on the card" hint="A first name or nickname — this is whose card it is.">
              <TextInput value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. Jordan" />
            </Field>
            {contacts.map((c, i) => (
              <div key={i} style={{ background: C.bg, border: `1px solid ${C.hair}`, borderRadius: 16, padding: 18, marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: C.sub }}>Contact {i + 1}</span>
                  {contacts.length > 1 && (
                    <span onClick={() => removeContact(i)} style={{ fontSize: 13, color: C.danger, cursor: "pointer" }}>
                      Remove
                    </span>
                  )}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <TextInput value={c.name} onChange={(e) => updateContact(i, "name", e.target.value)} placeholder="Name (e.g. Mom)" />
                </div>
                <div className="cc-contact-line">
                  <TextInput value={c.phone} onChange={(e) => updateContact(i, "phone", e.target.value)} placeholder="Phone number" inputMode="tel" />
                  <TextInput value={c.rel} onChange={(e) => updateContact(i, "rel", e.target.value)} placeholder="Relationship" />
                </div>
              </div>
            ))}
            {contacts.length < 3 && (
              <Btn kind="quiet" onClick={addContact}>+ Add another contact</Btn>
            )}
            <div style={{ fontSize: 12.5, color: C.sub, marginTop: 18, lineHeight: 1.5, background: C.fill, borderRadius: 12, padding: "12px 14px" }}>
              Keep it to people, not paperwork. Anyone who opens your card will see these names and numbers, so add only what you’d be comfortable a stranger seeing in an emergency.
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <H title="How you’ll open it later" sub="Two things you’ll remember without your phone: your own number, and a private PIN." />
            <Field label="Your phone number" hint="This is how you look up your own card. Use the number you know by heart.">
              <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (206) 555-0100" inputMode="tel" />
            </Field>
            <Field label="Choose a PIN" hint="4 to 6 digits, like a bank card. Don’t use 1234, a birthday year, or repeats.">
              <TextInput value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="••••" inputMode="numeric" type="password" />
              {pinStrength === "ok" && <Strength color={C.ok} label="Good PIN" />}
              {pinStrength === "weak" && <Strength color={C.warn} label="Too easy to guess — pick another" />}
              {pinStrength === "format" && pin.length > 0 && <Strength color={C.sub} label="4–6 digits" />}
            </Field>
            <Field label="Confirm your PIN">
              <TextInput value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="••••" inputMode="numeric" type="password" />
            </Field>
            <Field label="Recovery email" hint="If you ever forget your PIN, we’ll help you reset it here. We also use this to alert you whenever your card is opened.">
              <TextInput value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} placeholder="you@example.com" inputMode="email" />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <H title="Anything else worth knowing?" sub="Optional. A short note and one medical flag can help whoever’s assisting you. Skip if you’d rather." />
            <Field label="Short note" hint="Keep it brief. No home address or ID numbers — we block those on purpose.">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 140))}
                placeholder="e.g. Travelling in Lisbon until the 14th."
                style={{ ...inputStyle, minHeight: 76, resize: "vertical", lineHeight: 1.5 }}
                maxLength={140}
              />
              <div style={{ fontSize: 12, color: C.sub, marginTop: 5, textAlign: "right" }}>{note.length}/140</div>
            </Field>
            <Field label="Medical flag (optional)" hint="One short, non-sensitive note for first responders. Stored with your explicit consent.">
              <TextInput value={medical} onChange={(e) => setMedical(e.target.value.slice(0, 60))} placeholder="e.g. Allergic to penicillin" />
            </Field>
            <div style={{ background: C.bg, border: `1px solid ${C.hair}`, borderRadius: 16, padding: "16px 18px", marginTop: 6 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>Your card preview</div>
              <ContactCardPreview card={{ firstName: firstName || "Your", note: note || (medical ? medical : ""), contacts: contacts.filter((c) => c.name) }} />
            </div>
          </>
        )}

        {err && (
          <div style={{ color: C.danger, fontSize: 14, marginTop: 18 }}>{err}</div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 30 }}>
          <Btn kind="ghost" onClick={step === 0 ? onCancel : () => setStep(step - 1)}>
            {step === 0 ? "Cancel" : "\u2039 Back"}
          </Btn>
          {step < 2 ? <Btn onClick={next}>Continue</Btn> : <Btn onClick={finish}>Save my card</Btn>}
        </div>
      </div>
    </div>
  );
}

function H({ title, sub }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <h2 style={{ fontSize: 27, fontWeight: 600, letterSpacing: "-0.03em", margin: "0 0 8px" }}>{title}</h2>
      <p style={{ fontSize: 16, color: C.sub, lineHeight: 1.5, margin: 0 }}>{sub}</p>
    </div>
  );
}

function Strength({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 8, fontSize: 13, color }}>
      <span style={{ width: 7, height: 7, borderRadius: 7, background: color, display: "inline-block" }} />
      <span>{label}</span>
    </div>
  );
}

function Stepper({ step }) {
  const labels = ["Your people", "How you open it", "Extras"];
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
      {labels.map((l, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 26,
                background: i < step ? C.ok : i === step ? C.ink : C.fill,
                color: i <= step ? "#fff" : C.sub,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 600,
                transition: "all .3s",
              }}
            >
              {i < step ? "\u2713" : i + 1}
            </div>
            <span style={{ fontSize: 13.5, color: i === step ? C.ink : C.sub, fontWeight: i === step ? 600 : 400 }}>{l}</span>
          </div>
          {i < labels.length - 1 && <div style={{ width: 26, height: 1, background: C.hair }} />}
        </div>
      ))}
    </div>
  );
}

// ---------- DASHBOARD / SETTINGS ----------
function Dashboard({ card, onEdit, onTryRetrieve }) {
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 30 }}>
        <div>
          <div style={{ fontSize: 14, color: C.sub }}>Your card is live</div>
          <h1 style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-0.03em", margin: "4px 0 0" }}>
            {card.firstName}’s card
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: C.ok, fontWeight: 500 }}>
          <span style={{ width: 8, height: 8, borderRadius: 8, background: C.ok }} />
          Active
        </div>
      </div>

      <div className="cc-dash">
        <div>
          <ContactCardPreview card={card} />
          <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "center" }}>
            <Btn kind="quiet" onClick={onEdit}>Edit card</Btn>
            <Btn kind="ghost" onClick={onTryRetrieve}>Test retrieval</Btn>
          </div>
        </div>

        <div>
          <SettingsBlock title="How you open it">
            <Row k="Lookup number" v={card.phone} />
            <Row k="PIN" v="•••• (hidden)" />
            <Row k="Recovery email" v={card.recoveryEmail} />
          </SettingsBlock>

          <SettingsBlock title="Safety">
            <ToggleRow label="Alert me when my card is opened" defaultOn />
            <ToggleRow label="Lock after 3 wrong PIN tries" defaultOn locked />
            <ToggleRow label="Block sensitive info on the card" defaultOn locked />
          </SettingsBlock>

          <SettingsBlock title="Plan">
            <Row k="Current plan" v="Card (Free)" />
            <div style={{ marginTop: 12 }}>
              <Btn full onClick={onEdit /* placeholder */}>Upgrade to Card+ — $12/yr</Btn>
              <div style={{ fontSize: 12, color: C.sub, marginTop: 8, textAlign: "center", lineHeight: 1.5 }}>
                Adds a mailed backup card, family cards, and one-tap location sharing.
              </div>
            </div>
          </SettingsBlock>

          <div style={{ textAlign: "center", marginTop: 8 }}>
            <Btn kind="danger">Delete my card</Btn>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: C.sub, textAlign: "center", marginTop: 40, lineHeight: 1.6, maxWidth: 520, margin: "40px auto 0" }}>
        Prototype note: lockout, rate-limiting, and open-alerts run server-side in production. Locked toggles above are core safety protections and can’t be turned off.
      </div>
    </div>
  );
}

function SettingsBlock({ title, children }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.hair}`, borderRadius: 18, padding: "18px 20px", marginBottom: 16 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: C.sub, letterSpacing: ".03em", textTransform: "uppercase", marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}
function Row({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: 15, borderBottom: `1px solid ${C.fill}` }}>
      <span style={{ color: C.sub }}>{k}</span>
      <span style={{ fontWeight: 500 }}>{v}</span>
    </div>
  );
}
function ToggleRow({ label, defaultOn, locked }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", fontSize: 14.5 }}>
      <span style={{ color: C.ink, paddingRight: 12 }}>
        {label} {locked && <span style={{ fontSize: 11, color: C.sub }}>· required</span>}
      </span>
      <div
        onClick={() => !locked && setOn(!on)}
        style={{
          width: 44,
          height: 26,
          borderRadius: 26,
          background: on ? C.ok : C.hair,
          position: "relative",
          cursor: locked ? "default" : "pointer",
          transition: "background .25s",
          opacity: locked ? 0.7 : 1,
          flexShrink: 0,
        }}
      >
        <div style={{ width: 22, height: 22, borderRadius: 22, background: "#fff", position: "absolute", top: 2, left: on ? 20 : 2, transition: "left .25s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
      </div>
    </div>
  );
}

// ---------- RETRIEVE (the panic flow) ----------
function Retrieve({ card, onBack }) {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [shown, setShown] = useState(false);
  const [err, setErr] = useState("");
  const [countdown, setCountdown] = useState(60);
  const timer = useRef(null);

  useEffect(() => {
    if (shown) {
      timer.current = setInterval(() => setCountdown((c) => (c <= 1 ? (clearInterval(timer.current), 0) : c - 1)), 1000);
      return () => clearInterval(timer.current);
    }
  }, [shown]);

  useEffect(() => {
    if (countdown === 0 && shown) setShown(false);
  }, [countdown, shown]);

  const normalize = (s) => s.replace(/\D/g, "");

  function tryOpen() {
    setErr("");
    if (locked) return;
    if (!card) {
      setErr("No card found for that number. (In this prototype, set up a card first.)");
      return;
    }
    const phoneMatch = normalize(phone) && normalize(phone) === normalize(card.phone);
    const pinMatch = pin === card.pin;
    if (phoneMatch && pinMatch) {
      setShown(true);
      setCountdown(60);
      return;
    }
    const n = attempts + 1;
    setAttempts(n);
    if (n >= 3) {
      setLocked(true);
      setErr("Too many attempts. This card is locked for 24 hours, and its owner has been alerted by text and email.");
    } else {
      setErr(`That didn’t match. ${3 - n} ${3 - n === 1 ? "try" : "tries"} left before this card locks.`);
    }
  }

  if (shown && card) {
    return (
      <div style={{ maxWidth: 440, margin: "0 auto", padding: "56px 24px 100px" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 14, color: C.ok, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: 8, background: C.ok }} /> Card opened
          </div>
        </div>
        <ContactCardPreview card={card} />
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13.5, color: C.sub }}>
          Auto-closing in {countdown}s · the owner has been notified this card was opened.
        </div>
        <div style={{ textAlign: "center", marginTop: 18 }}>
          <Btn kind="quiet" onClick={onBack}>Close now</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "70px 24px 120px" }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <Mark size={36} />
        <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.03em", margin: "16px 0 8px" }}>Find your card</h1>
        <p style={{ fontSize: 16, color: C.sub, lineHeight: 1.5, margin: 0 }}>
          Enter your own phone number and PIN. It’s safe to do this on a borrowed phone — nothing is saved here.
        </p>
      </div>

      <div style={{ background: "#fff", border: `1px solid ${C.hair}`, borderRadius: 22, padding: "30px 28px", boxShadow: "0 24px 50px -36px rgba(0,0,0,.25)" }}>
        <Field label="Your phone number">
          <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="The number you know by heart" inputMode="tel" disabled={locked} />
        </Field>
        <Field label="Your PIN">
          <TextInput value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="••••" inputMode="numeric" type="password" disabled={locked} />
        </Field>

        {err && <div style={{ color: locked ? C.danger : C.warn, fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>{err}</div>}

        <Btn full onClick={tryOpen} disabled={locked}>
          {locked ? "Card locked" : "Open my card"}
        </Btn>

        <div style={{ fontSize: 12.5, color: C.sub, textAlign: "center", marginTop: 16, lineHeight: 1.55 }}>
          Forgot your PIN? We can email a reset link to your recovery address.
        </div>
      </div>

      {card && (
        <div style={{ textAlign: "center", marginTop: 22, fontSize: 12.5, color: C.sub, background: C.fill, borderRadius: 12, padding: "12px 14px", lineHeight: 1.5 }}>
          Prototype hint: open the card you just made with its number and PIN. Three wrong tries demonstrates the lockout.
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 18 }}>
        <Btn kind="ghost" onClick={onBack}>‹ Back</Btn>
      </div>
    </div>
  );
}

// ---------- FOOTER ----------
function Footer({ setView }) {
  const link = { cursor: "pointer", color: C.sub, textDecoration: "none" };
  return (
    <div style={{ borderTop: `1px solid ${C.hair}`, background: "#fff" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "34px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <Wordmark />
          <div style={{ display: "flex", gap: 18, marginTop: 14, fontSize: 13 }}>
            <span style={link} onClick={() => setView("terms")}>Terms</span>
            <span style={link} onClick={() => setView("privacy")}>Privacy</span>
            <span style={link} onClick={() => setView("waitlist")}>Reserve your spot</span>
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.6, maxWidth: 560 }}>
          PhoneLess is a secondary informational utility. It does not provide medical treatment, rescue coordination, or guaranteed real-time communication. Keep only low-sensitivity information on your card. This site is a demonstration prototype; it does not store data or process payments.
        </div>
      </div>
    </div>
  );
}

// ---------- WAITLIST ----------
// No-payment interest capture. Collects an email in-memory only — this demo
// does NOT transmit or store it anywhere. Wiring a real list (e.g. an email
// service or a simple form backend) is a launch step; until then this just
// validates the flow and messaging without taking on data-storage liability.
function Waitlist({ onBack }) {
  const [email, setEmail] = useState("");
  const [segment, setSegment] = useState("");
  const [done, setDone] = useState(false);
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  return (
    <section style={{ maxWidth: 560, margin: "0 auto", padding: "70px 24px 90px" }}>
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1 className="cc-section-h2" style={{ fontWeight: 600, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
          Reserve your spot
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.55, color: C.sub, margin: 0 }}>
          PhoneLess isn’t live yet. Leave your email and we’ll let you know when the real card —
          and the physical backup — is ready. No payment now, and you’re never charged for joining the list.
        </p>
      </div>

      {!done ? (
        <div style={{ background: "#fff", border: `1px solid ${C.hair}`, borderRadius: 20, padding: "28px 26px" }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.ink, display: "block", marginBottom: 7 }}>Email</label>
          <TextInput value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" inputMode="email" />

          <label style={{ fontSize: 13, fontWeight: 600, color: C.ink, display: "block", margin: "18px 0 7px" }}>
            What describes you? <span style={{ color: C.sub, fontWeight: 400 }}>(optional)</span>
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["Just me", "For a parent / family", "Outdoors / travel", "An organization"].map((s) => (
              <span
                key={s}
                onClick={() => setSegment(s === segment ? "" : s)}
                style={{
                  cursor: "pointer", fontSize: 13.5, padding: "8px 13px", borderRadius: 980,
                  border: `1px solid ${segment === s ? C.accent : C.hair}`,
                  color: segment === s ? C.accent : C.sub,
                  background: segment === s ? "#f0f7ff" : "#fff", fontWeight: 500,
                }}
              >
                {s}
              </span>
            ))}
          </div>

          <div style={{ marginTop: 22 }}>
            <Btn onClick={() => valid && setDone(true)} disabled={!valid}>Join the list</Btn>
          </div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 14, lineHeight: 1.5 }}>
            Demo note: this prototype does not send or save your email anywhere. By joining at launch you’ll
            agree to our Terms and Privacy Policy. We’ll only email you about PhoneLess.
          </div>
        </div>
      ) : (
        <div style={{ background: "#fff", border: `1px solid ${C.hair}`, borderRadius: 20, padding: "34px 26px", textAlign: "center" }}>
          <div style={{ width: 46, height: 46, borderRadius: 46, background: "#eaf7ef", color: C.ok, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 14 }}>✓</div>
          <div style={{ fontSize: 19, fontWeight: 600, marginBottom: 8 }}>You’re on the list (in this demo)</div>
          <div style={{ fontSize: 14.5, color: C.sub, lineHeight: 1.55 }}>
            In the live version this is where we’d confirm your spot. Nothing was actually saved or sent — this is a prototype.
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 22 }}>
        <Btn kind="ghost" onClick={onBack}>‹ Back</Btn>
      </div>
    </section>
  );
}

// ---------- LEGAL PAGES ----------
// DEMO-GRADE templates. These are a reasonable starting point for a
// demonstration site and a draft to hand to an attorney — they are NOT a
// substitute for legal review. Bracketed [PLACEHOLDERS] must be filled in,
// and the flagged sections (auto-renew, liability, special-category data)
// MUST be reviewed by counsel before any payment is ever taken.
function LegalPage({ kind, onBack }) {
  const updated = "[INSERT DATE]";
  return (
    <section style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px 90px" }}>
      <div style={{ background: "#fff7e6", border: "1px solid #f0d99a", color: "#7a5c00", borderRadius: 12, padding: "12px 16px", fontSize: 13, lineHeight: 1.5, marginBottom: 28 }}>
        <strong>Template — not yet legal advice.</strong> This page is a demonstration draft. Before PhoneLess
        accepts any payment or stores real user data, this text must be completed and reviewed by a qualified attorney.
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.03em", margin: "0 0 6px" }}>
        {kind === "terms" ? "Terms of Service" : "Privacy Policy"}
      </h1>
      <div style={{ fontSize: 13, color: C.sub, marginBottom: 28 }}>Last updated: {updated}</div>

      {kind === "terms" ? <TermsBody /> : <PrivacyBody />}

      <div style={{ marginTop: 30 }}>
        <Btn kind="ghost" onClick={onBack}>‹ Back</Btn>
      </div>
    </section>
  );
}

function LegalH({ children }) {
  return <h2 style={{ fontSize: 18, fontWeight: 600, margin: "26px 0 8px", color: C.ink }}>{children}</h2>;
}
function LegalP({ children }) {
  return <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "#3a3a3c", margin: "0 0 12px" }}>{children}</p>;
}
function LegalFlag({ children }) {
  return (
    <p style={{ fontSize: 13, lineHeight: 1.55, color: "#7a5c00", background: "#fff7e6", border: "1px solid #f0d99a", borderRadius: 10, padding: "10px 13px", margin: "0 0 12px" }}>
      <strong>⚑ Attorney review required: </strong>{children}
    </p>
  );
}

function TermsBody() {
  return (
    <div>
      <LegalP>
        These Terms govern your use of PhoneLess, operated by [LEGAL ENTITY NAME] (“we,” “us”). By using the
        service you agree to these Terms. If you do not agree, do not use the service.
      </LegalP>

      <LegalH>1. What PhoneLess is — and is not</LegalH>
      <LegalP>
        PhoneLess is a secondary, informational convenience that lets you store a small amount of low-sensitivity
        contact information and retrieve it later. It is <strong>not</strong> an emergency, medical, rescue, or
        life-safety service. It does not contact anyone on your behalf, summon help, provide medical advice, or
        guarantee that your information will be available at any given moment. Never rely on PhoneLess as your only
        means of reaching anyone in an emergency.
      </LegalP>

      <LegalH>2. Eligibility</LegalH>
      <LegalP>
        You must be at least 18 years old to create a card. The service is not directed to children, and accounts
        for minors are not supported at this time.
      </LegalP>

      <LegalH>3. Your information and consent to display it</LegalH>
      <LegalP>
        You choose what to put on your card and explicitly accept that it can be displayed to anyone who enters your
        identifier and PIN. Store only information you are comfortable exposing under that condition. Do not store
        sensitive personal data, financial details, passwords, or government identifiers.
      </LegalP>
      <LegalP>
        If you include any contact other than yourself, you confirm you have a reasonable basis to list them as an
        emergency contact.
      </LegalP>

      <LegalH>4. Acceptable use</LegalH>
      <LegalP>
        You may not use PhoneLess to look up, track, harass, or contact anyone without authorization, or for any
        unlawful purpose. We may suspend access for misuse.
      </LegalP>

      <LegalH>5. Paid features and auto-renewal</LegalH>
      <LegalFlag>
        The exact auto-renewal disclosures, consent mechanics, renewal-reminder emails, and cancellation path must
        be drafted to comply with US ROSCA and state automatic-renewal laws (e.g. California) for every market you
        sell in. Do not enable billing until this section is finalized by counsel.
      </LegalFlag>
      <LegalP>
        Paid tiers, where offered, will be billed on a recurring basis at the price and cadence disclosed to you at
        checkout, with affirmative consent obtained before the first charge and a clear way to cancel. [FINAL TERMS
        TO BE INSERTED.]
      </LegalP>

      <LegalH>6. Physical card orders</LegalH>
      <LegalFlag>
        If you pre-sell or take payment for a physical card before shipping, your shipping timeframes and refund
        obligations are governed by the FTC Mail Order Rule and similar laws. Disclose realistic ship times and a
        refund path.
      </LegalFlag>

      <LegalH>7. No warranty</LegalH>
      <LegalP>
        The service is provided “as is” and “as available,” without warranties of any kind to the fullest extent
        permitted by law, including no warranty that it will be uninterrupted, available, or error-free.
      </LegalP>

      <LegalH>8. Limitation of liability</LegalH>
      <LegalFlag>
        Limitation-of-liability and indemnity language for a service people may associate with safety must be
        drafted carefully; courts may not enforce broad waivers, especially for gross negligence or where consumer
        law applies. This is the single most important section to have reviewed.
      </LegalFlag>
      <LegalP>
        To the fullest extent permitted by law, we are not liable for indirect, incidental, or consequential damages,
        or for any harm arising from reliance on the service, unavailability of the service, or unauthorized access
        to information you chose to store. [SCOPE AND CAPS TO BE SET BY COUNSEL.]
      </LegalP>

      <LegalH>9. Changes; governing law; contact</LegalH>
      <LegalP>
        We may update these Terms; continued use means acceptance. These Terms are governed by the laws of
        [STATE/COUNTRY]. Questions: [CONTACT EMAIL].
      </LegalP>
    </div>
  );
}

function PrivacyBody() {
  return (
    <div>
      <LegalP>
        This Policy explains how PhoneLess, operated by [LEGAL ENTITY NAME], handles information. This demonstration
        site does not collect, store, or transmit any information you enter.
      </LegalP>

      <LegalH>1. Information we would handle (at launch)</LegalH>
      <LegalP>
        Your account email; the card contents you choose to store (contact names and numbers, an optional short
        note); and, for paid orders, a shipping address handled separately from card contents. Payment card details
        would be handled by our payment processor — we would not store full card numbers.
      </LegalP>

      <LegalH>2. Contacts you add about other people</LegalH>
      <LegalP>
        Emergency-contact details may be personal data about someone other than you. We process it only to provide
        the service, and that person may have rights to access or delete it.
      </LegalP>

      <LegalH>3. Medical or other special-category information</LegalH>
      <LegalFlag>
        Any health/medical flag is special-category data under GDPR Art. 9 and similar laws, requiring separate,
        explicit, logged opt-in consent. Keep medical flags off by default and confirm the consent flow with counsel.
      </LegalFlag>

      <LegalH>4. How information would be used</LegalH>
      <LegalP>
        Only to operate the service: to store your card, allow retrieval with your identifier and PIN, notify you of
        lookups, process orders, and provide support. We would not sell your information.
      </LegalP>

      <LegalH>5. Retrieval, security, and your choices</LegalH>
      <LegalP>
        Retrieval is protected by rate-limiting, lockout, and owner notification. You would be able to edit or delete
        your card and close your account at any time. We would honor applicable access and deletion rights.
      </LegalP>
      <LegalFlag>
        Data-breach exposure is a primary risk for this product (the “stalker breaches a card” scenario). Encryption
        at rest and in transit, data minimization, and an incident-response/notification plan must be in place before
        storing real data.
      </LegalFlag>

      <LegalH>6. International users; changes; contact</LegalH>
      <LegalP>
        GDPR/CCPA and other laws may apply depending on where you live; [DETAILS TO BE COMPLETED]. We may update this
        Policy. Questions or requests: [CONTACT EMAIL].
      </LegalP>
    </div>
  );
}
