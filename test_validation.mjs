import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
await mongoose.connect(uri);

// Try to create a therapy session using TherapySessionModel
const { TherapySessionModel } = await import("./src/modules/pharmacy/schema.ts").catch(() => ({}));
if (!TherapySessionModel) {
  console.log("Could not import TS file. We'll use raw mongoose model definition.");
  const schema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, required: true },
    clinicId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, default: "Recommended" },
    consultationId: { type: mongoose.Schema.Types.ObjectId, required: true },
  });
  const Model = mongoose.models.TherapySession || mongoose.model("TherapySession", schema);
  
  const doc = new Model({
    patientId: new mongoose.Types.ObjectId(),
    clinicId: new mongoose.Types.ObjectId(),
    name: "Sex Therapy",
    price: 2499,
    status: "Recommended",
    consultationId: new mongoose.Types.ObjectId()
  });
  
  try {
    await doc.save();
    console.log("Successfully saved!");
  } catch(e) {
    console.log("Validation failed:", e);
  }
}
process.exit(0);
