import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Intima Health",
  description: "Read the Terms of Service for using Intima Health.",
};

export default function TermsPage() {
  return (
    <div className="bg-[#FCFBFC] min-h-screen py-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-serif text-[#4A154B] mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg text-muted-foreground prose-headings:text-[#4A154B] prose-a:text-[#4A154B]">
          <p className="font-medium text-lg">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using the Intima Health website and services, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">2. Medical Disclaimer</h2>
          <p>
            The content on the Intima Health website is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">3. User Accounts</h2>
          <p>
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">4. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of Intima Health and its licensors. The Service is protected by copyright, trademark, and other laws of both the country and foreign countries.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">5. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
          </p>
        </div>
      </div>
    </div>
  );
}
