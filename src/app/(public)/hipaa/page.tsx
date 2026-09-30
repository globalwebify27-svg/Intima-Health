import { Metadata } from "next";
import mongoose from "mongoose";
import { PageModel } from "@/modules/cms/schema";

export const metadata: Metadata = {
  title: "HIPAA Notice of Privacy Practices | KELKAR MANAS HEALTH CLINIC",
  description: "Read our HIPAA Notice of Privacy Practices to understand how we protect your medical information.",
};

async function getPageContent(slug: string) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }
    const page = await PageModel.findOne({ slug });
    return page?.content || null;
  } catch (err) {
    console.error("Error fetching page content:", err);
    return null;
  }
}

export default async function HIPAAPage() {
  const content = await getPageContent("hipaa");

  return (
    <div className="bg-[#FCFBFC] min-h-screen py-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-serif text-[#4A154B] mb-8">HIPAA Notice of Privacy Practices</h1>
        
        {content ? (
          <div 
            className="prose prose-lg text-muted-foreground prose-headings:text-[#4A154B] prose-a:text-[#4A154B] max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="prose prose-lg text-muted-foreground prose-headings:text-[#4A154B] prose-a:text-[#4A154B]">
            <p className="font-medium text-lg">Loading or missing content...</p>
          </div>
        )}
      </div>
    </div>
  );
}
