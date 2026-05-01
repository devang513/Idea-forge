import { useState } from "react";

function Login({ onLogin, onSwitchToSignup, onGoHome }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const API_BASE_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001' 
      : 'https://idea-forge-991a.vercel.app';

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user);
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("We’re having trouble connecting right now. Please try again in a moment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative" }}>
      {onGoHome && (
        <button 
          onClick={onGoHome}
          style={{ position: "absolute", top: 24, left: 24, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 16px", color: "#9ca3af", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all .2s" }}
        >
          ← Back to Home
        </button>
      )}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 40, width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>💡</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "white", margin: 0 }}>Welcome Back</h1>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: "8px 0 0" }}>Sign in to your IdeaForge account</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: 12, marginBottom: 20, fontSize: 13, color: "#fca5a5" }}>
              {error}
            </div>
          )}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "white", marginBottom: 8 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
              style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "white", fontSize: 14, outline: "none", opacity: loading ? 0.5 : 1 }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "white", marginBottom: 8 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "white", fontSize: 14, outline: "none", opacity: loading ? 0.5 : 1 }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#6366f1,#a855f7)", border: "none", borderRadius: 12, color: "white", fontSize: 16, fontWeight: 700, cursor: loading || !email || !password ? "not-allowed" : "pointer", marginBottom: 20, opacity: loading || !email || !password ? 0.6 : 1 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>
            Don't have an account?{" "}
            <button
              onClick={onSwitchToSignup}
              style={{ background: "none", border: "none", color: "#a78bfa", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;