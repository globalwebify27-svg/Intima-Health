import { connectDB } from "./src/db/connect";
import { PostModel, CategoryModel } from "./src/modules/cms/schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function seed() {
  await connectDB();
  
  // Create a category if none exists
  let category = await CategoryModel.findOne({ name: "Sexual Health" });
  if (!category) {
    category = await CategoryModel.create({ name: "Sexual Health", slug: "sexual-health" });
  }

  let category2 = await CategoryModel.findOne({ name: "Mental Health" });
  if (!category2) {
    category2 = await CategoryModel.create({ name: "Mental Health", slug: "mental-health" });
  }

  const posts = [
    {
      title: "Understanding the Psychological Impact of ED",
      slug: "understanding-the-psychological-impact-of-ed",
      content: "<p>Erectile dysfunction is not just a physical condition. We explore the profound psychological effects and how comprehensive therapy can help.</p><h2>The Mind-Body Connection</h2><p>Our thoughts and feelings have a direct impact on our physical well-being. By addressing the root causes of anxiety and stress, patients often see significant improvements in their physical symptoms.</p>",
      excerpt: "Erectile dysfunction is not just a physical condition. We explore the profound psychological effects and how comprehensive therapy can help.",
      readTime: "5 min read",
      categoryId: category2._id,
      author: "Dr. Sarah Jenkins",
      status: "Published",
    },
    {
      title: "The Truth About Testosterone Replacement Therapy",
      slug: "the-truth-about-testosterone-replacement-therapy",
      content: "<p>Separating fact from fiction. What modern clinical studies say about TRT, its benefits, and potential side effects.</p><h2>Understanding Hormonal Balance</h2><p>Testosterone levels naturally decline with age. However, not everyone needs TRT. We take a personalized approach to hormonal health.</p>",
      excerpt: "Separating fact from fiction. What modern clinical studies say about TRT, its benefits, and potential side effects.",
      readTime: "8 min read",
      categoryId: category._id,
      author: "Dr. Michael Chen",
      status: "Published",
    },
    {
      title: "How to Build Endurance and Stamina Safely",
      slug: "how-to-build-endurance-and-stamina-safely",
      content: "<p>Clinical approaches to managing premature ejaculation without relying on unverified over-the-counter supplements.</p><h2>Evidence-Based Approaches</h2><p>Through a combination of behavioral therapies and medical interventions, we help our patients achieve their goals safely and effectively.</p>",
      excerpt: "Clinical approaches to managing premature ejaculation without relying on unverified over-the-counter supplements.",
      readTime: "6 min read",
      categoryId: category._id,
      author: "Dr. Emily Roberts",
      status: "Published",
    }
  ];

  await PostModel.insertMany(posts);
  console.log("Seeded posts");
  process.exit(0);
}
seed().catch(console.error);
