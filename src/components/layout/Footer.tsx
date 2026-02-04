import { Button } from "@/components/ui/button";
import { Sparkles, Star, Music, Heart } from "@/lib/icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

const Footer = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profileData } = useProfile(user?.id);
  const isComic = profileData?.equipped_theme === 'theme_comic_manga';

  const scrollToGenerator = () => {
    const el = document.getElementById("generator");
    if (!el) return;
    const headerHeight =
      (document.querySelector("nav") as HTMLElement | null)?.clientHeight ?? 64;
    const yOffset = -(headerHeight + 8); // account for sticky navbar height + margin
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <footer id="footer" className="relative pt-32 pb-12 overflow-hidden">
      {/* Wave Divider */}
      

      {/* Main Content with Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 to-background -z-20"></div>

      {/* Peeking Mascots */}
      <div className="absolute top-10 left-[10%] opacity-20 hidden md:block animate-bounce-slow dark:hidden" style={{ animationDelay: '0s' }}>
        <Star className="w-24 h-24 text-primary rotate-[-12deg]" />
      </div>
      <div className="absolute top-20 right-[15%] opacity-20 hidden md:block animate-bounce-slow dark:hidden" style={{ animationDelay: '1s' }}>
        <Music className="w-20 h-20 text-primary rotate-[12deg]" />
      </div>
      <div className="absolute bottom-32 left-[20%] opacity-10 hidden lg:block animate-bounce-slow dark:hidden" style={{ animationDelay: '0.5s' }}>
        <Heart className="w-16 h-16 text-primary rotate-[6deg]" />
      </div>

      {/* CTA Section */}
      <div className="relative container mx-auto px-4 z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex justify-center p-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full shadow-lg mb-4 animate-bounce-slow">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>

          <div className="space-y-4">
            <h2 className={cn(
              "text-4xl md:text-5xl lg:text-6xl font-bold font-heading",
              isComic 
                ? "text-black drop-shadow-[4px_4px_0px_#FFD700]" 
                : "bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent"
            )}>
              {t('footer.ctaTitle')}
            </h2>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
              {t('footer.ctaSubtitle')}
            </p>
          </div>

          <div className="flex justify-center pt-4 relative group">
            {/* Decorative Arrow (CSS based simple shape or hidden) */}
            <Button
              variant="hero"
              size="xl"
              onClick={scrollToGenerator}
              className={cn(
                "relative z-10 px-10 py-8 text-xl rounded-[2rem] transition-all duration-300 group overflow-visible",
                isComic 
                  ? "bg-yellow-400 border-[6px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 text-black"
                  : "shadow-xl hover:shadow-2xl hover:-translate-y-2 border-[6px] border-white/50 dark:border-slate-700/50 hover:border-white dark:hover:border-slate-600 ring-4 ring-primary/20 hover:ring-primary/40"
              )}
            >
              <span className="mr-3">{t('footer.ctaButton')}</span>
              <div className="bg-primary p-1.5 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-white group-hover:scale-110 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>

              {/* Cute Badge floating on button */}
              <div className="absolute -top-3 -right-3 bg-red-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md transform rotate-12 animate-pulse">
                {t('footer.newBadge', 'New!')}
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Copyright & Made with Love */}
      <div className="relative container mx-auto px-4 mt-24">
        <div className={cn(
          "pt-8 flex flex-col items-center justify-center gap-3",
          isComic ? "border-t-4 border-black" : "border-t-2 border-dashed border-primary/20"
        )}>
          <p className="flex items-center gap-2 text-muted-foreground font-medium">
            <span>{t('footer.madeWith')}</span>
            <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-heart-beat" />
            <span>{t('footer.by')}</span>
          </p>
          <p className="text-sm text-muted-foreground/60">
            {t('footer.copyright', { year: new Date().getFullYear() })} {t('footer.slogan')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
