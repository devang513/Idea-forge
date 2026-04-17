import { useState, useEffect } from "react";
import IdeaDetail from "./pages/IdeaDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

/* ═══════════════════════════════════════════════════════════
   DATA & CONSTANTS
═══════════════════════════════════════════════════════════ */
const CATEGORIES = ["All", "HealthTech", "EdTech", "FinTech", "CleanTech", "AgriTech", "SocialImpact", "AI/ML", "Mobility"];

const MENTORS = [
  { id: 1, name: "Dr. Vikram Nair", avatar: "VN", expertise: "HealthTech & MedDevices", rating: 4.9, sessions: 234, bio: "Ex-AIIMS researcher, 3 exits in digital health", available: true },
  { id: 2, name: "Sunita Krishnan", avatar: "SK", expertise: "EdTech & Learning Design", rating: 4.8, sessions: 189, bio: "Former VP Product at BYJU'S, Stanford MBA", available: true },
  { id: 3, name: "Arjun Kapoor", avatar: "AK", expertise: "CleanTech & ESG Investing", rating: 4.7, sessions: 156, bio: "Climate VC Partner, IIT Bombay alumnus", available: false },
  { id: 4, name: "Meera Joshi", avatar: "MJ", expertise: "AI/ML & Deep Tech", rating: 4.9, sessions: 278, bio: "Google Brain alum, 12 patents, NeurIPS speaker", available: true },
];

const LEADERBOARD = [
  { rank: 1, title: "AI Rural Health Diagnostics", author: "Priya Sharma", score: 91, category: "HealthTech", delta: "+3", trend: "up" },
  { rank: 2, title: "Carbon Credit for Farmers", author: "Anjali Verma", score: 86, category: "CleanTech", delta: "+1", trend: "up" },
  { rank: 3, title: "AI Vernacular Tutor", author: "Sneha Iyer", score: 83, category: "EdTech", delta: "0", trend: "flat" },
  { rank: 4, title: "Gamified Micro-Skill Bootcamps", author: "Rahul Mehta", score: 78, category: "EdTech", delta: "+2", trend: "up" },
  { rank: 5, title: "Hyperlocal EV Fleet", author: "Karan Bose", score: 72, category: "Mobility", delta: "-1", trend: "down" },
];

/* ═══════════════════════════════════════════════════════════
   TINY HELPERS
═══════════════════════════════════════════════════════════ */
const ScoreRing = ({ score, size = 64, stroke = 5, color = "#6366f1" }) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fill="white" fontSize={size / 4} fontWeight="700"
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>{score}</text>
    </svg>
  );
};

const MiniBar = ({ val, max = 100, color }) => (
  <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 99, height: 6, overflow: "hidden" }}>
    <div style={{ width: `${val}%`, height: "100%", background: color, borderRadius: 99, transition: "width 1s ease" }} />
  </div>
);

const Tag = ({ children, color = "#6366f1" }) => (
  <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 600 }}>{children}</span>
);

const StageChip = ({ stage }) => {
  const map = {
    "Validated": { bg: "#10b98122", color: "#10b981", border: "#10b98133" },
    "In Review": { bg: "#f59e0b22", color: "#f59e0b", border: "#f59e0b33" },
    "Pitching": { bg: "#6366f122", color: "#818cf8", border: "#6366f133" },
  };
  const s = map[stage] || map["In Review"];
  return <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 99, padding: "3px 12px", fontSize: 11, fontWeight: 700 }}>{stage}</span>;
};

function AnimatedNumber({ target, duration = 1200 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setVal(Math.round(p * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return <>{val}</>;
}

/* mini sparkline */
const Spark = ({ data, color = "#6366f1" }) => {
  const w = 80, h = 28, max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 4)}`).join(" ");
  return <svg width={w} height={h}><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
};

/* ═══════════════════════════════════════════════════════════
   SUBMIT IDEA MODAL
═══════════════════════════════════════════════════════════ */
function SubmitModal({ onClose, onSubmit, onResult }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: "", description: "", target: "", assumptions: "", timeframe: "6 months", teamSize: "1-3" });
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (onResult) onResult(result);
  }, [result, onResult]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const analyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('http://localhost:5001/api/analyze-idea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          target: form.target
        }),
      });

      const isShort = (form.title + ' ' + form.description).length < 30;
      const base = isShort ? 10 : 70; // Terrible score for random/short text

      const mockResult = {
        score: Math.floor(Math.random() * 20) + base,
        feasibility: Math.floor(Math.random() * 20) + (base - 5),
        market: Math.floor(Math.random() * 20) + base,
        innovation: Math.floor(Math.random() * 20) + (base - 10),
        swot: isShort ? {
          s: ["None identified"],
          w: ["Text is too short to be a real idea", "Looks like random input", "Cannot validate"],
          o: ["Provide a real business description to get accurate analysis"],
          t: ["Will not survive market without a clear plan"]
        } : {
          s: ["Clear problem statement", "Identifiable target market", "Scalable approach"],
          w: ["Needs technical validation", "Resource requirements unclear"],
          o: ["Growing market trend", "Partnership potential", "Govt. support programs"],
          t: ["Established competition", "Regulatory uncertainty"]
        },
        suggestions: isShort ? 
          ["Please type a real, detailed startup idea.", "Describe the specific problem you are solving.", "Include who your target users are."] :
          ["Narrow your target audience for MVP", "Define 2-3 key metrics for validation", "Reach out to 10 potential users this week"]
      };

      if (response && response.ok) {
        const data = await response.json();
        setResult(data.analysis);
      } else {
        console.error('AI analysis failed or error occurred, using fallback');
        setResult(mockResult);
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      
      const isShort = (form.title + ' ' + form.description).length < 30;
      const base = isShort ? 10 : 70;
      setResult({
        score: Math.floor(Math.random() * 20) + base,
        feasibility: Math.floor(Math.random() * 20) + (base - 5),
        market: Math.floor(Math.random() * 20) + base,
        innovation: Math.floor(Math.random() * 20) + (base - 10),
        swot: isShort ? {
          s: ["None identified"],
          w: ["Text is too short to be a real idea", "Looks like random input"],
          o: ["Provide a real description"],
          t: ["Cannot be evaluated"]
        } : {
          s: ["Fallback used"], w: ["Backend error"], o: [""], t: [""]
        },
        suggestions: ["Backend API error. Please check server."]
      });
    } finally {
      setAnalyzing(false);
    }
  };

  if (result) return (
    <div style={{ padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 16, color: "#a78bfa", fontWeight: 700, letterSpacing: 3, marginBottom: 8 }}>✨ AI VALIDATION COMPLETE</div>
        <div style={{ fontSize: 36, fontWeight: 800, color: "white" }}>{form.title || "Your Idea"}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 30 }}>
        {[{ l: "Overall Score", v: result.score, c: "#6366f1" }, { l: "Feasibility", v: result.feasibility, c: "#10b981" }, { l: "Market Fit", v: result.market, c: "#f59e0b" }].map(m => (
          <div key={m.l} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: "24px 10px", textAlign: "center", border: "1px solid rgba(255,255,255,0.08)" }}>
            <ScoreRing score={m.v} size={80} color={m.c} />
            <div style={{ fontSize: 14, color: "#9ca3af", marginTop: 10, fontWeight: 600 }}>{m.l}</div>
          </div>
        ))}
      </div>

      {result.aiSummary && (
        <div style={{ background: "linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(99, 102, 241, 0.05))", border: "1px solid rgba(167, 139, 250, 0.2)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#a78bfa", marginBottom: 12, letterSpacing: 1 }}>AI EXECUTIVE SUMMARY</div>
          <div style={{ fontSize: 16, color: "white", lineHeight: 1.6 }}>{result.aiSummary}</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 24 }}>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#a78bfa", marginBottom: 16, letterSpacing: 1 }}>AUTO-GENERATED SWOT</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[{ l: "Strengths 💪", items: result.swot.s, c: "#10b981" }, { l: "Weaknesses ⚠️", items: result.swot.w, c: "#f59e0b" }, { l: "Opportunities 🚀", items: result.swot.o, c: "#6366f1" }, { l: "Threats 🔴", items: result.swot.t, c: "#ef4444" }].map(s => (
              <div key={s.l} style={{ background: `${s.c}11`, border: `1px solid ${s.c}22`, borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: s.c, marginBottom: 8 }}>{s.l}</div>
                {s.items.map(i => <div key={i} style={{ fontSize: 13, color: "#d1d5db", marginBottom: 4, lineHeight: 1.5 }}>• {i}</div>)}
              </div>
            ))}
          </div>
        </div>

        {result.marketResearchReport && (
          <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#10b981", marginBottom: 16, letterSpacing: 1 }}>MARKET RESEARCH REPORT</div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>Target Demographic</div>
                  <div style={{ fontSize: 14, color: "white" }}>{result.marketResearchReport.targetDemographic}</div>
                </div>
                
                <div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>Estimated Market Size</div>
                  <div style={{ fontSize: 14, color: "white" }}>{result.marketResearchReport.marketSize}</div>
                </div>
              </div>
              
              <div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>Key Competitors</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {result.marketResearchReport.competitors.map(c => <span key={c} style={{ background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: 100, fontSize: 12, color: "white" }}>{c}</span>)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6 }}>Industry Trends</div>
                  <ul style={{ margin: 0, paddingLeft: 20, color: "white", fontSize: 13 }}>
                    {result.marketResearchReport.trends.map(t => <li key={t} style={{ marginBottom: 4 }}>{t}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#a78bfa", marginBottom: 16, letterSpacing: 1 }}>AI NEXT STEPS & SUGGESTIONS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {result.suggestions.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#a78bfa", flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontSize: 14, color: "#e5e7eb", lineHeight: 1.6 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
        <button onClick={onClose} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "16px", color: "#9ca3af", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>Close</button>
        <button onClick={() => { onSubmit({ ...form, score: result.score, ...result }); onClose(); }} style={{ flex: 2, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 12, padding: "16px", color: "white", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>🚀 Submit Idea to Platform</button>
      </div>
    </div>
  );

  if (analyzing) return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ fontSize: 48, marginBottom: 16, animation: "spin 2s linear infinite" }}>⚙️</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 8 }}>Analyzing your idea…</div>
      <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24 }}>Running AI scoring, market analysis & SWOT generation</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 280, margin: "0 auto" }}>
        {["AI Feasibility Scoring", "Market Trend Analysis", "SWOT Auto-Generation", "Mentor Match Suggestions"].map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 14px" }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #6366f1", borderTopColor: "transparent", animation: `spin ${0.8 + i * 0.2}s linear infinite` }} />
            <span style={{ fontSize: 12, color: "#9ca3af" }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ maxHeight: "80vh", overflowY: "auto", padding: "0 2px" }}>
      {/* Steps */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["Idea Details", "Context", "Review"].map((s, i) => (
          <div key={s} style={{ flex: 1 }}>
            <div style={{ height: 3, borderRadius: 99, background: step > i ? "linear-gradient(90deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.1)", marginBottom: 6, transition: "background .3s" }} />
            <div style={{ fontSize: 11, color: step > i ? "#a78bfa" : "#6b7280", fontWeight: 600 }}>{s}</div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={lbl}>Idea Title *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. AI-powered crop disease detection" style={inp} />
          </div>
          <div>
            <label style={lbl}>Problem & Solution Description *</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={4} placeholder="Describe the problem you're solving and your proposed solution…" style={{ ...inp, resize: "vertical" }} />
          </div>
          <button onClick={() => setStep(2)} disabled={!form.title || !form.description} style={{ ...btn, opacity: (!form.title || !form.description) ? 0.4 : 1 }}>Continue →</button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={lbl}>Target Audience</label>
            <input value={form.target} onChange={e => set("target", e.target.value)} placeholder="Who are your primary users / customers?" style={inp} />
          </div>
          <div>
            <label style={lbl}>Key Assumptions / Hypotheses</label>
            <textarea value={form.assumptions} onChange={e => set("assumptions", e.target.value)} rows={3} placeholder="List the key assumptions your idea rests on…" style={{ ...inp, resize: "vertical" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={lbl}>Expected Timeframe</label>
              <select value={form.timeframe} onChange={e => set("timeframe", e.target.value)} style={inp}>
                {["3 months", "6 months", "12 months", "2+ years"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Team Size</label>
              <select value={form.teamSize} onChange={e => set("teamSize", e.target.value)} style={inp}>
                {["Solo", "1-3", "4-10", "10+"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 12, color: "#9ca3af", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>← Back</button>
            <button onClick={() => setStep(3)} style={{ ...btn, flex: 2 }}>Review →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>IDEA SUMMARY</div>
            {[["Title", form.title], ["Target", form.target || "—"], ["Timeframe", form.timeframe], ["Team", form.teamSize]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 13 }}>
                <span style={{ color: "#9ca3af" }}>{k}</span>
                <span style={{ color: "white", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: 14, fontSize: 13, color: "#6ee7b7", display: "flex", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🤖</span>
            <span>Our AI will analyze feasibility, generate SWOT analysis, score market potential, and suggest matching mentors — all in seconds.</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(2)} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 12, color: "#9ca3af", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>← Back</button>
            <button onClick={analyze} style={{ ...btn, flex: 2, background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>✨ Run AI Analysis</button>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl = { fontSize: 12, fontWeight: 600, color: "#9ca3af", letterSpacing: .5, marginBottom: 6, display: "block", textTransform: "uppercase" };
const inp = { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px", color: "white", fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
const btn = { background: "linear-gradient(135deg,#6366f1,#a855f7)", border: "none", borderRadius: 12, padding: "12px 20px", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer", width: "100%" };
function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  const bg = isUser ? 'rgba(99,102,241,0.16)' : 'rgba(255,255,255,0.08)';
  const color = isUser ? 'white' : '#d1d5db';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={{ maxWidth: '80%', background: bg, border: isUser ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '14px 16px', color, marginBottom: 10, whiteSpace: 'pre-wrap', lineHeight: 1.6, boxShadow: isUser ? '0 12px 30px rgba(99,102,241,0.08)' : '0 12px 30px rgba(0,0,0,0.12)' }}>
        <div style={{fontSize:12,fontWeight:700,color:isUser?'#a78bfa':'#9ca3af',marginBottom:8,textTransform:'uppercase'}}>{isUser ? 'You' : 'Mistral Assistant'}</div>
        <div>{message.content}</div>
      </div>
    </div>
  );
}
/* ═══════════════════════════════════════════════════════════
   IDEA CARD
═══════════════════════════════════════════════════════════ */
function IdeaCard({ idea, onClick, index }) {
  const scoreColor = idea.score >= 85 ? "#10b981" : idea.score >= 70 ? "#f59e0b" : "#6366f1";
  return (
    <div onClick={onClick} style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 20, padding: 20, cursor: "pointer", transition: "all .25s",
      animationDelay: `${index * 80}ms`,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            <StageChip stage={idea.stage} />
            <Tag color="#6366f1">{idea.category}</Tag>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "white", lineHeight: 1.3, margin: 0 }}>{idea.title}</h3>
        </div>
        <ScoreRing score={idea.score} size={56} color={scoreColor} />
      </div>

      <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.6, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{idea.description}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[{ l: "Feasibility", v: idea.feasibility, c: "#10b981" }, { l: "Market", v: idea.market, c: "#f59e0b" }, { l: "Innovation", v: idea.innovation, c: "#a78bfa" }].map(m => (
          <div key={m.l}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 10, color: "#6b7280" }}>{m.l}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: m.c }}>{m.v}</span>
            </div>
            <MiniBar val={m.v} color={m.c} />
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "white" }}>{idea.avatar}</div>
          <span style={{ fontSize: 12, color: "#6b7280" }}>{idea.author}</span>
        </div>
        <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#6b7280" }}>
          <span>❤️ {idea.votes}</span>
          <span>💬 {idea.comments}</span>
          <span>🎓 {idea.mentors}</span>
          <Spark data={idea.trends} color={scoreColor} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("home");
  const [ideas, setIdeas] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [sortBy, setSortBy] = useState("score");
  const [showSubmit, setShowSubmit] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [currentIdea, setCurrentIdea] = useState(null);
  const [user, setUser] = useState(null); // User state
  const [chatMessages, setChatMessages] = useState([{ role: 'system', content: 'You are an expert startup advisor and idea validation AI. Help the user refine startup ideas, suggest improvements, and answer product strategy questions clearly.' }]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatModel, setChatModel] = useState('mistralai/mistral-7b-instruct:free');
  const [hasResult, setHasResult] = useState(false);

  const handleLogin = (userData) => {
    setUser(userData);
    setPage("home");
  };

  const handleSignup = (userData) => {
    setUser(userData);
    setPage("home");
  };

  const handleLogout = () => {
    setUser(null);
    setPage("login");
  };

  useEffect(() => {
    fetch('http://localhost:5001/ideas')
      .then(response => response.json())
      .then(data => {
        const enrichedIdeas = data.map(idea => ({
          ...idea,
          author: idea.author || "Guest User",
          avatar: (idea.author || "G")[0].toUpperCase(),
          stage: idea.stage || "In Review",
          votes: idea.votes || 0,
          comments: idea.comments || 0,
          mentors: idea.mentors || 0,
          trends: idea.trends || [40, 45, 50, 55, 60, 65, idea.score || 75],
          submitted: idea.submitted || "Today",
          tags: idea.tags || [idea.category]
        }));
        setIdeas(enrichedIdeas);
      })
      .catch(error => console.error('Error fetching ideas:', error));
  }, []);

  const filtered = ideas
    .filter(i => {
      const q = search.toLowerCase();
      return (activeCat === "All" || i.category === activeCat) &&
        (!q || i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    })
    .sort((a, b) => sortBy === "score" ? b.score - a.score : sortBy === "votes" ? b.votes - a.votes : b.comments - a.comments);

  const addIdea = async (raw) => {
    try {
      const response = await fetch('http://localhost:5001/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: raw.title,
          category: raw.category || "General",
          description: raw.description,
          target: raw.target || 'TBD',
          score: raw.score || 75,
          feasibility: raw.feasibility || 70,
          market: raw.market || 72,
          innovation: raw.innovation || 68,
          swot: raw.swot || { s: ["Novel approach"], w: ["Early stage"], o: ["Growing market"], t: ["Competition"] },
          author: user ? user.name : "Anonymous"
        }),
      });
      if (response.ok) {
        const backendIdea = await response.json();
        const newIdea = {
          ...backendIdea,
          author: user ? user.name : "You",
          avatar: (user ? user.name : "Y")[0].toUpperCase(),
          stage: "In Review",
          votes: 0,
          comments: 0,
          mentors: 0,
          trends: [40, 45, 50, 55, 60, 65, backendIdea.score || 75],
          submitted: "Today",
          tags: [backendIdea.category]
        };
        console.log('Idea successfully sent to database:', backendIdea.title);
        setIdeas(p => [newIdea, ...p]);
        setCurrentIdea(newIdea);
        setPage("idea");
      } else {
        console.error('Failed to submit idea');
      }
    } catch (error) {
      console.error('Error submitting idea:', error);
    }
  };

  const sendChatMessage = async (messageText) => {
    if (!messageText.trim()) return;
    const userMessage = { role: 'user', content: messageText.trim() };
    const updatedMessages = [...chatMessages, userMessage];

    setChatMessages(updatedMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/gpt/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          model: chatModel,
          temperature: 0.7,
          max_tokens: 700,
        }),
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.choices) && data.choices.length > 0) {
        const assistant = data.choices[0].message || { role: 'assistant', content: data.choices[0].message?.content || '' };
        setChatMessages(prev => [...prev, { role: 'assistant', content: assistant.content || 'Mistral responded with no text.' }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'Mistral did not return a valid response. Please try again.' }]);
      }
    } catch (error) {
      console.error('Mistral request failed:', error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Unable to reach Mistral. Check backend or OpenRouter API key.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const navItems = [
    { id: "home", label: "Explore Ideas" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "mentors", label: "Mentors" },
    { id: "analytics", label: "Analytics" },
    { id: "chat", label: "AI Chat" },
  ];

  return (
    <>
      {/* Auth Pages */}
      {page === "login" && !user && (
        <Login onLogin={handleLogin} onSwitchToSignup={() => setPage("signup")} />
      )}

      {page === "signup" && !user && (
        <Signup onSignup={handleSignup} onSwitchToLogin={() => setPage("login")} />
      )}

      {/* Main App */}
      {page !== "login" && page !== "signup" && (
        <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans',system-ui,sans-serif", color: "white" }}>
          <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.3);border-radius:99px}
        input,select,textarea{font-family:inherit;color-scheme:dark}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fadeUp{animation:fadeUp .4s ease forwards}
        button{font-family:inherit}
      `}</style>

          {/* ── NAV ─────────────────────────────────── */}
          <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,15,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💡</div>
                <span style={{ fontFamily: "DM Serif Display,serif", fontSize: 20, fontWeight: 400, background: "linear-gradient(135deg,#e0e7ff,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>IdeaForge</span>
              </div>

              {/* Desktop nav */}
              <div style={{ display: "flex", gap: 4, flex: 1, justifyContent: "center", maxWidth: 480 }}>
                {navItems.map(n => (
                  <button key={n.id} onClick={() => setPage(n.id)} style={{ background: page === n.id ? "rgba(99,102,241,0.15)" : "none", border: page === n.id ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent", borderRadius: 10, padding: "7px 14px", color: page === n.id ? "#a78bfa" : "#9ca3af", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .2s", whiteSpace: "nowrap" }}>
                    {n.label}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
                {user && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{user.name}</span>
                    <span style={{ fontSize: 10, color: "#6b7280" }}>{user.email}</span>
                  </div>
                )}
                <button onClick={() => user ? setShowSubmit(true) : setPage("login")} style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", border: "none", borderRadius: 10, padding: "8px 16px", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                  + Submit Idea
                </button>
                {user ? (
                  <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "8px 16px", color: "#9ca3af", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                    Logout
                  </button>
                ) : (
                  <button onClick={() => setPage("login")} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "8px 16px", color: "#9ca3af", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                    Login
                  </button>
                )}
              </div>
            </div>
          </nav>

          {/* ── IDEA DETAIL PAGE ─────────────────────── */}
          {page === "idea" && currentIdea && (
            <div style={{ padding: 20 }}>
              <button onClick={() => { setPage("home"); setCurrentIdea(null); }} style={{ marginBottom: 20, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 16px", color: "#9ca3af", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← Back to Ideas</button>
              <IdeaDetail idea={currentIdea} onClose={() => { setPage("home"); setCurrentIdea(null); }} />
            </div>
          )}

          {/* ── HERO (home only) ─────────────────────── */}
          {page === "home" && (
            <div style={{ position: "relative", overflow: "hidden", padding: "52px 20px 40px" }}>
              {/* BG */}
              <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse,rgba(99,102,241,0.18) 0%,transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", top: 40, right: "5%", width: 200, height: 200, background: "radial-gradient(circle,rgba(168,85,247,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />

              <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", position: "relative" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 99, padding: "6px 16px", fontSize: 12, fontWeight: 700, color: "#a78bfa", marginBottom: 20, letterSpacing: .5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "spin 3s linear infinite" }} />
                  AI-Powered Validation Platform · Live
                </div>
                <h1 style={{ fontFamily: "DM Serif Display,serif", fontSize: "clamp(32px,5vw,54px)", fontWeight: 400, lineHeight: 1.15, marginBottom: 16, background: "linear-gradient(135deg,#e0e7ff 30%,#a78bfa 70%,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Validate Your Idea<br />Before You Build
                </h1>
                <p style={{ fontSize: "clamp(14px,2vw,17px)", color: "#9ca3af", maxWidth: 540, margin: "0 auto 28px", lineHeight: 1.7 }}>
                  Submit, score, and refine your startup ideas with AI-powered analysis, peer feedback, SWOT reports, and expert mentor matching — before writing a single line of code.
                </p>

                {/* Search */}
                <div style={{ display: "flex", gap: 10, maxWidth: 540, margin: "0 auto 24px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200, display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 16px" }}>
                    <svg width="16" height="16" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ideas, categories…" style={{ background: "none", border: "none", outline: "none", color: "white", fontSize: 14, flex: 1, fontFamily: "inherit" }} />
                  </div>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px", color: "#9ca3af", fontSize: 13, outline: "none", cursor: "pointer" }}>
                    <option value="score">Sort: AI Score</option>
                    <option value="votes">Sort: Votes</option>
                    <option value="comments">Sort: Feedback</option>
                  </select>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
                  {[{ v: ideas.length, l: "Ideas Submitted", c: "#a78bfa" }, { v: "89%", l: "Validation Rate", c: "#10b981" }, { v: MENTORS.length, l: "Expert Mentors", c: "#f59e0b" }, { v: "3.2K", l: "Community Members", c: "#60a5fa" }].map(s => (
                    <div key={s.l} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: s.c }}>{typeof s.v === "number" ? <AnimatedNumber target={s.v} /> : s.v}</div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── MAIN CONTENT ─────────────────────────── */}
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 60px" }}>

            {/* HOME PAGE */}
            {page === "home" && (
              <>
                {/* Category pills */}
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 24, scrollbarWidth: "none" }}>
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setActiveCat(c)} style={{ flexShrink: 0, background: activeCat === c ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.04)", border: activeCat === c ? "1px solid transparent" : "1px solid rgba(255,255,255,0.08)", borderRadius: 99, padding: "7px 18px", color: activeCat === c ? "white" : "#9ca3af", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}>
                      {c}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                  <span style={{ fontSize: 14, color: "#6b7280" }}>
                    <span style={{ color: "white", fontWeight: 700 }}>{filtered.length}</span> ideas found
                    {activeCat !== "All" && <span style={{ color: "#a78bfa" }}> in {activeCat}</span>}
                  </span>
                </div>

                {filtered.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "80px 20px" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 8 }}>No ideas found</div>
                    <button onClick={() => { setSearch(""); setActiveCat("All") }} style={{ ...btn, width: "auto", padding: "10px 24px" }}>Clear filters</button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,340px),1fr))", gap: 16 }}>
                    {filtered.map((idea, i) => (
                      <IdeaCard key={idea.id} idea={idea} index={i} onClick={() => { setCurrentIdea(idea); setPage("idea"); }} />
                    ))}
                    {/* Add idea CTA */}
                    <div onClick={() => user ? setShowSubmit(true) : setPage("login")} style={{ border: "2px dashed rgba(99,102,241,0.25)", borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 10, cursor: "pointer", minHeight: 200, transition: "all .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.6)"; e.currentTarget.style.background = "rgba(99,102,241,0.05)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.25)"; e.currentTarget.style.background = "transparent"; }}>
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>💡</div>
                      <div style={{ fontWeight: 700, color: "#a78bfa", fontSize: 15 }}>Submit Your Idea</div>
                      <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center", maxWidth: 180 }}>Get AI scoring, SWOT analysis & mentor matching in seconds</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* LEADERBOARD PAGE */}
            {page === "leaderboard" && (
              <div style={{ paddingTop: 32 }}>
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", letterSpacing: 2, marginBottom: 8 }}>🏆 INNOVATION LEADERBOARD</div>
                  <h2 style={{ fontFamily: "DM Serif Display,serif", fontSize: "clamp(24px,4vw,38px)", fontWeight: 400, background: "linear-gradient(135deg,#e0e7ff,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Top Validated Ideas</h2>
                  <p style={{ color: "#6b7280", fontSize: 14, marginTop: 8 }}>Ranked by composite AI score, peer votes, and mentor endorsements</p>
                </div>

                {/* Top 3 podium */}
                <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap" }}>
                  {[LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]].map((item, pos) => {
                    const heights = [80, 100, 70]; const colors = ["#9ca3af", "#f59e0b", "#cd7c2f"]; const realRanks = [2, 1, 3];
                    return (
                      <div key={item.rank} style={{ width: 180, background: "rgba(255,255,255,0.04)", border: `1px solid ${pos === 1 ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.07)"}`, borderRadius: 20, padding: "20px 16px", textAlign: "center", position: "relative", order: pos === 1 ? -1 : 0 }}>
                        {pos === 1 && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", fontSize: 20 }}>👑</div>}
                        <div style={{ fontSize: 28, fontWeight: 800, color: colors[pos], marginBottom: 4 }}>#{realRanks[pos]}</div>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#a855f7)", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{item.author.split(" ").map(x => x[0]).join("")}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1.3, marginBottom: 4 }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8 }}>{item.category}</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: colors[pos] }}>{item.score}</div>
                        <div style={{ fontSize: 10, color: "#6b7280" }}>AI Score</div>
                      </div>
                    );
                  })}
                </div>

                {/* Full table */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
                  <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "grid", gridTemplateColumns: "40px 1fr auto auto", gap: 12, fontSize: 11, color: "#6b7280", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                    <span>#</span><span>Idea</span><span>Score</span><span>Trend</span>
                  </div>
                  {LEADERBOARD.map((item) => (
                    <div key={item.rank} style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "grid", gridTemplateColumns: "40px 1fr auto auto", gap: 12, alignItems: "center", transition: "background .2s", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: ["#f59e0b", "#9ca3af", "#cd7c2f", "#6b7280", "#6b7280"][item.rank - 1] }}>{item.rank}</div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "white", marginBottom: 2 }}>{item.title}</div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>{item.author} · <Tag color="#6366f1">{item.category}</Tag></div>
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: item.score >= 85 ? "#10b981" : item.score >= 75 ? "#f59e0b" : "#9ca3af", textAlign: "center" }}>{item.score}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: item.trend === "up" ? "#10b981" : item.trend === "down" ? "#ef4444" : "#6b7280", textAlign: "right" }}>{item.delta}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MENTORS PAGE */}
            {page === "mentors" && (
              <div style={{ paddingTop: 32 }}>
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", letterSpacing: 2, marginBottom: 8 }}>🎓 MENTOR NETWORK</div>
                  <h2 style={{ fontFamily: "DM Serif Display,serif", fontSize: "clamp(24px,4vw,38px)", fontWeight: 400, background: "linear-gradient(135deg,#e0e7ff,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Expert Mentors</h2>
                  <p style={{ color: "#6b7280", fontSize: 14, marginTop: 8 }}>AI-matched domain experts who validate, advise, and accelerate your idea</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,280px),1fr))", gap: 16 }}>
                  {MENTORS.map(m => (
                    <div key={m.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 24, transition: "all .25s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.35)" }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>{m.avatar}</div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 99, background: m.available ? "rgba(16,185,129,0.15)" : "rgba(107,114,128,0.12)", color: m.available ? "#10b981" : "#6b7280", height: "fit-content" }}>{m.available ? "● Available" : "○ Busy"}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "white", marginBottom: 2 }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: "#a78bfa", marginBottom: 6, fontWeight: 500 }}>{m.expertise}</div>
                      <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5, marginBottom: 14 }}>{m.bio}</div>
                      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                        <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: "#f59e0b" }}>⭐ {m.rating}</div><div style={{ fontSize: 10, color: "#6b7280" }}>Rating</div></div>
                        <div style={{ textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: "#a78bfa" }}>{m.sessions}</div><div style={{ fontSize: 10, color: "#6b7280" }}>Sessions</div></div>
                      </div>
                      <button style={{ width: "100%", background: m.available ? "linear-gradient(135deg,#6366f1,#a855f7)" : "rgba(255,255,255,0.06)", border: m.available ? "none" : "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px", color: m.available ? "white" : "#6b7280", fontWeight: 700, fontSize: 13, cursor: m.available ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
                        {m.available ? "Request Session →" : "Currently Unavailable"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ANALYTICS PAGE */}
            {page === "analytics" && (
              <div style={{ paddingTop: 32 }}>
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", letterSpacing: 2, marginBottom: 8 }}>📊 PLATFORM ANALYTICS</div>
                  <h2 style={{ fontFamily: "DM Serif Display,serif", fontSize: "clamp(24px,4vw,38px)", fontWeight: 400, background: "linear-gradient(135deg,#e0e7ff,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Innovation Dashboard</h2>
                </div>

                {/* KPI cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,200px),1fr))", gap: 12, marginBottom: 24 }}>
                  {[{ l: "Ideas Validated", v: ideas.filter(i => i.stage === "Validated").length, c: "#10b981", icon: "✅" }, { l: "Avg. AI Score", v: Math.round(ideas.reduce((s, i) => s + i.score, 0) / ideas.length), c: "#6366f1", icon: "🤖" }, { l: "Mentor Sessions", v: ideas.reduce((s, i) => s + i.mentors, 0), c: "#f59e0b", icon: "🎓" }, { l: "Community Votes", v: ideas.reduce((s, i) => s + i.votes, 0), c: "#a78bfa", icon: "❤️" }].map(m => (
                    <div key={m.l} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{m.icon}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: m.c }}><AnimatedNumber target={m.v} /></div>
                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{m.l}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,400px),1fr))", gap: 16 }}>
                  {/* Category breakdown */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", letterSpacing: 1, marginBottom: 16 }}>IDEAS BY CATEGORY</div>
                    {["HealthTech", "EdTech", "CleanTech", "Mobility", "AI/ML"].map((cat, i) => {
                      const count = ideas.filter(x => x.category === cat).length;
                      const colors = ["#6366f1", "#10b981", "#f59e0b", "#a78bfa", "#60a5fa"];
                      return (
                        <div key={cat} style={{ marginBottom: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 13, color: "#d1d5db" }}>{cat}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: colors[i] }}>{count}</span>
                          </div>
                          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 99, height: 8, overflow: "hidden" }}>
                            <div style={{ width: `${(count / ideas.length) * 100}%`, height: "100%", background: colors[i], borderRadius: 99, transition: "width 1.2s ease" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Score distribution */}
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", letterSpacing: 1, marginBottom: 16 }}>VALIDATION FUNNEL</div>
                    {[{ l: "Ideas Submitted", v: ideas.length, pct: 100, c: "#6366f1" }, { l: "AI Scored", v: ideas.length, pct: 100, c: "#a78bfa" }, { l: "Community Reviewed", v: ideas.filter(i => i.votes > 50).length, pct: 67, c: "#10b981" }, { l: "Mentor Matched", v: ideas.filter(i => i.mentors > 0).length, pct: 83, c: "#f59e0b" }, { l: "Fully Validated", v: ideas.filter(i => i.stage === "Validated").length, pct: 33, c: "#ef4444" }].map(s => (
                      <div key={s.l} style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: "#9ca3af" }}>{s.l}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: s.c }}>{s.v}</span>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 99, height: 6 }}>
                          <div style={{ width: `${s.pct}%`, height: "100%", background: s.c, borderRadius: 99 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* GPT CHAT PAGE */}
            {page === "chat" && (
              <div style={{ paddingTop: 32, display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"#a78bfa",letterSpacing:2,marginBottom:8}}>💬 AI IDEA ASSISTANT</div>
                    <h2 style={{ fontFamily: "DM Serif Display,serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: 400, background: "linear-gradient(135deg,#e0e7ff,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Ask Mistral for idea feedback, growth advice, or product direction.</h2>
                    <p style={{ color: "#9ca3af", fontSize: 14, maxWidth: 680, lineHeight: 1.7, marginTop: 10 }}>Use the AI assistant to refine your startup idea, get validation suggestions, and generate next-step recommendations tailored to your project.</p>
                  </div>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <span style={{fontSize:12,color:"#6b7280"}}>Model:</span>
                    <select value={chatModel} onChange={e=>setChatModel(e.target.value)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"10px 14px",color:"white",fontSize:13,outline:"none",cursor:"pointer"}}>
                      <option value="mistralai/mistral-7b-instruct:free">Mistral 7B Instruct</option>
                      <option value="mistralai/mixtral-8x7b-instruct">Mixtral 8x7B</option>
                      <option value="meta-llama/llama-3-8b-instruct">Llama 3 8B</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: 24, display: "flex", flexDirection: "column", height: "calc(100vh - 280px)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", letterSpacing: 1.5, marginBottom: 6 }}>LIVE CHAT</div>
                      <div style={{fontSize:14,color:"#d1d5db"}}>Your conversation is sent to the backend and forwarded to OpenRouter.</div>
                    </div>
                    <div style={{ fontSize: 12, color: chatLoading ? "#fbbf24" : "#6b7280" }}>{chatLoading ? 'Thinking...' : 'Ready to chat'}</div>
                  </div>

                  <div style={{ flex: 1, overflowY: "auto", paddingRight: 6, marginBottom: 14 }}>
                    {chatMessages.filter(m => m.role !== 'system').map((message, index) => (
                      <ChatBubble key={`${message.role}-${index}`} message={message} />
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "stretch", flexWrap: "wrap" }}>
                    <textarea value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Ask Mistral how to improve your idea, get feedback, or request a pitch outline..." style={{flex:1,minHeight:120,resize:"vertical",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:18,padding:"16px",color:"white",fontSize:14,outline:"none",fontFamily:"inherit"}}/>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0, minWidth: 170 }}>
                      <button onClick={() => sendChatMessage(chatInput)} disabled={chatLoading} style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)", border: "none", borderRadius: 18, padding: "16px", color: "white", fontWeight: 700, fontSize: 14, cursor: chatLoading ? "not-allowed" : "pointer", minHeight: 48 }}>Send</button>
                      <button onClick={() => {
                        setChatMessages([{ role:'system', content:'You are an expert startup advisor and idea validation AI. Help the user refine startup ideas, suggest improvements, and answer product strategy questions clearly.' }]);
                        setChatInput('');
                      }} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: "16px", color: "#9ca3af", fontWeight: 700, fontSize: 14, cursor: "pointer", minHeight: 48 }}>Reset</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── MODALS ───────────────────────────────── */}
          {showSubmit && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => { if (e.target === e.currentTarget) { setShowSubmit(false); setHasResult(false); } }}>
              <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, width: "100%", maxWidth: hasResult ? 1000 : 520, maxHeight: "96vh", overflow: "hidden", display: "flex", flexDirection: "column", transition: "max-width 0.3s ease" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "white" }}>Submit Your Idea</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>AI will analyze and score it instantly</div>
                  </div>
                  <button onClick={() => { setShowSubmit(false); setHasResult(false); }} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>✕</button>
                </div>
                <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
                  <SubmitModal onClose={() => { setShowSubmit(false); setHasResult(false); }} onSubmit={addIdea} onResult={setHasResult} />
                </div>
              </div>
            </div>
          )}

          {/* ── FOOTER ───────────────────────────────── */}
          <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "28px 20px", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>💡</div>
              <span style={{ fontFamily: "DM Serif Display,serif", fontSize: 18, background: "linear-gradient(135deg,#e0e7ff,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>IdeaForge</span>
            </div>
            <p style={{ fontSize: 12, color: "#4b5563" }}>© 2025 IdeaForge · Validate before you build · Reducing innovation failure rates</p>
          </footer>
        </div>
      )}
    </>
  );
}