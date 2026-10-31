import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { WelcomeSection } from "@/components/sections/WelcomeSection";
import { TrustIndicators } from "@/components/sections/TrustIndicators";
import { Conditions } from "@/components/sections/Conditions";
import { SeekHelpSection } from "@/components/sections/SeekHelpSection";
import { TreatmentApproachSection } from "@/components/sections/TreatmentApproachSection";
import { FeaturedExperts } from "@/components/sections/FeaturedExperts";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { SelfAssessmentCTA } from "@/components/sections/SelfAssessmentCTA";
import { HomeFaqSection } from "@/components/sections/HomeFaqSection";

export const metadata: Metadata = {
  title: "KELKAR MANAS HEALTH CARE | Mental Health & Psychiatric Care",
  description:
    "Learn about mental health, psychiatric consultation, counselling, addiction treatment and selected sexual health services at KELKAR MANAS HEALTH CARE. Contact us for appointment information.",
  keywords: [
    "KELKAR MANAS HEALTH CARE",
    "mental health care",
    "psychiatric consultation",
    "depression treatment",
    "anxiety treatment",
    "de-addiction services",
    "counselling",
    "sexual health consultation",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "KELKAR MANAS HEALTH CARE | Mental Health & Psychiatric Care",
    description:
      "Learn about mental health, psychiatric consultation, counselling, addiction treatment and selected sexual health services at KELKAR MANAS HEALTH CARE. Contact us for appointment information.",
    url: "/",
    siteName: "KELKAR MANAS HEALTH CARE",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KELKAR MANAS HEALTH CARE | Mental Health & Psychiatric Care",
    description:
      "Learn about mental health, psychiatric consultation, counselling, addiction treatment and selected sexual health services at KELKAR MANAS HEALTH CARE. Contact us for appointment information.",
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <WelcomeSection />
      {/* <TrustIndicators /> */}
      <Conditions />
      <WhyChooseUs />
      <SeekHelpSection />
      <TreatmentApproachSection />
      {/* <FeaturedExperts /> */}
      <HomeFaqSection />
      <SelfAssessmentCTA />
    </>
  );
}

