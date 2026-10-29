import { notFound } from "next/navigation";
import { connectDB } from "@/db/connect";
import { TreatmentModel } from "@/modules/cms/schema";
import ClientPage from "./ClientPage";
import { Metadata } from "next";
import { cache } from "react";

export const revalidate = 120; // Revalidate at most every 2 minutes (ISR)

const getTreatment = cache(async (slug: string) => {
  await connectDB();
  return TreatmentModel.findOne({ slug }).lean();
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const treatment = await getTreatment(resolvedParams.slug);
  
  if (!treatment) {
    return { title: "Not Found" };
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
