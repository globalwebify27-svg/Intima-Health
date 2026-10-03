import { connectDB } from "../src/db/connect";
import { OrderModel } from "../src/modules/pharmacy/schema";

async function main() {
  await connectDB();
  const orders = await OrderModel.find().lean().exec();
  console.log(JSON.stringify(orders, null, 2));
  process.exit(0);
}
main();
