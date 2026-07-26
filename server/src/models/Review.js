// models/Review.js
const reviewSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: Number,
  comment: String,
}, { timestamps: true });