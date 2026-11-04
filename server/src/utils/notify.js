const Notification = require("../models/Notification");

// saves to DB, then pushes to the recipient's personal socket room
exports.notifyUser = async (io, { recipientId, type, message, relatedEventId }) => {
  const notification = await Notification.create({
    recipientId,
    type,
    message,
    relatedEventId,
  });

  if (io) {
    io.to(`user:${recipientId}`).emit("notification:new", notification);
  }
  return notification;
};