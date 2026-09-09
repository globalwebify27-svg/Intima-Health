const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://globalwebify27_db_user:BhipPJ7nwaBsj4IF@intima.mbemvrg.mongodb.net/intima-health?appName=Intima");
const db = mongoose.connection;
db.once("open", async () => {
  const collection = db.collection("products");
  const count1 = await collection.countDocuments({ clinicId: new mongoose.Types.ObjectId("6a9fbeec4955cc174a5c3084") });
  const count2 = await collection.countDocuments({ clinicId: "6a9fbeec4955cc174a5c3084" });
  const countAll = await collection.countDocuments();
  console.log("ObjectId count:", count1);
  console.log("String count:", count2);
  console.log("Total:", countAll);
  process.exit(0);
});
