import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://globalwebify27_db_user:BhipPJ7nwaBsj4IF@intima.mbemvrg.mongodb.net/intima-health?appName=Intima";

async function run() {
  await mongoose.connect(MONGO_URI);
  
  // Find the user they are editing
  const user = await mongoose.connection.collection('users').findOne({ _id: new mongoose.Types.ObjectId("6a2d095011bba2e3968a4d06") });
  console.log("User found:", user ? user.email : "Not found");
  
  if (user && user.role === "DOCTOR") {
    const doctor = await mongoose.connection.collection('doctors').findOne({ email: user.email });
    console.log("Doctor found:", doctor ? "Yes" : "No");
    if (doctor) {
      console.log("Doctor salary field:", doctor.salary, typeof doctor.salary);
      console.log("Doctor fees field:", doctor.fees, typeof doctor.fees);
    }
  }
  
  process.exit(0);
}
run();
