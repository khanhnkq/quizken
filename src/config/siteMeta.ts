export const SITE_NAME = "QuizKen";
export const SITE_URL = "https://quizken.vercel.app";

export const DEFAULT_DESCRIPTION =
  "QuizKen giúp giáo viên và học sinh tạo bài kiểm tra trắc nghiệm với AI trong vài giây.";

export const DEFAULT_OG_IMAGE = "/image/seo.jpg";
export const DEFAULT_LOCALE = "vi_VN";

export const DEFAULT_TWITTER_CARD = "summary_large_image";

export const buildAbsoluteUrl = (path?: string): string => {
  if (!path) {
    return SITE_URL;
  }
  try {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }
    return new URL(path, SITE_URL).toString();
  } catch {
    return SITE_URL;
  }
};
