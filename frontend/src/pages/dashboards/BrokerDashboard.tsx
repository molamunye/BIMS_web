// src/dashboard/BrokerDashboard.tsx (Fixed: Use onUpdated for EditListing, not onCreated)
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateListing from "./CreateListing";
import EditListing from "./EditListing";
import Chat from "./Chat";
import "./BrokerDashboard.css";
import { Listing } from "@/types";

interface Notification {
  _id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
}

const BrokerDashboard: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"dashboard" | "create" | "edit" | "chat">("dashboard");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadBrokerData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in first.");
        navigate("/login");
        return;
      }

      try {
        // Verify auth
        const authRes = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!authRes.ok) throw new Error("Invalid or expired token");
        const authData = await authRes.json();

        if (authData.user?.role !== "broker") {
          alert("Access denied. You are not a broker.");
          navigate("/login");
          return;
        }

        // Fetch listings (with populate for full data)
        const listRes = await fetch("http://localhost:5000/api/listings/my-listings", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!listRes.ok) throw new Error("Failed to fetch listings");
        const listData = await listRes.json();
        setListings(listData.listings || []);

        // Fetch notifications
        const notifRes = await fetch("http://localhost:5000/api/listings/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(notifData);
        }
      } catch (err: any) {
        console.error(err);
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadBrokerData();
  }, [navigate]);

  // Handlers
  const handleCreate = () => setView("create");
  const handleEdit = (listing: Listing) => {
    setSelectedListing(listing);
    setView("edit");
  };
  const handleChat = (listing: Listing) => {
    setSelectedListing(listing);
    setView("chat");
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/listings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setListings(listings.filter((l) => l._id !== id));
      alert("Listing deleted successfully.");
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleListingCreated = (newListing: Listing) => {
    setListings([...listings, newListing]);
    setView("dashboard");
    alert("Listing created successfully! Awaiting admin approval.");
  };

  const handleListingUpdated = (updatedListing: Listing) => {
    setListings(listings.map((l) => (l._id === updatedListing._id ? updatedListing : l)));
    setView("dashboard");
    alert("Listing updated successfully!");
  };

  const markNotificationAsRead = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/listings/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications(notifications.map((n) => 
          n._id === id ? { ...n, read: true } : n
        ));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) return <div className="loading">Loading dashboard...</div>;

  if (view === "create")
    return <CreateListing onCreated={handleListingCreated} onCancel={() => setView("dashboard")} />;

  if (view === "edit" && selectedListing)
    return <EditListing 
      listing={selectedListing} 
      onUpdated={handleListingUpdated}  // Fixed: Correct prop for EditListing
      onCancel={() => setView("dashboard")} 
    />;

  if (view === "chat" && selectedListing)
    return <Chat listing={selectedListing} onBack={() => setView("dashboard")} />;

  return (
    <div className="broker-dashboard">
      {/* Notification Access Bar at Top */}
      {unreadCount > 0 && (
        <div className="notification-bar">
          <div className="notification-icon">🔔</div>
          <span>You have {unreadCount} unread notification(s)</span>
          <button className="view-notifs-btn" onClick={() => setShowNotifications(true)}>
            View All
          </button>
        </div>
      )}

      {/* Full Notifications Dropdown/Modal */}
      {showNotifications && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <button className="close-notifs" onClick={() => setShowNotifications(false)}>×</button>
          </div>
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <p>No notifications.</p>
            ) : (
              notifications.map((notif) => (
                <div key={notif._id} className={`notification-item ${notif.read ? 'read' : 'unread'}`}>
                  <p className="notification-message">{notif.message}</p>
                  <small className="notification-time">{new Date(notif.createdAt).toLocaleString()}</small>
                  {!notif.read && (
                    <button 
                      className="mark-read-btn" 
                      onClick={() => markNotificationAsRead(notif._id)}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <header className="dashboard-header">
        <h1 className="dashboard-title">Broker Dashboard</h1>
        <button 
          className="notification-bell" 
          onClick={() => setShowNotifications(!showNotifications)}
          title="Notifications"
        >
          🔔 {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </button>
        <button 
          className="logout-btn" 
          onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}
        >
          Logout
        </button>
      </header>

      <div className="action-grid">
        <div className="action-card">
          <h3 className="action-title">Create New Listing</h3>
          <button className="action-button primary" onClick={handleCreate}>
            ➕ Add Listing
          </button>
          <p className="action-desc">Add new property details (will be pending admin approval)</p>
        </div>

        <div className="action-card">
          <h3 className="action-title">Messages</h3>
          <button className="action-button secondary" onClick={() => setView("chat")}>
            💬 Open Chat
          </button>
          <p className="action-desc">Chat with clients and admins</p>
        </div>
      </div>

      <div className="listings-section">
        <h2 className="section-title">My Listings ({listings.length})</h2>
        {listings.length === 0 ? (
          <p className="no-listings">No listings yet. Create one to get started!</p>
        ) : (
          <table className="listings-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing._id}>
                  <td>{listing.title}</td>
                  <td>{listing.type}</td>
                  <td className={`status-cell ${listing.status}`}>
                    {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                    {listing.status === 'pending' && <span className="pending-tag"> ⏳ Awaiting Review</span>}
                  </td>
                  <td className="actions-cell">
                    <button className="action-btn edit" onClick={() => handleEdit(listing)}>✏️ Edit</button>
                    <button className="action-btn chat" onClick={() => handleChat(listing)}>💬 Chat</button>
                    <button className="action-btn delete" onClick={() => handleDelete(listing._id)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BrokerDashboard;