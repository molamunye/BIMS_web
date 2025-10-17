const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Notification = require('../models/Notification');

// GET /api/admin/stats (existing)
router.get('/stats', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    const totalUsers = await User.countDocuments();
    const activeBrokers = await User.countDocuments({ role: 'broker' });
    const totalListings = await Listing.countDocuments();
    const pendingReviews = await Listing.countDocuments({ status: 'pending' });
    res.json({ totalUsers, activeBrokers, totalListings, pendingReviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/pending-listings (existing, with populate)
router.get('/pending-listings', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    const listings = await Listing.find({ status: 'pending' })
      .populate('broker', 'name email')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/approve-listing/:id
router.put('/approve-listing/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('broker', 'name email');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    // Create notification for broker
    await Notification.create({
      recipient: listing.broker._id,
      sender: req.user.id,
      type: 'listing_approved',
      message: `Your listing "${listing.title}" has been approved!`,
      relatedId: listing._id
    });

    res.json({ message: 'Listing approved', listing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/reject-listing/:id
router.put('/reject-listing/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).populate('broker', 'name email');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    // Create notification for broker
    await Notification.create({
      recipient: listing.broker._id,
      sender: req.user.id,
      type: 'listing_rejected',
      message: `Your listing "${listing.title}" has been rejected. Please review and resubmit.`,
      relatedId: listing._id
    });

    res.json({ message: 'Listing rejected', listing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/notifications (for admin to see notifications if needed)
router.get('/notifications', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  try {
    const notifications = await Notification.find({ sender: req.user.id }).populate('recipient', 'name').sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;