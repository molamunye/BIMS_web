// src/dashboard/Chat.tsx
import React from "react";
import { Listing } from "@/types";

interface ChatProps {
  listing: Listing;
  onBack: () => void;
}

const Chat: React.FC<ChatProps> = ({ listing, onBack }) => {
  return (
    <div className="chat">
      <h2>Chat about: {listing.title}</h2>
      <button onClick={onBack}>Back to Dashboard</button>
      {/* Add chat messages and input here */}
    </div>
  );
};

export default Chat;
