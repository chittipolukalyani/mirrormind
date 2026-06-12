"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Message = { role: "user" | "assistant"; content: string };
type Pattern = { type: string; title: string; description: string; frequency: number; color: string; };
type Analysis = { headline: string; score: number; patterns: Pattern[]; strength: string; growth: string; };
type Phase = "session" | "analyzing" | "results";

export default function Session() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("session");
  const [question, setQuestion] = useState("");
  const [questionNum, setQuestionNum] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLast, setIsLast] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const [started, setStarted] = useState(false);
  const [sharing, setSharing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const startSession = async () => {
    setStarted(true);
    await loadQuestion(0);
  };

  const loadQuestion = async (num: number) => {
    try {
      const res = await fetch(`${API_URL}/question/${num}`);
      const data = await res.json();
      setQuestion(data.question);
      setTotalQuestions(data.total);
      setIsLast(data.is_last);
      setQuestionNum(num);
      setTranscript("");
      setTypedAnswer("");
      setMessages((prev) => [...prev, { role: "assistant", content: data.question }]);
    } catch {
      setError("Could not connect to backend. Make sure it's running.");
    }
  };

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setError("Voice not supported. Use text mode or Chrome."); return; }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
      }
      if (final) setTranscript((prev) => prev + " " + final);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); };
  const getAnswer = () => inputMode === "voice" ? transcript.trim() : typedAnswer.trim();

  const submitAnswer = async () => {
    const answer = getAnswer();
    if (!answer) return;
    setTranscript(""); setTypedAnswer("");
    const newMessages: Message[] = [...messages, { role: "user", content: answer }];
    setMessages(newMessages);
    if (isLast) { setPhase("analyzing"); await getAnalysis(newMessages); }
    else await loadQuestion(questionNum + 1);
  };

  const getAnalysis = async (msgs: Message[]) => {
    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs, question_number: questionNum }),
      });
      const data = await res.json();
      setAnalysis(data); setPhase("results");
    } catch {
      setError("Analysis failed. Please try again."); setPhase("session");
    }
  };

  const handleShare = async () => {
    if (!shareCardRef.current || !analysis) return;
    setSharing(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: "#080810",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = "mirrormind-profile.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error(e);
    }
    setSharing(false);
  };

  const colorMap: Record<string, string> = { purple: "#9b7fe8", yellow: "#fbbf24", green: "#34d399" };
  const hasAnswer = getAnswer().length > 0;

  return (
    <div style={{
      minHeight: "100vh", background: "#080810", color: "#f0eee8",
      fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: "24px",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } textarea { resize: none; outline: none; } textarea::placeholder { color: #3a3a52; }`}</style>

      <button onClick={() => router.push("/")} style={{
        position: "fixed", top: "24px", left: "24px",
        background: "transparent", border: "1px solid rgba(255,255,255,0.07)",
        color: "#7a7a92", padding: "8px 16px", borderRadius: "100px",
        fontSize: "0.8rem", cursor: "pointer", fontFamily: "'DM Mono', monospace",
      }}>← Back</button>

      <AnimatePresence mode="wait">

        {/* START SCREEN */}
        {!started && (
          <motion.div key="start" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ textAlign: "center", maxWidth: "500px" }}>
            <div style={{ fontSize: "4rem", marginBottom: "32px" }}>🪞</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 700, marginBottom: "16px" }}>
              Ready to meet your<br /><em style={{ color: "#9b7fe8" }}>outer self?</em>
            </h1>
            <p style={{ color: "#7a7a92", fontWeight: 300, lineHeight: 1.7, marginBottom: "48px" }}>
              5 questions. 2 minutes. Complete honesty.<br />
              You can answer by voice or by typing.
            </p>
            <button onClick={startSession} style={{
              background: "linear-gradient(135deg, #9b7fe8, #c084fc)",
              color: "#fff", border: "none", padding: "16px 40px",
              borderRadius: "100px", fontSize: "1rem", fontWeight: 600,
              cursor: "pointer", boxShadow: "0 0 40px rgba(155,127,232,0.4)",
            }}>Begin my session →</button>
          </motion.div>
        )}

        {/* SESSION */}
        {started && phase === "session" && (
          <motion.div key="session" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ width: "100%", maxWidth: "640px" }}>
            <div style={{ marginBottom: "40px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#9b7fe8", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Question {questionNum + 1} of {totalQuestions}
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#3a3a52" }}>
                  {Math.round(((questionNum + 1) / totalQuestions) * 100)}%
                </span>
              </div>
              <div style={{ height: "2px", background: "#13131f", borderRadius: "1px", overflow: "hidden" }}>
                <motion.div style={{ height: "100%", background: "linear-gradient(90deg, #9b7fe8, #c084fc)", borderRadius: "1px" }}
                  animate={{ width: `${((questionNum + 1) / totalQuestions) * 100}%` }} transition={{ duration: 0.5 }} />
              </div>
            </div>

            <motion.div key={questionNum} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "36px", marginBottom: "24px" }}>
              <div style={{ fontSize: "0.65rem", fontFamily: "'DM Mono', monospace", color: "#9b7fe8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>MirrorMind asks</div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.35rem", fontWeight: 400, lineHeight: 1.5 }}>{question}</p>
            </motion.div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              {(["voice", "text"] as const).map((mode) => (
                <button key={mode} onClick={() => { setInputMode(mode); setTranscript(""); setTypedAnswer(""); if (isListening) stopListening(); }}
                  style={{
                    padding: "8px 20px", borderRadius: "100px", border: "1px solid",
                    borderColor: inputMode === mode ? "#9b7fe8" : "rgba(255,255,255,0.07)",
                    background: inputMode === mode ? "rgba(155,127,232,0.15)" : "transparent",
                    color: inputMode === mode ? "#c084fc" : "#7a7a92",
                    fontSize: "0.8rem", fontWeight: 500, cursor: "pointer",
                    fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em", textTransform: "uppercase",
                  }}>
                  {mode === "voice" ? "🎙 Voice" : "⌨️ Type"}
                </button>
              ))}
            </div>

            {inputMode === "voice" && (
              <div style={{
                background: "#13131f", border: `1px solid ${isListening ? "rgba(155,127,232,0.5)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: "20px", padding: "24px", marginBottom: "16px", minHeight: "100px",
              }}>
                {transcript
                  ? <p style={{ color: "#f0eee8", fontSize: "0.95rem", lineHeight: 1.6, fontWeight: 300 }}>{transcript}</p>
                  : <p style={{ color: "#3a3a52", fontSize: "0.9rem", fontStyle: "italic" }}>{isListening ? "Listening... speak naturally" : "Press the mic and speak your answer"}</p>
                }
              </div>
            )}

            {inputMode === "text" && (
              <textarea value={typedAnswer} onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type your answer here..." rows={4}
                style={{
                  width: "100%", background: "#13131f", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "20px", padding: "24px", color: "#f0eee8", fontSize: "0.95rem",
                  lineHeight: 1.6, fontFamily: "'Inter', sans-serif", fontWeight: 300,
                  marginBottom: "16px", display: "block",
                }} />
            )}

            {error && <p style={{ color: "#f87171", fontSize: "0.8rem", marginBottom: "12px", textAlign: "center" }}>{error}</p>}

            <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "center" }}>
              {inputMode === "voice" && (
                <button onClick={isListening ? stopListening : startListening} style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  background: isListening ? "linear-gradient(135deg, #ef4444, #dc2626)" : "linear-gradient(135deg, #9b7fe8, #c084fc)",
                  border: "none", cursor: "pointer", fontSize: "1.5rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: isListening ? "0 0 30px rgba(239,68,68,0.4)" : "0 0 30px rgba(155,127,232,0.4)",
                }}>{isListening ? "⏹" : "🎙️"}</button>
              )}
              {hasAnswer && !isListening && (
                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  onClick={submitAnswer} style={{
                    background: "linear-gradient(135deg, #9b7fe8, #c084fc)", color: "#fff",
                    border: "none", padding: "16px 32px", borderRadius: "100px",
                    fontSize: "0.95rem", fontWeight: 600, cursor: "pointer",
                  }}>{isLast ? "Get my profile →" : "Next question →"}</motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* ANALYZING */}
        {phase === "analyzing" && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ width: "80px", height: "80px", borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#9b7fe8", borderRightColor: "#c084fc", margin: "0 auto 32px" }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", marginBottom: "12px" }}>Building your perception profile...</h2>
            <p style={{ color: "#7a7a92", fontWeight: 300 }}>Analyzing how you come across to the world</p>
          </motion.div>
        )}

        {/* RESULTS */}
        {phase === "results" && analysis && (
          <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ width: "100%", maxWidth: "720px" }}>

            {/* Shareable Card */}
            <div ref={shareCardRef} style={{
              background: "#080810", padding: "48px",
              borderRadius: "24px", border: "1px solid rgba(155,127,232,0.2)",
              marginBottom: "32px",
            }}>
              {/* Card Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem" }}>
                  Mirror<span style={{ color: "#9b7fe8", fontStyle: "italic" }}>Mind</span>
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#3a3a52", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Perception Profile
                </div>
              </div>

              {/* Score + Headline */}
              <div style={{ textAlign: "center", marginBottom: "40px" }}>
                <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", background: "#13131f", border: "1px solid rgba(155,127,232,0.2)", borderRadius: "20px", padding: "20px 36px", marginBottom: "24px" }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "3rem", fontWeight: 700, background: "linear-gradient(135deg, #9b7fe8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{analysis.score}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "#7a7a92", letterSpacing: "0.1em", textTransform: "uppercase" }}>Perception Score</span>
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.2rem, 3vw, 1.8rem)", fontWeight: 700, lineHeight: 1.3, maxWidth: "560px", margin: "0 auto" }}>
                  {analysis.headline}
                </h2>
              </div>

              {/* Patterns */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "24px" }}>
                {analysis.patterns.map((p, i) => (
                  <div key={i} style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ fontSize: "0.6rem", fontFamily: "'DM Mono', monospace", color: colorMap[p.color] || "#9b7fe8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>{p.type}</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px", color: "#f0eee8" }}>"{p.title}"</div>
                    <div style={{ height: "2px", background: "#0e0e1a", borderRadius: "1px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${p.frequency}%`, background: `linear-gradient(90deg, ${colorMap[p.color] || "#9b7fe8"}, ${colorMap[p.color] || "#9b7fe8"}88)`, borderRadius: "1px" }} />
                    </div>
                    <div style={{ fontSize: "0.6rem", color: "#3a3a52", fontFamily: "'DM Mono', monospace", marginTop: "4px", textAlign: "right" }}>{p.frequency}%</div>
                  </div>
                ))}
              </div>

              {/* Strength + Growth */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "32px" }}>
                <div style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: "12px", padding: "16px" }}>
                  <div style={{ fontSize: "0.6rem", fontFamily: "'DM Mono', monospace", color: "#34d399", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>✨ Strength</div>
                  <p style={{ fontSize: "0.8rem", color: "#f0eee8", lineHeight: 1.5, fontWeight: 300 }}>{analysis.strength}</p>
                </div>
                <div style={{ background: "rgba(155,127,232,0.05)", border: "1px solid rgba(155,127,232,0.15)", borderRadius: "12px", padding: "16px" }}>
                  <div style={{ fontSize: "0.6rem", fontFamily: "'DM Mono', monospace", color: "#9b7fe8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>🎯 Grow Here</div>
                  <p style={{ fontSize: "0.8rem", color: "#f0eee8", lineHeight: 1.5, fontWeight: 300 }}>{analysis.growth}</p>
                </div>
              </div>

              {/* Card Footer */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "20px" }}>
                <p style={{ fontSize: "0.7rem", color: "#3a3a52", fontFamily: "'DM Mono', monospace" }}>mirrormind-gules.vercel.app</p>
                <p style={{ fontSize: "0.7rem", color: "#3a3a52", fontFamily: "'DM Mono', monospace" }}>Try it free →</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={handleShare} disabled={sharing} style={{
                background: "linear-gradient(135deg, #9b7fe8, #c084fc)",
                color: "#fff", border: "none", padding: "14px 32px",
                borderRadius: "100px", fontSize: "0.9rem", fontWeight: 600,
                cursor: "pointer", boxShadow: "0 0 20px rgba(155,127,232,0.3)",
                opacity: sharing ? 0.7 : 1,
              }}>
                {sharing ? "Generating..." : "📸 Download my profile card"}
              </button>
              <button onClick={() => { setPhase("session"); setMessages([]); setTranscript(""); setTypedAnswer(""); setQuestionNum(0); setAnalysis(null); setError(""); setStarted(false); }}
                style={{ background: "transparent", border: "1px solid rgba(155,127,232,0.3)", color: "#9b7fe8", padding: "14px 32px", borderRadius: "100px", fontSize: "0.9rem", cursor: "pointer", fontWeight: 500 }}>
                Start a new session
              </button>
              <button onClick={() => router.push("/")}
                style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.07)", color: "#7a7a92", padding: "14px 32px", borderRadius: "100px", fontSize: "0.9rem", cursor: "pointer", fontWeight: 500 }}>
                Back to home
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
