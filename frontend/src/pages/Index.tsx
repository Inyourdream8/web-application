import Hero from "@/components/Hero";
import Features from "@/components/Features";
import ApplicationSteps from "@/components/ApplicationSteps";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ApplicationSteps />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
