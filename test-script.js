const mongoose = require("mongoose");
const { connectDB } = require("./src/db/connect");
const { ConsultationModel } = require("./src/modules/consultations/schema");

async function run() {
  await connectDB();
  const docs = await ConsultationModel.find({}).limit(5).exec();
  console.log("Consultations:", JSON.stringify(docs, null, 2));
  process.exit(0);
}
run();
