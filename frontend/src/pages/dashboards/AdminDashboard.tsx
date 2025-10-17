import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './AdminDashboard.css';  // Scoped CSS

interface Stat {
  title: string;
  value: string;
  change: string;
  icon: string;
}

interface PendingBroker {
  id: string;
  name: string;
  email: string;
  license?: string;
  company?: string;
  appliedDate: string;
}

interface PendingListing {
  _id: string;
  title: string;
  broker: {
    name: string;
    email: string;
  };
  type: string;
  price: number;
  description: string;
  location: string;
  image?: string;
  // Add other fields as needed
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stat[]>([
    { title: "Total Users", value: "0", change: "+0%", icon: "👥" },
    { title: "Active Brokers", value: "0", change: "+0%", icon: "✅" },
    { title: "Total Listings", value: "0", change: "+0%", icon: "🏠" },
    { title: "Pending Reviews", value: "0", change: "+0%", icon: "⚠️" },
  ]);

  const [pendingBrokers, setPendingBrokers] = useState<PendingBroker[]>([]);
  const [pendingListings, setPendingListings] = useState<PendingListing[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"brokers" | "listings">("brokers");
  const [selectedListing, setSelectedListing] = useState<PendingListing | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch stats
        const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats([
            { title: "Total Users", value: statsData.totalUsers.toString(), change: "+12%", icon: "🧑‍👩‍👧‍👦" },
            { title: "Active Brokers", value: statsData.activeBrokers.toString(), change: "+5%", icon: "✅" },
            { title: "Total Listings", value: statsData.totalListings.toString(), change: "+18%", icon: "🏠" },
            { title: "Pending Reviews", value: statsData.pendingReviews.toString(), change: "-8%", icon: "⚠️" },
          ]);
        }

        // Fetch pending brokers
        const brokersRes = await fetch('http://localhost:5000/api/admin/pending-brokers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (brokersRes.ok) {
          const brokersData = await brokersRes.json();
          setPendingBrokers(brokersData);
        }

        // Fetch pending listings with populated broker
        const listingsRes = await fetch('http://localhost:5000/api/admin/pending-listings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (listingsRes.ok) {
          const listingsData = await listingsRes.json();
          setPendingListings(listingsData);
        }
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
        alert('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleApproveBroker = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/approve-broker/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Broker approved");
        window.location.reload();
      }
    } catch (err) {
      alert("Failed to approve broker");
    }
  };

  const handleRejectBroker = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/reject-broker/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Broker rejected");
        window.location.reload();
      }
    } catch (err) {
      alert("Failed to reject broker");
    }
  };

  const handleApproveListing = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/approve-listing/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Listing approved - notification sent to broker");
        setShowReviewModal(false);
        setSelectedListing(null);
        window.location.reload();
      }
    } catch (err) {
      alert("Failed to approve listing");
    }
  };

  const handleRejectListing = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/reject-listing/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Listing rejected - notification sent to broker");
        setShowReviewModal(false);
        setSelectedListing(null);
        window.location.reload();
      }
    } catch (err) {
      alert("Failed to reject listing");
    }
  };

  const handleReviewListing = (listing: PendingListing) => {
    setSelectedListing(listing);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedListing(null);
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
      </header>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <h3 className="stat-title">{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
              <span className="stat-change">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="tabs-wrapper">
        <nav className="tabs-nav">
          <button 
            className={`tab-button ${activeTab === "brokers" ? "active" : ""}`} 
            onClick={() => setActiveTab("brokers")}
          >
            Pending Brokers ({pendingBrokers.length})
          </button>
          <button 
            className={`tab-button ${activeTab === "listings" ? "active" : ""}`} 
            onClick={() => setActiveTab("listings")}
          >
            Pending Listings ({pendingListings.length})
          </button>
        </nav>

        <div className="tab-content">
          {activeTab === "brokers" && (
            <div className="pending-list">
              {pendingBrokers.length === 0 ? (
                <p>No pending brokers.</p>
              ) : (
                pendingBrokers.map((broker) => (
                  <div key={broker.id} className="pending-item">
                    <div className="item-details">
                      <h3 className="item-name">{broker.name}</h3>
                      <p className="item-email">{broker.email}</p>
                      <p className="item-info">{broker.company} - {broker.license}</p>
                      <p className="item-date">Applied: {broker.appliedDate}</p>
                    </div>
                    <div className="item-actions">
                      <button className="action-btn approve" onClick={() => handleApproveBroker(broker.id)}>
                        Approve
                      </button>
                      <button className="action-btn reject" onClick={() => handleRejectBroker(broker.id)}>
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "listings" && (
            <div className="pending-list">
              {pendingListings.length === 0 ? (
                <p>No pending listings.</p>
              ) : (
                pendingListings.map((listing) => (
                  <div key={listing._id} className="pending-item">
                    <div className="item-details">
                      <h3 className="item-name">{listing.title}</h3>
                      <p className="item-info">{listing.broker.name} ({listing.broker.email}) | {listing.type} | {listing.location}</p>
                      <p className="item-price">{listing.price} ETB</p>
                      <p className="item-desc">{listing.description}</p>
                    </div>
                    <div className="item-actions">
                      <button className="action-btn approve" onClick={() => handleApproveListing(listing._id)}>
                        Quick Approve
                      </button>
                      <button className="action-btn reject" onClick={() => handleRejectListing(listing._id)}>
                        Quick Reject
                      </button>
                      <button className="action-btn review" onClick={() => handleReviewListing(listing)}>
                        Review Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedListing && (
        <div className="modal-overlay" onClick={closeReviewModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeReviewModal}>×</button>
            <h2 className="modal-title">Review Listing: {selectedListing.title}</h2>
            {selectedListing.image && (
              <img 
                src={`http://localhost:5000${selectedListing.image}`} 
                alt={selectedListing.title} 
                className="modal-image"
              />
            )}
            <div className="modal-details">
              <p><strong>Broker:</strong> {selectedListing.broker.name} ({selectedListing.broker.email})</p>
              <p><strong>Type:</strong> {selectedListing.type}</p>
              <p><strong>Price:</strong> {selectedListing.price} ETB</p>
              <p><strong>Location:</strong> {selectedListing.location}</p>
              <p><strong>Description:</strong> {selectedListing.description}</p>
              {/* Add more fields if needed */}
            </div>
            <div className="modal-actions">
              <button className="action-btn approve" onClick={() => handleApproveListing(selectedListing._id)}>
                Approve Listing
              </button>
              <button className="action-btn reject" onClick={() => handleRejectListing(selectedListing._id)}>
                Reject Listing
              </button>
              <button className="action-btn cancel" onClick={closeReviewModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;