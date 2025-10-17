// src/dashboard/CreateListing.tsx (Fixed: Price as string for placeholder; full doc fields)
import { useState } from "react";
import { Listing } from "@/types";
import "./CreateListing.css";

interface CreateListingProps {
  onCreated: (newListing: Listing) => void;
  onCancel: () => void;
}

type ListingFormData = {
  title: string;
  description: string;
  price: string; // String for placeholder visibility
  location: string;
  type: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  image?: File | null;
  size?: string; // From doc
  rooms?: string; // From doc (string for input)
  condition?: string; // From doc
};

const CreateListing: React.FC<CreateListingProps> = ({ onCreated, onCancel }) => {
  const [formData, setFormData] = useState<ListingFormData>({
    title: "",
    description: "",
    price: "", // Empty string so placeholder shows
    location: "",
    type: "",
    category: "",
    status: "pending",
    image: null,
    size: "",
    rooms: "",
    condition: "",
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

    // Convert strings to numbers where needed
    const payload = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      rooms: parseInt(formData.rooms || "0") || 0,
    };

    const formDataToSend = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        formDataToSend.append(key, value as any);
      }
    });

    try {
      const res = await fetch("http://localhost:5000/api/listings/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Creation failed");

      alert("Listing created successfully! Awaiting admin approval.");
      onCreated(data.listing);
    } catch (err: any) {
      alert("Error creating listing: " + err.message);
    }
  };

  return (
    <div className="create-listing">
      <h2>Create New Listing</h2>
      <form onSubmit={handleSubmit} className="listing-form" encType="multipart/form-data">
        <input name="title" placeholder="Title (e.g., Modern House in Hossana)" value={formData.title} onChange={handleChange} required />
        <textarea name="description" placeholder="Description (e.g., 3BR house with modern amenities)" value={formData.description} onChange={handleChange} required />
        <input name="price" type="number" placeholder="Enter price (e.g., 2500000)" value={formData.price} onChange={handleChange} required min="0" step="0.01" />
        <input name="location" placeholder="Location (e.g., Hossana Center)" value={formData.location} onChange={handleChange} required />
        <input name="type" placeholder="Type (e.g., House, Apartment, Car)" value={formData.type} onChange={handleChange} required />
        <input name="size" placeholder="Size (e.g., 100 sqm)" value={formData.size} onChange={handleChange} />
        <input name="rooms" type="number" placeholder="Number of rooms (e.g., 3)" value={formData.rooms} onChange={handleChange} min="0" />
        <input name="condition" placeholder="Condition (e.g., Excellent, Good, Fair)" value={formData.condition} onChange={handleChange} />

        <select name="category" value={formData.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="office">Office</option>
          <option value="car">Car</option>
          <option value="vehicle">Vehicle</option>
        </select>

        <input type="file" name="image" accept="image/*" onChange={handleFileChange} />

        <div className="form-actions">
          <button type="submit" className="btn primary">Create Listing</button>
          <button type="button" className="btn cancel" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CreateListing;