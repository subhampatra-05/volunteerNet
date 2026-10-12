const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 500 },
}, { timestamps: true });

// one review per student per event, enforced by the database
reviewSchema.index({ eventId: 1, reviewerId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);