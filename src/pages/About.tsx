import Navbar from "@/components/layout/Navbar";
import SeoMeta from "@/components/SeoMeta";
import {
  AboutHero,
  AboutMissionVision,
  AboutStory,
  AboutFeatures,
  AboutValues,
  AboutShopFavorites,
  AboutSocialLinks,
} from "@/components/sections/about/AboutSections";
import { shopFavorites } from "@/config/shopFavorites";
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/ScrollVelocity";
import {
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateBreadcrumbSchema,
} from "@/lib/seoSchemas";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
  ]);

  return (
    <>
      <SeoMeta
        title={t('about.meta.title')}
        description={t('about.meta.description')}
        canonical="/about"
        keywords={t('about.meta.keywords').split(',')}
        openGraph={{
          title: t('about.meta.title'),
          description: t('about.meta.description'),
          image: "https://quizken.vercel.app/image/seo.jpg",
          url: "/about",
          type: "website",
        }}
        twitter={{
          card: "summary_large_image",
          title: t('about.meta.title'),
          description: t('about.meta.description'),
        }}
        structuredData={[
          generateOrganizationSchema(),
          generateLocalBusinessSchema(),
          breadcrumbSchema,
        ]}
      />
      {/* Navbar outside ScrollSmoother for proper sticky behavior */}
      <Navbar />

      <div id="smooth-wrapper" className="pt-16">
        <div id="smooth-content" className="relative">
          <div className="absolute inset-0 -z-10 opacity-5 hidden md:block">
            <ScrollVelocityContainer className="text-6xl md:text-8xl font-bold">
              <ScrollVelocityRow baseVelocity={75} rowIndex={0}>
                AI Education Smart Learning Intelligent Teaching Digital
                Classroom
              </ScrollVelocityRow>
              <ScrollVelocityRow baseVelocity={75} rowIndex={1}>
                Adaptive Assessment Personalized Learning Virtual Teacher
                Cognitive Training
              </ScrollVelocityRow>
              <ScrollVelocityRow baseVelocity={75} rowIndex={2}>
                Educational Analytics Student Engagement Knowledge Discovery
                Learning Analytics
              </ScrollVelocityRow>
              <ScrollVelocityRow baseVelocity={75} rowIndex={3}>
                Artificial Intelligence Machine Learning Neural Networks
                Cognitive Computing
              </ScrollVelocityRow>
              <ScrollVelocityRow baseVelocity={75} rowIndex={4}>
                Interactive Assessment Educational Technology Intelligent
                Tutoring Automated Grading
              </ScrollVelocityRow>
              <ScrollVelocityRow baseVelocity={75} rowIndex={5}>
                AI Education Smart Learning Intelligent Teaching Digital
                Classroom
              </ScrollVelocityRow>
              <ScrollVelocityRow baseVelocity={75} rowIndex={6}>
                Adaptive Assessment Personalized Learning Virtual Teacher
                Cognitive Training
              </ScrollVelocityRow>
              <ScrollVelocityRow baseVelocity={75} rowIndex={7}>
                Educational Analytics Student Engagement Knowledge Discovery
                Learning Analytics
              </ScrollVelocityRow>
              <ScrollVelocityRow baseVelocity={75} rowIndex={8}>
                Artificial Intelligence Machine Learning Neural Networks
                Cognitive Computing
              </ScrollVelocityRow>
              <ScrollVelocityRow baseVelocity={75} rowIndex={9}>
                Interactive Assessment Educational Technology Intelligent
                Tutoring Automated Grading
              </ScrollVelocityRow>
            </ScrollVelocityContainer>
          </div>
          <AboutHero />
          <AboutStory />
          <AboutFeatures />
          <AboutMissionVision />
          <AboutValues />
          <AboutShopFavorites products={shopFavorites} />
          <AboutSocialLinks />
        </div>
      </div>
    </>
  );
};

export default About;
