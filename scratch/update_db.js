require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const TreatmentModel = mongoose.connection.collection('treatments');
  
  const sexualProblemSlugs = [
    'erectile-dysfunction',
    'premature-ejaculation',
    'sexual-performance-anxiety',
    'sexually-transmitted-infections',
    'precum',
    'nocturnal-emissions',
    'masturbation-habit',
    'homosexuality-counseling',
    'infertility',
    'sex-for-happiness'
  ];
  
  const result = await TreatmentModel.updateMany(
    { slug: { $in: sexualProblemSlugs } },
    { $set: { type: "sexual-problem" } }
  );
  console.log(`Updated ${result.modifiedCount} records to sexual-problem`);
  
  const otherResult = await TreatmentModel.updateMany(
    { slug: { $nin: sexualProblemSlugs } },
    { $set: { type: "treatment" } }
  );
  console.log(`Updated ${otherResult.modifiedCount} records to treatment`);
  
  await mongoose.disconnect();
}
main().catch(console.error);
