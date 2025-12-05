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
import logo from "@/assets/logo/logo.png";
import { useEffect, useState, type MouseEvent } from "react";
import { gsap } from "gsap";

type Cta = {
  label: string;
  onClick?: () => void;
  to?: string;
  external?: boolean;
  variant?: "default" | "outline";
};

export const AboutHero = () => {
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
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-[#B5CC89]/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
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
          <div className="absolute -inset-1 bg-gradient-to-r from-[#B5CC89] to-primary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-[#B5CC89]/20 transform transition duration-500 hover:scale-105">
            <img
              src={logo}
              alt="Khánh"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 right-2 bg-white px-3 py-1 rounded-full shadow-lg border border-border text-xs font-bold animate-bounce">
            Meow
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] text-foreground drop-shadow-sm">
            Xin chào, mình là<br className="hidden md:block" />{" "}
            <span className="text-primary relative inline-block mt-2 md:mt-0">
              Nguyễn Khánh
              <svg className="absolute -bottom-2 left-0 w-full h-4 text-[#B5CC89] -z-10 opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 15 100 5" stroke="currentColor" strokeWidth="12" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
            Mình xây dựng <span className="font-bold text-foreground">QuizKen</span> để việc học trở nên{" "}
            <span className="inline-block px-2 py-1 rounded-lg bg-orange-100 text-orange-700 -rotate-2 transform hover:rotate-0 transition-transform">vui hơn</span>,{" "}
            <span className="inline-block px-2 py-1 rounded-lg bg-blue-100 text-blue-700 rotate-1 transform hover:rotate-0 transition-transform">dễ hơn</span> và{" "}
            <span className="inline-block px-2 py-1 rounded-lg bg-green-100 text-green-700 -rotate-1 transform hover:rotate-0 transition-transform">hiệu quả hơn</span>.
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
            Thử tạo bài trắc nghiệm
            <div className="bg-white/20 p-1.5 rounded-xl ml-3 group-hover:rotate-12 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </Button>

          <Link to="/library" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="xl"
              className="text-lg px-8 py-6 rounded-3xl border-4 border-border hover:border-primary/50 hover:bg-secondary hover:text-secondary-foreground active:scale-95 transition-all duration-200 font-heading w-full h-auto"
            >
              Dạo quanh thư viện
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
  return (
    <section className="py-24 px-4 bg-transparent relative overflow-hidden">
      <div className="container mx-auto max-w-7xl">

        {/* Section Header - Chapter Title Style */}
        <div className="flex items-center justify-center mb-16 relative">
          <div className="bg-white border-4 border-black px-8 py-4 shadow-[8px_8px_0px_#000] transform -rotate-2 relative z-10 transition-transform hover:rotate-0 duration-300">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              CHƯƠNG TIẾP THEO <span className="text-primary text-5xl md:text-7xl">!?</span>
            </h2>
          </div>
          {/* Decorative Ink Splat or Shape */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-24 bg-yellow-300 -rotate-3 -z-0 opacity-80 mix-blend-multiply rounded-full blur-xl" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-stretch">

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
                    MISSION START!
                  </div>
                  <div className="text-5xl animate-bounce">🎯</div>
                </div>

                <h3 className="text-4xl font-black uppercase mb-6 leading-none drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                  Sứ Mệnh <br /><span className="text-red-500 text-5xl">Cực Đại</span>
                </h3>

                <div className="space-y-4 flex-1">
                  {/* Comic Strip Items */}
                  <div className="flex items-center gap-4 border-b-2 border-black/10 pb-4 group/item hover:bg-yellow-50 transition-colors p-2 rounded-lg">
                    <span className="text-3xl font-black text-gray-200 group-hover/item:text-black transition-colors">01</span>
                    <p className="text-lg font-bold text-gray-800">
                      Biến việc học thành <span className="bg-yellow-300 px-1 border border-black transform inline-block -rotate-1">TRÒ CHƠI</span> đầy cảm hứng!
                    </p>
                  </div>
                  <div className="flex items-center gap-4 border-b-2 border-black/10 pb-4 group/item hover:bg-blue-50 transition-colors p-2 rounded-lg">
                    <span className="text-3xl font-black text-gray-200 group-hover/item:text-black transition-colors">02</span>
                    <p className="text-lg font-bold text-gray-800">
                      Dùng <span className="text-blue-600 underline decoration-wavy">AI Power</span> tạo đề siêu tốc (nhanh hơn flash!).
                    </p>
                  </div>
                  <div className="flex items-center gap-4 group/item hover:bg-green-50 transition-colors p-2 rounded-lg">
                    <span className="text-3xl font-black text-gray-200 group-hover/item:text-black transition-colors">03</span>
                    <p className="text-lg font-bold text-gray-800">
                      Kết nối anh em bốn phương cùng chia sẻ bí kíp.
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
                    FUTURE SIGHT
                  </div>
                </div>

                <h3 className="text-4xl font-black uppercase mb-6 leading-none text-right">
                  Tầm Nhìn <br /><span className="text-blue-500 text-5xl">Vô Hạn</span>
                </h3>

                <div className="flex-1 flex flex-col justify-end text-right">
                  {/* Thought Bubble Style */}
                  <div className="relative bg-gray-100 border-2 border-black p-6 rounded-2xl rounded-tr-none shadow-[4px_4px_0px_#ccc] transform hover:scale-105 transition-transform">
                    <p className="text-xl font-bold italic text-gray-800 leading-relaxed">
                      "Chúng ta sẽ xây dựng một <span className="text-purple-600 font-black">THƯ VIỆN MỞ ĐA VŨ TRỤ</span>! Nơi kiến thức không chỉ để nhớ, mà là để..."
                    </p>
                    <div className="mt-2 text-2xl font-black text-black uppercase transform -rotate-1 inline-block bg-yellow-300 px-2 mt-4 border border-black">
                      CHIẾN & THẮNG! 🏆
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
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFFaf4]/70 to-white/70 backdrop-blur-[1px]" />

      <div className="container mx-auto max-w-7xl relative z-10">

        {/* Manga-style Header */}
        <div className="text-center mb-16 relative z-10">
          <div className="inline-block transform rotate-1 hover:-rotate-1 transition-transform duration-300">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-[4px_4px_0px_#000] stroke-black" style={{ WebkitTextStroke: '2px black' }}>
              CHUYỆN LÀ THẾ NÀY... <span className="text-yellow-400">🤔</span>
            </h2>
          </div>
        </div>

        <div className="max-w-4xl mx-auto min-h-[600px]">

          {/* Manga Chat Frame */}
          <div className="bg-white border-4 border-black p-4 md:p-6 rounded-[2.5rem] shadow-[12px_12px_0px_#000] relative">

            {/* Decorative Corner Screws */}
            <div className="absolute top-4 left-4 w-4 h-4 rounded-full border-2 border-black bg-gray-200 flex items-center justify-center"><div className="w-2 h-0.5 bg-black rotate-45"></div></div>
            <div className="absolute top-4 right-4 w-4 h-4 rounded-full border-2 border-black bg-gray-200 flex items-center justify-center"><div className="w-2 h-0.5 bg-black rotate-45"></div></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 rounded-full border-2 border-black bg-gray-200 flex items-center justify-center"><div className="w-2 h-0.5 bg-black rotate-45"></div></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 rounded-full border-2 border-black bg-gray-200 flex items-center justify-center"><div className="w-2 h-0.5 bg-black rotate-45"></div></div>

            {/* Chat Container */}
            <div className="bg-white border-4 border-black rounded-[2rem] flex-1 flex flex-col overflow-hidden h-full">

              {/* Chat Header */}
              <div className="px-6 py-5 border-b-4 border-black flex items-center justify-between bg-yellow-300 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-black bg-white flex items-center justify-center text-xl shadow-[2px_2px_0px_#000]">
                    👋
                  </div>
                  <div>
                    <h4 className="font-bold text-black text-lg uppercase tracking-wider">Nguyễn Khánh</h4>
                    <div className="bg-green-400 border border-black px-2 rounded-full text-[10px] font-bold inline-block text-black shadow-[1px_1px_0px_#000]">
                      ONLINE
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
              <div className="flex-1 p-6 space-y-8 overflow-y-auto relative bg-white">
                {/* Halftone Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                {/* Message 1 (Left) */}
                <div className="flex gap-4 max-w-[90%] items-end animate-in slide-in-from-left-10 duration-500">
                  <div className="w-10 h-10 rounded-full border-2 border-black bg-gray-100 flex items-center justify-center shrink-0 text-xl shadow-[2px_2px_0px_#000]">😰</div>
                  <div className="relative group">
                    <div className="bg-white p-5 rounded-2xl rounded-bl-sm border-2 border-black shadow-[4px_4px_0px_#000] text-gray-800 font-bold text-lg relative z-10">
                      Ngày xưa đi học, sợ nhất là nghe cô giáo nói: <span className="text-red-500 font-black uppercase">"Kiểm tra 15 phút!"</span> 😭
                    </div>
                  </div>
                </div>

                {/* Message 2 (Left) */}
                <div className="flex gap-4 max-w-[90%] items-end animate-in slide-in-from-left-10 duration-500 delay-150">
                  <div className="w-10 h-10 rounded-full border-2 border-black bg-gray-100 flex items-center justify-center shrink-0 text-xl shadow-[2px_2px_0px_#000]">🤔</div>
                  <div className="relative group">
                    <div className="bg-white p-5 rounded-2xl rounded-bl-sm border-2 border-black shadow-[4px_4px_0px_#000] text-gray-800 font-medium">
                      Tim đập chân run, chữ nghĩa bay sạch... Tại sao kiểm tra cứ phải đáng sợ thế nhỉ? <br />
                      <span className="font-black">Sao không vui như chơi game? 🎮</span>
                    </div>
                  </div>
                </div>

                {/* Message 3 (Right - Quizken) */}
                <div className="flex gap-4 max-w-[90%] ml-auto flex-row-reverse items-end animate-in slide-in-from-right-10 duration-500 delay-300">
                  <div className="w-10 h-10 rounded-full border-2 border-black bg-primary flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]">
                    <img src={logo} alt="Q" className="w-6 h-6 object-contain invert" />
                  </div>
                  <div className="relative group text-right">
                    <div className="bg-primary text-white p-5 rounded-2xl rounded-br-sm border-2 border-black shadow-[4px_4px_0px_#000] text-lg">
                      Thế là <span className="font-black text-yellow-300 uppercase italic">Quizken</span> ra đời! 🚀<br />
                      <span className="font-bold">Tạo quiz nhanh như order trà sữa, vừa học vừa chơi!</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fake Input Area */}
              <div className="p-4 border-t-4 border-black bg-gray-50">
                <div className="flex gap-3 items-center bg-white rounded-xl px-4 py-3 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                  <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-black font-black cursor-pointer hover:bg-gray-100 transition-colors">
                    +
                  </div>
                  <div className="flex-1 text-gray-400 font-bold italic">Viết tin nhắn...</div>
                  <div className="text-black cursor-pointer transform hover:scale-110 transition-transform">
                    <h4 className="font-black text-sm bg-primary text-white px-3 py-1 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000]">SEND</h4>
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

export const AboutFeatures = () => {
  const features = [
    {
      title: "Team Lười Học",
      icon: "😴",
      desc: "Cách nhanh nhất để qua môn mà không tốn sức.",
      color: "bg-orange-400",
      rotate: "-rotate-2"
    },
    {
      title: "Team Mê Game",
      icon: "🎮",
      desc: "Leo rank kiến thức, đua top server lớp học.",
      color: "bg-blue-400",
      rotate: "rotate-2"
    },
    {
      title: "Hội Sợ Thi",
      icon: "👻",
      desc: "Cộng đồng \"phao cứu sinh\" chính hiệu.",
      color: "bg-purple-400",
      rotate: "-rotate-1"
    }
  ];

  return (
    <section className="py-24 px-4 bg-transparent">
      <div className="container mx-auto max-w-7xl">

        {/* Manga Header */}
        <div className="text-center mb-16 relative z-10">
          <div className="inline-block transform -rotate-2 hover:rotate-1 transition-transform duration-300">
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white drop-shadow-[4px_4px_0px_#000] stroke-black"
              style={{ WebkitTextStroke: '2px black' }}>
              Biệt Đội <span className="text-[#FFD700]">Siêu Đẳng</span>
            </h2>
          </div>
          <p className="mt-4 text-xl md:text-2xl font-bold text-gray-800 max-w-2xl mx-auto bg-white border-2 border-black p-3 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transform rotate-1">
            Gia nhập Quizken để mở khóa những <span className="text-purple-600">siêu năng lực</span> này nhé! ⚡️
          </p>

          {/* Decorative Comic Elements */}
          <div className="absolute top-[-20px] right-[20%] w-12 h-12 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center font-bold text-xs animate-bounce shadow-[3px_3px_0px_#000]">
            POW!
          </div>
          <div className="absolute top-[10px] left-[20%] w-16 h-10 bg-blue-400 border-2 border-black flex items-center justify-center font-bold text-xs -rotate-12 animate-pulse shadow-[3px_3px_0px_#000]">
            BOOM!
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
                  <h3 className="text-2xl font-black text-white uppercase tracking-wider relative z-10 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    {feature.title}
                  </h3>
                </div>

                {/* Content */}
                <div className="text-8xl mb-6 transform group-hover:scale-110 transition-transform duration-300 filter drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                  {feature.icon}
                </div>

                <p className="text-lg font-bold text-gray-800 leading-relaxed mb-6">
                  {feature.desc}
                </p>

                {/* Comic Badge */}
                <div className="mt-auto bg-black text-white px-4 py-1 rounded-full font-bold text-xs uppercase tracking-widest">
                  Special Power
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
  const values = [
    {
      icon: Zap,
      title: "Tốc Độ",
      desc: "Nhanh như Ninja! Tạo đề trong tíc tắc.",
      color: "bg-yellow-400",
      sfx: "SWOOSH!",
      rotate: "-rotate-3"
    },
    {
      icon: Heart,
      title: "Đam Mê",
      desc: "Yêu việc học như yêu Crush!",
      color: "bg-red-400",
      sfx: "DOKI DOKI",
      rotate: "rotate-2"
    },
    {
      icon: Users,
      title: "Cộng Đồng",
      desc: "Đông vui như hội chợ Anime.",
      color: "bg-blue-400",
      sfx: "WAKU WAKU",
      rotate: "-rotate-1"
    },
    {
      icon: Sparkles,
      title: "Sáng Tạo",
      desc: "Ý tưởng nổ tung như pháo hoa.",
      color: "bg-purple-400",
      sfx: "KABOOM!",
      rotate: "rotate-3"
    },
  ];

  return (
    <section className="py-24 px-4 bg-transparent overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-20 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter inline-block relative">
            <span className="relative z-10 text-black drop-shadow-[4px_4px_0px_rgba(255,255,255,1)]">
              Giá Trị Cốt Lõi
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
                  <div className={`w-20 h-20 mx-auto rounded-full border-4 border-black ${v.color} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform shadow-[4px_4px_0px_rgba(0,0,0,0.2)]`}>
                    <Icon className="w-10 h-10 text-white drop-shadow-[2px_2px_0px_#000]" />
                  </div>

                  {/* Content */}
                  <div className="text-center relative z-10 flex-1 flex flex-col">
                    <h3 className="text-2xl font-black uppercase mb-2 bg-black text-white inline-block mx-auto px-2 transform -skew-x-12">
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
  const items =
    products && products.length > 0
      ? products
      : shopeeUrl
        ? [{ title: "Xem trên Shopee", href: shopeeUrl }]
        : [];
  const hasItems = items.length > 0;

  return (
    <section className="py-24 px-4 bg-transparent relative overflow-hidden">
      <div className="container mx-auto max-w-7xl">

        {/* Shop Header */}
        <div className="flex items-center justify-between mb-12 border-b-4 border-black pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-400 border-4 border-black flex items-center justify-center text-4xl shadow-[4px_4px_0px_#000] rotate-3 animate-pulse">
              🎒
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                SHOP ITEMS
              </h2>
              <p className="font-mono text-gray-600 font-bold">
                "Vũ khí tối thượng của Developer"
              </p>
            </div>
          </div>
          <div className="hidden md:block bg-black text-white px-6 py-2 font-mono font-bold text-xl -skew-x-12 shadow-[4px_4px_0px_#888]">
            GOLD: ∞
          </div>
        </div>

        {hasItems ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, i) => (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block"
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
                      CLICK TO EQUIP
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 flex flex-col gap-2">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2 min-h-[3rem]">
                      {item.title}
                    </h3>

                    <div className="mt-auto pt-3 border-t-2 border-dashed border-black/20 flex items-center justify-between">
                      {item.price && (
                        <span className="font-black text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded border border-yellow-600 text-sm">
                          {item.price}
                        </span>
                      )}
                      {!item.price && (
                        <span className="font-mono text-xs text-gray-400">RARE ITEM</span>
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
                  NEW!
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-4 border-dashed border-black/20 rounded-3xl bg-gray-50">
            <div className="text-6xl mb-4 opacity-30">🕸️</div>
            <p className="text-xl font-bold text-gray-400">Kho hàng đang trống...</p>
          </div>
        )}
      </div>
    </section>
  );
};

export const AboutSocialLinks = () => {
  const links = [
    { label: "Facebook", href: "https://www.facebook.com/qkanengk30825", color: "bg-[#1877F2]", rotate: "rotate-3" },
    { label: "GitHub", href: "https://github.com/khanhnkq", color: "bg-[#24292e]", rotate: "-rotate-2" },
    { label: "Email", href: "mailto:khanhnkq@gmail.com", color: "bg-[#EA4335]", rotate: "rotate-6" },
  ];
  return (
    <section className="py-24 px-4 bg-transparent border-t-0 relative overflow-hidden">
      <div className="container mx-auto max-w-4xl text-center relative z-10">

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
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                Connect With Me!
              </h2>
              {/* Underline Scribble */}
              <svg className="w-full h-4 mt-2 text-yellow-400" viewBox="0 0 200 10" preserveAspectRatio="none">
                <path d="M0 5 Q 100 15 200 5" stroke="currentColor" strokeWidth="6" fill="none" />
              </svg>
            </div>

            <p className="text-xl font-bold text-gray-600 max-w-lg mx-auto font-mono">
              "Đừng ngại say hi! Mình không cắn đâu (chắc thế) 🐶"
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
              <div className="font-script text-3xl text-gray-400">Nguyễn Khánh</div>
              <div className="text-xs font-bold uppercase tracking-widest text-gray-300">Creator of Quizken</div>
            </div>
          </div>
        </div>

        {/* Scattered Decor */}
        <div className="absolute -bottom-10 -right-10 text-9xl opacity-20 rotate-12 pointer-events-none">✏️</div>
      </div>
    </section>
  );
};
