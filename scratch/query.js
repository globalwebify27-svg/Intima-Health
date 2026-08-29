import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://globalwebify27_db_user:BhipPJ7nwaBsj4IF@intima.mbemvrg.mongodb.net/intima-health?appName=Intima";

async function run() {
  await mongoose.connect(MONGO_URI);
  
  const appointments = await mongoose.connection.collection('appointments').find({}).toArray();
  console.log("Appointments:");
  appointments.forEach(a => console.log(a._id, a.type, a.serviceName));

  const services = await mongoose.connection.collection('platformservices').find({}).toArray();
  console.log("\nServices:");
  services.forEach(s => console.log(s._id, s.name));
  
  process.exit(0);
}
run();
