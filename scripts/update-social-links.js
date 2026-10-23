const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

async function updateSocialLinks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Page = mongoose.connection.collection("pages");

    const contactDoc = await Page.findOne({ slug: "contact" });
    if (contactDoc) {
      let parsed = {};
      try {
        parsed = JSON.parse(contactDoc.content || "{}");
      } catch (e) {
        parsed = {};
      }

      parsed.facebook = "https://www.facebook.com/deepak.kelkar.5832";
      parsed.instagram = "https://www.instagram.com/dr.deepak.kelkar";
      parsed.twitter = "https://x.com/DeepakKelk47743";

      await Page.updateOne(
        { slug: "contact" },
        {
          $set: {
            content: JSON.stringify(parsed, null, 2),
            updatedAt: new Date()
          }
        }
      );
      console.log("Updated contact page in MongoDB with new social links.");
    } else {
      console.log("Contact page doc not found in DB.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error updating social links:", error);
    process.exit(1);
  }
}

updateSocialLinks();
