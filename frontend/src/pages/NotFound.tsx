import { Link } from "react-router-dom";

import './NotFound.css';  // Scoped CSS

const NotFound = () => (
  <div className="not-found-container">
    <div className="not-found-card">
      <h1 className="not-found-title">404 - Page Not Found</h1>
      <p className="not-found-desc">The page you're looking for doesn't exist.</p>
      <Link to="/" className="home-link">
        Back to Home
      </Link>
    </div>
  </div>
);

export default NotFound;