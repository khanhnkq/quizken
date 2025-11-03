/**
 * SEO Schema Generators
 * Helper functions to generate JSON-LD schema markup for common content types
 */

import { SITE_NAME, SITE_URL, buildAbsoluteUrl } from "@/config/siteMeta";

export interface SchemaConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

/**
 * Organization Schema - For homepage
 */
export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org/",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: buildAbsoluteUrl("/image/seo.jpg"),
    description:
      "QuizKen - AI-powered quiz generator for teachers and students. Create engaging quizzes instantly with artificial intelligence.",
    sameAs: [
      "https://facebook.com/quizken",
      "https://youtube.com/quizken",
      "https://twitter.com/quizken",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+84-xxx-xxx-xxx",
      contactType: "Customer Support",
    },
    areaServed: "VN",
    foundingDate: "2024",
  };
};

/**
 * SoftwareApplication Schema - For features page
 */
export const generateSoftwareApplicationSchema = () => {
  return {
    "@context": "https://schema.org/",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    description:
      "Create engaging quizzes instantly with AI. Generate multiple-choice questions, manage student responses, and analyze results.",
    url: SITE_URL,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "VND",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
    },
    screenshot: buildAbsoluteUrl("/image/seo.jpg"),
  };
};

/**
 * Article Schema - For blog posts
 */
export const generateArticleSchema = (
  config: SchemaConfig & {
    datePublished: string;
    dateModified?: string;
    author?: string;
  }
) => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: config.title || "QuizKen Article",
    description: config.description || "",
    image: buildAbsoluteUrl(config.image || "/image/seo.jpg"),
    datePublished: config.datePublished,
    dateModified: config.dateModified || config.datePublished,
    author: {
      "@type": "Organization",
      name: config.author || SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: buildAbsoluteUrl("/image/seo.jpg"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": buildAbsoluteUrl(config.url || ""),
    },
  };
};

/**
 * BreadcrumbList Schema - For navigation
 */
export const generateBreadcrumbSchema = (
  items: Array<{ name: string; url: string }>
) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildAbsoluteUrl(item.url),
    })),
  };
};

/**
 * LocalBusiness Schema - For Vietnam market
 */
export const generateLocalBusinessSchema = () => {
  return {
    "@context": "https://schema.org/",
    "@type": "LocalBusiness",
    "@id": SITE_URL,
    name: `${SITE_NAME} Vietnam`,
    description:
      "Leading AI Quiz Generator platform in Vietnam for teachers and students",
    url: SITE_URL,
    image: buildAbsoluteUrl("/image/seo.jpg"),
    areaServed: {
      "@type": "Country",
      name: "VN",
    },
    contactType: "Customer Service",
  };
};

/**
 * FAQPage Schema - For FAQ section
 */
export const generateFAQSchema = (
  faqs: Array<{
    question: string;
    answer: string;
  }>
) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
};

/**
 * WebPage Schema - For general pages
 */
export const generateWebPageSchema = (config: SchemaConfig) => {
  return {
    "@context": "https://schema.org/",
    "@type": "WebPage",
    name: config.title || SITE_NAME,
    description: config.description || "",
    url: buildAbsoluteUrl(config.url || ""),
    image: buildAbsoluteUrl(config.image || "/image/seo.jpg"),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    inLanguage: "vi-VN",
  };
};

/**
 * Product Schema - For premium plans (if applicable)
 */
export const generateProductSchema = (
  config: SchemaConfig & { price?: string; currency?: string }
) => {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: config.title || SITE_NAME,
    description: config.description || "",
    image: buildAbsoluteUrl(config.image || "/image/seo.jpg"),
    url: buildAbsoluteUrl(config.url || ""),
    offers: {
      "@type": "Offer",
      price: config.price || "0",
      priceCurrency: config.currency || "VND",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
    },
  };
};

/**
 * Combined Schema for Homepage
 */
export const generateHomepageSchema = () => {
  return [
    generateOrganizationSchema(),
    generateSoftwareApplicationSchema(),
    generateWebPageSchema({
      title: "QuizKen - AI Quiz Generator",
      description: "Create engaging quizzes instantly with AI",
      url: "/",
    }),
  ];
};
