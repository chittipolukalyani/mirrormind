"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080810",
      color: "#f0eee8",
      fontFamily: "'Inter', sans-serif",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 48px",
        background: "linear-gradient(to bottom, rgba(8,8,16,0.95), transparent)",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem" }}>
          Mirror<span style={{ color: "#9b7fe8", fontStyle: "italic" }}>Mind</span>
        </div>
        <button onClick={() => router.push("/session")} style={{
          background: "linear-gradient(135deg, #9b7fe8, #c084fc)",
          color: "#fff", border: "none", padding: "10px 24px",
          borderRadius: "100px", fontSize: "0.85rem", fontWeight: 600,
          cursor: "pointer",
        }}>Try for free</button>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "120px 24px 80px",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
          width: "700px", height: "700px",
          background: "radial-gradient(circle, rgba(155,127,232,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(155,127,232,0.12)", border: "1px solid rgba(155,127,232,0.25)",
            color: "#c084fc", fontSize: "0.75rem", fontFamily: "'DM Mono', monospace",
            letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "8px 18px", borderRadius: "100px", marginBottom: "40px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#c084fc", display: "inline-block" }} />
            AI Perception Coach — Now Live
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.8rem, 7vw, 6rem)",
            fontWeight: 700, lineHeight: 1.08,
            letterSpacing: "-0.02em", maxWidth: "820px",
            marginBottom: "24px",
          }}>
            You know how you{" "}
            <em style={{ color: "#9b7fe8" }}>feel.</em>
            <br />
            But how do you{" "}
            <em style={{ color: "#c084fc" }}>appear?</em>
          </h1>

          <p style={{
            fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "#7a7a92",
            maxWidth: "520px", fontWeight: 300, lineHeight: 1.7,
            marginBottom: "48px", margin: "0 auto 48px",
          }}>
            Nobody in your life will tell you how you actually come across.
            MirrorMind will — through a 5-question voice conversation.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => router.push("/session")} style={{
              background: "linear-gradient(135deg, #9b7fe8, #c084fc)",
              color: "#fff", border: "none", padding: "16px 36px",
              borderRadius: "100px", fontSize: "1rem", fontWeight: 600,
              cursor: "pointer", boxShadow: "0 0 32px rgba(155,127,232,0.35)",
            }}>Start your first conversation →</button>
            <a href="#how" style={{
              color: "#7a7a92", background: "transparent",
              border: "1px solid rgba(255,255,255,0.07)",
              padding: "16px 36px", borderRadius: "100px",
              fontSize: "1rem", fontWeight: 500, textDecoration: "none",
            }}>See how it works</a>
          </div>
        </motion.div>

        {/* Mirror visual */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}
          style={{ marginTop: "80px", width: "340px", height: "420px", position: "relative" }}>
          <div style={{
            width: "100%", height: "100%",
            border: "1px solid rgba(155,127,232,0.3)",
            borderRadius: "180px 180px 160px 160px",
            background: "linear-gradient(160deg, rgba(155,127,232,0.06), rgba(192,132,252,0.03))",
            boxShadow: "0 0 60px rgba(155,127,232,0.1)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: "16px", padding: "40px",
          }}>
            {[
              { label: "Pattern detected", text: "You apologize before making strong points — quietly reducing your credibility." },
              { label: "Tone analysis", text: "High energy at work, flat when speaking about yourself." },
              { label: "Language habit", text: "You over-explain when uncomfortable. It adds noise to your message." },
            ].map((chip, i) => (
              <motion.div key={i}
                animate={{ y: [0, -4, 0], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity, delay: i }}
                style={{
                  background: "rgba(155,127,232,0.12)",
                  border: "1px solid rgba(155,127,232,0.2)",
                  borderRadius: "12px", padding: "12px 18px",
                  fontSize: "0.78rem", color: "#f0eee8",
                  lineHeight: 1.5, textAlign: "left", width: "100%",
                }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#c084fc", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
                  {chip.label}
                </div>
                {chip.text}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* TRUTH */}
      <section style={{ padding: "120px 24px", maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
        <blockquote style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)",
          fontWeight: 400, fontStyle: "italic", lineHeight: 1.4,
        }}>
          "Your best friend won't say it.<br />
          Your manager won't say it.<br />
          Your partner won't say it.<br />
          <strong style={{ fontStyle: "normal", fontWeight: 700, background: "linear-gradient(135deg, #9b7fe8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>We will.</strong>"
        </blockquote>
        <p style={{ marginTop: "32px", fontSize: "1rem", color: "#7a7a92", fontWeight: 300 }}>
          Because knowing the truth about how you show up is the first step to actually changing it.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{
        padding: "100px 24px",
        background: "#0e0e1a",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <p style={{ textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9b7fe8", marginBottom: "16px" }}>The process</p>
        <h2 style={{ textAlign: "center", fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 700, marginBottom: "64px" }}>How MirrorMind works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2px", maxWidth: "1000px", margin: "0 auto" }}>
          {[
            { num: "01", icon: "🎙️", title: "Speak for 2 minutes", desc: "Answer a few real questions from the AI — like a curious stranger would ask you." },
            { num: "02", icon: "🔬", title: "AI reads between the lines", desc: "It analyzes word choice, hesitation patterns, emotional tone, and confidence signals." },
            { num: "03", icon: "🪞", title: "Your perception profile builds", desc: "A clear picture forms of how you likely come across to colleagues, dates, and strangers." },
            { num: "04", icon: "📈", title: "You actually change", desc: "Specific, honest feedback you can act on. Your patterns, your triggers, your growth." },
          ].map((step, i) => (
            <div key={i} style={{
              background: "#13131f", padding: "40px 32px",
              borderRadius: i === 0 ? "16px 0 0 16px" : i === 3 ? "0 16px 16px 0" : "0",
            }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "#9b7fe8", letterSpacing: "0.1em", marginBottom: "20px" }}>{step.num}</div>
              <span style={{ fontSize: "2rem", marginBottom: "16px", display: "block" }}>{step.icon}</span>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "10px" }}>{step.title}</h3>
              <p style={{ fontSize: "0.875rem", color: "#7a7a92", fontWeight: 300, lineHeight: 1.65 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* JOURNEY */}
      <section style={{ padding: "100px 24px", background: "#0e0e1a" }}>
        <p style={{ textAlign: "center", fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#9b7fe8", marginBottom: "16px" }}>Your transformation</p>
        <h2 style={{ textAlign: "center", fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 700, marginBottom: "64px" }}>What happens over 6 weeks</h2>
        <div style={{ maxWidth: "680px", margin: "0 auto", position: "relative" }}>
          <div style={{ position: "absolute", left: "18px", top: 0, bottom: 0, width: "1px", background: "rgba(255,255,255,0.07)" }} />
          {[
            { week: "Week 1", title: "You're curious", desc: "The first session feels like talking to a very perceptive stranger. You get your first perception report and it makes you think.", active: true },
            { week: "Week 2–3", title: "You're slightly uncomfortable", desc: "Patterns emerge that are a little too accurate. You recognize them from conversations that went sideways.", active: false },
            { week: "Week 4–5", title: "You start catching yourself", desc: "In real conversations, you notice the habits MirrorMind flagged. You pause. You choose differently.", active: false },
            { week: "Week 6", title: "Something has actually changed", desc: "People respond to you differently. You show up the way you always meant to.", active: false },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "32px", marginBottom: i < 3 ? "48px" : "0" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                background: item.active ? "linear-gradient(135deg, #9b7fe8, #c084fc)" : "#13131f",
                border: item.active ? "none" : "1px solid rgba(155,127,232,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.8rem", position: "relative", zIndex: 1,
                boxShadow: item.active ? "0 0 20px rgba(155,127,232,0.4)" : "none",
              }}>{i + 1}</div>
              <div style={{ paddingTop: "4px" }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#9b7fe8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>{item.week}</div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 600, marginBottom: "6px" }}>{item.title}</h3>
                <p style={{ fontSize: "0.875rem", color: "#7a7a92", fontWeight: 300, lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "140px 24px", textAlign: "center", position: "relative" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: "600px", height: "600px",
          background: "radial-gradient(circle, rgba(155,127,232,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: 700, lineHeight: 1.1, maxWidth: "680px", margin: "0 auto 24px" }}>
          Ready to meet yourself<br /><em>from the outside?</em>
        </h2>
        <p style={{ color: "#7a7a92", fontSize: "1.1rem", fontWeight: 300, maxWidth: "440px", margin: "0 auto 48px" }}>
          Two minutes. No signup required to try. Just speak — and listen.
        </p>
        <button onClick={() => router.push("/session")} style={{
          background: "linear-gradient(135deg, #9b7fe8, #c084fc)",
          color: "#fff", border: "none", padding: "16px 40px",
          borderRadius: "100px", fontSize: "1rem", fontWeight: 600,
          cursor: "pointer", boxShadow: "0 0 40px rgba(155,127,232,0.4)",
        }}>Start your first session free →</button>
        <p style={{ marginTop: "20px", fontSize: "0.8rem", color: "#3a3a52", fontFamily: "'DM Mono', monospace" }}>
          100% free · No credit card · Works in your browser
        </p>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "32px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px",
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem" }}>
          Mirror<span style={{ color: "#9b7fe8", fontStyle: "italic" }}>Mind</span>
        </div>
        <p style={{ fontSize: "0.8rem", color: "#7a7a92" }}>Built with care for people who want to grow honestly.</p>
        <p style={{ fontSize: "0.75rem", color: "#3a3a52" }}>© 2026 MirrorMind</p>
      </footer>
    </div>
  );
}
