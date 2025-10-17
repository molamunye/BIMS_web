export interface Listing {
  _id?: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: string;
  category: string;
  size?: string;
  rooms?: number;
  condition?: string;
  status: "pending" | "approved" | "rejected";
  image?: string;
  broker: string; // ID
  // Other fields
}