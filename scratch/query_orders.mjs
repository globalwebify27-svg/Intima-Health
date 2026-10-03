import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({}, { strict: false });
const OrderModel = mongoose.model("Order", OrderSchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/intima-health");
  const orders = await OrderModel.find().lean().exec();
  console.log(JSON.stringify(orders, null, 2));
  process.exit(0);
}
main();
