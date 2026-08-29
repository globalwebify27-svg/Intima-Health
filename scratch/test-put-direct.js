import mongoose from "mongoose";
import { UserModel, hashPassword } from "./src/modules/auth/schema.js";
import { DoctorModel } from "./src/modules/doctors/schema.js";

const MONGO_URI = "mongodb+srv://globalwebify27_db_user:BhipPJ7nwaBsj4IF@intima.mbemvrg.mongodb.net/intima-health?appName=Intima";

async function run() {
  await mongoose.connect(MONGO_URI);
  
  try {
    const user = await UserModel.findById("6a2d095011bba2e3968a4d06").exec();
    const oldEmail = user.email;
    const doctor = await DoctorModel.findOne({ email: oldEmail }).exec();
    
    // Simulate what the route does
    // const name = "Sarah Jenkins";
    // if (name) user.name = name;
    
    await user.save();
    
    if (doctor) {
      // doctor.salary = undefined; // This would cause error
      await doctor.save();
    }
    console.log("Successfully saved both user and doctor");
  } catch (error) {
    console.error("Error saving:", error);
  }
  
  process.exit(0);
}
run();
