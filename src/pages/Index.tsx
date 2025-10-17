import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import QuizGenerator from "@/components/QuizGenerator";
import Stats from "@/components/Stats";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <QuizGenerator />
      <Stats />
      <Features />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
