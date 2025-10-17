// routes/listings.js (Full Updated: Role-based access for all actors)
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { authMiddleware } = require("../middleware/auth");
const Listing = require("../models/Listing");

// Multer setup for image upload/update
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// POST /api/listings/create - Broker creates new listing (pending status)
router.post(
  "/create",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (req.user.role !== "broker") {
        return res.status(403).json({ message: "Access denied: Brokers only" });
      }

      const {
        title,
        description,
        type,
        category,
        price,
        location,
        size,
        rooms,
        condition,
      } = req.body;

      if (!title || !description || !type || !category || !price || !location) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newListing = new Listing({
        title,
        description,
        type,
        category,
        price: parseFloat(price),
        location,
        size,
        rooms: parseInt(rooms) || 0,
        condition,
        broker: req.user.id,
        image: req.file ? `/uploads/${req.file.filename}` : null,
        status: "pending", // Always pending for admin review
      });

      await newListing.save();
      await newListing.populate("broker", "name email");

      res.status(201).json({
        message: "Listing created successfully (pending approval)",
        listing: newListing,
      });
    } catch (err) {
      console.error("Create listing error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// GET /api/listings/my-listings - Broker gets own listings (all statuses)
router.get("/my-listings", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "broker") {
      return res.status(403).json({ message: "Access denied: Brokers only" });
    }

    const listings = await Listing.find({ broker: req.user.id })
      .populate("broker", "name email")
      .sort({ createdAt: -1 });
    res.json({ listings });
  } catch (err) {
    console.error("My listings error:", err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/listings/:id - Broker updates own listing (cannot change status)
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (req.user.role !== "broker") {
      return res.status(403).json({ message: "Access denied: Brokers only" });
    }

    // Find listing owned by broker
    const listing = await Listing.findOne({
      _id: req.params.id,
      broker: req.user.id,
    });
    if (!listing) {
      return res
        .status(404)
        .json({ message: "Listing not found or access denied" });
    }

    // Handle image update
    if (req.file) {
      // Optional: Delete old image (add fs.unlinkSync if needed)
      listing.image = `/uploads/${req.file.filename}`;
    }

    // Update fields (handle numbers, ignore status change by broker)
    listing.title = req.body.title || listing.title;
    listing.description = req.body.description || listing.description;
    listing.type = req.body.type || listing.type;
    listing.category = req.body.category || listing.category;
    listing.price = parseFloat(req.body.price) || listing.price;
    listing.location = req.body.location || listing.location;
    listing.size = req.body.size || listing.size;
    listing.rooms = parseInt(req.body.rooms) || listing.rooms;
    listing.condition = req.body.condition || listing.condition;
    // Status unchanged by broker (admin controls)

    await listing.save();
    await listing.populate("broker", "name email");

    res.json({ message: "Listing updated successfully", listing });
  } catch (err) {
    console.error("Update listing error:", err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/listings/:id - Broker deletes own listing
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "broker") {
      return res.status(403).json({ message: "Access denied: Brokers only" });
    }

    const deleted = await Listing.findOneAndDelete({
      _id: req.params.id,
      broker: req.user.id,
    });
    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Listing not found or access denied" });
    }

    // Optional: Delete image file
    if (deleted.image) {
      // fs.unlinkSync(`uploads${deleted.image}`); // Uncomment if fs imported
    }

    res.json({ message: "Listing deleted successfully" });
  } catch (err) {
    console.error("Delete listing error:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/listings/approved - Client gets approved listings (view only)
router.get("/approved", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Access denied: Clients only" });
    }

    const listings = await Listing.find({ status: "approved" })
      .populate("broker", "name email")
      .sort({ createdAt: -1 });
    res.json({ listings });
  } catch (err) {
    console.error("Approved listings error:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/listings/all - Admin gets all listings (for overview)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const listings = await Listing.find({})
      .populate("broker", "name email")
      .sort({ createdAt: -1 });
    res.json({ listings });
  } catch (err) {
    console.error("All listings error:", err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/listings/:id/status - Admin updates status (approve/reject)
router.put("/:id/status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const { status } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("broker", "name email");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Create notification for broker (assuming Notification model exists)
    // await Notification.create({ ... }); // From previous code

    res.json({ message: `Listing ${status}`, listing });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
