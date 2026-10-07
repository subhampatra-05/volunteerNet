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
    const { title, description, category, date, time, location, capacity } =
      req.body;

    if (
      !title ||
      !description ||
      !category ||
      !date ||
      !time ||
      !location ||
      !capacity
    ) {
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
    const events = await Event.find({ hostId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json({ events });
  } catch (err) {
    console.error("Error fetching my events:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/events/pending — admin only
exports.getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "pending" })
      .populate("hostId", "name email college")
      .sort({ createdAt: 1 }); // oldest submissions first

    res.json({ events });
  } catch (err) {
    console.error("Error fetching pending events:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/events/:id/approve — admin only
exports.approveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.status = "approved";
    await event.save();

    // notify the host in real time (Phase 5 will fully wire the room join)
    const io = req.app.get("io");
    if (io) {
      io.to(`user:${event.hostId}`).emit("event:approved", {
        eventId: event._id,
        title: event.title,
      });
      io.emit("event:new-live", { event }); // this one stays broadcast — every student's feed should refresh
    }

    res.json({ event });
  } catch (err) {
    console.error("Error approving event:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/events/:id/reject — admin only
exports.rejectEvent = async (req, res) => {
  try {
    const { reason } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.status = "rejected";
    event.rejectionReason = reason || "No reason provided";
    await event.save();

    const io = req.app.get("io");
    if (io) {
      io.to(`user:${event.hostId}`).emit("event:rejected", {
        eventId: event._id,
        title: event.title,
        reason: event.rejectionReason,
      });
    }

    res.json({ event });
  } catch (err) {
    console.error("Error rejecting event:", err);
    res.status(500).json({ message: "Server error" });
  }
};
