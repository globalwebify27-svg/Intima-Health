import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://globalwebify27_db_user:BhipPJ7nwaBsj4IF@intima.mbemvrg.mongodb.net/intima-health?appName=Intima";

async function run() {
  await mongoose.connect(MONGO_URI);
  
  const staffs = await mongoose.connection.collection('staffs').find({}).toArray();
  console.log("Staff Roles:");
  staffs.forEach(s => console.log(s.email, s.role));
  
  process.exit(0);
}
run();
