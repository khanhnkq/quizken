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

const HomeHero = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    const scrollToGenerator = () => {
        const element = document.getElementById("generator");
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Card Data for the "Character" Showcase
    const features = [
        { id: 1, name: "AI Power", role: "Generator", icon: Brain, image: logo, color: "bg-green-500", desc: "Tạo đề thông minh" },
        { id: 2, name: "Speed", role: "Instant", icon: Zap, color: "bg-emerald-500", desc: "Tốc độ ánh sáng" },
        { id: 3, name: "Format", role: "Flexible", icon: Layout, color: "bg-teal-500", desc: "Đa dạng định dạng" },
    ];

    const [activeFeature, setActiveFeature] = useState(features[0]);
    const heroRef = useRef<HTMLElement>(null);

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
        <section ref={heroRef} className="relative min-h-[90vh] md:min-h-screen pt-24 pb-12 overflow-hidden flex items-center bg-slate-50/50 dark:bg-transparent">
            <BackgroundDecorations />
            {/* Background Decoration (Preserved Colors: Blue/Purple/Indigo) - Denser Version */}
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-green-100/40 dark:bg-green-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-50 animate-blob" />
            <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-emerald-100/40 dark:bg-emerald-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-50 animate-blob animation-delay-2000" />
            <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-teal-100/40 dark:bg-teal-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-50 animate-blob animation-delay-4000" />
            <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-lime-100/40 dark:bg-lime-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[60px] opacity-40 animate-blob animation-delay-6000" />

            {/* Floating Icons - Denser Version */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[15%] left-[5%] animate-float hover:scale-110 transition-transform duration-1000">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-3xl shadow-xl border border-white/50 dark:border-slate-700/50 rotate-[-6deg]">
                        <Brain className="w-10 h-10 text-emerald-500" />
                    </div>
                </div>
                <div className="absolute top-[10%] left-[45%] animate-float animation-delay-2000 hover:scale-110 transition-transform duration-1000">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-3xl shadow-xl border border-white/50 dark:border-slate-700/50 rotate-[12deg]">
                        <Sparkles className="w-10 h-10 text-yellow-500" />
                    </div>
                </div>
                <div className="absolute bottom-[20%] left-[8%] animate-float animation-delay-4000 hover:scale-110 transition-transform duration-1000">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-3xl shadow-xl border border-white/50 dark:border-slate-700/50 rotate-[3deg]">
                        <Zap className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="absolute bottom-[25%] right-[25%] animate-float animation-delay-5000 hover:scale-110 transition-transform duration-1000">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-3xl shadow-xl border border-white/50 dark:border-slate-700/50 rotate-[-8deg]">
                        <Lightbulb className="w-8 h-8 text-orange-400" />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* LEFT COLUMN: Text Content */}
                    <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
                        {/* Badge */}
                        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#23c45d]/20 text-[#23c45d] font-bold text-sm shadow-sm mx-auto lg:mx-0 opacity-0">
                            <Sparkles className="w-4 h-4 fill-[#23c45d] text-[#23c45d]" />
                            <span>{t("hero.badgeAI", "AI Quiz Generator")}</span>
                        </div>

                        {/* Title */}
                        <h1 className="hero-title font-heading text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-slate-50 drop-shadow-sm opacity-0">
                            {t("hero.titlePart1", "Create")}{" "}
                            <span className="text-[#23c45d] relative inline-block">
                                {t("hero.titlePart2", "Quizzes")}
                                <svg className="absolute -bottom-2 left-0 w-full h-3 text-yellow-400/80 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                </svg>
                            </span>
                            <br className="hidden md:block" />
                            {t("hero.titlePart3", "with")}{" "}
                            <span className="text-[#23c45d]">{t("hero.titlePart4", "AI")}</span>
                        </h1>

                        {/* Description */}
                        <p className="hero-subtitle text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium opacity-0">
                            {t("hero.subtitle", "Transform any text into a gamified quiz instantly. Perfect for teachers, students, and lifelong learners.")}
                        </p>

                        {/* Buttons */}
                        <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2 opacity-0">
                            <Button
                                size="xl"
                                className="w-full sm:w-auto text-lg px-8 py-7 rounded-[2rem] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 font-black bg-[#23c45d] hover:bg-[#23c45d]/90 border-4 border-white/20"
                                onClick={scrollToGenerator}
                            >
                                {t("hero.createQuizButton", "Create Now")}
                                <div className="bg-white/20 p-2 rounded-full ml-3">
                                    <Zap className="w-5 h-5 text-white fill-white" />
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                size="xl"
                                className="w-full sm:w-auto text-lg px-8 py-7 rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 hover:border-[#23c45d]/30 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#23c45d] font-bold"
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
                                <div key={i} className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/80 px-3 py-1.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                                    <item.icon className="w-4 h-4 text-[#23c45d]" />
                                    {item.text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Character/Card Visual - Hidden on mobile */}
                    <div className="relative order-1 lg:order-2 hidden lg:flex justify-center lg:justify-end h-[500px] lg:h-[600px] items-center">
                        {/* Background Shapes for the 'Character' */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-green-50/50 dark:bg-emerald-900/20 rounded-[3rem] -rotate-6 z-0" />

                        {/* Main Card (The "Character") */}
                        <div className="hero-card relative z-10 w-full max-w-md aspect-[4/5] perspective-1000 opacity-0">
                            <div className="w-full h-full relative preserve-3d transition-transform duration-500 hover:rotate-y-6">
                                {/* The 'Card' Body */}
                                <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border-4 border-white dark:border-slate-800 overflow-hidden flex flex-col">
                                    {/* Illustration Area */}
                                    <div className={`flex-1 ${activeFeature.color} bg-opacity-10 relative flex items-center justify-center p-8 transition-colors duration-500`}>
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

                                        {/* Dynamic Icon/Character */}
                                        {/* @ts-ignore */}
                                        {activeFeature.image ? (
                                            <img
                                                src={activeFeature.image}
                                                alt={activeFeature.name}
                                                className="w-48 h-48 object-contain drop-shadow-2xl animate-float"
                                            />
                                        ) : (
                                            <activeFeature.icon
                                                className={`w-48 h-48 ${activeFeature.color.replace('bg-', 'text-')} drop-shadow-2xl filter transition-all duration-500 animate-float`}
                                                strokeWidth={1.5}
                                            />
                                        )}
                                    </div>

                                    {/* Card Info Area */}
                                    <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{activeFeature.name}</h3>
                                                <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">{activeFeature.role}</p>
                                            </div>
                                            <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 text-xs">
                                                lvl 99
                                            </div>
                                        </div>

                                        <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-6">
                                            {activeFeature.desc}
                                        </p>

                                        {/* Stat Bar Example */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs font-bold text-slate-400">
                                                <span>Power</span>
                                                <span>98/100</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className={`h-full ${activeFeature.color} w-[98%] rounded-full`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating 'Selector' Cards (Like the mini cards in reference) */}
                                <div className="absolute -bottom-6 -left-6 z-20 flex flex-col gap-3">
                                    {features.map((f) => (
                                        <button
                                            key={f.id}
                                            onClick={() => setActiveFeature(f)}
                                            className={cn(
                                                "hero-selector flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 transition-all duration-200 hover:scale-105 text-left w-48 opacity-0",
                                                activeFeature.id === f.id ? "border-green-500 ring-2 ring-green-100 dark:ring-green-900" : "border-white dark:border-slate-700"
                                            )}
                                        >
                                            <div className={`p-2 rounded-xl ${f.color} text-white`}>
                                                <f.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-700 dark:text-slate-200 text-sm">{f.name}</div>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">{f.role}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Floating Badge Top Right */}
                                <div className="hero-floating-badge absolute top-8 -right-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border-2 border-white dark:border-slate-700 animate-float animation-delay-2000 hidden sm:block opacity-0">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
                                            <CheckCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-800 dark:text-slate-100">Verified</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">Best AI Tool</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HomeHero;
