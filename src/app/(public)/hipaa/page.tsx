import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HIPAA Notice of Privacy Practices | Intima Health",
  description: "Read our HIPAA Notice of Privacy Practices to understand how we protect your medical information.",
};

export default function HIPAAPage() {
  return (
    <div className="bg-[#FCFBFC] min-h-screen py-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-serif text-[#4A154B] mb-8">HIPAA Notice of Privacy Practices</h1>
        
        <div className="prose prose-lg text-muted-foreground prose-headings:text-[#4A154B] prose-a:text-[#4A154B]">
          <p className="font-medium text-lg">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">1. Our Commitment to Your Privacy</h2>
          <p>
            At Intima Health, we are dedicated to maintaining the privacy of your protected health information (PHI). In conducting our business, we will create records regarding you and the treatment and services we provide to you.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">2. How We May Use and Disclose Your PHI</h2>
          <p>
            We may use and disclose your PHI in the following ways:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Treatment:</strong> To provide, coordinate, or manage your health care and any related services.</li>
            <li><strong>Payment:</strong> To obtain payment for your health care services.</li>
            <li><strong>Health Care Operations:</strong> To support the business activities of our practice, such as quality assessment activities, employee review activities, and conducting or arranging for other business activities.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-4">3. Your Rights Regarding Your PHI</h2>
          <p>
            You have the following rights regarding the PHI that we maintain about you:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Right to Inspect and Copy:</strong> You have the right to inspect and copy your PHI.</li>
            <li><strong>Right to Amend:</strong> You have the right to request that we amend your PHI if you believe it is incorrect or incomplete.</li>
            <li><strong>Right to an Accounting of Disclosures:</strong> You have the right to request a list of certain disclosures we have made of your PHI.</li>
            <li><strong>Right to Request Restrictions:</strong> You have the right to request a restriction or limitation on the PHI we use or disclose about you.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-4">4. Changes to This Notice</h2>
          <p>
            We reserve the right to change this notice. We reserve the right to make the revised or changed notice effective for PHI we already have about you as well as any information we receive in the future.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">5. Complaints</h2>
          <p>
            If you believe your privacy rights have been violated, you may file a complaint with us or with the Secretary of the Department of Health and Human Services. All complaints must be submitted in writing.
          </p>
        </div>
      </div>
    </div>
  );
}
