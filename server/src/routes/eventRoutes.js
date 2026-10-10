const express = require("express");
const router = express.Router();
const {
  getApprovedEvents,
  createEvent,
  getMyEvents,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  joinEvent,
  leaveEvent,
} = require("../controllers/eventController");
const { protect, requireRole } = require("../middleware/authMiddleware");

router.get("/", getApprovedEvents);
router.get("/my-events", protect, getMyEvents);
router.get("/pending", protect, requireRole("admin"), getPendingEvents);
router.post("/", protect, createEvent);
router.patch("/:id/approve", protect, requireRole("admin"), approveEvent);
router.patch("/:id/reject", protect, requireRole("admin"), rejectEvent);
router.post("/:id/join", protect, requireRole("student"), joinEvent);
router.post("/:id/leave", protect, requireRole("student"), leaveEvent);

module.exports = router;