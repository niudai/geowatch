import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import LogoBar from "@/components/sections/LogoBar";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import Pricing from "@/components/sections/Pricing";
import Testimonials from "@/components/sections/Testimonials";
import WaitlistCTA from "@/components/sections/WaitlistCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050508] overflow-x-hidden">
      <Navbar />
      <Hero />
      <LogoBar />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <WaitlistCTA />
      <Footer />
    </main>
  );
}
