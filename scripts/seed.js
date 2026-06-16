const fs = require('fs');
const mongoose = require('mongoose');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

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

  console.log("Clearing existing database collections...");
  await db.collection('clinics').deleteMany({});
  await db.collection('doctors').deleteMany({});
  await db.collection('users').deleteMany({});
  await db.collection('patients').deleteMany({});
  await db.collection('appointments').deleteMany({});
  await db.collection('consultations').deleteMany({});
  await db.collection('therapy_sessions').deleteMany({});
  await db.collection('products').deleteMany({});
  await db.collection('orders').deleteMany({});
  await db.collection('payments').deleteMany({});

  console.log("Seeding Clinics...");
  const clinicsData = [
    {
      name: "Pune Intimacy Clinic",
      city: "Pune",
      address: "Sector 4, Koregaon Park, Pune",
      phone: "9876543230",
      email: "pune@intima.health",
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Kalyani Nagar Care Center",
      city: "Pune",
      address: "102 Kalyani Nagar, Pune",
      phone: "9876543231",
      email: "kalyani@intima.health",
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Bandra Premium Clinic",
      city: "Mumbai",
      address: "Linking Road, Bandra West, Mumbai",
      phone: "9876543232",
      email: "mumbai@intima.health",
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Vasant Vihar Premium Clinic",
      city: "New Delhi",
      address: "Vasant Vihar, New Delhi",
      phone: "9876543233",
      email: "delhi@intima.health",
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const clinicInsertResult = await db.collection('clinics').insertMany(clinicsData);
  const clinicIds = Object.values(clinicInsertResult.insertedIds);
  console.log(`Successfully seeded ${clinicIds.length} Clinics.`);

  console.log("Seeding Doctors...");
  const doctorsData = [
    {
      clinicId: clinicIds[0], // Pune Intimacy Clinic
      name: "Dr. Sarah Jenkins",
      email: "sarah.jenkins@intima.health",
      phone: "9876543210",
      specialization: "Sexual Medicine",
      experience: 12,
      bio: "Specialist in sexual medicine and couple therapy with over 12 years of clinical experience.",
      fees: 1500,
      qualifications: ["MD - Internal Medicine", "Fellowship in Sexual Medicine"],
      availability: [
        { day: "Monday", slots: [{ start: "09:00", end: "13:00" }, { start: "14:00", end: "17:00" }] },
        { day: "Wednesday", slots: [{ start: "09:00", end: "13:00" }] }
      ],
      slotDuration: 30,
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      clinicId: clinicIds[1], // Kalyani Nagar Care Center
      name: "Dr. Michael Chen",
      email: "michael.chen@intima.health",
      phone: "9876543211",
      specialization: "Urology",
      experience: 15,
      bio: "Senior consultant urologist specializing in male reproductive health and micro-surgery.",
      fees: 1800,
      qualifications: ["MS - General Surgery", "MCh - Urology"],
      availability: [
        { day: "Tuesday", slots: [{ start: "10:00", end: "14:00" }] },
        { day: "Thursday", slots: [{ start: "10:00", end: "16:00" }] }
      ],
      slotDuration: 30,
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      clinicId: clinicIds[2], // Bandra Premium Clinic
      name: "Dr. Malay Verma",
      email: "malayverma@intimahealth.com",
      phone: "9876543212",
      specialization: "Sexual Health Consultant",
      experience: 10,
      bio: "Focuses on male fertility, couples therapy, and sexual wellness consults.",
      fees: 1200,
      qualifications: ["MD - Psychiatry", "Diploma in Sexual Medicine"],
      availability: [
        { day: "Monday", slots: [{ start: "09:00", end: "17:00" }] },
        { day: "Tuesday", slots: [{ start: "10:00", end: "15:00" }] },
        { day: "Wednesday", slots: [{ start: "09:00", end: "17:00" }] }
      ],
      slotDuration: 30,
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await db.collection('doctors').insertMany(doctorsData);
  const doctors = await db.collection('doctors').find({}).toArray();
  console.log(`Successfully seeded ${doctors.length} Doctors.`);

  const patientsData = [
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
    },
    {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "9876543222",
      gender: "Male",
      dob: new Date("1988-11-04"),
      allergies: ["Sulfonamides"],
      medicalHistory: "Diagnosed with Type-2 diabetes. Takes Metformin daily.",
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const patientInsertResult = await db.collection('patients').insertMany(patientsData);
  const patientIds = Object.values(patientInsertResult.insertedIds);
  const patients = await db.collection('patients').find({}).toArray();
  console.log(`Successfully seeded ${patientIds.length} Patients.`);

  console.log("Seeding Users...");
  // 1. Seed administrator
  await db.collection('users').insertOne({
    name: "Intima Admin",
    email: "admin@intima.health",
    passwordHash: hashPassword("adminpassword123"),
    role: "SUPER_ADMIN",
    status: "Active",
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // 2. Seed doctor credentials
  for (const doc of doctors) {
    await db.collection('users').insertOne({
      name: doc.name,
      email: doc.email,
      passwordHash: hashPassword("password123"),
      role: "DOCTOR",
      status: "Active",
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // 3. Seed patient credentials
  for (const pat of patients) {
    await db.collection('users').insertOne({
      name: pat.name,
      email: pat.email,
      passwordHash: hashPassword("password123"),
      role: "PATIENT",
      status: "Active",
      patientId: pat._id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // 4. Seed Pharmacy Staff
  await db.collection('users').insertOne({
    name: "Pune Pharmacy Staff",
    email: "pharma.pune@intima.health",
    passwordHash: hashPassword("password123"),
    role: "PHARMACY_STAFF",
    clinicId: clinicIds[0], // Pune Intimacy Clinic
    status: "Active",
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // 5. Seed Clinic Manager Staff
  await db.collection('users').insertOne({
    name: "Pune Clinic Manager",
    email: "manager.pune@intima.health",
    passwordHash: hashPassword("password123"),
    role: "CLINIC_MANAGER",
    clinicId: clinicIds[0], // Pune Intimacy Clinic
    status: "Active",
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log("Successfully seeded Administrator, Doctor, Patient, Pharmacy, and Clinic Manager credentials.");

  console.log("Seeding Appointments & Consultations...");
  const timeSlots = ["10:30", "14:15", "16:00"];
  const dates = ["2026-06-12", "2026-06-13", "2026-06-14"];

  let i = 0;
  for (const doc of doctors) {
    for (const patId of patientIds) {
      const date = dates[i % dates.length];
      const time = timeSlots[i % timeSlots.length];
      
      const apt = {
        patientId: patId,
        doctorId: doc._id,
        clinicId: doc.clinicId,
        date: date,
        time: time,
        type: "Video",
        status: i % 2 === 0 ? "Scheduled" : "Completed",
        notes: "Wellness consultation session.",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const aptResult = await db.collection('appointments').insertOne(apt);
      
      const consult = {
        appointmentId: aptResult.insertedId,
        patientId: patId,
        doctorId: doc._id,
        videoChannelName: `room-${Math.random().toString(36).substring(2, 9)}`,
        status: i % 2 === 0 ? "Pending" : "Completed",
        notes: i % 2 === 0 ? "" : "Patient is recovering well. Maintain supplement routine.",
        prescriptionSummary: i % 2 === 0 ? "" : JSON.stringify([
          { drug: "Sildenafil 50mg", dosage: "1 tab", frequency: "On demand", duration: "30 days" }
        ]),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('consultations').insertOne(consult);
      i++;
    }
  }
  console.log("Successfully seeded Appointments & Telemedicine Consultations.");

  console.log("Seeding Pharmacy Products...");
  const productsData = [
    {
      clinicId: clinicIds[0],
      name: "Tadalafil 5mg",
      category: "ED Medication",
      price: 450,
      stock: 150,
      description: "Daily dosage tablet for long-term erectile dysfunction treatment and performance improvement.",
      status: "In Stock",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      clinicId: clinicIds[0],
      name: "Sildenafil 50mg",
      category: "ED Medication",
      price: 380,
      stock: 8,
      description: "On-demand PDE5 inhibitor tablet for active male sexual wellness.",
      status: "Low Stock",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  await db.collection('products').insertMany(productsData);
  console.log("Successfully seeded Pharmacy Products.");

  console.log("Database Seeding Completed Successfully.");
  process.exit(0);
}

main().catch(console.error);
