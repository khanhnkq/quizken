import Navbar from "@/components/layout/Navbar";
import SeoMeta from "@/components/SeoMeta";
import {
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
import {
  generateOrganizationSchema,
  generateLocalBusinessSchema,
  generateBreadcrumbSchema,
} from "@/lib/seoSchemas";

const About = () => {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
  ]);

  return (
    <>
      <SeoMeta
        title="Về QuizKen - Nền Tảng Quiz AI Miễn Phí"
        description="Tìm hiểu về QuizKen, sứ mệnh cung cấp công cụ tạo bài kiểm tra AI dành cho mọi người. Công nghệ, giá trị cốt lõi, và câu chuyện phía sau ứng dụng."
        canonical="/about"
        keywords={[
          "về quizken",
          "giới thiệu",
          "quiz ai generator",
          "công cụ giáo dục",
          "AI giáo dục việt nam",
        ]}
        openGraph={{
          title: "Về QuizKen - AI Quiz Generator",
          description: "Tìm hiểu hành trình và sứ mệnh của QuizKen",
          image: "https://quizken.vercel.app/image/seo.jpg",
          url: "/about",
          type: "website",
        }}
        twitter={{
          card: "summary_large_image",
          title: "Về QuizKen",
          description:
            "Nền tảng tạo bài trắc nghiệm bằng AI hàng đầu tại Việt Nam",
        }}
        structuredData={[
          generateOrganizationSchema(),
          generateLocalBusinessSchema(),
          breadcrumbSchema,
        ]}
      />
      {/* Navbar outside ScrollSmoother for proper sticky behavior */}
      <Navbar />

      <div id="smooth-wrapper">
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
