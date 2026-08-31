const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://globalwebify27_db_user:BhipPJ7nwaBsj4IF@intima.mbemvrg.mongodb.net/intima-health?appName=Intima")
  .then(async () => {
    const db = mongoose.connection.db;
    const patients = await db.collection("patients").find({ name: { $regex: "Om" } }).toArray();
    console.log("Patients:", patients.map(p => ({ _id: p._id, name: p.name, email: p.email, phone: p.phone })));
    
    const therapies = await db.collection("therapysessions").find({}).toArray();
    console.log("Therapies assigned to these patients:", therapies.filter(t => patients.some(p => String(p._id) === String(t.patientId))));
    
    process.exit(0);
  });
