const dns = require("node:dns");
try {
  if (process.env.NODE_ENV !== "production" || process.env.OVERRIDE_DNS === "true") {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
  }
} catch (e) {
  console.warn("DNS server override skipped:", e.message);
}

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
require("dotenv").config();

async function seedAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("FATAL ERROR: MONGO_URI is required to run seedAdmin.");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@volunteernet.com";
    const rawPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (rawPassword === "admin123") {
      console.warn("⚠️  SECURITY WARNING: Using default admin password ('admin123'). Please set ADMIN_PASSWORD in production environment variables!");
    }

    // Check if an admin already exists so you don't create duplicates
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin account already exists for email:", existingAdmin.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const admin = await User.create({
      name: "Admin",
      email: adminEmail,
      passwordHash: hashedPassword,
      role: "admin",
    });

    console.log("Admin account successfully created:", admin.email);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
}

seedAdmin();
