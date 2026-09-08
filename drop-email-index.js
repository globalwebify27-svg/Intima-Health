const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

async function dropIndexes() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  try {
    await mongoose.connection.collection("patients").dropIndex("email_1");
    console.log("Dropped email_1 index from patients");
  } catch(e) {
    console.log("Error dropping patients index:", e.message);
  }

  try {
    await mongoose.connection.collection("users").dropIndex("email_1");
    console.log("Dropped email_1 index from users");
  } catch(e) {
    console.log("Error dropping users index:", e.message);
  }

  process.exit(0);
}

dropIndexes();
