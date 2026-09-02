import { config } from "dotenv";
config({ path: ".env.local" });

import { connectDB } from "../db/connect";
import { PlatformServiceModel } from "../modules/services/schema";

async function main() {
  await connectDB();
  const res = await PlatformServiceModel.updateOne(
    { name: "Sex Therapy" },
    { $set: { description: "30-min psychological counseling" } }
  );
  console.log("Update result:", res);
  process.exit(0);
}

main().catch(console.error);
