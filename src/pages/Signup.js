import { useState } from "react";

function Signup({ onSignup, onSwitchToLogin, onGoHome }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
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
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    const API_BASE_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:5001' 
      : 'https://idea-forge-991a.vercel.app';

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('User signup successful and saved to database:', data.user.email);
        onSignup(data.user);
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
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
          <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg,#6366f1,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>🚀</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "white", margin: 0 }}>Join IdeaForge</h1>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: "8px 0 0" }}>Create your account to start validating ideas</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: 12, marginBottom: 20, fontSize: 13, color: "#fca5a5" }}>
              {error}
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "white", marginBottom: 8 }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              disabled={loading}
              style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "white", fontSize: 14, outline: "none", opacity: loading ? 0.5 : 1 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
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

          <div style={{ marginBottom: 16 }}>
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

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "white", marginBottom: 8 }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "white", fontSize: 14, outline: "none", opacity: loading ? 0.5 : 1 }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "white", marginBottom: 12 }}>I am signing up as a...</label>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={() => setRole('user')}
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: role === 'user' ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.05)", border: role === 'user' ? "1px solid #818cf8" : "1px solid rgba(255,255,255,0.1)", color: role === 'user' ? "white" : "#9ca3af", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all .2s" }}
              >
                Founder
              </button>
              <button
                type="button"
                onClick={() => setRole('mentor')}
                style={{ flex: 1, padding: "10px", borderRadius: 10, background: role === 'mentor' ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)", border: role === 'mentor' ? "1px solid #34d399" : "1px solid rgba(255,255,255,0.1)", color: role === 'mentor' ? "white" : "#9ca3af", fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all .2s" }}
              >
                Mentor
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !name || !email || !password || !confirmPassword}
            style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg,#6366f1,#a855f7)", border: "none", borderRadius: 12, color: "white", fontSize: 16, fontWeight: 700, cursor: loading || !name || !email || !password || !confirmPassword ? "not-allowed" : "pointer", marginBottom: 20, opacity: loading || !name || !email || !password || !confirmPassword ? 0.6 : 1 }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              style={{ background: "none", border: "none", color: "#a78bfa", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;