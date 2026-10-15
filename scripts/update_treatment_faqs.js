require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const fs = require('fs');

// Read topicFaqs.ts and extract TOPIC_FAQS
const content = fs.readFileSync('./src/constants/topicFaqs.ts', 'utf-8');
const startMatch = content.indexOf('export const TOPIC_FAQS: Record<string, TopicFaqItem[]> = {');
if (startMatch === -1) {
  console.error("Could not find TOPIC_FAQS in topicFaqs.ts");
  process.exit(1);
}

const startIndex = content.indexOf('{', startMatch);
let endIndex = -1;
let depth = 0;
for (let i = startIndex; i < content.length; i++) {
  if (content[i] === '{') depth++;
  if (content[i] === '}') {
    depth--;
    if (depth === 0) {
      endIndex = i;
      break;
    }
  }
}

const objStr = content.substring(startIndex, endIndex + 1);
const topicFaqs = eval('(' + objStr + ')');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const collection = mongoose.connection.collection('treatments');

  for (const [slug, faqs] of Object.entries(topicFaqs)) {
    const res = await collection.updateMany(
      { slug },
      { $set: { faqs: faqs, deletedAt: null } }
    );
    console.log(`Updated ${slug}: matched ${res.matchedCount}, modified ${res.modifiedCount} with ${faqs.length} FAQs`);
  }

  console.log("All treatment FAQs updated successfully from PDF!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
