import { Hero } from "@/components/sections/Hero";
import { TrustIndicators } from "@/components/sections/TrustIndicators";
import { Conditions } from "@/components/sections/Conditions";
import { FeaturedProducts } from "@/components/sections/FeaturedProducts";
import { SelfAssessmentCTA } from "@/components/sections/SelfAssessmentCTA";
import { FeaturedExperts } from "@/components/sections/FeaturedExperts";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustIndicators />
      <Conditions />
      <FeaturedProducts />
      <SelfAssessmentCTA />
      <FeaturedExperts />
      <WhyChooseUs />
    </>
  );
}
