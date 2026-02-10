import { Button } from "@/components/ui/button";
import { Sparkles, Brain, Zap, Layout, FileText, CheckCircle, Play, Lightbulb } from "lucide-react";
import logo from "@/assets/logo/logo.png";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { BackgroundDecorations } from "@/components/ui/BackgroundDecorations";

import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/useProfile";
import { VietnamFlagIcon } from "@/components/icons/VietnamFlagIcon";
import { VietnamMapIcon, VietnamStarIcon, VietnamDrumIcon, VietnamLotusIcon } from "@/components/icons/VietnamIcons";
import { NeonBoltIcon, NeonCyberSkullIcon, PastelCloudIcon, PastelHeartIcon, ComicPowIcon, ComicBoomIcon } from "@/components/icons/ThemeIcons";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const HomeHero = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const { user } = useAuth();
    const { profileData } = useProfile(user?.id);
    const theme = profileData?.equipped_theme;
    
    // Fetch detailed item config (like video_url) from DB
    const { data: themeItem } = useQuery({
        queryKey: ['themeItem', theme],
        queryFn: async () => {
             if (!theme) return null;
             // @ts-ignore
             const { data } = await supabase.from('items').select('video_url').eq('id', theme).single();
             return data;
        },
        enabled: !!theme
    });

    const getThemeAssets = () => {
        let assets: any = { active: false, floating: [] };

        // 1. Static Configuration for Badges/Mascots
        switch (theme) {
            case 'theme_vietnam_spirit':
                assets = {
                    active: true,
                    mascot: VietnamFlagIcon,
                    mascotClass: "w-56 h-auto drop-shadow-2xl filter transition-all duration-500 hover:scale-105",
                    badgeText: t("themes.vietnam_spirit.badge", "Tự hào Việt Nam"),
                    badgeClass: "bg-gradient-to-r from-red-600 to-yellow-500 text-white border-yellow-400 font-bold",
                    badgeIcon: VietnamStarIcon,
                    floating: [
                        { Icon: VietnamStarIcon, color: "text-yellow-500", bg: "bg-card border-yellow-400", rotate: "-6deg" },
                        { Icon: VietnamDrumIcon, color: "text-primary", bg: "bg-card border-primary", rotate: "12deg" },
                        { Icon: VietnamLotusIcon, color: "text-pink-500", bg: "bg-white/90 border-pink-400", rotate: "-10deg", pos: "bottom-[20%] left-[10%]" },
                        { Icon: VietnamMapIcon, color: "text-red-600", bg: "bg-yellow-100/90 border-yellow-500", rotate: "5deg", pos: "top-[40%] right-[10%]" }
                    ],
                    header: {
                        title: (
                            <>
                                {t("themes.vietnam_spirit.title1", "Hào Khí")} <span className="text-red-600">{t("themes.vietnam_spirit.title1Highlight", "Việt Nam")}</span>
                                <br />
                                {t("themes.vietnam_spirit.title2", "Bản Sắc")} <span className="text-yellow-500">{t("themes.vietnam_spirit.title2Highlight", "Dân Tộc")}</span>
                            </>
                        ),
                        subtitle: t("themes.vietnam_spirit.subtitle", "Tự hào văn hóa Việt với giao diện mang đậm hồn thiêng sông núi. Khám phá ngay!")
                    }
                };
                break;
            case 'theme_neon_night':
                assets = {
                    active: true,
                    mascot: NeonCyberSkullIcon,
                    mascotClass: "w-48 h-48 drop-shadow-[0_0_15px_rgba(0,255,255,0.5)] animate-pulse",
                    badgeText: t("themes.neon_night.badge", "CYBERPUNK 2077"),
                    badgeClass: "bg-black text-cyan-400 border-cyan-500 border shadow-[0_0_10px_#0ff] font-mono",
                    badgeIcon: NeonBoltIcon,
                    floating: [
                         { Icon: NeonBoltIcon, color: "text-yellow-400", bg: "bg-black/80 border-yellow-400", rotate: "-12deg" },
                         { Icon: NeonBoltIcon, color: "text-cyan-400", bg: "bg-black/80 border-cyan-400", rotate: "10deg" }
                    ],
                    header: {
                        title: (
                            <>
                                {t("themes.neon_night.title1", "NEON")} <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">{t("themes.neon_night.title1Highlight", "NIGHT")}</span>
                                <br />
                                {t("themes.neon_night.title2", "FUTURE")} <span className="text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">{t("themes.neon_night.title2Highlight", "VIBES")}</span>
                            </>
                        ),
                        subtitle: t("themes.neon_night.subtitle", "Hòa mình vào ánh đèn Neon rực rỡ và nhịp điệu sôi động của thành phố tương lai.")
                    }
                };
                break;
            case 'theme_pastel_dream':
                assets = {
                    active: true,
                    mascot: PastelHeartIcon,
                    mascotClass: "w-48 h-48 text-pink-300 drop-shadow-xl animate-bounce-slow",
                    badgeText: t("themes.pastel_dream.badge", "Sweet Dreams"),
                    badgeClass: "bg-white text-pink-400 border-blue-200 font-serif italic",
                    badgeIcon: PastelCloudIcon,
                    floating: [
                         { Icon: PastelCloudIcon, color: "text-blue-300", bg: "bg-white border-blue-200", rotate: "5deg" },
                         { Icon: PastelHeartIcon, color: "text-pink-300", bg: "bg-white border-pink-200", rotate: "-5deg" }
                    ],
                    header: {
                        title: (
                            <>
                                {t("themes.pastel_dream.title1", "Pastel")} <span className="text-pink-300">{t("themes.pastel_dream.title1Highlight", "Dream")}</span>
                                <br />
                                {t("themes.pastel_dream.title2", "Soft")} <span className="text-blue-300">{t("themes.pastel_dream.title2Highlight", "World")}</span>
                            </>
                        ),
                        subtitle: t("themes.pastel_dream.subtitle", "Thế giới mộng mơ với những gam màu pastel nhẹ nhàng, mang lại cảm giác thư thái.")
                    }
                };
                break;
             case 'theme_comic_manga':
                assets = {
                    active: true,
                    mascot: ComicBoomIcon,
                    mascotClass: "w-56 h-auto drop-shadow-xl scale-110",
                    badgeText: t("themes.comic_manga.badge", "COMIC MODE"),
                    badgeClass: "bg-yellow-400 text-black border-black border-4 font-black italic",
                    badgeIcon: ComicPowIcon,
                    floating: [
                         { Icon: ComicPowIcon, color: "text-red-500", bg: "bg-white border-black border-2", rotate: "-15deg" },
                         { Icon: ComicBoomIcon, color: "text-blue-500", bg: "bg-white border-black border-2", rotate: "15deg" }
                    ],
                    header: {
                        title: (
                            <>
                                {t("themes.comic_manga.title1", "COMIC")} <span className="text-yellow-500 outline-text-black">{t("themes.comic_manga.title1Highlight", "BOOM!")}</span>
                                <br />
                                {t("themes.comic_manga.title2", "HERO")} <span className="text-red-500 outline-text-black">{t("themes.comic_manga.title2Highlight", "TIME")}</span>
                            </>
                        ),
                        subtitle: t("themes.comic_manga.subtitle", "Phong cách truyện tranh đầy năng lượng! Biến việc học thành cuộc phiêu lưu thú vị.")
                    }
                };
                break;
             case 'theme_jujutsu_kaisen':
                assets = {
                    active: true,
                    badgeText: t("themes.jujutsu_kaisen.badge", "Vô Lượng Hạn"), 
                    badgeClass: "bg-neutral-900 text-white border-purple-900 border-2 font-black shadow-[0_0_20px_rgba(147,51,234,0.5)]",
                    badgeIcon: Sparkles,
                    floating: [
                        { Icon: Sparkles, color: "text-purple-500", bg: "bg-black/90 border-purple-600", rotate: "-10deg" },
                        { Icon: Zap, color: "text-red-500", bg: "bg-black/90 border-red-600", rotate: "15deg" }
                    ],
                    header: {
                        title: (
                            <>
                                {t("themes.jujutsu_kaisen.title1", "Domain")} <span className="text-purple-600 drop-shadow-[0_0_15px_rgba(147,51,234,0.8)]">{t("themes.jujutsu_kaisen.title1Highlight", "Expansion")}</span>
                                <br />
                                {t("themes.jujutsu_kaisen.title2", "Infinite")} <span className="text-red-600">{t("themes.jujutsu_kaisen.title2Highlight", "Void")}</span>
                            </>
                        ),
                        subtitle: t("themes.jujutsu_kaisen.subtitle", "Khai mở lãnh địa tri thức. Thống trị mọi kỳ thi với sức mạnh chú thuật sư.")
                    }
                };
                break;
        }

        // 2. Dynamic Overrides from DB (Video URL)
        if (themeItem?.video_url) {
            assets.active = true;
            assets.videoMode = true;
            assets.videoUrl = themeItem.video_url;
            
            // Default Badge if not set by switch case
            if (!assets.badgeText) {
                assets.badgeText = "Premium Theme";
                assets.badgeClass = "bg-primary/20 text-primary border-primary backdrop-blur-md";
                assets.badgeIcon = Sparkles;
                assets.floating = [];
                // Default Header for video themes if not matched
                assets.header = {
                    title: <>Premium <span className="text-primary">Theme</span></>,
                    subtitle: "Trải nghiệm giao diện động chất lượng cao."
                };
            }
        }

        return assets;
    };

    const themeAssets = getThemeAssets();

    const scrollToGenerator = () => {
        const element = document.getElementById("generator");
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Card Data using Theme Classes instead of hardcoded tailwind colors
    const features = [
        { id: 1, name: "AI Power", role: "Generator", icon: Brain, image: logo, color: "bg-primary/20 text-primary", desc: "Tạo đề thông minh" },
        { id: 2, name: "Speed", role: "Instant", icon: Zap, color: "bg-secondary/20 text-secondary-foreground", desc: "Tốc độ ánh sáng" },
        { id: 3, name: "Format", role: "Flexible", icon: Layout, color: "bg-accent/20 text-accent-foreground", desc: "Đa dạng định dạng" },
    ];

    const [activeFeature, setActiveFeature] = useState(features[0]);
    const heroRef = useRef<HTMLElement>(null);

    // Dynamic Background Colors
    const bgColors = {
        blob1: "bg-primary/20",
        blob2: "bg-secondary/20",
        blob3: "bg-accent/20"
    };

    // Entrance animations
    useEffect(() => {
        if (!heroRef.current) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            // Staggered entrance for left column elements
            tl.fromTo(".hero-badge",
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.6 }
            )
                .fromTo(".hero-title",
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: 0.7 },
                    "-=0.3"
                )
                .fromTo(".hero-subtitle",
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    "-=0.4"
                )
                .fromTo(".hero-buttons",
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    "-=0.3"
                )
                .fromTo(".hero-tags",
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.2"
                )
                // Card column (desktop only)
                .fromTo(".hero-card",
                    { opacity: 0, x: 60, rotateY: -10 },
                    { opacity: 1, x: 0, rotateY: 0, duration: 0.8 },
                    "-=0.6"
                )
                .fromTo(".hero-selector",
                    { opacity: 0, x: -30 },
                    { opacity: 1, x: 0, duration: 0.5, stagger: 0.1 },
                    "-=0.4"
                )
                .fromTo(".hero-floating-badge",
                    { opacity: 0, scale: 0.8 },
                    { opacity: 1, scale: 1, duration: 0.5 },
                    "-=0.3"
                );
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={heroRef} className="relative min-h-[90vh] md:min-h-screen pt-24 pb-12 overflow-hidden flex items-center bg-background">
            <BackgroundDecorations />
            {/* Background Decoration - Generalized colors */}
            <div className={`absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-blob ${bgColors.blob1}`} />
            <div className={`absolute top-[20%] left-[-10%] w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-blob animation-delay-2000 ${bgColors.blob2}`} />
            <div className={`absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] rounded-full mix-blend-screen filter blur-[80px] opacity-40 animate-blob animation-delay-4000 ${bgColors.blob3}`} />
            
            {/* Floating Icons */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
                {themeAssets.active ? (
                    // Theme Specific Floating Icons
                    <>
                        {/* Position 1: Generally Top Left */}
                        <div className="absolute top-[15%] left-[5%] animate-float hover:scale-110 transition-transform duration-1000">
                             {themeAssets.floating[0]?.Icon && (
                                <div className={`backdrop-blur-sm p-3 rounded-2xl shadow-xl border-2 rotate-[-6deg] ${themeAssets.floating[0].bg}`}>
                                    {(() => {
                                        const Icon = themeAssets.floating[0].Icon;
                                        return <Icon className={`w-10 h-10 ${themeAssets.floating[0].color}`} />;
                                    })()}
                                </div>
                             )}
                        </div>

                         {/* Position 2: Generally Top Center-Left */}
                        <div className="absolute top-[10%] left-[45%] animate-float animation-delay-2000 hover:scale-110 transition-transform duration-1000">
                             {themeAssets.floating[1]?.Icon && (
                                <div className={`backdrop-blur-sm p-3 rounded-2xl shadow-xl border-2 rotate-[12deg] ${themeAssets.floating[1].bg}`}>
                                     {(() => {
                                        const Icon = themeAssets.floating[1].Icon;
                                        return <Icon className={`w-12 h-12 ${themeAssets.floating[1].color}`} />;
                                    })()}
                                </div>
                             )}
                        </div>

                         {/* Extra Positions from Config */}
                         {themeAssets.floating.slice(2).map((iconConfig, idx) => (
                             <div key={idx} className={`absolute animate-float hover:scale-110 transition-transform duration-1000 ${iconConfig.pos || "top-1/2 left-1/2"}`} style={{ animationDelay: `${(idx + 3) * 1000}ms` }}>
                                <div 
                                    className={`backdrop-blur-sm p-3 rounded-2xl shadow-xl border-2 ${iconConfig.bg}`}
                                    style={{ transform: `rotate(${iconConfig.rotate})` }}
                                >
                                    <iconConfig.Icon className={`w-10 h-10 ${iconConfig.color}`} />
                                </div>
                             </div>
                         ))}
                    </>
                ) : (
                    // Default Floating Icons
                    <>
                        <div className="absolute top-[15%] left-[5%] animate-float hover:scale-110 transition-transform duration-1000">
                            <div className="bg-card backdrop-blur-sm p-4 rounded-3xl shadow-xl border border-border rotate-[-6deg]">
                                <Brain className="w-10 h-10 text-primary" />
                            </div>
                        </div>
                        <div className="absolute top-[10%] left-[45%] animate-float animation-delay-2000 hover:scale-110 transition-transform duration-1000">
                             <div className="bg-card backdrop-blur-sm p-4 rounded-3xl shadow-xl border border-border rotate-[12deg]">
                                <Sparkles className="w-10 h-10 text-accent-foreground" />
                            </div>
                        </div>
                    </>
                )}
                {/* ... other floating icons converted similarly ... */}
            </div>

            <div className="container mx-auto px-4 z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* LEFT COLUMN: Text Content */}
                    <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
                        {/* Badge */}
                        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm shadow-sm mx-auto lg:mx-0 opacity-0">
                            <Sparkles className="w-4 h-4 fill-primary text-primary" />
                            <span>{t("hero.badgeAI", "AI Quiz Generator")}</span>
                        </div>

                        {/* Title */}
                        <h1 className="hero-title font-heading text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black tracking-tight leading-[1.1] text-foreground drop-shadow-sm opacity-0">
                            {themeAssets.header ? (
                                themeAssets.header.title
                            ) : (
                                <>
                                    {t("hero.titlePart1", "Create")}{" "}
                                    <span className="text-primary relative inline-block">
                                        {t("hero.titlePart2", "Quizzes")}
                                        <svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                        </svg>
                                    </span>
                                    <br className="hidden md:block" />
                                    {t("hero.titlePart3", "with")}{" "}
                                    <span className="text-primary">{t("hero.titlePart4", "AI")}</span>
                                </>
                            )}
                        </h1>

                        {/* Description */}
                        <p className="hero-subtitle text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium opacity-0">
                            {themeAssets.header ? (
                                themeAssets.header.subtitle
                            ) : (
                                t("hero.subtitle", "Transform any text into a gamified quiz instantly. Perfect for teachers, students, and lifelong learners.")
                            )}
                        </p>

                        {/* Buttons */}
                        <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2 opacity-0">
                            <Button
                                size="xl"
                                className="w-full sm:w-auto text-lg px-8 py-7 rounded-[2rem] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 font-black bg-primary text-primary-foreground hover:bg-primary/90 border-4 border-white/20"
                                onClick={scrollToGenerator}
                            >
                                {t("hero.createQuizButton", "Create Now")}
                                <div className="bg-white/20 p-2 rounded-full ml-3">
                                    <Zap className="w-5 h-5 text-current fill-current" />
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                size="xl"
                                className="w-full sm:w-auto text-lg px-8 py-7 rounded-[2rem] border-2 font-bold transition-all border-border hover:border-primary/50 hover:bg-card text-foreground hover:text-primary"
                                onClick={() => navigate("/quiz/library")}
                            >
                                {t("hero.viewExamplesButton", "See Examples")}
                                <Play className="w-5 h-5 ml-2 fill-current" />
                            </Button>
                        </div>

                        {/* Feature Tags/Mini-list */}
                        <div className="hero-tags pt-8 flex flex-wrap justify-center lg:justify-start gap-4 opacity-0">
                            {[
                                { icon: CheckCircle, text: "Free to use" },
                                { icon: CheckCircle, text: "Export PDF" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm font-bold text-muted-foreground bg-card px-3 py-1.5 rounded-full shadow-sm border border-border">
                                    <item.icon className="w-4 h-4 text-primary" />
                                    {item.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Character/Card Visual - Hidden on mobile */}
                    <div className="relative order-1 lg:order-2 hidden lg:flex justify-center lg:justify-end h-[500px] lg:h-[600px] items-center">
                        {/* Background Shapes for the 'Character' - Hidden in Video Mode */}
                        {!themeAssets.videoMode && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-[3rem] -rotate-6 z-0" />
                        )}

                        {/* Main Card (The "Character") */}
                        <div className="hero-card relative z-10 w-full max-w-md aspect-[4/5] perspective-1000 opacity-0 rounded-[3rem]">
                            {themeAssets.active && (
                                <div className="absolute -top-16 left-0 right-0 z-30 flex justify-center animate-bounce-slow">
                                     <span className={`${themeAssets.badgeClass} px-6 py-3 rounded-2xl shadow-xl border-4 text-base sm:text-lg uppercase tracking-widest transform -rotate-3 inline-flex items-center gap-2 whitespace-nowrap`}>
                                        {themeAssets.badgeIcon && <themeAssets.badgeIcon className="w-5 h-5"/>}
                                        {themeAssets.badgeText}
                                        {themeAssets.badgeIcon && <themeAssets.badgeIcon className="w-5 h-5"/>}
                                    </span>
                                </div>
                            )}
                            <div className="w-full h-full relative preserve-3d transition-transform duration-500 hover:rotate-y-6">
                                {/* The 'Card' Body */}
                                <div className={cn(
                                    "absolute inset-0 rounded-[3rem] overflow-hidden flex flex-col",
                                    themeAssets.videoMode ? "bg-black border-0" : "bg-card shadow-2xl border-4 border-card"
                                )}>
                                    
                                    {/* VIDEO MODE: Replaces entire card content */}
                                    {/* @ts-ignore */}
                                    {themeAssets.active && themeAssets.videoMode ? (
                                        <div className="absolute inset-0 z-10 w-full h-full bg-black">
                                            <video 
                                                autoPlay 
                                                loop 
                                                muted 
                                                playsInline
                                                className="w-full h-full object-cover opacity-90"
                                                src={themeAssets.videoUrl || "https://res.cloudinary.com/demo/video/upload/v1/dog.mp4"} 
                                            />
                                            {/* Generic Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                            
                                            {/* Dynamic Video Overlay Content */}
                                            <div className="absolute bottom-8 left-8 right-8 text-white z-20">
                                                <h3 className="text-4xl font-black tracking-tighter mb-2 text-primary drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] uppercase">
                                                    {themeAssets.badgeText || "HERO MODE"}
                                                </h3>
                                            </div>
                                        </div>
                                    ) : (
                                        /* STANDARD MODE */
                                        <>
                                            {/* Illustration Area */}
                                            <div className={`flex-1 ${activeFeature.color} relative flex items-center justify-center p-8 transition-colors duration-500`}>
                                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(https://www.transparenttextures.com/patterns/cubes.png)' }} />

                                                {/* Dynamic Icon/Character */}
                                                {/* @ts-ignore */}
                                                {themeAssets.active && themeAssets.mascot ? (
                                                    <div className="animate-float">
                                                        <themeAssets.mascot className={themeAssets.mascotClass} />
                                                    </div>
                                                ) : (
                                                    activeFeature.image ? (
                                                        <img
                                                            src={activeFeature.image}
                                                            alt={activeFeature.name}
                                                            className="w-48 h-48 object-contain drop-shadow-2xl animate-float"
                                                        />
                                                    ) : (
                                                        <activeFeature.icon
                                                            className="w-48 h-48 drop-shadow-2xl filter transition-all duration-500 animate-float"
                                                            strokeWidth={1.5}
                                                        />
                                                    )
                                                )}
                                            </div>

                                            {/* Card Info Area */}
                                            <div className="p-6 bg-card/80 backdrop-blur-md relative z-10">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-3xl font-black text-foreground tracking-tight">{activeFeature.name}</h3>
                                                        <p className="text-muted-foreground font-bold text-sm uppercase tracking-wider">{activeFeature.role}</p>
                                                    </div>
                                                    <div className="px-3 py-1 rounded-full bg-secondary font-bold text-secondary-foreground text-xs">
                                                        lvl 99
                                                    </div>
                                                </div>

                                                <p className="text-muted-foreground font-medium leading-relaxed mb-6">
                                                    {activeFeature.desc}
                                                </p>

                                                {/* Stat Bar Example */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs font-bold text-muted-foreground">
                                                        <span>Power</span>
                                                        <span>98/100</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary w-[98%] rounded-full" />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Floating 'Selector' Cards - Hidden when any Theme is Active */}
                                {!themeAssets.active && (
                                    <div className="absolute -bottom-6 -left-6 z-20 flex flex-col gap-3">
                                        {features.map((f) => (
                                            <button
                                                key={f.id}
                                                onClick={() => setActiveFeature(f)}
                                                className={cn(
                                                    "hero-selector flex items-center gap-3 p-3 bg-card rounded-2xl shadow-lg border-2 transition-all duration-200 hover:scale-105 text-left w-48 opacity-0",
                                                    activeFeature.id === f.id ? "border-primary ring-2 ring-primary/20" : "border-border"
                                                )}
                                            >
                                                <div className={`p-2 rounded-xl ${f.color}`}>
                                                    <f.icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-foreground text-sm">{f.name}</div>
                                                    <div className="text-[10px] text-muted-foreground font-bold uppercase">{f.role}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Floating Badge Top Right - Hidden when any Theme is Active */}
                                {!themeAssets.active && (
                                    <div className="hero-floating-badge absolute top-8 -right-8 bg-card p-4 rounded-2xl shadow-xl border-2 border-border animate-float animation-delay-2000 hidden sm:block opacity-0">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-primary/10 p-2 rounded-full text-primary">
                                                <CheckCircle className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="font-black text-foreground">Verified</div>
                                                <div className="text-xs text-muted-foreground font-bold">Best AI Tool</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HomeHero;
