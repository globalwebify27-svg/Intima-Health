import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://globalwebify27_db_user:BhipPJ7nwaBsj4IF@intima.mbemvrg.mongodb.net/intima-health?appName=Intima";

async function run() {
  await mongoose.connect(MONGO_URI);
  
  const result = await mongoose.connection.collection('doctors').updateMany(
    { salary: { $exists: false } },
    { $set: { salary: 500 } }
  );
  console.log(`Set default salary for ${result.modifiedCount} doctors.`);
  
  process.exit(0);
}
run();
