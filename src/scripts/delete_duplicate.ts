import { connectDB } from "../db/connect";
import { AppointmentModel } from "../modules/appointments/schema";
import { PatientModel } from "../modules/patients/schema";

async function run() {
  await connectDB();
  
  // Find Om Kumar
  const patient = await PatientModel.findOne({ name: /Om Kumar/i }).exec();
  if (!patient) {
    console.log("Patient not found");
    process.exit(0);
  }
  
  const appointments = await AppointmentModel.find({ 
    date: "2026-09-02"
  }).populate('patientId', 'name').exec();
  
  console.log(`Found ${appointments.length} appointments on 2026-09-02:`);
  appointments.forEach(a => console.log(a._id, a.time, a.status, (a as any).patientId?.name));
  
  if (appointments.length > 1) {
    const dups = appointments.filter(a => a.time === "13:00");
    if (dups.length > 1) {
      console.log(`Deleting duplicate appointment ID: ${dups[0]._id}`);
      await AppointmentModel.deleteOne({ _id: dups[0]._id });
      console.log("Deleted successfully.");
    }
  }
  
  process.exit(0);
}

run();
