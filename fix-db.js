const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/intima-health");
const db = mongoose.connection;
db.once("open", async () => {
  const collection = db.collection("products");
  const docs = await collection.find({ clinicId: { $type: "string" } }).toArray();
  for (const doc of docs) {
    if (doc.clinicId) {
      try {
        await collection.updateOne({ _id: doc._id }, { $set: { clinicId: new mongoose.Types.ObjectId(doc.clinicId) } });
      } catch (e) {
        console.error(e);
      }
    }
  }
  console.log("Fixed", docs.length, "documents");
  process.exit(0);
});
