const mongoose = require("mongoose");
const crypto = require("crypto");
require("dotenv").config({ path: ".env.local" });

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function seedStaffDoctors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection;
    const Doctor = db.collection("doctors");
    const User = db.collection("users");
    const Clinic = db.collection("clinics");

    console.log("Connected to MongoDB.");

    // Retrieve clinics
    const thaneClinic = await Clinic.findOne({ name: /Thane/i });
    const banerClinic = await Clinic.findOne({ name: /Baner/i });
    const bhosariClinic = await Clinic.findOne({ name: /Bhosari/i });

    const doctorsList = [
      {
        name: "Dr. Deepak Kelkar",
        email: "drdeepakkelkar@kelkarmanas.com",
        clinicId: thaneClinic ? thaneClinic._id : null,
      },
      {
        name: "Dr. Amol Kelkar",
        email: "dramolkelkar@kelkarmanas.com",
        clinicId: thaneClinic ? thaneClinic._id : null,
      },
      {
        name: "Dr. Radhika Kelkar",
        email: "drradhikakelkar@kelkarmanas.com",
        clinicId: thaneClinic ? thaneClinic._id : null,
      },
      {
        name: "Dr. Anuja Kelkar (Tulankar)",
        email: "dranujakelkar@kelkarmanas.com",
        clinicId: thaneClinic ? thaneClinic._id : null,
      },
      {
        name: "Dr. Sandeep Mahajan",
        email: "drmahajan@kelkarmanas.com",
        clinicId: bhosariClinic ? bhosariClinic._id : null,
      },
      {
        name: "Dr. Vishwas Binawade",
        email: "drbinawade@kelkalmanas.com",
        clinicId: banerClinic ? banerClinic._id : null,
      },
    ];

    for (const docInfo of doctorsList) {
      // 1. Ensure doctor exists in doctors collection with active status
      const existingDoc = await Doctor.findOne({
        email: { $regex: new RegExp(`^${docInfo.email.trim()}$`, "i") }
      });

      if (existingDoc) {
        await Doctor.updateOne(
          { _id: existingDoc._id },
          {
            $set: {
              name: docInfo.name,
              status: "Active",
              deletedAt: null,
              ...(docInfo.clinicId && !existingDoc.clinicId ? { clinicId: docInfo.clinicId } : {})
            }
          }
        );
        console.log(`Updated doctor record in doctors collection: ${docInfo.name}`);
      }

      // 2. Ensure user credentials exist in users collection
      const existingUser = await User.findOne({
        email: { $regex: new RegExp(`^${docInfo.email.trim()}$`, "i") }
      });

      if (existingUser) {
        await User.updateOne(
          { _id: existingUser._id },
          {
            $set: {
              name: docInfo.name,
              role: "DOCTOR",
              clinicId: existingDoc?.clinicId || docInfo.clinicId,
              status: "Active",
              deletedAt: null,
              updatedAt: new Date()
            }
          }
        );
        console.log(`Updated user credentials in users collection: ${docInfo.name} (${docInfo.email})`);
      } else {
        const newUser = {
          name: docInfo.name,
          email: docInfo.email.toLowerCase().trim(),
          passwordHash: hashPassword("password123"),
          role: "DOCTOR",
          clinicId: existingDoc?.clinicId || docInfo.clinicId,
          status: "Active",
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await User.insertOne(newUser);
        console.log(`Created new staff user in users collection: ${docInfo.name} (${docInfo.email})`);
      }
    }

    console.log("All 6 doctors successfully seeded and synchronized with staff users!");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding staff doctors:", err);
    process.exit(1);
  }
}

seedStaffDoctors();

