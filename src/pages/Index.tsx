import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PartnersBar from "@/components/PartnersBar";
import ComparisonSection from "@/components/ComparisonSection";
import FAQSection from "@/components/FAQSection";
import PortfolioSection from "@/components/PortfolioSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import GrowthSection from "@/components/GrowthSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <PartnersBar />
      <ComparisonSection />
      <FAQSection />
      <PortfolioSection />
      <GrowthSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
