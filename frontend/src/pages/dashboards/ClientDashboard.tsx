// src/dashboard/ClientDashboard.tsx (Fixed: Added debug logs, better error handling, role check)
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './ClientDashboard.css';  // Scoped CSS

interface ApprovedListing {
  _id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  description: string;
  broker: {
    name: string;
    email: string;
  };
  image?: string;
  category?: string;
}

const ClientDashboard = () => {
  const [listings, setListings] = useState<ApprovedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadClientData = async () => {
      const token = localStorage.getItem('token');
      console.log("🔍 ClientDashboard: Token found:", !!token); // Debug

      if (!token) {
        console.log("❌ No token, redirecting to login");
        alert("Please log in first.");
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Step 1: Verify token and role
        console.log("🔍 Verifying token at /api/auth/me");
        const authRes = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("📡 Auth response status:", authRes.status); // Debug

        if (!authRes.ok) {
          const authError = await authRes.json().catch(() => ({}));
          console.error("❌ Auth error:", authError);
          throw new Error(authError.message || "Invalid or expired token");
        }

        const authData = await authRes.json();
        console.log("📄 Auth data:", authData); // Debug full response
        console.log("🔍 User role from auth:", authData.user?.role); // Debug role

        const userRole = authData.user?.role?.toLowerCase().trim();
        if (userRole !== 'client') {
          console.error("❌ Role mismatch. Expected 'client', got:", userRole);
          alert(`Access denied. Your role is '${userRole}'. Clients only.`);
          navigate('/login');
          return;
        }

        console.log("✅ Auth successful, fetching listings");

        // Step 2: Fetch approved listings
        const listingsRes = await fetch('http://localhost:5000/api/listings/approved', {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("📡 Listings response status:", listingsRes.status); // Debug

        if (!listingsRes.ok) {
          const listError = await listingsRes.json().catch(() => ({}));
          console.error("❌ Listings error:", listError);
          throw new Error(listError.message || "Failed to fetch listings");
        }

        const listingsData = await listingsRes.json();
        console.log("📄 Listings data:", listingsData); // Debug
        setListings(listingsData.listings || []);
      } catch (err: any) {
        console.error('❌ Client data load error:', err);
        setError(err.message);
        if (err.message.includes('expired') || err.message.includes('token') || err.message.includes('Invalid')) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          alert(`Error loading dashboard: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadClientData();
  }, [navigate]);

  if (loading) {
    return <div className="loading">Loading client dashboard...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="client-dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Client Dashboard</h1>
      </header>

      <div className="listings-section">
        <h2 className="section-title">Approved Listings ({listings.length})</h2>
        {listings.length === 0 ? (
          <p className="no-listings">No approved listings available yet. Check back soon!</p>
        ) : (
          <div className="listings-grid">
            {listings.map((listing) => (
              <div key={listing._id} className="listing-card">
                {listing.image && (
                  <img 
                    src={`http://localhost:5000${listing.image}`} 
                    alt={listing.title} 
                    className="listing-image-medium"
                  />
                )}
                <h3 className="listing-title">{listing.title}</h3>
                <p className="listing-price">{listing.price} ETB</p>
                <p className="listing-desc">{listing.description}</p>
                <p className="listing-location">{listing.location}</p>
                <button className="view-button" onClick={() => navigate(`/listing/${listing._id}`)}>
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;