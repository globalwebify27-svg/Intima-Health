const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/intima-health");
const db = mongoose.connection;
db.once("open", async () => {
  const collection = db.collection("products");
  const doc = await collection.findOne();
  console.log(doc);
  console.log("clinicId type:", typeof doc.clinicId);
  process.exit(0);
});
