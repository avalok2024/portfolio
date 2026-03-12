import EventGallery from "@/components/EventGallary";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CTASection from "@/components/CTASection";

const EventsPage = () => {
  return (
    <main className="min-h-screen bg-[#0c0c0c]">
         <Navbar />
      <EventGallery />
      <CTASection />
      <Footer />    
    </main>
  );
};

export default EventsPage;