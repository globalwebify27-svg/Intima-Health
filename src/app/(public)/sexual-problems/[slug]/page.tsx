import { notFound } from "next/navigation";
import { connectDB } from "@/db/connect";
import { TreatmentModel } from "@/modules/cms/schema";
import ClientPage from "./ClientPage";
import { Metadata } from "next";
import { cache } from "react";
import { SEXUAL_PROBLEM_SLUGS, getFallbackTreatment } from "@/constants/defaultTreatments";

export const revalidate = 120; // Revalidate at most every 2 minutes (ISR)

export async function generateStaticParams() {
  const staticParams = SEXUAL_PROBLEM_SLUGS.map((slug) => ({ slug }));
  try {
    await connectDB();
    const dbTreatments = await TreatmentModel.find({
      type: "sexual-problem",
    })
      .select("slug")
      .lean();
    const dbSlugs = dbTreatments.map((t: { slug?: string }) => t.slug).filter(Boolean) as string[];
    const allSlugs = Array.from(new Set([...SEXUAL_PROBLEM_SLUGS, ...dbSlugs]));
    return allSlugs.map((slug) => ({ slug }));
  } catch {
    return staticParams;
  }
}

const getTreatment = cache(async (slug: string) => {
  try {
    await connectDB();
    const doc = await TreatmentModel.findOne({ slug }).lean();
    if (doc) return doc;
  } catch (error) {
    console.error(`Error fetching sexual problem ${slug}:`, error);
  }
  return getFallbackTreatment(slug);
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const treatment = await getTreatment(resolvedParams.slug);
  
  if (!treatment) {
    return { title: "Topic Not Found | Intima Health" };
  }

  return {
    title: `${treatment.title} | Intima Health`,
    description: treatment.heroSubtext,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const treatment = await getTreatment(resolvedParams.slug);
  
  if (!treatment) {
    notFound();
  }

  // Convert MongoDB ObjectId and Dates to string for client component serialization
  const serializedTreatment = JSON.parse(JSON.stringify(treatment));

  return <ClientPage data={serializedTreatment} />;
}
