const dns = require("node:dns");
dns.setServers(["1.1.1.1"]);
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
require("dotenv").config();

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // check if an admin already exists so you don't create duplicates
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10); // change this password!

    const admin = await User.create({
      name: "Admin",
      email: "admin@volunteernet.com",
      passwordHash: hashedPassword,
      role: "admin",
    });

    console.log("Admin created:", admin.email);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
}

seedAdmin();