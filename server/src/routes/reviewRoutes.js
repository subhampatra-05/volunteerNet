const express = require("express");
const router = express.Router();
const { getReviewableEvents, createReview } = require("../controllers/reviewController");
const { protect, requireRole } = require("../middleware/authMiddleware");

router.get("/reviewable", protect, requireRole("student"), getReviewableEvents);
router.post("/:eventId", protect, requireRole("student"), createReview);

module.exports = router;