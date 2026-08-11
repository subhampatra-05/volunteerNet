const Event = require("../models/Event");

// GET /api/events — public feed, approved events only
exports.getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" })
      .populate("hostId", "name email college")
      .sort({ date: 1 }); // soonest events first

    res.json({ events });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Server error fetching events" });
  }
};