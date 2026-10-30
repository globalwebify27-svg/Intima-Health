import { connectDB } from "@/db/connect";
import { PageModel } from "@/modules/cms/schema";
import ContactClient from "./ContactClient";
import { Metadata } from "next";

export const revalidate = 120; // Revalidate every 2 minutes

export const metadata: Metadata = {
  title: "Contact Us | KELKAR MANAS HEALTH CLINIC",
  description:
    "Get in touch with Kelkar Manas Health Care Clinic. Contact numbers, location details, appointment queries, and hospital addresses.",
};

export default async function ContactPage() {
  await connectDB();

  const pageDoc = await PageModel.findOne({
    slug: "contact",
    deletedAt: null,
  }).lean();

  const initialContent = pageDoc && (pageDoc as any).content ? (pageDoc as any).content : null;

  return <ContactClient initialContent={initialContent} />;
}
