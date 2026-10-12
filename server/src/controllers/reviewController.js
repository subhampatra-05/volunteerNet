const Review = require("../models/Review");
const Event = require("../models/Event");
const User = require("../models/User");

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// GET /api/reviews/reviewable: ended events I joined and haven't reviewed yet
exports.getReviewableEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewedIds = await Review.find({ reviewerId: userId }).distinct("eventId");

    const events = await Event.find({
      participants: userId,
      status: "approved",
      date: { $lt: startOfToday() },
      _id: { $nin: reviewedIds },
    })
      .populate("hostId", "name")
      .sort({ date: -1 });

    res.json({ events });
  } catch (err) {
    console.error("Error fetching reviewable events:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/reviews/:eventId: review the host of an event I attended
exports.createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rating, comment } = req.body;

    const score = Number(rating);
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return res.status(400).json({ message: "Rating must be a whole number from 1 to 5" });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event || event.status !== "approved") {
      return res.status(404).json({ message: "Event not found" });
    }
    if (new Date(event.date) >= startOfToday()) {
      return res.status(400).json({ message: "You can review an event only after it has happened" });
    }
    if (!event.participants.some((p) => p.toString() === userId)) {
      return res.status(403).json({ message: "Only participants can review this event" });
    }

    try {
      await Review.create({
        eventId: event._id,
        reviewerId: userId,
        revieweeId: event.hostId,
        rating: score,
        comment,
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ message: "You've already reviewed this event" });
      }
      throw err;
    }

    // recalculate the host's average rating from all their reviews
    const [agg] = await Review.aggregate([
      { $match: { revieweeId: event.hostId } },
      { $group: { _id: "$revieweeId", avg: { $avg: "$rating" } } },
    ]);
    await User.findByIdAndUpdate(event.hostId, {
      avgRating: Math.round(agg.avg * 10) / 10,
    });

    res.status(201).json({ message: "Review submitted" });
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ message: "Server error" });
  }
};