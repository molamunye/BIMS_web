import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import './Login.css';  // Scoped CSS

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("client");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      alert("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Full API Response:", data);  // Full debug log
      console.log("User Role from API:", data.user?.role);  // Specific role log
      setLoading(false);

      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem('token', data.token);

      alert(`Login Successful! Role: ${data.user.role}. Redirecting...`);

      // Enhanced role matching (trim, lowercase, fallback)
      const userRole = (data.user?.role || "client").toLowerCase().trim();
      console.log("Processed Role:", userRole);  // Log processed role

      switch (userRole) {
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "broker":
          navigate("/broker-dashboard");
          break;
        case "client":
          navigate("/client-dashboard");
          break;
        default:
          console.error("Unknown role - defaulting to client:", userRole);
          navigate("/client-dashboard");
      }
    } catch (err: any) {
      setLoading(false);
      alert(`Login Failed: ${err.message}`);
    }
  };

  const renderForm = (userType: string, emailPlaceholder: string, passwordPlaceholder: string) => (
    <form onSubmit={handleLogin} className="login-form">
      <div className="form-group">
        <label htmlFor="email" className="form-label">Email</label>
        <input id="email" name="email" type="email" placeholder={emailPlaceholder} required className="input-field" />
      </div>
      <div className="form-group password-group">
        <label htmlFor="password" className="form-label">Password</label>
        <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder={passwordPlaceholder} required className="input-field" />
        <button type="button" className="password-eye" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? '👁️' : '🙈'}
        </button>
      </div>
      <button type="submit" className="login-button" disabled={loading}>
        {loading ? "Signing In..." : `Sign In as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`}
      </button>
    </form>
  );

  return (
    <div className="login-container">
      <div className="login-card">
        <header className="login-header">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
          <div className="login-logo">
            🏢 BIMS
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to access your account</p>
        </header>

        <div className="tabs-wrapper">
          <nav className="tabs-nav">
            <button className={`tab-button ${activeTab === "client" ? "active" : ""}`} onClick={() => setActiveTab("client")}>Client</button>
            <button className={`tab-button ${activeTab === "broker" ? "active" : ""}`} onClick={() => setActiveTab("broker")}>Broker</button>
            <button className={`tab-button ${activeTab === "admin" ? "active" : ""}`} onClick={() => setActiveTab("admin")}>Admin</button>
          </nav>

          <div className="tab-content">
            {activeTab === "client" && (
              <div>
                <h2 className="tab-title">Client Login</h2>
                <p className="tab-description">Access your account to browse properties and connect with brokers</p>
                {renderForm("client", "client@example.com", "Enter your password")}
              </div>
            )}
            {activeTab === "broker" && (
              <div>
                <h2 className="tab-title">Broker Login</h2>
                <p className="tab-description">Manage listings and clients</p>
                {renderForm("broker", "broker@example.com", "Enter your password")}
              </div>
            )}
            {activeTab === "admin" && (
              <div>
                <h2 className="tab-title">Admin Login</h2>
                <p className="tab-description">Administrative access to manage the BIMS platform</p>
                {renderForm("admin", "admin@bims.et", "Enter admin password")}
              </div>
            )}
          </div>
        </div>

        <footer className="login-footer">
          <p>Don't have an account? <Link to="/register" className="signup-link">Sign up here</Link></p>
        </footer>
      </div>
    </div>
  );
};

export default Login;