require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const TreatmentModel = mongoose.connection.collection('treatments');
  const all = await TreatmentModel.find({}, { projection: { slug: 1, type: 1, _id: 0 } }).toArray();
  console.log(all);
  await mongoose.disconnect();
}
main().catch(console.error);
