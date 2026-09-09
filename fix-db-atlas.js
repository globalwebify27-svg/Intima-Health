const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://globalwebify27_db_user:BhipPJ7nwaBsj4IF@intima.mbemvrg.mongodb.net/intima-health?appName=Intima");
const db = mongoose.connection;
db.once("open", async () => {
  const collection = db.collection("products");
  const docs = await collection.find({ clinicId: { $type: "string" } }).toArray();
  let updated = 0;
  for (const doc of docs) {
    if (doc.clinicId) {
      try {
        await collection.updateOne({ _id: doc._id }, { $set: { clinicId: new mongoose.Types.ObjectId(doc.clinicId) } });
        updated++;
      } catch (e) {
        console.error(e);
      }
    }
  }
  console.log("Fixed", updated, "out of", docs.length, "documents");
  process.exit(0);
});
