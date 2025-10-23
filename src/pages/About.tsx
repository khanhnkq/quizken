import Navbar from "@/components/layout/Navbar";
import {
  SEOHead,
  AboutHero,
  AboutMissionVision,
  AboutStory,
  AboutValues,
  AboutShopFavorites,
  AboutSocialLinks,
} from "@/components/sections/about/AboutSections";
import { shopFavorites } from "@/config/shopFavorites";
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/ScrollVelocity";

const About = () => {
  return (
    <>
      <Navbar />
      <SEOHead />

      <div id="smooth-content" className="relative">
        <div className="absolute inset-0 -z-10 opacity-5 hidden md:block">
          <ScrollVelocityContainer className="text-6xl md:text-8xl font-bold">
            <ScrollVelocityRow baseVelocity={40} rowIndex={0}>
              AI Education Smart Learning Intelligent Teaching Digital Classroom
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={1}>
              Adaptive Assessment Personalized Learning Virtual Teacher
              Cognitive Training
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={2}>
              Educational Analytics Student Engagement Knowledge Discovery
              Learning Analytics
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={3}>
              Artificial Intelligence Machine Learning Neural Networks Cognitive
              Computing
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={4}>
              Interactive Assessment Educational Technology Intelligent Tutoring
              Automated Grading
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={5}>
              AI Education Smart Learning Intelligent Teaching Digital Classroom
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={6}>
              Adaptive Assessment Personalized Learning Virtual Teacher
              Cognitive Training
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={7}>
              Educational Analytics Student Engagement Knowledge Discovery
              Learning Analytics
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={8}>
              Artificial Intelligence Machine Learning Neural Networks Cognitive
              Computing
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={40} rowIndex={9}>
              Interactive Assessment Educational Technology Intelligent Tutoring
              Automated Grading
            </ScrollVelocityRow>
          </ScrollVelocityContainer>
        </div>
        <AboutHero />
        <AboutStory />
        <AboutMissionVision />
        <AboutValues />
        <AboutShopFavorites products={shopFavorites} />
        <AboutSocialLinks />
      </div>
    </>
  );
};

export default About;
