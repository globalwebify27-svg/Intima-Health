const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

async function seedDoctors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection;
    const Clinic = db.collection("clinics");
    const Doctor = db.collection("doctors");
    const Page = db.collection("pages");

    // 1. Get or create clinics
    let banerClinic = await Clinic.findOne({ name: /Baner/i });
    let bhosariClinic = await Clinic.findOne({ name: /Bhosari/i });

    let thaneClinic = await Clinic.findOne({ name: /Thane/i });
    if (!thaneClinic) {
      const res = await Clinic.insertOne({
        name: "Kelkar Manas Health Care, Thane",
        state: "Maharashtra",
        city: "Thane",
        address: "101, 102, 103 & 104, Gulmohar Heights, Behind Fatema Church, Ghodbandar Road, Majiwada, Thane 400601",
        phone: "+91 7030414140",
        email: "kelkarmanashealthcare@gmail.com",
        status: "Active",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      thaneClinic = { _id: res.insertedId };
    }

    let akolaClinic = await Clinic.findOne({ name: /Akola/i });
    if (!akolaClinic) {
      const res = await Clinic.insertOne({
        name: "Kelkar Hospital, Akola",
        state: "Maharashtra",
        city: "Akola",
        address: "Kelkar Hospital, Ramdas Peth, Akola, Maharashtra",
        phone: "+91 7030414140",
        email: "kelkarmanashealthcare@gmail.com",
        status: "Active",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      akolaClinic = { _id: res.insertedId };
    }

    // 2. Deactivate / soft-delete removed doctors: Dr. Tiwari, Dr. Sheetal Binawade, Dr. Amarjeet
    await Doctor.updateMany(
      { name: { $regex: /Tiwari|Tivari|Sheetal|Amarjeet/i } },
      { $set: { status: "Inactive", deletedAt: new Date() } }
    );
    console.log("Deactivated/removed non-applicable doctors.");

    // 3. Define the exact 6 doctors
    const doctorsData = [
      {
        name: "Dr. Deepak Kelkar",
        email: "drdeepakkelkar@kelkarmanas.com",
        phone: "+91 7030414140",
        qualifications: ["MBBS", "DPM", "MD", "DNB"],
        specialization: "Consultant Psychiatrist, Sexologist, Hypnotherapist & De-Addiction Specialist",
        experience: 43,
        avatar: "/images/dr_kelkar_hero_nobg.png",
        clinicId: thaneClinic?._id || null,
        registrationNumber: "MCI-43-KELKAR-01",
        rating: 5.0,
        reviewsCount: 142,
        fees: 1500,
        status: "Active",
        showOnHomepage: true,
        bio: "Senior Consultant Psychiatrist, Sexologist, and Hypnotherapist with over 43 years of clinical expertise leading Kelkar Hospital and Kelkar Manas Health Care."
      },
      {
        name: "Dr. Amol Kelkar",
        email: "dramolkelkar@kelkarmanas.com",
        phone: "+91 7030414140",
        qualifications: ["MBBS", "MD"],
        specialization: "Psychiatrist, Sexologist, De-Addiction Specialist & Hypnotherapist",
        experience: 15,
        avatar: "/images/doctor_2.png",
        clinicId: thaneClinic?._id || null,
        registrationNumber: "MMC-15-KELKAR-02",
        rating: 4.9,
        reviewsCount: 88,
        fees: 1200,
        status: "Active",
        showOnHomepage: true,
        bio: "Experienced Psychiatrist and Sexologist specializing in modern de-addiction therapies, hypnotherapy, and comprehensive mental health care."
      },
      {
        name: "Dr. Radhika Kelkar",
        email: "drradhikakelkar@kelkarmanas.com",
        phone: "+91 7030414140",
        qualifications: ["MBBS", "DPM", "MD"],
        specialization: "Psychiatrist, De-Addiction Specialist & Hypnotherapist",
        experience: 15,
        avatar: "/images/doctor_3.png",
        clinicId: thaneClinic?._id || null,
        registrationNumber: "MMC-15-KELKAR-03",
        rating: 4.9,
        reviewsCount: 92,
        fees: 1200,
        status: "Active",
        showOnHomepage: true,
        bio: "Compassionate Psychiatrist with 15 years of practice in adult and child mental health, clinical hypnotherapy, and holistic rehabilitation."
      },
      {
        name: "Dr. Anuja Kelkar (Tulankar)",
        email: "dranujakelkar@kelkarmanas.com",
        phone: "+91 7030414140",
        qualifications: ["MBBS", "MD"],
        specialization: "Psychiatrist, De-Addiction Specialist & Hypnotherapist",
        experience: 20,
        avatar: "/images/doctor_1.png",
        clinicId: thaneClinic?._id || null,
        registrationNumber: "MMC-20-KELKAR-04",
        rating: 4.9,
        reviewsCount: 76,
        fees: 1200,
        status: "Active",
        showOnHomepage: true,
        bio: "Specialist Psychiatrist with two decades of experience in evidence-based mental healthcare, addiction recovery, and psychotherapy."
      },
      {
        name: "Dr. Sandeep Mahajan",
        email: "drmahajan@kelkarmanas.com",
        phone: "+91 7030414140",
        qualifications: ["MBBS", "MD"],
        specialization: "Psychiatrist & Sexologist – Bhosari Clinic, Pune",
        experience: 5,
        avatar: "/uploads/avatars/e932154c779a6ef6.jpeg",
        clinicId: bhosariClinic?._id || null,
        registrationNumber: "MMC-05-MAHAJAN-05",
        rating: 4.8,
        reviewsCount: 45,
        fees: 1000,
        status: "Active",
        showOnHomepage: true,
        bio: "Consultant Psychiatrist and Sexologist at Bhosari Clinic, Pune, dedicated to modern, confidential mental and sexual health solutions."
      },
      {
        name: "Dr. Vishwas Binawade",
        email: "drbinawade@kelkalmanas.com",
        phone: "+91 7030414140",
        qualifications: ["MBBS"],
        specialization: "Sexologist – Baner Clinic, Pune",
        experience: 35,
        avatar: "/uploads/avatars/6cbc8ec5c8b55900.jpeg",
        clinicId: banerClinic?._id || null,
        registrationNumber: "MMC-35-BINAWADE-06",
        rating: 4.9,
        reviewsCount: 110,
        fees: 1200,
        status: "Active",
        showOnHomepage: true,
        bio: "Renowned Sexologist with 35 years of clinical excellence providing specialized consultation and care at Baner Clinic, Pune."
      }
    ];

    for (const doc of doctorsData) {
      await Doctor.updateOne(
        { email: doc.email },
        { 
          $set: {
            ...doc,
            deletedAt: null,
            updatedAt: new Date()
          } 
        },
        { upsert: true }
      );
      console.log(`Upserted doctor: ${doc.name}`);
    }

    // 4. Update the About page JSON in MongoDB so experts array is also in sync
    const aboutPage = await Page.findOne({ slug: "about" });
    if (aboutPage) {
      let contentObj = {};
      try {
        contentObj = JSON.parse(aboutPage.content || "{}");
      } catch (e) {
        contentObj = {};
      }

      contentObj.experts = doctorsData.map(d => ({
        name: d.name,
        role: d.qualifications.join(", "),
        spec: d.specialization,
        img: d.avatar,
        exp: d.experience
      }));

      await Page.updateOne(
        { slug: "about" },
        {
          $set: {
            content: JSON.stringify(contentObj, null, 2),
            updatedAt: new Date()
          }
        }
      );
      console.log("Updated About page experts in DB.");
    }

    console.log("All doctors seeded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding doctors:", err);
    process.exit(1);
  }
}

seedDoctors();
