const express = require("express");
const router = express.Router();
const { getApprovedEvents, createEvent, getMyEvents } = require("../controllers/eventController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", getApprovedEvents);
router.get("/my-events", protect, getMyEvents);
router.post("/", protect, createEvent);

module.exports = router;