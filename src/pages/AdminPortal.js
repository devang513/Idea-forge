import React, { useState, useEffect } from 'react';

function AdminPortal() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001' 
    : 'https://idea-forge-chi.vercel.app';

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/users/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      
      // Remove from UI
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert("Error deleting user: " + err.message);
    }
  };

  if (loading) return <div style={{ color: "white", padding: 40, textAlign: "center" }}>Loading users...</div>;
  if (error) return <div style={{ color: "#ef4444", padding: 40, textAlign: "center" }}>Error: {error}</div>;

  const totalUsers = users.filter(u => u.role === 'user').length;
  const totalMentors = users.filter(u => u.role === 'mentor').length;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "white", margin: 0 }}>Admin Portal</h2>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "10px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#a78bfa" }}>{totalUsers}</div>
            <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>Total Founders</div>
          </div>
          <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "10px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#34d399" }}>{totalMentors}</div>
            <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>Total Mentors</div>
          </div>
        </div>
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr auto", gap: 16, fontSize: 13, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase" }}>
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Joined</span>
          <span>Actions</span>
        </div>
        
        {users.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#6b7280" }}>No users found.</div>
        ) : (
          users.map(user => (
            <div key={user.id} style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr auto", gap: 16, alignItems: "center", transition: "background .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ color: "white", fontWeight: 600 }}>{user.name}</div>
              <div style={{ color: "#d1d5db", fontSize: 14 }}>{user.email}</div>
              <div>
                <span style={{ 
                  background: user.role === 'admin' ? "rgba(239,68,68,0.15)" : user.role === 'mentor' ? "rgba(16,185,129,0.15)" : "rgba(99,102,241,0.15)",
                  color: user.role === 'admin' ? "#fca5a5" : user.role === 'mentor' ? "#6ee7b7" : "#a78bfa",
                  padding: "4px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700, textTransform: "capitalize",
                  border: `1px solid ${user.role === 'admin' ? "rgba(239,68,68,0.3)" : user.role === 'mentor' ? "rgba(16,185,129,0.3)" : "rgba(99,102,241,0.3)"}`
                }}>
                  {user.role}
                </span>
              </div>
              <div style={{ color: "#9ca3af", fontSize: 13 }}>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
              </div>
              <div>
                <button 
                  onClick={() => handleDelete(user.id)}
                  disabled={user.role === 'admin'}
                  style={{ 
                    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "6px 12px", 
                    color: "#fca5a5", fontSize: 12, fontWeight: 600, cursor: user.role === 'admin' ? "not-allowed" : "pointer",
                    opacity: user.role === 'admin' ? 0.5 : 1 
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminPortal;
