const User = require("../models/User");

// GET /api/users/dashboard-stats
exports.getDashboardStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-passwordHash")
      .populate("eventsHosted", "title date status")
      .populate("eventsParticipated", "title date status");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        name: user.name,
        email: user.email,
        college: user.college,
        year: user.year,
        skills: user.skills,
        avgRating: user.avgRating,
      },
      stats: {
        eventsHostedCount: user.eventsHosted.length,
        eventsParticipatedCount: user.eventsParticipated.length,
      },
      eventsHosted: user.eventsHosted,
      eventsParticipated: user.eventsParticipated,
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ message: "Server error" });
  }
};