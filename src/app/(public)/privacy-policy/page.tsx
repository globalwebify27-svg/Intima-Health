import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Intima Health",
  description: "Learn about how Intima Health protects your privacy and handles your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FCFBFC] min-h-screen py-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-serif text-[#4A154B] mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg text-muted-foreground prose-headings:text-[#4A154B] prose-a:text-[#4A154B]">
          <p className="font-medium text-lg">Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">1. Information We Collect</h2>
          <p>
            At Intima Health, we take your privacy seriously. We collect information to provide better services to our users. This includes basic information like your IP address, as well as more complex information like the personal details you provide during registration or appointment booking.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">2. How We Use Information</h2>
          <p>
            The information we collect is used to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Provide, maintain, and improve our services.</li>
            <li>Process transactions and send related information, including confirmations and receipts.</li>
            <li>Send you technical notices, updates, security alerts, and support and administrative messages.</li>
            <li>Respond to your comments, questions, and requests, and provide customer service.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-4">3. Data Security</h2>
          <p>
            We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information. We offer the use of a secure server. All supplied sensitive/credit information is transmitted via Secure Socket Layer (SSL) technology and then encrypted into our Payment gateway providers database only to be accessible by those authorized with special access rights to such systems.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">4. Sharing of Information</h2>
          <p>
            We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">5. Contact Us</h2>
          <p>
            If there are any questions regarding this privacy policy, you may contact us using the information on our Contact page.
          </p>
        </div>
      </div>
    </div>
  );
}
