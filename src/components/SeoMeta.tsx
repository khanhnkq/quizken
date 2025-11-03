import { useEffect } from "react";
import {
  SITE_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_LOCALE,
  DEFAULT_TWITTER_CARD,
  buildAbsoluteUrl,
} from "@/config/siteMeta";

interface OpenGraphConfig {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  type?: string;
  locale?: string;
  siteName?: string;
}

interface TwitterConfig {
  card?: string;
  title?: string;
  description?: string;
  image?: string;
  site?: string;
  creator?: string;
}

interface SeoMetaProps {
  title: string;
  description?: string;
  canonical?: string;
  openGraph?: OpenGraphConfig;
  twitter?: TwitterConfig;
  keywords?: string[];
  noIndex?: boolean;
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

const ensureMetaTag = (
  selector: string,
  attributes: Record<string, string>,
  content: string
) => {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([attr, value]) => {
      element.setAttribute(attr, value);
    });
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
  return element;
};

const ensureLinkTag = (rel: string, href: string) => {
  let element = document.head.querySelector(
    `link[rel='${rel}']`
  ) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
  return element;
};

const asArray = <T,>(value?: T | T[]): T[] => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

export const SeoMeta = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  openGraph,
  twitter,
  keywords,
  noIndex,
  structuredData,
}: SeoMetaProps) => {
  useEffect(() => {
    const cleanupTags: HTMLElement[] = [];

    const pageTitle = `${title} | ${SITE_NAME}`.trim();
    document.title = pageTitle;

    ensureMetaTag("meta[name='description']", { name: "description" }, description);

    if (keywords?.length) {
      ensureMetaTag(
        "meta[name='keywords']",
        { name: "keywords" },
        keywords.join(", ")
      );
    }

    if (typeof noIndex === "boolean") {
      ensureMetaTag(
        "meta[name='robots']",
        { name: "robots" },
        noIndex ? "noindex, nofollow" : "index, follow"
      );
    }

    const canonicalUrl = buildAbsoluteUrl(canonical);
    ensureLinkTag("canonical", canonicalUrl);

    const ogConfig: Required<OpenGraphConfig> = {
      title: openGraph?.title ?? pageTitle,
      description: openGraph?.description ?? description,
      url: buildAbsoluteUrl(openGraph?.url ?? canonicalUrl),
      image: buildAbsoluteUrl(openGraph?.image ?? DEFAULT_OG_IMAGE),
      type: openGraph?.type ?? "website",
      locale: openGraph?.locale ?? DEFAULT_LOCALE,
      siteName: openGraph?.siteName ?? SITE_NAME,
    };

    ensureMetaTag("meta[property='og:title']", { property: "og:title" }, ogConfig.title);
    ensureMetaTag(
      "meta[property='og:description']",
      { property: "og:description" },
      ogConfig.description
    );
    ensureMetaTag("meta[property='og:url']", { property: "og:url" }, ogConfig.url);
    ensureMetaTag("meta[property='og:type']", { property: "og:type" }, ogConfig.type);
    
    // PRIMARY og:image - EXPLICITLY REQUIRED
    ensureMetaTag("meta[property='og:image']", { property: "og:image" }, ogConfig.image);
    
    // SECONDARY og:image attributes for clarity
    ensureMetaTag(
      "meta[property='og:image:secure_url']",
      { property: "og:image:secure_url" },
      ogConfig.image
    );
    ensureMetaTag(
      "meta[property='og:image:type']",
      { property: "og:image:type" },
      "image/jpeg"
    );
    ensureMetaTag(
      "meta[property='og:image:width']",
      { property: "og:image:width" },
      "1200"
    );
    ensureMetaTag(
      "meta[property='og:image:height']",
      { property: "og:image:height" },
      "630"
    );
    ensureMetaTag(
      "meta[property='og:image:alt']",
      { property: "og:image:alt" },
      ogConfig.title
    );
    
    ensureMetaTag("meta[property='og:locale']", { property: "og:locale" }, ogConfig.locale);
    ensureMetaTag(
      "meta[property='og:site_name']",
      { property: "og:site_name" },
      ogConfig.siteName
    );

    const twitterConfig: Required<TwitterConfig> = {
      card: twitter?.card ?? DEFAULT_TWITTER_CARD,
      title: twitter?.title ?? pageTitle,
      description: twitter?.description ?? description,
      image: buildAbsoluteUrl(twitter?.image ?? ogConfig.image),
      site: twitter?.site ?? `@${SITE_NAME}`,
      creator: twitter?.creator ?? `@${SITE_NAME}`,
    };

    ensureMetaTag(
      "meta[name='twitter:card']",
      { name: "twitter:card" },
      twitterConfig.card
    );
    ensureMetaTag(
      "meta[name='twitter:title']",
      { name: "twitter:title" },
      twitterConfig.title
    );
    ensureMetaTag(
      "meta[name='twitter:description']",
      { name: "twitter:description" },
      twitterConfig.description
    );
    ensureMetaTag(
      "meta[name='twitter:image']",
      { name: "twitter:image" },
      twitterConfig.image
    );
    ensureMetaTag("meta[name='twitter:site']", { name: "twitter:site" }, twitterConfig.site);
    ensureMetaTag(
      "meta[name='twitter:creator']",
      { name: "twitter:creator" },
      twitterConfig.creator
    );

    const schemas = asArray(structuredData);
    schemas.forEach((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-meta", "structured-data");
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
      cleanupTags.push(script);
    });

    return () => {
      cleanupTags.forEach((tag) => {
        tag.remove();
      });
    };
  }, [
    title,
    description,
    canonical,
    JSON.stringify(openGraph),
    JSON.stringify(twitter),
    keywords?.join(","),
    noIndex,
    JSON.stringify(structuredData),
  ]);

  return null;
};

export default SeoMeta;
