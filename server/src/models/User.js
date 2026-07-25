// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], default: "student" },
  college: String,
  year: String,
  skills: [String],
  avatar: String,
  eventsHosted: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  eventsParticipated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  avgRating: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);