const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Broker or client
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin or system
  type: { type: String, enum: ['listing_approved', 'listing_rejected', 'message_received', 'new_inquiry'], required: true },
  message: { type: String, required: true }, // e.g., "Your listing 'tws' has been approved!"
  relatedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }, // Optional, link to listing
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);