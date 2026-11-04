const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["event-approved", "event-rejected", "new-submission", "event-joined"],
    required: true,
  },
  message: { type: String, required: true },
  relatedEventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  read: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ recipientId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);