const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://globalwebify27_db_user:BhipPJ7nwaBsj4IF@intima.mbemvrg.mongodb.net/intima-health?appName=Intima");
const db = mongoose.connection;
db.once("open", async () => {
  const collection = db.collection("clinics");
  const clinic = await collection.findOne({ name: /Kelkar/i });
  console.log(clinic);
  process.exit(0);
});
