const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  size: { type: String }, // From doc
  rooms: { type: Number }, // From doc
  condition: { type: String }, // From doc
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  broker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);