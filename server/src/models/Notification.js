// models/Notification.js
const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["event-approved", "event-rejected", "new-submission", "event-joined"] },
  message: String,
  relatedEventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  read: { type: Boolean, default: false },
}, { timestamps: true });