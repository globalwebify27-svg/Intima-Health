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

  console.log("Clearing existing clinics collection...");
  await db.collection('clinics').deleteMany({});

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

  const result = await db.collection('clinics').insertMany(clinicsData);
  console.log(`Successfully seeded ${Object.keys(result.insertedIds).length} Clinics.`);
  
  process.exit(0);
}

main().catch(console.error);
