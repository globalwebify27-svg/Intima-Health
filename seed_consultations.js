const fs = require('fs');
const mongoose = require('mongoose');

async function seed() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  let mongodbUri = '';
  for (const line of envContent.split('\n')) {
    if (line.startsWith('MONGODB_URI=')) {
      mongodbUri = line.substring('MONGODB_URI='.length).trim().replace(/^["']|["']$/g, '');
    }
  }

  if (!mongodbUri) {
    console.error("MONGODB_URI is not defined in .env.local");
    process.exit(1);
  }
  
  await mongoose.connect(mongodbUri);
  const db = mongoose.connection.db;

  // 1. Get doctors
  const doctors = await db.collection('doctors').find({}).toArray();
  if (doctors.length === 0) {
    console.log("No doctors found. Please run/visit /api/doctors list to seed them first.");
    process.exit(1);
  }

  // 2. Create mock patients
  const patientData = [
    {
      name: "Amit Sharma",
      email: "amit.sharma@example.com",
      phone: "9876543220",
      gender: "Male",
      dob: new Date("1992-05-15"),
      allergies: ["Penicillin"],
      medicalHistory: "Diagnosed with mild hypertension. Non-smoker.",
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Priya Patel",
      email: "priya.patel@example.com",
      phone: "9876543221",
      gender: "Female",
      dob: new Date("1995-09-22"),
      allergies: [],
      medicalHistory: "No chronic conditions. Regular fitness routine.",
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await db.collection('patients').deleteMany({});
  const patientInsertResult = await db.collection('patients').insertMany(patientData);
  const patientIds = Object.values(patientInsertResult.insertedIds);
  console.log("Seeded mock patients.");

  // 3. Create mock appointments and consultations
  await db.collection('appointments').deleteMany({});
  await db.collection('consultations').deleteMany({});

  const appointments = [];
  const consultations = [];

  const timeSlots = ["10:30", "14:15", "16:00"];
  const dates = ["2026-06-12", "2026-06-13"];

  let i = 0;
  for (const doc of doctors) {
    for (const patId of patientIds) {
      const date = dates[i % dates.length];
      const time = timeSlots[i % timeSlots.length];
      
      const apt = {
        patientId: patId,
        doctorId: doc._id,
        date: date,
        time: time,
        type: "Video",
        status: "Scheduled",
        notes: "Regular sexual wellness consultation.",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const aptResult = await db.collection('appointments').insertOne(apt);
      
      const consult = {
        appointmentId: aptResult.insertedId,
        patientId: patId,
        doctorId: doc._id,
        videoChannelName: `room-${Math.random().toString(36).substring(2, 9)}`,
        status: "Pending",
        notes: "",
        prescriptionSummary: "",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      consultations.push(consult);
      i++;
    }
  }

  await db.collection('consultations').insertMany(consultations);
  console.log(`Successfully seeded ${consultations.length} mock appointments & consultations.`);
  process.exit(0);
}

seed().catch(console.error);
