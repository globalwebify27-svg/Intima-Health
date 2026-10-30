import { connectDB } from "@/db/connect";
import { ClinicModel } from "@/modules/clinics/schema";
import { DoctorModel } from "@/modules/doctors/schema";
import DoctorsClient from "./DoctorsClient";
import { Metadata } from "next";

export const revalidate = 120; // Cache for 2 minutes (Incremental Static Regeneration)

export const metadata: Metadata = {
  title: "Clinical Specialists & Doctors | KELKAR MANAS HEALTH CLINIC",
  description:
    "Meet our board-certified psychiatrists, psychologists, and specialists at Kelkar Manas Health Clinic.",
};

export default async function DoctorsPage() {
  await connectDB();

  const [clinicsDocs, doctorsDocs] = await Promise.all([
    ClinicModel.find({ status: "Active" }).lean(),
    DoctorModel.find({ status: "Active" }).limit(100).lean(),
  ]);

  const initialClinics = JSON.parse(JSON.stringify(clinicsDocs || []));
  const initialDoctors = JSON.parse(JSON.stringify(doctorsDocs || []));

  return (
    <DoctorsClient
      initialClinics={initialClinics}
      initialDoctors={initialDoctors}
    />
  );
}
