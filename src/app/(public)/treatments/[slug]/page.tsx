import { notFound } from "next/navigation";
import { connectDB } from "@/db/connect";
import { TreatmentModel } from "@/modules/cms/schema";
import { HospitalService } from "@/modules/hospitals/service";
import ClientPage from "./ClientPage";
import { Metadata } from "next";
import { cache } from "react";
import { TREATMENT_SLUGS, getFallbackTreatment } from "@/constants/defaultTreatments";

export const revalidate = 120; // Revalidate at most every 2 minutes (ISR)

export async function generateStaticParams() {
  const staticParams = TREATMENT_SLUGS.map((slug) => ({ slug }));
  try {
    await connectDB();
    const dbTreatments = await TreatmentModel.find({
      $or: [{ type: "treatment" }, { type: { $exists: false } }],
    })
      .select("slug")
      .lean();
    const dbSlugs = dbTreatments.map((t: { slug?: string }) => t.slug).filter(Boolean) as string[];
    const allSlugs = Array.from(new Set([...TREATMENT_SLUGS, ...dbSlugs]));
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
    console.error(`Error fetching treatment ${slug}:`, error);
  }
  return getFallbackTreatment(slug);
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const treatment = await getTreatment(resolvedParams.slug);
  
  if (!treatment) {
    return { title: "Treatment Not Found | Intima Health" };
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

  const isRehabSlug =
    resolvedParams.slug === "treatment-of-alcohol-addiction" ||
    resolvedParams.slug === "brown-sugar-de-addiction";

  let hospitals = undefined;
  if (isRehabSlug) {
    try {
      const live = await HospitalService.listAll(false);
      hospitals = JSON.parse(JSON.stringify(live || []));
    } catch (e) {
      console.error("Failed to load rehab centres:", e);
      hospitals = [];
    }
  }

  return <ClientPage data={serializedTreatment} hospitals={hospitals} />;
}
