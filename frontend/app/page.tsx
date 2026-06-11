"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Message = { role: "user" | "assistant"; content: string };
type Pattern = {
  type: string;
  title: string;
  description: string;
  frequency: number;
  color: string;
};
type Analysis = {
  headline: string;
  score: number;
  patterns: Pattern[];
  strength: string;
  growth: string;
};
type Phase = "landing" | "session" | "analyzing" | "results";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("landing");
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
  const recognitionRef = useRef<any>(null);

  const startSession = async () => {
    setPhase("session");
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
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice not supported. Use text mode or Chrome browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
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

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const getAnswer = () => inputMode === "voice" ? transcript.trim() : typedAnswer.trim();

  const submitAnswer = async () => {
    const answer = getAnswer();
    if (!answer) return;
    setTranscript("");
    setTypedAnswer("");
    const newMessages: Message[] = [...messages, { role: "user", content: answer }];
    setMessages(newMessages);
    if (isLast) {
      setPhase("analyzing");
      await getAnalysis(newMessages);
    } else {
      await loadQuestion(questionNum + 1);
    }
  };

  const getAnalysis = async (msgs: Message[]) => {
    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs, question_number: questionNum }),
      });
      const data = await res.json();
      setAnalysis(data);
      setPhase("results");
    } catch {
      setError("Analysis failed. Please try again.");
      setPhase("session");
    }
  };

  const colorMap: Record<string, string> = {
    purple: "#9b7fe8",
    yellow: "#fbbf24",
    green: "#34d399",
  };

  const hasAnswer = getAnswer().length > 0;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080810",
      color: "#f0eee8",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea { resize: none; outline: none; }
        textarea::placeholder { color: #3a3a52; }
      `}</style>

      <AnimatePresence mode="wait">

        {/* LANDING */}
        {phase === "landing" && (
          <motion.div key="landing" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            style={{ textAlign: "center", maxWidth: "600px" }}>
            <div style={{
              width: "120px", height: "120px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(155,127,232,0.4), rgba(192,132,252,0.1))",
              border: "1px solid rgba(155,127,232,0.3)",
              margin: "0 auto 40px",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem",
            }}>🪞</div>

            <div style={{
              display: "inline-block",
              background: "rgba(155,127,232,0.12)", border: "1px solid rgba(155,127,232,0.25)",
              color: "#c084fc", fontSize: "0.7rem", fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "6px 16px", borderRadius: "100px", marginBottom: "32px",
            }}>AI Perception Coach</div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.2rem, 6vw, 3.8rem)",
              fontWeight: 700, lineHeight: 1.1, marginBottom: "20px",
            }}>
              You know how you <em style={{ color: "#9b7fe8" }}>feel.</em><br />
              But how do you <em style={{ color: "#c084fc" }}>appear?</em>
            </h1>

            <p style={{ color: "#7a7a92", fontSize: "1.05rem", fontWeight: 300, lineHeight: 1.7, marginBottom: "48px" }}>
              Nobody in your life will tell you how you actually come across.<br />
              MirrorMind will — through a 5-question conversation.
            </p>

            <button onClick={startSession} style={{
              background: "linear-gradient(135deg, #9b7fe8, #c084fc)",
              color: "#fff", border: "none", padding: "16px 40px", borderRadius: "100px",
              fontSize: "1rem", fontWeight: 600, cursor: "pointer",
              boxShadow: "0 0 40px rgba(155,127,232,0.4)",
            }}>Start my session →</button>

            <p style={{ marginTop: "16px", fontSize: "0.75rem", color: "#3a3a52", fontFamily: "'DM Mono', monospace" }}>
              5 questions · voice or text · completely honest
            </p>
          </motion.div>
        )}

        {/* SESSION */}
        {phase === "session" && (
          <motion.div key="session" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            style={{ width: "100%", maxWidth: "640px" }}>

            {/* Progress */}
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
                <motion.div
                  style={{ height: "100%", background: "linear-gradient(90deg, #9b7fe8, #c084fc)", borderRadius: "1px" }}
                  animate={{ width: `${((questionNum + 1) / totalQuestions) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Question */}
            <motion.div key={questionNum} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "36px", marginBottom: "24px" }}>
              <div style={{ fontSize: "0.65rem", fontFamily: "'DM Mono', monospace", color: "#9b7fe8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
                MirrorMind asks
              </div>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.35rem", fontWeight: 400, lineHeight: 1.5, color: "#f0eee8" }}>
                {question}
              </p>
            </motion.div>

            {/* Input Mode Toggle */}
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
                    transition: "all 0.2s",
                  }}>
                  {mode === "voice" ? "🎙 Voice" : "⌨️ Type"}
                </button>
              ))}
            </div>

            {/* Voice Input */}
            {inputMode === "voice" && (
              <div style={{
                background: "#13131f",
                border: `1px solid ${isListening ? "rgba(155,127,232,0.5)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: "20px", padding: "24px", marginBottom: "16px", minHeight: "100px",
                transition: "border-color 0.3s",
              }}>
                {transcript ? (
                  <p style={{ color: "#f0eee8", fontSize: "0.95rem", lineHeight: 1.6, fontWeight: 300 }}>{transcript}</p>
                ) : (
                  <p style={{ color: "#3a3a52", fontSize: "0.9rem", fontWeight: 300, fontStyle: "italic" }}>
                    {isListening ? "Listening... speak naturally" : "Press the mic button and speak your answer"}
                  </p>
                )}
              </div>
            )}

            {/* Text Input */}
            {inputMode === "text" && (
              <textarea
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
                style={{
                  width: "100%", background: "#13131f",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "20px", padding: "24px",
                  color: "#f0eee8", fontSize: "0.95rem", lineHeight: 1.6,
                  fontFamily: "'Inter', sans-serif", fontWeight: 300,
                  marginBottom: "16px", display: "block",
                }}
              />
            )}

            {error && <p style={{ color: "#f87171", fontSize: "0.8rem", marginBottom: "12px", textAlign: "center" }}>{error}</p>}

            {/* Controls */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "center" }}>
              {inputMode === "voice" && (
                <button onClick={isListening ? stopListening : startListening} style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  background: isListening ? "linear-gradient(135deg, #ef4444, #dc2626)" : "linear-gradient(135deg, #9b7fe8, #c084fc)",
                  border: "none", cursor: "pointer", fontSize: "1.5rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: isListening ? "0 0 30px rgba(239,68,68,0.4)" : "0 0 30px rgba(155,127,232,0.4)",
                  transition: "all 0.3s",
                }}>
                  {isListening ? "⏹" : "🎙️"}
                </button>
              )}

              {(hasAnswer && !isListening) && (
                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  onClick={submitAnswer} style={{
                    background: "linear-gradient(135deg, #9b7fe8, #c084fc)",
                    color: "#fff", border: "none", padding: "16px 32px", borderRadius: "100px",
                    fontSize: "0.95rem", fontWeight: 600, cursor: "pointer",
                    boxShadow: "0 0 20px rgba(155,127,232,0.3)",
                  }}>
                  {isLast ? "Get my profile →" : "Next question →"}
                </motion.button>
              )}

              {inputMode === "text" && !hasAnswer && (
                <p style={{ color: "#3a3a52", fontSize: "0.8rem", fontStyle: "italic" }}>Type your answer above to continue</p>
              )}
            </div>
          </motion.div>
        )}

        {/* ANALYZING */}
        {phase === "analyzing" && (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center" }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{
                width: "80px", height: "80px", borderRadius: "50%",
                border: "2px solid transparent", borderTopColor: "#9b7fe8", borderRightColor: "#c084fc",
                margin: "0 auto 32px",
              }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", marginBottom: "12px" }}>
              Building your perception profile...
            </h2>
            <p style={{ color: "#7a7a92", fontWeight: 300 }}>Analyzing how you come across to the world</p>
          </motion.div>
        )}

        {/* RESULTS */}
        {phase === "results" && analysis && (
          <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            style={{ width: "100%", maxWidth: "720px" }}>

            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <div style={{ fontSize: "0.65rem", fontFamily: "'DM Mono', monospace", color: "#9b7fe8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
                Your Perception Profile
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem, 4vw, 2.4rem)", fontWeight: 700, lineHeight: 1.3, marginBottom: "24px" }}>
                {analysis.headline}
              </h1>
              <div style={{
                display: "inline-flex", flexDirection: "column", alignItems: "center",
                background: "#13131f", border: "1px solid rgba(155,127,232,0.2)",
                borderRadius: "20px", padding: "24px 40px", marginBottom: "48px",
              }}>
                <span style={{
                  fontFamily: "'Playfair Display', serif", fontSize: "3.5rem", fontWeight: 700,
                  background: "linear-gradient(135deg, #9b7fe8, #c084fc)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>{analysis.score}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "#7a7a92", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Perception Score
                </span>
              </div>
            </div>

            {/* Patterns */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "24px" }}>
              {analysis.patterns.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                  style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "24px" }}>
                  <span style={{
                    display: "inline-block",
                    background: `${colorMap[p.color] || "#9b7fe8"}18`,
                    color: colorMap[p.color] || "#9b7fe8",
                    fontSize: "0.65rem", fontFamily: "'DM Mono', monospace",
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    padding: "4px 10px", borderRadius: "100px", marginBottom: "12px",
                  }}>{p.type}</span>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "8px", color: "#f0eee8" }}>"{p.title}"</h3>
                  <p style={{ fontSize: "0.82rem", color: "#7a7a92", lineHeight: 1.65, fontWeight: 300, marginBottom: "16px" }}>{p.description}</p>
                  <div style={{ height: "3px", background: "#0e0e1a", borderRadius: "2px", overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${p.frequency}%` }} transition={{ duration: 1, delay: i * 0.15 + 0.3 }}
                      style={{ height: "100%", background: `linear-gradient(90deg, ${colorMap[p.color] || "#9b7fe8"}, ${colorMap[p.color] || "#9b7fe8"}88)`, borderRadius: "2px" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                    <span style={{ fontSize: "0.65rem", color: "#3a3a52", fontFamily: "'DM Mono', monospace" }}>Frequency</span>
                    <span style={{ fontSize: "0.65rem", color: "#3a3a52", fontFamily: "'DM Mono', monospace" }}>{p.frequency}%</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Strength + Growth */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "40px" }}>
              <div style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ fontSize: "1.2rem", marginBottom: "8px" }}>✨</div>
                <div style={{ fontSize: "0.65rem", fontFamily: "'DM Mono', monospace", color: "#34d399", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Your Strength</div>
                <p style={{ fontSize: "0.88rem", color: "#f0eee8", lineHeight: 1.6, fontWeight: 300 }}>{analysis.strength}</p>
              </div>
              <div style={{ background: "rgba(155,127,232,0.05)", border: "1px solid rgba(155,127,232,0.15)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ fontSize: "1.2rem", marginBottom: "8px" }}>🎯</div>
                <div style={{ fontSize: "0.65rem", fontFamily: "'DM Mono', monospace", color: "#9b7fe8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Grow Here</div>
                <p style={{ fontSize: "0.88rem", color: "#f0eee8", lineHeight: 1.6, fontWeight: 300 }}>{analysis.growth}</p>
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <button onClick={() => { setPhase("landing"); setMessages([]); setTranscript(""); setTypedAnswer(""); setQuestionNum(0); setAnalysis(null); setError(""); }}
                style={{ background: "transparent", border: "1px solid rgba(155,127,232,0.3)", color: "#9b7fe8", padding: "14px 32px", borderRadius: "100px", fontSize: "0.9rem", cursor: "pointer", fontWeight: 500 }}>
                Start a new session
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
