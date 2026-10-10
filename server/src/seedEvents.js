const dns = require("node:dns");
dns.setServers(["1.1.1.1"]); // same DNS fix as seedAdmin.js

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Event = require("./models/Event");
require("dotenv").config();

async function seedEvents() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // find or create a couple of student hosts to attach events to
    let host1 = await User.findOne({ email: "test@student.com" });
    if (!host1) {
      const passwordHash = await bcrypt.hash("test123", 10);
      host1 = await User.create({
        name: "Test Student",
        email: "test@student.com",
        passwordHash,
        role: "student",
        college: "GIET",
        year: "3rd",
        skills: ["JavaScript", "Public Speaking"],
      });
      console.log("Created host1:", host1.email);
    }

    let host2 = await User.findOne({ email: "host2@student.com" });
    if (!host2) {
      const passwordHash = await bcrypt.hash("test123", 10);
      host2 = await User.create({
        name: "Priya Sharma",
        email: "host2@student.com",
        passwordHash,
        role: "student",
        college: "GIET",
        year: "2nd",
        skills: ["Event Management", "Design"],
      });
      console.log("Created host2:", host2.email);
    }

    // clear existing seeded events so reruns don't duplicate
    await Event.deleteMany({});

    const events = [
      {
        title: "Tech Fest 2026 Volunteers",
        description: "Looking for volunteers to help manage registration and crowd control at the annual tech fest.",
        category: "Technical",
        date: new Date("2026-09-15"),
        time: "09:00 AM",
        location: "Main Auditorium",
        capacity: 20,
        hostId: host1._id,
        status: "approved",
      },
      {
        title: "Blood Donation Camp",
        description: "Volunteer to assist the college health center with organizing a blood donation drive.",
        category: "Social Service",
        date: new Date("2026-09-20"),
        time: "10:00 AM",
        location: "Health Center",
        capacity: 15,
        hostId: host2._id,
        status: "approved",
      },
      {
        title: "Coding Bootcamp for Juniors",
        description: "Host a beginner-friendly weekend coding bootcamp for first-year students.",
        category: "Technical",
        date: new Date("2026-09-25"),
        time: "02:00 PM",
        location: "CS Lab 2",
        capacity: 30,
        hostId: host1._id,
        status: "pending",
      },
      {
        title: "Campus Cleanliness Drive",
        description: "Organize a weekend cleanliness drive around the campus and nearby community.",
        category: "Social Service",
        date: new Date("2026-09-28"),
        time: "07:00 AM",
        location: "Campus Grounds",
        capacity: 25,
        hostId: host2._id,
        status: "pending",
      },
    ];

    await Event.insertMany(events);
    console.log(`Seeded ${events.length} events (2 approved, 2 pending)`);

    process.exit(0);
  } catch (err) {
    console.error("Error seeding events:", err);
    process.exit(1);
  }
}

seedEvents();