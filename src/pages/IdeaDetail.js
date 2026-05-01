import { useState } from "react";

const MENTORS = [
  { id:1, name:"Dr. Vikram Nair", avatar:"VN", expertise:"HealthTech & MedDevices", rating:4.9, sessions:234, bio:"Ex-AIIMS researcher, 3 exits in digital health", available:true },
  { id:2, name:"Sunita Krishnan", avatar:"SK", expertise:"EdTech & Learning Design", rating:4.8, sessions:189, bio:"Former VP Product at BYJU'S, Stanford MBA", available:true },
  { id:3, name:"Arjun Kapoor", avatar:"AK", expertise:"CleanTech & ESG Investing", rating:4.7, sessions:156, bio:"Climate VC Partner, IIT Bombay alumnus", available:false },
  { id:4, name:"Meera Joshi", avatar:"MJ", expertise:"AI/ML & Deep Tech", rating:4.9, sessions:278, bio:"Google Brain alum, 12 patents, NeurIPS speaker", available:true },
];

const inp = {width:"100%",padding:"12px 16px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,color:"white",fontSize:14,fontFamily:"inherit",outline:"none"};
const btn = {background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:12,padding:"12px 20px",color:"white",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"};

function StageChip({ stage }) {
  const s = stage === "Validated" ? {bg:"rgba(16,185,129,0.15)",color:"#10b981",border:"rgba(16,185,129,0.3)"} :
           stage === "In Review" ? {bg:"rgba(245,158,11,0.15)",color:"#f59e0b",border:"rgba(245,158,11,0.3)"} :
           {bg:"rgba(99,102,241,0.15)",color:"#6366f1",border:"rgba(99,102,241,0.3)"};
  return <span style={{background:s.bg,color:s.color,border:`1px solid ${s.border}`,borderRadius:99,padding:"3px 12px",fontSize:11,fontWeight:700}}>{stage}</span>;
}

function Tag({ color, children }) {
  return <span style={{background:`${color}15`,color,border:`1px solid ${color}30`,borderRadius:99,padding:"3px 10px",fontSize:10,fontWeight:700}}>{children}</span>;
}

function ScoreRing({ score, size=64, stroke=5, color="#6366f1" }) {
  const r = (size - stroke*2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{transition:"stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)"}}/>
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fill="white" fontSize={size/4} fontWeight="700">{score}</text>
    </svg>
  );
}

function MiniBar({ val, color }) {
  return <div style={{height:4,background:"rgba(255,255,255,0.1)",borderRadius:2,overflow:"hidden"}}><div style={{width:`${val}%`,height:"100%",background:color,borderRadius:2}}/></div>;
}

function IdeaDetail({ idea, onClose }) {
  const [tab, setTab] = useState("overview");
  const [voted, setVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(idea.votes || 0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(idea.comments && idea.comments.length > 0 ? idea.comments : [
    { author:"Meera J.", text:"Excellent market sizing! Have you considered the insurance angle?", time:"2h ago" },
    { author:"Arjun K.", text:"This aligns with what we're seeing in ESG investing. Strong opportunity.", time:"1d ago" },
  ]);

  const handleVote = async () => {
    if (voted) return; // Prevent multiple votes locally
    setVoted(true);
    setVoteCount(v => v + 1);
    const API_BASE_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001' 
      : 'https://idea-forge-991a.vercel.app';
      
    try {
      await fetch(`${API_BASE_URL}/ideas/${idea._id || idea.id}/vote`, {
        method: 'POST'
      });
    } catch (e) {
      console.error("Failed to save vote", e);
    }
  };

  const handlePostComment = async () => {
    if (!comment.trim()) return;
    const newComment = { author: "You", text: comment, time: "just now" };
    setComments(p => [...p, newComment]);
    setComment("");
    try {
      await fetch(`${API_BASE_URL}/ideas/${idea._id || idea.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComment)
      });
    } catch (e) {
      console.error("Failed to save comment", e);
    }
  };

  const tabs = ["overview","swot","feedback","mentors"];

  return (
    <div style={{maxHeight:"88vh",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:`linear-gradient(135deg,#1e1b4b,#312e81)`,padding:"20px 24px",borderRadius:"20px 20px 0 0",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
              <StageChip stage={idea.stage}/>
              <Tag color="#6366f1">{idea.category}</Tag>
            </div>
            <h2 style={{fontSize:20,fontWeight:800,color:"white",lineHeight:1.3,margin:0}}>{idea.title}</h2>
            <div style={{fontSize:13,color:"#a5b4fc",marginTop:6}}>by {idea.author} · submitted {idea.submitted}</div>
          </div>
          <ScoreRing score={idea.score} size={72} color="#6366f1"/>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.02)",flexShrink:0}}>
        {tabs.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"12px 4px",background:"none",border:"none",borderBottom:tab===t?"2px solid #6366f1":"2px solid transparent",color:tab===t?"#a78bfa":"#6b7280",fontSize:13,fontWeight:600,cursor:"pointer",textTransform:"capitalize",fontFamily:"inherit"}}>
            {t}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{flex:1,overflowY:"auto",padding:20}}>
        {tab==="overview" && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:14,color:"#d1d5db",lineHeight:1.7}}>{idea.description}</p>
            <div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:14}}>
              <div style={{fontSize:11,color:"#9ca3af",fontWeight:700,letterSpacing:1,marginBottom:8}}>TARGET AUDIENCE</div>
              <p style={{fontSize:13,color:"#e5e7eb",margin:0}}>{idea.target}</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {[{l:"Feasibility",v:idea.feasibility,c:"#10b981"},{l:"Market Fit",v:idea.market,c:"#f59e0b"},{l:"Innovation",v:idea.innovation,c:"#a78bfa"}].map(m=>(
                <div key={m.l} style={{background:"rgba(255,255,255,0.04)",borderRadius:12,padding:12,textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:800,color:m.c}}>{m.v}</div>
                  <div style={{fontSize:10,color:"#9ca3af",marginTop:2}}>{m.l}</div>
                  <MiniBar val={m.v} color={m.c}/>
                </div>
              ))}
            </div>
            <div style={{background:"rgba(255,255,255,0.03)",borderRadius:14,padding:14}}>
              <div style={{fontSize:11,color:"#9ca3af",fontWeight:700,letterSpacing:1,marginBottom:10}}>SCORE TREND</div>
              <div style={{display:"flex",alignItems:"flex-end",gap:4,height:48}}>
                {idea.trends.map((v,i)=>(
                  <div key={i} style={{flex:1,background:i===idea.trends.length-1?"#6366f1":"rgba(99,102,241,0.3)",borderRadius:"4px 4px 0 0",height:`${(v/100)*100}%`,transition:"height 1s ease"}}/>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                {["W1","W2","W3","W4","W5","W6","Now"].map(w=><span key={w} style={{fontSize:9,color:"#6b7280"}}>{w}</span>)}
              </div>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {idea.tags.map(t=><Tag key={t} color="#6366f1">{t}</Tag>)}
            </div>
          </div>
        )}

        {tab==="swot" && (
          <div>
            <div style={{fontSize:13,color:"#9ca3af",marginBottom:16,lineHeight:1.6}}>Auto-generated SWOT analysis powered by our AI model, based on idea description and market signals.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[
                {l:"Strengths",icon:"💪",items:idea.swot.s,c:"#10b981"},
                {l:"Weaknesses",icon:"⚠️",items:idea.swot.w,c:"#f59e0b"},
                {l:"Opportunities",icon:"🚀",items:idea.swot.o,c:"#6366f1"},
                {l:"Threats",icon:"🛡️",items:idea.swot.t,c:"#ef4444"},
              ].map(s=>(
                <div key={s.l} style={{background:`${s.c}0d`,border:`1px solid ${s.c}22`,borderRadius:16,padding:14}}>
                  <div style={{fontSize:12,fontWeight:700,color:s.c,marginBottom:10}}>{s.icon} {s.l}</div>
                  {s.items.map(item=>(
                    <div key={item} style={{display:"flex",gap:6,marginBottom:6}}>
                      <span style={{color:s.c,flexShrink:0,fontSize:12}}>▸</span>
                      <span style={{fontSize:12,color:"#d1d5db",lineHeight:1.5}}>{item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="feedback" && (
          <div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
              {comments.map((c,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:14}}>
                  <div style={{display:"flex",gap:10,marginBottom:6}}>
                    <div style={{width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"white",flexShrink:0}}>{c.author.split(" ").map(x=>x[0]).join("")}</div>
                    <div><div style={{fontSize:13,fontWeight:600,color:"white"}}>{c.author}</div><div style={{fontSize:11,color:"#6b7280"}}>{c.time}</div></div>
                  </div>
                  <p style={{fontSize:13,color:"#d1d5db",margin:0,lineHeight:1.6}}>{c.text}</p>
                </div>
              ))}
            </div>
            <div>
              <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3} placeholder="Add your feedback or question…" style={{...inp,marginBottom:8}}/>
              <button onClick={handlePostComment} style={{...btn,padding:"10px"}}>Post Feedback</button>
            </div>
          </div>
        )}

        {tab==="mentors" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{fontSize:13,color:"#9ca3af",marginBottom:4}}>AI-matched mentors for this idea based on domain expertise:</div>
            {MENTORS.slice(0,3).map(m=>(
              <div key={m.id} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:16,padding:14,display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"white",flexShrink:0}}>{m.avatar}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div><div style={{fontSize:14,fontWeight:700,color:"white"}}>{m.name}</div><div style={{fontSize:11,color:"#9ca3af"}}>{m.expertise}</div></div>
                    <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:99,background:m.available?"rgba(16,185,129,0.15)":"rgba(107,114,128,0.15)",color:m.available?"#10b981":"#6b7280"}}>{m.available?"Available":"Busy"}</span>
                  </div>
                  <div style={{fontSize:11,color:"#6b7280",marginTop:4}}>⭐ {m.rating} · {m.sessions} sessions</div>
                  <button onClick={() => m.available && alert(`Session requested with ${m.name}! They will contact you shortly.`)} style={{ marginTop: 10, width: "100%", background: m.available ? "linear-gradient(135deg,#6366f1,#a855f7)" : "rgba(255,255,255,0.06)", border: m.available ? "none" : "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px", color: m.available ? "white" : "#6b7280", fontWeight: 700, fontSize: 11, cursor: m.available ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
                    {m.available ? "Request Session →" : "Currently Unavailable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div style={{padding:"14px 20px",borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",gap:10,flexShrink:0}}>
        <button onClick={handleVote} style={{flex:1,background:voted?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.05)",border:`1px solid ${voted?"rgba(99,102,241,0.5)":"rgba(255,255,255,0.1)"}`,borderRadius:12,padding:10,color:voted?"#a78bfa":"#9ca3af",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          {voted?"❤️":"🤍"} {voteCount}
        </button>
        <button onClick={() => setTab("feedback")} style={{flex:2,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",border:"none",borderRadius:12,padding:10,color:"white",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          💬 Give Feedback
        </button>
        <button onClick={onClose} style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:10,color:"#9ca3af",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Close</button>
      </div>
    </div>
  );
}

export default IdeaDetail;