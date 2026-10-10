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

// POST /api/events/:id/join (student)
exports.joinEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const event = await Event.findById(req.params.id);

    if (!event || event.status !== "approved") {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.hostId.toString() === userId) {
      return res.status(400).json({ message: "You can't join your own event" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(event.date) < today) {
      return res.status(400).json({ message: "This event has already happened" });
    }
    if (event.participants.some((p) => p.toString() === userId)) {
      return res.status(409).json({ message: "You've already joined this event" });
    }

    // atomic update: only succeeds if the user isn't in the list AND there's still room.
    // this stops two students grabbing the last spot at the same moment.
    const updated = await Event.findOneAndUpdate(
      {
        _id: event._id,
        participants: { $ne: userId },
        $expr: { $lt: [{ $size: "$participants" }, "$capacity"] },
      },
      { $push: { participants: userId } },
      { new: true }
    );

    if (!updated) {
      return res.status(409).json({ message: "This event is full" });
    }

    await User.findByIdAndUpdate(userId, {
      $addToSet: { eventsParticipated: event._id },
    });

    const io = req.app.get("io");
    if (io) {
      // everyone sees the live spot count
      io.emit("event:participants-updated", {
        eventId: updated._id,
        count: updated.participants.length,
      });
      // the host gets a personal notification
      const joiner = await User.findById(userId).select("name");
      io.to(`user:${event.hostId}`).emit("event:participant-joined", {
        eventId: updated._id,
        title: updated.title,
        participantName: joiner?.name,
      });
    }

    res.json({ event: updated });
  } catch (err) {
    console.error("Error joining event:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/events/:id/leave (student)
exports.leaveEvent = async (req, res) => {
  try {
    const userId = req.user.id;

    const updated = await Event.findOneAndUpdate(
      { _id: req.params.id, participants: userId },
      { $pull: { participants: userId } },
      { new: true }
    );

    if (!updated) {
      return res.status(400).json({ message: "You haven't joined this event" });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { eventsParticipated: updated._id },
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("event:participants-updated", {
        eventId: updated._id,
        count: updated.participants.length,
      });
    }

    res.json({ event: updated });
  } catch (err) {
    console.error("Error leaving event:", err);
    res.status(500).json({ message: "Server error" });
  }
};