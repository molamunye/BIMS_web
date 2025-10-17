import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import './Register.css';  // Scoped CSS

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("client");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = activeTab;

    if (!name || !email || !password || !role) {
      alert("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) throw new Error(data.message || "Registration failed");

      alert(`Registration Successful! Account created as ${role}. Please log in.`);

      navigate("/login");
    } catch (err: any) {
      setLoading(false);
      alert(`Registration Failed: ${err.message}`);
    }
  };

  const renderForm = (userType: string, namePlaceholder: string, emailPlaceholder: string) => (
    <form onSubmit={handleRegister} className="register-form">
      <div className="form-group">
        <label htmlFor="name" className="form-label">Full Name</label>
        <input id="name" name="name" type="text" placeholder={namePlaceholder} required className="input-field" />
      </div>
      <div className="form-group">
        <label htmlFor="email" className="form-label">Email</label>
        <input id="email" name="email" type="email" placeholder={emailPlaceholder} required className="input-field" />
      </div>
      <div className="form-group password-group">
        <label htmlFor="password" className="form-label">Password</label>
        <input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter a strong password" required className="input-field" />
        <button type="button" className="password-eye" onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? '👁️' : '🙈'}
        </button>
      </div>
      <input type="hidden" name="role" value={userType} />
      <button type="submit" className="register-button" disabled={loading}>
        {loading ? "Creating Account..." : `Sign Up as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`}
      </button>
    </form>
  );

  return (
    <div className="register-container">
      <div className="register-card">
        <header className="register-header">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
          <div className="register-logo">
            🏢 BIMS
          </div>
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">Join BIMS to buy, sell, or manage properties</p>
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
                <h2 className="tab-title">Client Registration</h2>
                <p className="tab-description">Sign up to search and connect with brokers</p>
                {renderForm("client", "Your full name", "client@example.com")}
              </div>
            )}
            {activeTab === "broker" && (
              <div>
                <h2 className="tab-title">Broker Registration</h2>
                <p className="tab-description">Register to manage listings and clients</p>
                {renderForm("broker", "Your full name", "broker@example.com")}
              </div>
            )}
            {activeTab === "admin" && (
              <div>
                <h2 className="tab-title">Admin Registration</h2>
                <p className="tab-description">Sign up for platform management (verification required)</p>
                {renderForm("admin", "Your full name", "admin@bims.et")}
              </div>
            )}
          </div>
        </div>

        <footer className="register-footer">
          <p>Already have an account? <Link to="/login" className="signin-link">Sign in here</Link></p>
        </footer>
      </div>
    </div>
  );
};

export default Register;