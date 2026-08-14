const Event = require("../models/Event");
const User = require("../models/User");

// GET /api/events — public feed, approved events only
exports.getApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" })
      .populate("hostId", "name email college")
      .sort({ date: 1 });

    res.json({ events });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ message: "Server error fetching events" });
  }
};

// POST /api/events — create event (student, lands as "pending")
exports.createEvent = async (req, res) => {
  try {
    const { title, description, category, date, time, location, capacity } = req.body;

    if (!title || !description || !category || !date || !time || !location || !capacity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const event = await Event.create({
      title,
      description,
      category,
      date,
      time,
      location,
      capacity,
      hostId: req.user.id, // comes from the JWT via protect middleware
      status: "pending",
    });

    // keep the user's eventsHosted array in sync
    await User.findByIdAndUpdate(req.user.id, {
      $push: { eventsHosted: event._id },
    });

    // notify admins in real time (Phase 5 will build this out properly —
    // for now just emit if io is available, harmless if nothing's listening yet)
    const io = req.app.get("io");
    if (io) {
      io.to("admins").emit("event:submitted", {
        eventId: event._id,
        title: event.title,
        hostId: req.user.id,
      });
    }

    res.status(201).json({ event });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: "Server error creating event" });
  }
};

// GET /api/events/my-events — logged-in student's own hosted events (any status)
exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ hostId: req.user.id }).sort({ createdAt: -1 });
    res.json({ events });
  } catch (err) {
    console.error("Error fetching my events:", err);
    res.status(500).json({ message: "Server error" });
  }
};