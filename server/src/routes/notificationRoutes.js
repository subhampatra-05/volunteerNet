const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { protect } = require("../middleware/authMiddleware");

// GET /api/notifications: latest 20 plus unread count
router.get("/", protect, async (req, res) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipientId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(20),
      Notification.countDocuments({ recipientId: req.user.id, read: false }),
    ]);
    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/notifications/read-all
router.patch("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user.id, read: false },
      { read: true }
    );
    res.json({ message: "All marked as read" });
  } catch (err) {
    console.error("Error marking notifications read:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/notifications: clear all notifications for current user
router.delete("/", protect, async (req, res) => {
  try {
    await Notification.deleteMany({ recipientId: req.user.id });
    res.json({ message: "All notifications cleared" });
  } catch (err) {
    console.error("Error clearing notifications:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/notifications/:id: delete a single notification
router.delete("/:id", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipientId: req.user.id,
    });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification deleted" });
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;