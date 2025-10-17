import { Link } from "react-router-dom";
import heroImage from '../assets/hero-bims.jpg';
import './Index.css';

const Index = () => (
  <div
    className="index-container"
    style={{
      backgroundImage: `url(${heroImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
  >
    <header className="index-header">
      <h1 className="index-title">Welcome to BIMS</h1>
      <p className="index-subtitle">Broker Information Management System</p>
    </header>

    <div className="index-content">
      <div className="index-card">
        <h2 className="card-title">Get Started</h2>
        <p className="card-desc">Join the modern way to manage property and vehicle transactions.</p>
        <div className="card-actions">
          <Link to="/login" className="action-link primary">Login</Link>
          <Link to="/register" className="action-link secondary">Register</Link>
        </div>
      </div>
    </div>
  </div>
);

export default Index;
