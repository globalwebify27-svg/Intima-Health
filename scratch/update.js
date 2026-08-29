import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://globalwebify27_db_user:BhipPJ7nwaBsj4IF@intima.mbemvrg.mongodb.net/intima-health?appName=Intima";

async function run() {
  await mongoose.connect(MONGO_URI);
  
  const result = await mongoose.connection.collection('appointments').updateMany(
    { serviceName: "Consultation" },
    { $set: { serviceName: "Walk-in Consultation" } }
  );
  
  console.log(`Updated ${result.modifiedCount} appointments.`);
  
  process.exit(0);
}
run();
