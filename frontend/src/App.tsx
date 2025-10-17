import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";

import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import BrokerDashboard from "./pages/dashboards/BrokerDashboard";
import ClientDashboard from "./pages/dashboards/ClientDashboard";
import NotFound from "./pages/NotFound";
import CreateListing from "./pages/dashboards/CreateListing";
import EditListing from "./pages/dashboards/EditListing";
import Chat from "./pages/dashboards/Chat";
import { Listing } from "@/types";

import './index.css';  // Global CSS
import React from "react";

const queryClient = new QueryClient();

// Wrapper for CreateListing
const BrokerCreateListingWrapper = () => {
  const navigate = useNavigate();
  return (
    <CreateListing
      onCreated={() => navigate("/broker-dashboard")}
      onCancel={() => navigate("/broker-dashboard")}
    />
  );
};

// Wrapper for EditListing
const BrokerEditListingWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = React.useState<Listing | null>(null);

  React.useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchListing = async () => {
      const res = await fetch(`http://localhost:5000/api/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setListing(data.listing);
    };
    fetchListing();
  }, [id]);

  if (!listing) return <div>Loading listing...</div>;

  return (
    <EditListing
      listing={listing}
      onUpdated={() => navigate("/broker-dashboard")}
      onCancel={() => navigate("/broker-dashboard")}
    />
  );
};

// Wrapper for Chat
const BrokerChatWrapper = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = React.useState<Listing | null>(null);

  React.useEffect(() => {
    if (!listingId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchListing = async () => {
      const res = await fetch(`http://localhost:5000/api/listings/${listingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setListing(data.listing);
    };
    fetchListing();
  }, [listingId]);

  if (!listing) return <div>Loading chat...</div>;

  return <Chat listing={listing} onBack={() => navigate("/broker-dashboard")} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <div className="app-wrapper">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/broker-dashboard" element={<BrokerDashboard />} />
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="*" element={<NotFound />} />

          {/* Broker Routes */}
          <Route path="/broker/create-listing" element={<BrokerCreateListingWrapper />} />
          <Route path="/broker/edit-listing/:id" element={<BrokerEditListingWrapper />} />
          <Route path="/broker/chat/:listingId" element={<BrokerChatWrapper />} />
        </Routes>
      </div>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
