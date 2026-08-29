import mongoose from "mongoose";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGO_URI = "mongodb+srv://globalwebify27_db_user:BhipPJ7nwaBsj4IF@intima.mbemvrg.mongodb.net/intima-health?appName=Intima";

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId("6a2d095011bba2e3968a4d06") });
  console.log("User found:", user ? user.email : "Not found");
  
  if (user && user.role === "DOCTOR") {
    const doctor = await db.collection('doctors').findOne({ email: user.email });
    console.log("Doctor found:", doctor ? "Yes" : "No");
    if (doctor) {
      console.log("Doctor salary:", doctor.salary);
      
      // Let's try to update using Mongoose Model directly to trigger validation
      try {
        const { DoctorModel } = await import('../src/modules/doctors/schema.js');
        const doc = await DoctorModel.findById(doctor._id);
        
        doc.salary = 1000;
        await doc.save();
        console.log("Doctor saved successfully.");
      } catch (err) {
        console.error("Validation error:", err);
      }
    }
  }
  
  process.exit(0);
}
run();
