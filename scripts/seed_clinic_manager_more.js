const fs = require('fs');
const mongoose = require('mongoose');

async function main() {
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

  console.log("Connecting to MongoDB...");
  await mongoose.connect(mongodbUri);
  const db = mongoose.connection.db;

  // Find Pune Intimacy Clinic ID
  const clinic = await db.collection('clinics').findOne({ name: "Pune Intimacy Clinic" });
  if (!clinic) {
    console.error("Pune Intimacy Clinic not found in DB.");
    process.exit(1);
  }
  const clinicId = clinic._id;

  // Find a doctor in this clinic
  const doctor = await db.collection('doctors').findOne({ clinicId });
  if (!doctor) {
    console.error("No doctor found for Pune Intimacy Clinic.");
    process.exit(1);
  }
  const doctorId = doctor._id;

  console.log("Seeding extra walk-in patients...");
  const extraPatients = [
    {
      name: "Rajesh Patil",
      email: "rajesh@example.com",
      phone: "9123456789",
      gender: "Male",
      dob: new Date("1989-08-12"),
      allergies: ["Peanuts"],
      medicalHistory: "Asthma patient",
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Sanjay Deshmukh",
      email: "sanjay@example.com",
      phone: "9812739182",
      gender: "Male",
      dob: new Date("1991-03-24"),
      allergies: [],
      medicalHistory: "No history",
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Vikram Malhotra",
      email: "vikram@example.com",
      phone: "9823481239",
      gender: "Male",
      dob: new Date("1985-07-19"),
      allergies: ["Sulfur"],
      medicalHistory: "Gastric issues",
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const patientsResult = await db.collection('patients').insertMany(extraPatients);
  const patientIds = Object.values(patientsResult.insertedIds);

  console.log("Seeding extra appointments & prescriptions...");
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Add some completed consultations with prescriptions
  const completedApt = {
    patientId: patientIds[0],
    doctorId,
    clinicId,
    date: todayStr,
    time: "10:30 AM",
    type: "In-person",
    status: "Completed",
    notes: "Regular sexual health checkup completed.",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const completedResult = await db.collection('appointments').insertOne(completedApt);

  await db.collection('consultations').insertOne({
    appointmentId: completedResult.insertedId,
    patientId: patientIds[0],
    doctorId,
    videoChannelName: "room-completed-1",
    status: "Completed",
    notes: "Patient advised rest. Prescribed standard course.",
    prescriptionSummary: "Paracetamol 500mg - 1 tab twice a day for 5 days; Vitamin C - 1 tab daily for 30 days",
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // 2. Add second completed consultation
  const completedApt2 = {
    patientId: patientIds[1],
    doctorId,
    clinicId,
    date: todayStr,
    time: "11:15 AM",
    type: "In-person",
    status: "Completed",
    notes: "Follow up review.",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const completedResult2 = await db.collection('appointments').insertOne(completedApt2);

  await db.collection('consultations').insertOne({
    appointmentId: completedResult2.insertedId,
    patientId: patientIds[1],
    doctorId,
    videoChannelName: "room-completed-2",
    status: "Completed",
    notes: "Prescribed antibiotics course.",
    prescriptionSummary: "Amoxicillin 250mg - 1 capsule thrice a day for 7 days; Cetirizine 10mg - 1 tab at night for 5 days",
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // 3. Add upcoming agenda appointments for today
  const upcomingApt1 = {
    patientId: patientIds[2],
    doctorId,
    clinicId,
    date: todayStr,
    time: "03:30 PM",
    type: "In-person",
    status: "Scheduled",
    notes: "Walk-in registration consult.",
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await db.collection('appointments').insertOne(upcomingApt1);

  console.log("Seeding extra unpaid therapy sessions...");
  await db.collection('therapy_sessions').insertMany([
    {
      patientId: patientIds[0],
      clinicId,
      name: "Pelvic Floor Physiotherapy",
      price: 1200,
      status: "Unpaid",
      consultationId: completedResult.insertedId,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      patientId: patientIds[1],
      clinicId,
      name: "Couple counseling session",
      price: 2500,
      status: "Unpaid",
      consultationId: completedResult2.insertedId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  console.log("Extra seed data injected successfully!");
  process.exit(0);
}

main().catch(console.error);
