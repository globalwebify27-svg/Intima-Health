const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://globalwebify27_db_user:BhipPJ7nwaBsj4IF@intima.mbemvrg.mongodb.net/intima-health?appName=Intima");
const db = mongoose.connection;
db.once("open", async () => {
  const collection = db.collection("products");
  const doc = await collection.findOne({ clinicId: new mongoose.Types.ObjectId("6a9fbeec4955cc174a5c3084") });
  console.log(doc);
  process.exit(0);
});
