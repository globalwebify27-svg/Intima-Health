const fs = require('fs');
const mongoose = require('mongoose');

async function run() {
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

  const appointments = await db.collection('appointments').find({}).toArray();
  console.log("ALL APPOINTMENTS:");
  console.log(JSON.stringify(appointments, null, 2));

  process.exit(0);
}

run().catch(console.error);
