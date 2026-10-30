require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { execSync } = require('child_process');
const mongoose = require("mongoose");
const uri = process.env.MONGODB_URI;

const PageSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  deletedAt: { type: Date, default: null }
}, { collection: "pages", timestamps: true });

const Page = mongoose.model("Page", PageSchema);

function extractMap(content, mapName) {
  const startString = `const ${mapName}: Record<string,`;
  let startIndex = content.indexOf(startString);
  if (startIndex === -1) return null;
  
  startIndex = content.indexOf('{', startIndex);
  let endIndex = -1;
  let bracketCount = 0;
  
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') bracketCount++;
    if (content[i] === '}') bracketCount--;
    if (bracketCount === 0) {
      endIndex = i;
      break;
    }
  }
  
  const mapContent = content.substring(startIndex, endIndex + 1);
  
  const wrapped = `(function() {
    const BrainCircuit = "BrainCircuit";
    const Activity = "Activity";
    const HeartPulse = "HeartPulse";
    const HeartHandshake = "HeartHandshake";
    const ShieldAlert = "ShieldAlert";
    const ShieldCheck = "ShieldCheck";
    const UserCheck = "UserCheck";
    const Zap = "Zap";
    const Building2 = "Building2";
    const Stethoscope = "Stethoscope";
    const Pill = "Pill";
    const Clock = "Clock";
    const FlaskConical = "FlaskConical";
    return ${mapContent};
  })()`;
  
  return eval(wrapped);
}

async function run() {
  const condStr = execSync('git show HEAD:src/app/\\(public\\)/conditions/\\[slug\\]/page.tsx').toString();
  const servStr = execSync('git show HEAD:src/app/\\(public\\)/services/\\[slug\\]/page.tsx').toString();

  const condMap = extractMap(condStr, "conditionDataMap");
  const servMap = extractMap(servStr, "serviceDataMap");

  if (!condMap || !servMap) {
    console.error("Could not extract maps");
    process.exit(1);
  }

  await mongoose.connect(uri);

  for (const [slug, data] of Object.entries(condMap)) {
    const content = JSON.stringify(data, null, 2);
    const dbSlug = `conditions/${slug}`;
    let page = await Page.findOne({ slug: dbSlug });
    if (page) {
      page.content = content;
      await page.save();
      console.log(`Updated ${dbSlug}`);
    } else {
      await Page.create({ title: data.title, slug: dbSlug, content });
      console.log(`Created ${dbSlug}`);
    }
  }

  for (const [slug, data] of Object.entries(servMap)) {
    const content = JSON.stringify(data, null, 2);
    const dbSlug = `services/${slug}`;
    let page = await Page.findOne({ slug: dbSlug });
    if (page) {
      page.content = content;
      await page.save();
      console.log(`Updated ${dbSlug}`);
    } else {
      await Page.create({ title: data.title, slug: dbSlug, content });
      console.log(`Created ${dbSlug}`);
    }
  }

  console.log("Done seeding all conditions and services.");
  process.exit(0);
}

run().catch(console.error);
