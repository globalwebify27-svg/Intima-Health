import { connectDB } from "@/db/connect";
import { PageModel } from "@/modules/cms/schema";
import { ClinicModel } from "@/modules/clinics/schema";
import { DoctorModel } from "@/modules/doctors/schema";
import AboutClient from "./AboutClient";
import { Metadata } from "next";

export const revalidate = 120; // Cache for 2 minutes (Incremental Static Regeneration)

export const metadata: Metadata = {
  title: "About Us | Dr. Kelkar Hospital Akola & Nagpur",
  description:
    "Learn about Dr. Deepak Kelkar, Dr. Kelkar Hospital, and Sanmitra Hospital. Over 44 years of psychiatric care, cashless scheme treatments, and clinical excellence.",
};

export default async function AboutPage() {
  await connectDB();

  const [pageDoc, clinicsDocs, doctorsDocs] = await Promise.all([
    PageModel.findOne({ slug: "about", deletedAt: null }).lean(),
    ClinicModel.find({ status: "Active" }).lean(),
    DoctorModel.find({ status: "Active", showOnHomepage: true }).lean(),
  ]);

  let parsedAboutData = null;
  const rawContent = (pageDoc as { content?: string } | null)?.content;
  if (rawContent) {
    try {
      parsedAboutData = JSON.parse(rawContent);
    } catch (e) {
      console.error("Failed to parse about content JSON on server:", e);
    }
  }

  const initialClinics = JSON.parse(JSON.stringify(clinicsDocs || []));
  const initialDoctors = JSON.parse(JSON.stringify(doctorsDocs || []));

  return (
    <AboutClient
      initialAboutData={parsedAboutData}
      initialClinics={initialClinics}
      initialDoctors={initialDoctors}
    />
  );
}
