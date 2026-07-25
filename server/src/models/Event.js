// models/Event.js
const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  date: Date,
  time: String,
  location: String,
  capacity: Number,
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  rejectionReason: String,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });