import { Link } from "react-router-dom";

import './Landing.css';  // Scoped CSS

const Landing = () => (
  <div className="landing-container">
    <header className="landing-header">
      <nav className="nav-bar">
        <div className="logo">
          🏢 BIMS
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register" className="nav-link">Register</Link>
        </div>
      </nav>
    </header>

    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Modern Brokerage for Ethiopia</h1>
        <p className="hero-subtitle">Connect buyers, sellers, and brokers with secure, transparent transactions.</p>
        <div className="hero-actions">
          <Link to="/register" className="hero-button primary">Get Started</Link>
          <Link to="/login" className="hero-button secondary">Learn More</Link>
        </div>
      </div>
    </section>

    <section className="features-section">
      <h2 className="section-title">Features</h2>
      <div className="features-grid">
        <div className="feature-card">
          <h3 className="feature-title">Secure Listings</h3>
          <p className="feature-desc">Create and manage property/vehicle listings with ease.</p>
        </div>
        <div className="feature-card">
          <h3 className="feature-title">Real-Time Chat</h3>
          <p className="feature-desc">Communicate directly with clients and brokers.</p>
        </div>
        <div className="feature-card">
          <h3 className="feature-title">Admin Control</h3>
          <p className="feature-desc">Verify users and listings for trust.</p>
        </div>
      </div>
    </section>
  </div>
);

export default Landing;