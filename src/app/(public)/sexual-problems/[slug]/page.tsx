import { notFound } from "next/navigation";
import { connectDB } from "@/db/connect";
import { TreatmentModel } from "@/modules/cms/schema";
import ClientPage from "./ClientPage";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  await connectDB();
  const resolvedParams = await params;
  const treatment = await TreatmentModel.findOne({ slug: resolvedParams.slug }).lean();
  
  if (!treatment) {
    return { title: "Not Found" };
  }

  return {
    title: `${treatment.title} | Intima Health`,
    description: treatment.heroSubtext,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  await connectDB();
  const resolvedParams = await params;
  const treatment = await TreatmentModel.findOne({ slug: resolvedParams.slug }).lean();
  
  if (!treatment) {
    notFound();
  }

  // Convert MongoDB ObjectId and Dates to string for client component serialization
  const serializedTreatment = JSON.parse(JSON.stringify(treatment));

  return <ClientPage data={serializedTreatment} />;
}
