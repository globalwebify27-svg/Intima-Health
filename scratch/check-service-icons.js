import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://globalwebify27_db_user:BhipPJ7nwaBsj4IF@intima.mbemvrg.mongodb.net/intima-health?appName=Intima";

async function run() {
  await mongoose.connect(MONGO_URI);
  const services = await mongoose.connection.collection('platformservices').find({}).toArray();
  console.log("=== All services and their icon values ===");
  services.forEach(s => {
    console.log(`  "${s.name}" -> icon: "${s.icon}"`);
  });
  process.exit(0);
}
run();
