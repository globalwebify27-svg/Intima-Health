const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://globalwebify27_db_user:BhipPJ7nwaBsj4IF@intima.mbemvrg.mongodb.net/intima-health?appName=Intima")
  .then(async () => {
    const db = mongoose.connection.db;
    const users = await db.collection("users").find({ role: "PATIENT" }).toArray();
    console.log(users.map(u => ({ email: u.email, name: u.name, patientId: u.patientId })));
    process.exit(0);
  });
