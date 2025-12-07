import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";

import {
  Sparkles,
  Target,
  CheckCircle,
  Zap,
  Users,
  MousePointer,
  Heart,
  ArrowDown,
} from "@/lib/icons";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import logo from "@/assets/logo/logo.png";
import { useEffect, useState, useRef, type MouseEvent } from "react";
import { gsap } from "gsap";
import { useTranslation } from "react-i18next";

type Cta = {
  label: string;
  onClick?: () => void;
  to?: string;
  external?: boolean;
  variant?: "default" | "outline";
};

export const AboutHero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handlePrimary = () => {
    window.dispatchEvent(
      new CustomEvent("analytics", {
        detail: { event: "hero_cta_start_generator" },
      })
    );
    navigate("/", { state: { scrollToQuiz: true } });
  };

  const handleHoverEnter = (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget as HTMLButtonElement;
    gsap.to(target, {
      y: -2,
      scale: 1.04,
      boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
      duration: 0.18,
      ease: "power3.out",
    });
  };

  const handleHoverLeave = (e: MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget as HTMLButtonElement;
    gsap.to(target, {
      y: 0,
      scale: 1,
      boxShadow: "0 0 0 rgba(0,0,0,0)",
      duration: 0.22,
      ease: "power3.inOut",
    });
  };

  return (
    <section className="relative overflow-hidden bg-transparent min-h-[85vh] pt-16 pb-24 px-4 flex items-center justify-center">
      {/* Animated Background Blobs - Matched with Main Hero */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-orange-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Icons */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none -z-0">
        <div className="absolute top-[15%] left-[10%] animate-float hover:scale-110 transition-transform duration-1000">
          <div className="bg-white p-4 rounded-2xl shadow-xl border border-border/50 rotate-[-8deg]">
            <span className="text-4xl">👋</span>
          </div>
        </div>
        <div className="absolute top-[25%] right-[10%] animate-float animation-delay-2000 hover:scale-110 transition-transform duration-1000">
          <div className="bg-white p-4 rounded-2xl shadow-xl border border-border/50 rotate-[12deg]">
            <span className="text-4xl">💻</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl relative z-10 text-center space-y-10 -translate-y-12">
        {/* Avatar Badge */}
        <div className="relative inline-block animate-fade-in group cursor-pointer">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-primary/20 transform transition duration-500 hover:scale-105">
            <img
              src={logo}
              alt="Khánh"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 right-2 bg-white px-3 py-1 rounded-full shadow-lg border border-border text-xs font-bold animate-bounce">
            {t('about.hero.meow')}
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-foreground drop-shadow-sm">
            {t('about.hero.greeting')}<br className="hidden md:block" />{" "}
            <span className="text-primary relative inline-block mt-2 md:mt-0">
              {t('about.hero.name')}
              <svg className="absolute -bottom-2 left-0 w-full h-4 text-primary -z-10 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="12" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
            {t('about.hero.description1')} <span className="font-bold text-foreground">{t('about.hero.quizken')}</span> {t('about.hero.description2')}{" "}
            <span className="inline-block px-2 py-1 rounded-lg bg-orange-100 text-orange-700 -rotate-2 transform hover:rotate-0 transition-transform">{t('about.hero.moreFun')}</span>,{" "}
            <span className="inline-block px-2 py-1 rounded-lg bg-blue-100 text-blue-700 rotate-1 transform hover:rotate-0 transition-transform">{t('about.hero.easier')}</span> &{" "}
            <span className="inline-block px-2 py-1 rounded-lg bg-green-100 text-green-700 -rotate-1 transform hover:rotate-0 transition-transform">{t('about.hero.moreEffective')}</span>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
          <Button
            variant="hero"
            size="xl"
            className="group text-lg px-8 py-6 rounded-3xl shadow-xl border-4 border-primary hover:border-primary-foreground/50 active:scale-95 transition-all duration-200 font-heading bg-primary text-white w-full sm:w-auto h-auto"
            onClick={handlePrimary}
            onMouseEnter={handleHoverEnter}
            onMouseLeave={handleHoverLeave}>
            {t('about.hero.primaryCta')}
            <div className="bg-white/20 p-1.5 rounded-xl ml-3 group-hover:rotate-12 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </Button>

          <Link to="/quiz/library" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="xl"
              className="text-lg px-8 py-6 rounded-3xl border-4 border-border hover:border-primary/50 hover:bg-secondary hover:text-secondary-foreground active:scale-95 transition-all duration-200 font-heading w-full h-auto"
            >
              {t('about.hero.secondaryCta')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
        <ArrowDown className="w-10 h-10 text-primary drop-shadow-md" />
      </div>
    </section>
  );
};

export const AboutMissionVision = () => {
  const { t } = useTranslation();
  return (
    <section className="py-24 px-4 bg-transparent relative overflow-hidden">
      <div className="container mx-auto max-w-5xl">

        {/* Section Header - Chapter Title Style */}
        <div className="flex items-center justify-center mb-16 relative">
          <div className="bg-white border-4 border-black px-8 py-4 shadow-[8px_8px_0px_#000] transform -rotate-2 relative z-10 transition-transform hover:rotate-0 duration-300">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
              {t('about.missionVision.title')} <span className="text-primary text-4xl md:text-6xl">!?</span>
            </h2>
          </div>
          {/* Decorative Ink Splat or Shape */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-24 bg-yellow-300 -rotate-3 -z-0 opacity-80 mix-blend-multiply rounded-full blur-xl" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">

          {/* PANEL 1: MISSION (Action Style) */}
          <div className="group relative">
            <div className="absolute inset-0 bg-black rounded-xl translate-x-4 translate-y-4 transition-transform group-hover:translate-x-3 group-hover:translate-y-3" />
            <div className="relative h-full bg-white border-4 border-black rounded-xl p-8 overflow-hidden hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-200">

              {/* Manga Background: Speed Lines */}
              <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 49px, #000 50px)' }}></div>
              <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at center, white 30%, transparent 100%)' }}></div>

              <div className="relative z-10 flex flex-col h-full">
                {/* Panel Header */}
                <div className="flex items-start justify-between mb-8">
                  <div className="bg-black text-white px-4 py-1 text-xl font-black uppercase italic -rotate-2 inline-block shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
                    {t('about.missionVision.missionStart')}
                  </div>
                  <div className="text-5xl animate-bounce">🎯</div>
                </div>

                <h3 className="text-2xl md:text-3xl font-black uppercase mb-6 leading-none drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                  {t('about.missionVision.missionTitle1')} <br /><span className="text-red-500 text-3xl md:text-4xl">{t('about.missionVision.missionTitle2')}</span>
                </h3>

                <div className="space-y-4 flex-1">
                  {/* Comic Strip Items */}
                  <div className="flex items-center gap-4 border-b-2 border-black/10 pb-4 group/item hover:bg-yellow-50 transition-colors p-2 rounded-lg">
                    <span className="text-2xl font-black text-gray-200 group-hover/item:text-black transition-colors">01</span>
                    <p className="text-base font-bold text-gray-800">
                      {t('about.missionVision.mission1')} <span className="bg-yellow-300 px-1 border border-black transform inline-block -rotate-1">{t('about.missionVision.mission1Highlight')}</span>!
                    </p>
                  </div>
                  <div className="flex items-center gap-4 border-b-2 border-black/10 pb-4 group/item hover:bg-blue-50 transition-colors p-2 rounded-lg">
                    <span className="text-2xl font-black text-gray-200 group-hover/item:text-black transition-colors">02</span>
                    <p className="text-base font-bold text-gray-800">
                      {t('about.missionVision.mission2Part1')} <span className="text-blue-600 underline decoration-wavy">{t('about.missionVision.mission2Highlight')}</span> {t('about.missionVision.mission2Part2')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 group/item hover:bg-green-50 transition-colors p-2 rounded-lg">
                    <span className="text-2xl font-black text-gray-200 group-hover/item:text-black transition-colors">03</span>
                    <p className="text-base font-bold text-gray-800">
                      {t('about.missionVision.mission3')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PANEL 2: VISION (Dreamy/Future Style) */}
          <div className="group relative mt-12 lg:mt-0">
            <div className="absolute inset-0 bg-black rounded-xl translate-x-4 translate-y-4 transition-transform group-hover:translate-x-3 group-hover:translate-y-3" />
            <div className="relative h-full bg-white border-4 border-black rounded-xl p-8 overflow-hidden hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-200">

              {/* Manga Background: Halftone Dots */}
              <div className="absolute inset-0 opacity-15 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}></div>

              {/* Dream Cloud Shape Overlay */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50"></div>

              <div className="relative z-10 flex flex-col h-full">
                {/* Panel Header */}
                <div className="flex items-start justify-between mb-8">
                  <div className="text-5xl animate-pulse delay-700">✨</div>
                  <div className="bg-white border-2 border-black text-black px-4 py-1 text-xl font-black uppercase italic rotate-2 inline-block shadow-[4px_4px_0px_#000]">
                    {t('about.missionVision.futureSight')}
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl font-black uppercase mb-6 leading-none text-right">
                  {t('about.missionVision.visionTitle1')} <br /><span className="text-blue-500 text-3xl md:text-4xl">{t('about.missionVision.visionTitle2')}</span>
                </h3>

                <div className="flex-1 flex flex-col justify-end text-right">
                  {/* Thought Bubble Style */}
                  <div className="relative bg-gray-100 border-2 border-black p-6 rounded-2xl rounded-tr-none shadow-[4px_4px_0px_#ccc] transform hover:scale-105 transition-transform">
                    <p
                      className="text-lg font-bold italic text-gray-800 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: t('about.missionVision.visionQuote').replace(
                          t('about.missionVision.visionHighlight'),
                          `<span class="text-purple-600 font-black">${t('about.missionVision.visionHighlight')}</span>`
                        )
                      }}
                    />
                    <div className="mt-2 text-2xl font-black text-black uppercase transform -rotate-1 inline-block bg-yellow-300 px-2 mt-4 border border-black">
                      {t('about.missionVision.visionCta')} 🏆
                    </div>

                    {/* Bubble Tail */}
                    <div className="absolute -top-3 right-0 w-6 h-6 bg-gray-100 border-l-2 border-t-2 border-black transform rotate-45"></div>
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

export const AboutStory = () => {
  const { t } = useTranslation();
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = window.document.getElementById("story-scroll-area");

  // Script Data
  const storySteps = [
    {
      options: [{ label: t('about.story.opt_hello'), reply: t('about.story.welcome') }]
    },
    {
      options: [{ label: t('about.story.q1'), reply: [t('about.story.a1_p1'), t('about.story.a1_p2')] }]
    },
    {
      options: [{ label: t('about.story.q2'), reply: [t('about.story.a2_p1'), t('about.story.a2_p2')] }]
    },
    {
      options: [{ label: t('about.story.q3'), reply: [t('about.story.a3_p1'), t('about.story.a3_p2')] }]
    },
    {
      options: [{ label: t('about.story.q4'), reply: [t('about.story.a4_p1'), t('about.story.a4_p2')] }]
    },
    {
      options: [{ label: t('about.story.opt_bye'), reply: t('about.story.reply_bye') }]
    }
  ];

  const initialMessage = {
    id: 1,
    side: "left",
    avatar: "logo",
    content: <span className="font-bold">{t('about.story.intro_msg')}</span>
  };

  const [messages, setMessages] = useState<any[]>([initialMessage]);
  const [currentStep, setCurrentStep] = useState(0);
  const [options, setOptions] = useState(storySteps[0].options);

  const handleOptionClick = (opt: { label: string, reply: string | string[] }) => {
    setOptions([]); // Hide options while processing

    // Add User Message
    const userMsg = {
      id: Date.now(),
      side: "right",
      avatar: "👤",
      content: <span className="font-bold">{opt.label}</span>
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Handle Replies (Single or Multiple)
    const replies = Array.isArray(opt.reply) ? opt.reply : [opt.reply];
    let replyIndex = 0;

    const sendNextReply = () => {
      setTimeout(() => {
        const botMsg = {
          id: Date.now() + replyIndex + 1,
          side: "left",
          avatar: "logo",
          content: <span className="font-medium">{replies[replyIndex]}</span>
        };
        setMessages(prev => [...prev, botMsg]);
        replyIndex++;

        if (replyIndex < replies.length) {
          setIsTyping(true);
          sendNextReply(); // Recurse for next message
        } else {
          setIsTyping(false);
          // Advance Step
          const nextStep = currentStep + 1;
          if (nextStep < storySteps.length) {
            setCurrentStep(nextStep);
            setOptions(storySteps[nextStep].options);
          } else {
            // End of story -> Auto Restart
            setTimeout(() => {
              setMessages([initialMessage]);
              setCurrentStep(0);
              setOptions(storySteps[0].options);
            }, 3000);
          }
        }
      }, 3500);
    };

    sendNextReply();
  };

  // Auto-scroll
  useEffect(() => {
    const el = document.getElementById("story-chat-area");
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <section className="relative py-12 md:py-24 px-2 md:px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFFaf4]/70 to-white/70 backdrop-blur-[1px]" />

      <div className="container mx-auto max-w-5xl relative z-10">

        {/* Manga-style Header */}
        <div className="text-center mb-16 relative z-10">
          <div className="inline-block transform rotate-1 hover:-rotate-1 transition-transform duration-300">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-[4px_4px_0px_#000] stroke-black" style={{ WebkitTextStroke: '2px black' }}>
              {t('about.story.title')} <span className="text-yellow-400">🤔</span>
            </h2>
          </div>
        </div>

        <div className="w-full md:max-w-2xl mx-auto">

          {/* Manga Chat Frame */}
          <div className="bg-white border-4 border-black p-4 md:p-6 rounded-[2.5rem] shadow-[12px_12px_0px_#000] relative">

            {/* Decorative Corner Screws */}
            <div className="absolute top-4 left-4 w-4 h-4 rounded-full border-2 border-black bg-gray-200 flex items-center justify-center"><div className="w-2 h-0.5 bg-black rotate-45"></div></div>
            <div className="absolute top-4 right-4 w-4 h-4 rounded-full border-2 border-black bg-gray-200 flex items-center justify-center"><div className="w-2 h-0.5 bg-black rotate-45"></div></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 rounded-full border-2 border-black bg-gray-200 flex items-center justify-center"><div className="w-2 h-0.5 bg-black rotate-45"></div></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 rounded-full border-2 border-black bg-gray-200 flex items-center justify-center"><div className="w-2 h-0.5 bg-black rotate-45"></div></div>

            {/* Chat Container */}
            <div className="bg-white border-4 border-black rounded-[2rem] flex-1 flex flex-col overflow-hidden h-[500px] md:h-[600px]">

              {/* Chat Header */}
              <div className="px-6 py-5 border-b-4 border-black flex items-center justify-between bg-yellow-300 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-black bg-white flex items-center justify-center text-xl shadow-[2px_2px_0px_#000]">
                    👋
                  </div>
                  <div>
                    <h4 className="font-bold text-black text-lg uppercase tracking-wider">{t('about.story.chatHeader')}</h4>
                    <div className="bg-green-400 border border-black px-2 rounded-full text-[10px] font-bold inline-block text-black shadow-[1px_1px_0px_#000]">
                      {isTyping ? "typing..." : t('about.story.online')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400 border border-black" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black" />
                  <div className="w-3 h-3 rounded-full bg-green-400 border border-black" />
                </div>
              </div>

              {/* Chat Messages Area */}
              <div id="story-chat-area" className="flex-1 p-6 space-y-8 overflow-y-auto relative bg-white scroll-smooth">
                {/* Halftone Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                {messages.map((msg: any) => (
                  <div key={msg.id} className={`flex gap-4 max-w-[90%] items-end animate-in fade-in slide-in-from-bottom-4 duration-300 ${msg.side === 'right' ? 'ml-auto flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center shrink-0 text-xl shadow-[2px_2px_0px_#000] ${msg.side === 'right' ? 'bg-primary' : 'bg-gray-100'}`}>
                      {msg.avatar === 'logo' ? (
                        <img src={logo} alt="Q" className={`w-6 h-6 object-contain ${msg.side === 'right' ? 'invert' : ''}`} />
                      ) : (
                        msg.avatar
                      )}
                    </div>
                    <div className={`relative group ${msg.side === 'right' ? 'text-right' : ''}`}>
                      <div className={`p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] text-base ${msg.side === 'right'
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm'
                        }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-4 max-w-[90%] items-end animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="w-10 h-10 rounded-full border-2 border-black bg-white flex items-center justify-center shrink-0 text-xl shadow-[2px_2px_0px_#000]">
                      <img src={logo} alt="Q" className="w-6 h-6 object-contain" />
                    </div>
                    <div className="bg-white p-4 rounded-2xl rounded-bl-sm border-2 border-black shadow-[4px_4px_0px_#000]">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Interaction Area */}
              <div className="p-6 border-t-4 border-black bg-gray-50 relative z-20">
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide relative z-20">
                  {options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => !isTyping && handleOptionClick(opt)}
                      disabled={isTyping}
                      className="whitespace-nowrap px-4 py-3 bg-white border-2 border-black rounded-xl font-bold text-sm shadow-[2px_2px_0px_rgba(0,0,0,0.2)] hover:bg-yellow-300 hover:shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const AboutFeatures = () => {
  const { t } = useTranslation();
  const featuresData = t('about.features.items', { returnObjects: true }) as { title: string; desc: string }[];

  const features = featuresData.map((item, index) => ({
    title: item.title,
    icon: ["😴", "🎮", "👻"][index],
    desc: item.desc,
    color: ["bg-orange-400", "bg-blue-400", "bg-purple-400"][index],
    rotate: ["-rotate-2", "rotate-2", "-rotate-1"][index]
  }));

  return (
    <section className="py-24 px-4 bg-transparent">
      <div className="container mx-auto max-w-5xl">

        {/* Manga Header */}
        <div className="text-center mb-16 relative z-10">
          <div className="inline-block transform -rotate-2 hover:rotate-1 transition-transform duration-300">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-[4px_4px_0px_#000] stroke-black"
              style={{ WebkitTextStroke: '2px black' }}>
              {t('about.features.title')}
            </h2>
          </div>
          <p className="mt-4 text-lg md:text-xl font-bold text-gray-800 max-w-2xl mx-auto bg-white border-2 border-black p-3 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transform rotate-1">
            {t('about.features.subtitle')} ⚡️
          </p>

          {/* Decorative Comic Elements */}
          <div className="absolute top-[-20px] right-0 md:right-[20%] w-12 h-12 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center font-bold text-xs animate-bounce shadow-[3px_3px_0px_#000]">
            {t('about.features.pow')}
          </div>
          <div className="absolute top-[10px] left-0 md:left-[20%] w-16 h-10 bg-blue-400 border-2 border-black flex items-center justify-center font-bold text-xs -rotate-12 animate-pulse shadow-[3px_3px_0px_#000]">
            {t('about.features.boom')}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className={`relative group ${feature.rotate} hover:rotate-0 transition-all duration-300 hover:z-10`}>
              {/* Manga Frame - Black Background for Shadow */}
              <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 rounded-xl" />

              {/* Main Card - Manga Style */}
              <div className="relative bg-white border-4 border-black rounded-xl p-6 h-full flex flex-col items-center text-center overflow-hidden hover:-translate-y-2 hover:-translate-x-2 transition-transform duration-200">

                {/* Halftone Pattern Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '8px 8px' }} />

                {/* Speed Lines for Header */}
                <div className={`w-full py-4 ${feature.color} border-b-4 border-black mb-6 -mx-6 mt-[-24px] relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/20 rotate-45 transform scale-150 origin-bottom-left" />
                  <h3 className="text-xl font-black text-white uppercase tracking-wider relative z-10 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    {feature.title}
                  </h3>
                </div>

                {/* Content */}
                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300 filter drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                  {feature.icon}
                </div>

                <p className="text-base font-bold text-gray-800 leading-relaxed mb-6">
                  {feature.desc}
                </p>

                {/* Comic Badge */}
                <div className="mt-auto bg-black text-white px-4 py-1 rounded-full font-bold text-xs uppercase tracking-widest">
                  {t('about.features.badge')}
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const AboutValues = () => {
  const { t } = useTranslation();
  const valuesData = t('about.values.items', { returnObjects: true }) as { title: string; desc: string; sfx: string }[];

  const values = valuesData.map((item, index) => ({
    icon: [Zap, Heart, Users, Sparkles][index],
    title: item.title,
    desc: item.desc,
    color: ["bg-yellow-400", "bg-red-400", "bg-blue-400", "bg-purple-400"][index],
    sfx: item.sfx,
    rotate: ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3"][index]
  }));

  return (
    <section className="py-24 px-4 bg-transparent overflow-hidden">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center space-y-4 mb-20 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter inline-block relative">
            <span className="relative z-10 text-black drop-shadow-[4px_4px_0px_rgba(255,255,255,1)]">
              {t('about.values.title')}
            </span>
            <div className="absolute inset-0 bg-yellow-300 transform scale-110 -rotate-2 -z-0 border-4 border-black"></div>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className={`group relative ${v.rotate} hover:rotate-0 transition-all duration-300 hover:z-20`}
              >
                {/* SFX Floating Text */}
                <div className="absolute -top-6 -right-4 font-black text-xl text-black bg-white border-2 border-black px-2 py-0.5 transform rotate-12 z-20 shadow-[2px_2px_0px_#000] animate-bounce">
                  {v.sfx}
                </div>

                {/* Card Container */}
                <div className="relative bg-white border-4 border-black p-6 rounded-xl shadow-[8px_8px_0px_#000] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-[4px_4px_0px_#000] transition-all overflow-hidden h-full flex flex-col">

                  {/* Background Stripes */}
                  <div className={`absolute top-0 left-0 w-full h-2 ${v.color} border-b-2 border-black`}></div>
                  <div className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }} />

                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto rounded-full border-4 border-black ${v.color} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform shadow-[4px_4px_0px_rgba(0,0,0,0.2)]`}>
                    <Icon className="w-8 h-8 text-white drop-shadow-[2px_2px_0px_#000]" />
                  </div>

                  {/* Content */}
                  <div className="text-center relative z-10 flex-1 flex flex-col">
                    <h3 className="text-xl font-black uppercase mb-2 bg-black text-white inline-block mx-auto px-2 transform -skew-x-12">
                      {v.title}
                    </h3>
                    <p className="text-gray-800 font-bold border-t-2 border-black/10 pt-4 mt-auto">
                      {v.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const AboutShopFavorites = ({
  products = [],
  shopeeUrl = "https://s.shopee.vn/6psJLKL8PW",
}: {
  products?: {
    title: string;
    href: string;
    image?: string;
    note?: string;
    price?: string;
  }[];
  shopeeUrl?: string;
}) => {
  const { t } = useTranslation();
  const items =
    products && products.length > 0
      ? products
      : shopeeUrl
        ? [{ title: t('about.shopFavorites.viewOnShopee'), href: shopeeUrl }]
        : [];
  const hasItems = items.length > 0;

  return (
    <section className="py-24 px-4 bg-transparent relative overflow-hidden">
      <div className="container mx-auto max-w-5xl">

        {/* Shop Header */}
        <div className="flex items-center justify-between mb-12 border-b-4 border-black pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-400 border-4 border-black flex items-center justify-center text-4xl shadow-[4px_4px_0px_#000] rotate-3 animate-pulse">
              🎒
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                {t('about.shopFavorites.title')}
              </h2>
              <p className="font-mono text-gray-600 font-bold">
                {t('about.shopFavorites.subtitle')}
              </p>
            </div>
          </div>
          <div className="hidden md:block bg-black text-white px-6 py-2 font-mono font-bold text-xl -skew-x-12 shadow-[4px_4px_0px_#888]">
            {t('about.shopFavorites.gold')}
          </div>
        </div>

        {hasItems ? (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {items.map((item, i) => (
                <CarouselItem key={i} className="pl-4 py-4 pr-4 basis-full sm:basis-1/2 lg:basis-1/4">
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block h-full"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent("analytics", {
                          detail: {
                            event: "shopee_product_click",
                            title: item.title,
                          },
                        })
                      )
                    }
                  >
                    {/* Card Frame (RPG Inventory Slot) */}
                    <div className="h-full bg-white border-4 border-black p-4 rounded-xl shadow-[6px_6px_0px_#000] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-[2px_2px_0px_#000] transition-all duration-200 flex flex-col">

                      {/* Item Image Container */}
                      <div className="relative aspect-square bg-gray-100 border-2 border-black rounded-lg mb-4 overflow-hidden">
                        {/* Rarity Background Effect */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-gray-100 to-gray-300 opacity-50"></div>

                        {/* Grid Pattern */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover relative z-10 group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">📦</div>
                        )}

                        {/* "EQUIP" Badge on Hover */}
                        <div className="absolute inset-x-0 bottom-0 bg-black/80 text-white font-mono text-center text-xs py-1 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                          {t('about.shopFavorites.clickToEquip')}
                        </div>
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col gap-2">
                        <h3 className="font-bold text-base leading-tight line-clamp-2 min-h-[3rem]">
                          {item.title}
                        </h3>

                        <div className="mt-auto pt-3 border-t-2 border-dashed border-black/20 flex items-center justify-between">
                          {item.price && (
                            <span className="font-black text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded border border-yellow-600 text-sm">
                              {item.price}
                            </span>
                          )}
                          {!item.price && (
                            <span className="font-mono text-xs text-gray-400">{t('about.shopFavorites.rareItem')}</span>
                          )}

                          {/* Arrow Icon */}
                          <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform">
                            <span className="text-xs">➜</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* New Status Label */}
                    <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 border-2 border-black rotate-12 shadow-sm group-hover:rotate-0 transition-transform z-20">
                      {t('about.shopFavorites.new')}
                    </div>
                  </a>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-end gap-2 mt-8">
              <CarouselPrevious className="static translate-y-0 h-12 w-12 border-4 border-black bg-white hover:bg-yellow-300 transition-colors shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none rounded-none" />
              <CarouselNext className="static translate-y-0 h-12 w-12 border-4 border-black bg-white hover:bg-yellow-300 transition-colors shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none rounded-none" />
            </div>
          </Carousel>
        ) : (
          <div className="text-center py-20 border-4 border-dashed border-black/20 rounded-3xl bg-gray-50">
            <div className="text-6xl mb-4 opacity-30">🕸️</div>
            <p className="text-xl font-bold text-gray-400">{t('about.shopFavorites.emptyTitle')}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export const AboutSocialLinks = () => {
  const { t } = useTranslation();
  const links = [
    { label: "Facebook", href: "https://www.facebook.com/qkanengk30825", color: "bg-[#1877F2]", rotate: "rotate-3" },
    { label: "GitHub", href: "https://github.com/khanhnkq", color: "bg-[#24292e]", rotate: "-rotate-2" },
    { label: "Email", href: "mailto:khanhnkq@gmail.com", color: "bg-[#EA4335]", rotate: "rotate-6" },
  ];
  return (
    <section className="py-24 px-4 bg-transparent border-t-0 relative overflow-hidden">
      <div className="container mx-auto max-w-3xl text-center relative z-10">

        {/* Sketchbook Container */}
        <div className="bg-white border-4 border-black rounded-[3rem] p-8 md:p-12 shadow-[12px_12px_0px_#000] transform -rotate-1 relative">
          {/* Binding Spirits (Spiral Notebook effect) */}
          <div className="absolute -top-6 left-12 w-4 h-12 bg-gray-300 border-2 border-black rounded-full z-0"></div>
          <div className="absolute -top-6 left-24 w-4 h-12 bg-gray-300 border-2 border-black rounded-full z-0"></div>
          <div className="absolute -top-6 left-36 w-4 h-12 bg-gray-300 border-2 border-black rounded-full z-0"></div>
          <div className="absolute -top-6 right-12 w-4 h-12 bg-gray-300 border-2 border-black rounded-full z-0"></div>
          <div className="absolute -top-6 right-24 w-4 h-12 bg-gray-300 border-2 border-black rounded-full z-0"></div>

          {/* Dotted Grid Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none rounded-[2.5rem]"
            style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '20px 20px' }} />

          <div className="space-y-6 relative z-10">
            <div className="inline-block transform -rotate-2">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                {t('about.socialLinks.title')}
              </h2>
              {/* Underline Scribble */}
              <svg className="w-full h-4 mt-2 text-yellow-400" viewBox="0 0 200 10" preserveAspectRatio="none">
                <path d="M0 5 Q 100 15 200 5" stroke="currentColor" strokeWidth="6" fill="none" />
              </svg>
            </div>

            <p className="text-lg font-bold text-gray-600 max-w-lg mx-auto font-mono">
              {t('about.socialLinks.subtitle')} 🐶
            </p>

            <div className="flex flex-wrap gap-8 justify-center pt-8">
              {links.map((l, i) => {
                return (
                  <a
                    key={i}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative ${l.rotate} hover:rotate-0 hover:scale-110 hover:z-50 transition-all duration-300`}
                  >
                    {/* Hard Shadow (Comic Style) */}
                    <div className="absolute inset-0 bg-black rounded-2xl translate-x-1.5 translate-y-1.5 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-300"></div>

                    {/* Sticker Edge (White Border) */}
                    <div className="absolute inset-0 bg-white rounded-2xl -m-1 border-2 border-black group-hover:-m-1.5 transition-all duration-300"></div>

                    {/* Main Button Content */}
                    <div className={`relative px-8 py-4 rounded-xl border-2 border-black ${l.color} text-white font-black text-xl flex items-center justify-center gap-3 uppercase tracking-wider overflow-hidden min-w-[160px]`}>
                      {/* Interaction: Shine Effect */}
                      <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>

                      {l.label}
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Signature Area */}
            <div className="mt-12 opacity-60 rotate-2">
              <div className="font-script text-3xl text-gray-400">{t('about.socialLinks.signature')}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-300">{t('about.socialLinks.signatureRole')}</div>
            </div>
          </div>
        </div>

        {/* Scattered Decor */}
        <div className="absolute -bottom-10 -right-10 text-9xl opacity-20 rotate-12 pointer-events-none">✏️</div>
      </div>
    </section>
  );
};
