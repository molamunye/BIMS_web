import React, { useState } from "react";
import { Listing } from "@/types";
import "./EditListing.css";

interface EditListingProps {
  listing: Listing;
  onUpdated: (updatedListing: Listing) => void;
  onCancel: () => void;
}

type ListingFormData = {
  title: string;
  description: string;
  price: string; // String for input placeholder
  location: string;
  type: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  image?: File | null;
  size?: string;
  rooms: string; // String for input
  condition: string;
};

const EditListing: React.FC<EditListingProps> = ({ listing, onUpdated, onCancel }) => {
  const [formData, setFormData] = useState<ListingFormData>({
    title: listing.title || "",
    description: listing.description || "",
    price: listing.price ? String(listing.price) : "",
    location: listing.location || "",
    type: listing.type || "",
    category: listing.category || "",
    status: listing.status as ListingFormData["status"] || "pending",
    image: null,
    size: listing.size || "",
    rooms: listing.rooms ? String(listing.rooms) : "",
    condition: listing.condition || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        image: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first.");

    // Convert strings to numbers
    const payload = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      rooms: parseInt(formData.rooms || "0") || 0,
    };

    const formDataToSend = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formDataToSend.append(key, String(value));
    });

    try {
      const res = await fetch(`http://localhost:5000/api/listings/${listing._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      alert("Listing updated successfully!");
      onUpdated(data.listing);
    } catch (err: any) {
      alert("Error updating listing: " + err.message);
    }
  };

  return (
    <div className="edit-listing">
      <h2>Edit Listing</h2>
      <form onSubmit={handleSubmit} className="listing-form" encType="multipart/form-data">
        <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
        <input name="price" type="number" placeholder="Enter price" value={formData.price} onChange={handleChange} required min="0" step="0.01" />
        <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} required />
        <input name="type" placeholder="Type (e.g., House, Car)" value={formData.type} onChange={handleChange} required />
        <input name="size" placeholder="Size (e.g., 100 sqm)" value={formData.size} onChange={handleChange} />
        <input name="rooms" type="number" placeholder="Number of rooms" value={formData.rooms} onChange={handleChange} min="0" />
        <input name="condition" placeholder="Condition (e.g., Excellent, Good)" value={formData.condition} onChange={handleChange} />

        <select name="category" value={formData.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="office">Office</option>
          <option value="car">Car</option>
          <option value="vehicle">Vehicle</option>
        </select>

        <select name="status" value={formData.status} onChange={handleChange} required>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <input type="file" name="image" accept="image/*" onChange={handleFileChange} />
        {listing.image && <p>Current image: <img src={`http://localhost:5000${listing.image}`} alt="Current" style={{width: '50px', height: '50px'}} /></p>}

        <div className="form-actions">
          <button type="submit" className="btn primary">Save Changes</button>
          <button type="button" className="btn cancel" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditListing;