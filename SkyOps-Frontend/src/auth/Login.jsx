import { useState } from "react";
import { useNavigate } from "react-router-dom";

const USERS = {
  admin: "admin",
  pilot: "admin",
};

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (USERS[username] === password) {
      localStorage.setItem("auth", "true"); 
      navigate("/");                        
    } else {
      setError("שם משתמש או סיסמה שגויים");
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: "10vh auto", textAlign: "center" }}>
      <h2>כניסה למערכת</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button type="submit">Login</button>
      </form>

      {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
    </div>
  );
}
