import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Sparkles,
  Target,
  CheckCircle,
  Zap,
  Users,
  MousePointer,
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
    <section className="relative overflow-hidden bg-transparent min-h-[85vh] pt-20 pb-32 px-4 flex items-center justify-center">
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

      <div className="container mx-auto max-w-5xl relative z-10 text-center space-y-10">
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
            Định danh
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
    </section>
  );
};

export const AboutMissionVision = () => {
  return (
    <section className="py-20 px-4 bg-transparent">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Mission Card */}
          <div className="group rounded-[2.5rem] p-8 md:p-10 bg-[#f4f7eb] border-2 border-transparent hover:border-[#B5CC89] transition-all duration-300 hover:shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="w-40 h-40 text-[#B5CC89] rotate-12" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm">
                <div className="p-2.5 bg-[#B5CC89] rounded-full text-black">
                  <Target className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg">Sứ mệnh</span>
              </div>

              <ul className="space-y-4">
                <li className="flex gap-3 text-lg text-muted-foreground leading-relaxed">
                  <span className="text-2xl">🌱</span>
                  <span>
                    Giúp việc học trở nên <strong className="text-foreground">dễ tiếp cận</strong> và <strong className="text-foreground">thú vị</strong> hơn qua trắc nghiệm.
                  </span>
                </li>
                <li className="flex gap-3 text-lg text-muted-foreground leading-relaxed">
                  <span className="text-2xl">⚡</span>
                  <span>
                    Tận dụng <strong className="text-foreground">AI</strong> để tạo nội dung nhanh, chính xác và sáng tạo.
                  </span>
                </li>
                <li className="flex gap-3 text-lg text-muted-foreground leading-relaxed">
                  <span className="text-2xl">🤝</span>
                  <span>
                    Kết nối cộng đồng người học để cùng <strong className="text-foreground">chia sẻ</strong> tri thức.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Vision Card */}
          <div className="group rounded-[2.5rem] p-8 md:p-10 bg-[#eff6ff] border-2 border-transparent hover:border-blue-200 transition-all duration-300 hover:shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="w-40 h-40 text-blue-400 -rotate-12" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm">
                <div className="p-2.5 bg-blue-100 rounded-full text-blue-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg">Tầm nhìn</span>
              </div>

              <div className="prose prose-lg text-muted-foreground">
                <p className="leading-relaxed text-lg">
                  Quizken hướng đến việc trở thành một <strong className="text-foreground text-blue-700">thư viện mở</strong> về học tập chủ động.
                </p>
                <div className="my-6 p-4 bg-white/60 rounded-2xl border border-blue-100 italic">
                  "Học bằng cách làm. Không chỉ ghi nhớ, mà là hiểu và áp dụng."
                </div>
                <p className="leading-relaxed text-lg">
                  Nơi mỗi sai lầm là một bài học, và mỗi bài trắc nghiệm là một bước tiến mới.
                </p>
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
    <section className="relative py-24 px-4 bg-[#FFFaf4]/70 backdrop-blur-[1px] overflow-hidden">
      {/* Fun Background Pattern (Polka dots) */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(#444 2px, transparent 2px)', backgroundSize: '32px 32px' }}>
      </div>

      {/* Doodles */}
      <div className="absolute top-10 left-10 text-yellow-400 rotate-12 animate-pulse">
        <svg width="60" height="60" viewBox="0 0 50 50" fill="currentColor">
          <path d="M25 0L31 17L49 17L35 29L40 47L25 37L10 47L15 29L1 17L19 17L25 0Z" />
        </svg>
      </div>
      <div className="absolute bottom-20 right-10 text-pink-300 -rotate-12 animate-bounce duration-[3000ms]">
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block transform -rotate-3 hover:rotate-0 transition-transform duration-300 cursor-default">
            <span className="px-6 py-2 rounded-full bg-black text-white font-bold text-lg shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
              🤔 Chuyện là thế này...
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-[#333]">
            Tại sao lại "đẻ" ra <span className="text-primary inline-block transform hover:scale-110 transition-transform cursor-pointer">Quizken</span>?
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: Chat Bubbles Story */}
          <div className="space-y-6">

            {/* Bubble 1 */}
            <div className="flex gap-4 items-start group">
              <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center shrink-0">
                <span className="text-2xl group-hover:animate-spin">😩</span>
              </div>
              <div className="bg-white p-6 rounded-[2rem] rounded-tl-none shadow-sm border border-gray-100 relative group-hover:-translate-y-1 transition-transform duration-300">
                <p className="text-lg text-gray-600 font-medium">
                  Ngày xưa đi học, mình sợ nhất cảnh: <span className="text-red-500 font-bold">"Các em lấy giấy ra kiểm tra 15 phút!"</span>
                </p>
                <p className="text-gray-500 mt-2 text-sm">Tim đập chân run, chữ bay sạch khỏi đầu...</p>
              </div>
            </div>

            {/* Bubble 2 */}
            <div className="flex gap-4 items-start group flex-row-reverse">
              <div className="w-12 h-12 rounded-full bg-yellow-100 border-2 border-yellow-200 flex items-center justify-center shrink-0">
                <span className="text-2xl group-hover:animate-bounce">💡</span>
              </div>
              <div className="bg-[#FFF9C4] p-6 rounded-[2rem] rounded-tr-none shadow-sm border border-yellow-200 relative group-hover:-translate-y-1 transition-transform duration-300">
                <p className="text-lg text-gray-800 font-bold">
                  Tại sao kiểm tra lại phải đáng sợ? Tại sao không thể vui như chơi game?
                </p>
              </div>
            </div>

            {/* Bubble 3 */}
            <div className="flex gap-4 items-start group">
              <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center shrink-0">
                <img src={logo} alt="Quizken" className="w-8 h-8 object-contain" />
              </div>
              <div className="bg-white p-6 rounded-[2rem] rounded-bl-none shadow-lg border-2 border-[#B5CC89] relative group-hover:-translate-y-1 transition-transform duration-300">
                <p className="text-lg text-gray-600 font-medium">
                  Thế là <strong className="text-primary text-xl">Quizken</strong> ra đời!
                </p>
                <p className="mt-3 text-gray-600">
                  Mình muốn bạn tạo bài kiểm tra nhanh như cách bạn order trà sữa vậy. Bấm bấm vài cái là có ngay bài quiz xịn xò để ôn tập.
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-500">😎 Không lo tốn sức</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-500">🚀 Học siêu nhanh</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right: Sticker Board */}
          <div className="relative h-[500px] w-full hidden lg:block">
            {/* Sticker 1 */}
            <div className="absolute top-10 left-10 w-64 bg-white p-4 rounded-xl shadow-[8px_8px_0px_rgba(0,0,0,0.1)] border-2 border-black transform -rotate-6 hover:rotate-0 hover:scale-110 hover:z-20 transition-all duration-300 cursor-pointer group">
              <div className="bg-orange-100 h-32 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                <span className="text-6xl group-hover:scale-125 transition-transform duration-300">😴</span>
              </div>
              <h4 className="font-bold text-xl mb-1">Dành cho người lười</h4>
              <p className="text-sm text-gray-500">Người lười (như mình) luôn tìm cách nhanh nhất để làm việc.</p>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-12 bg-yellow-200/80 rotate-90"></div>
            </div>

            {/* Sticker 2 */}
            <div className="absolute top-32 right-10 w-60 bg-white p-4 rounded-xl shadow-[8px_8px_0px_#B5CC89] border-2 border-black transform rotate-12 hover:rotate-0 hover:scale-110 hover:z-20 transition-all duration-300 cursor-pointer group">
              <div className="bg-blue-100 h-24 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-5xl group-hover:scale-125 transition-transform duration-300">🎮</span>
              </div>
              <h4 className="font-bold text-lg mb-1">Vui như chơi game</h4>
              <p className="text-sm text-gray-500">Cày level, đua top, chứ không phải trả bài.</p>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-12 bg-pink-300/80 rotate-45"></div>
            </div>

            {/* Sticker 3 */}
            <div className="absolute bottom-10 left-32 w-72 bg-white p-5 rounded-xl shadow-[8px_8px_0px_#A5B4FC] border-2 border-black transform -rotate-3 hover:rotate-0 hover:scale-110 hover:z-20 transition-all duration-300 cursor-pointer group">
              <div className="bg-purple-100 h-28 rounded-lg mb-3 flex items-center justify-center">
                <Users className="w-16 h-16 text-purple-500 group-hover:scale-110 transition-transform" />
              </div>
              <h4 className="font-bold text-xl mb-1">Hội những người sợ thi</h4>
              <p className="text-sm text-gray-500">Tham gia cộng đồng để cùng nhau vượt qua nỗi sợ "mời phụ huynh".</p>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-12 bg-blue-300/80 -rotate-12"></div>
            </div>

          </div>

          {/* Mobile version of stickers (List) */}
          <div className="lg:hidden grid gap-4">
            <div className="bg-white p-4 rounded-xl shadow-md border-2 border-dashed border-gray-200 flex items-center gap-4">
              <span className="text-4xl">😴</span>
              <div>
                <h4 className="font-bold">Team lười học</h4>
                <p className="text-sm text-muted-foreground">Cách nhanh nhất để qua môn.</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md border-2 border-dashed border-gray-200 flex items-center gap-4">
              <span className="text-4xl">🎮</span>
              <div>
                <h4 className="font-bold">Team mê game</h4>
                <p className="text-sm text-muted-foreground">Biến bài thi thành trận đấu.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export const AboutValues = () => {
  const values = [
    {
      title: "Chất lượng",
      desc: "Câu hỏi rõ ràng, chính xác",
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    { title: "Tốc độ", desc: "Tạo bài tập trong tic tắc", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
    {
      title: "Dễ dùng",
      desc: "Giao diện trực quan",
      icon: MousePointer,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Cộng đồng",
      desc: "Phù hợp với tất cả mọi người",
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
  ];
  return (
    <section className="py-20 px-4 bg-transparent">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-14">
          <h2 className="text-3xl md:text-5xl font-bold">Giá trị cốt lõi</h2>
          <p className="text-lg text-muted-foreground">
            Những điều mình luôn tâm niệm khi phát triển Quizken
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className="group p-6 rounded-3xl bg-white border border-border/50 hover:border-[#B5CC89] hover:shadow-xl transition-all duration-300 text-center space-y-4 cursor-default"
              >
                <div className={`w-14 h-14 mx-auto rounded-2xl ${v.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">{v.title}</h3>
                  <p className="text-muted-foreground text-sm">{v.desc}</p>
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

  // Bản mobile: đảm bảo loop vô tận ngay cả khi ít sản phẩm
  const mobileItems =
    items.length >= 2 ? items : [...items, ...items, ...items];

  // Autoplay carousel mỗi 5 giây trên mobile & desktop
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [carouselApiDesktop, setCarouselApiDesktop] =
    useState<CarouselApi | null>(null);

  useEffect(() => {
    if (!carouselApi) return;
    const timer = setInterval(() => {
      carouselApi.scrollNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApiDesktop) return;
    const timer = setInterval(() => {
      carouselApiDesktop.scrollNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselApiDesktop]);

  return (
    <section className="py-12 px-4 bg-transparent">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold">
            Các sản phẩm mình dùng
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Danh sách những món đồ hỗ trợ mình trong quá trình xây dựng QuizKen.
          </p>
        </div>

        {hasItems ? (
          <>
            <div className="md:hidden relative">
              <Carousel
                opts={{
                  align: "center",
                  dragFree: false,
                  loop: true,
                  containScroll: "keepSnaps",
                  slidesToScroll: 1,
                }}
                setApi={setCarouselApi}>
                <CarouselContent className="ml-0">
                  {mobileItems.map((item, i) => (
                    <CarouselItem
                      key={i}
                      className="basis-[85%] sm:basis-[70%] pl-0">
                      <Card className="group border rounded-lg overflow-hidden transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg max-w-[260px] mx-auto">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )}
                        <CardContent className="pt-4 space-y-2">
                          <h3 className="text-base font-semibold">
                            {item.title}
                          </h3>
                          {item.note && (
                            <p className="text-sm text-muted-foreground">
                              {item.note}
                            </p>
                          )}
                          {item.price && (
                            <p className="text-sm font-medium">
                              Giá: {item.price}
                            </p>
                          )}
                          <div>
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() =>
                                window.dispatchEvent(
                                  new CustomEvent("analytics", {
                                    detail: {
                                      event: "shopee_product_click",
                                      title: item.title,
                                    },
                                  })
                                )
                              }>
                              <Button variant="outline" size="sm">
                                Xem sản phẩm
                              </Button>
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>

            <div className="hidden md:block">
              <Carousel
                opts={{ align: "start", dragFree: true, loop: true }}
                setApi={setCarouselApiDesktop}>
                <CarouselContent>
                  {items.map((item, i) => (
                    <CarouselItem
                      key={i}
                      className="basis-[25%] lg:basis-[25%]">
                      <Card className="group border rounded-lg overflow-hidden transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg max-w-[260px] mx-auto">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        )}
                        <CardContent className="pt-4 space-y-2">
                          <h3 className="text-base font-semibold">
                            {item.title}
                          </h3>
                          {item.note && (
                            <p className="text-sm text-muted-foreground">
                              {item.note}
                            </p>
                          )}
                          {item.price && (
                            <p className="text-sm font-medium">
                              Giá: {item.price}
                            </p>
                          )}
                          <div>
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() =>
                                window.dispatchEvent(
                                  new CustomEvent("analytics", {
                                    detail: {
                                      event: "shopee_product_click",
                                      title: item.title,
                                    },
                                  })
                                )
                              }>
                              <Button variant="outline" size="sm">
                                Xem sản phẩm
                              </Button>
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </>
        ) : (
          <div className="text-center space-y-2">
            <Button
              size="lg"
              variant="outline"
              disabled
              title="Chưa có link Shopee - vui lòng cấu hình">
              Chưa có sản phẩm
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export const AboutSocialLinks = () => {
  const links = [
    { label: "Facebook", href: "https://www.facebook.com/qkanengk30825", color: "bg-blue-600 hover:bg-blue-700 text-white" },
    { label: "GitHub", href: "https://github.com/khanhnkq", color: "bg-gray-900 hover:bg-black text-white" },
    { label: "Email", href: "mailto:khanhnkq@gmail.com", color: "bg-red-500 hover:bg-red-600 text-white" },
  ];
  return (
    <section className="py-20 px-4 bg-transparent border-t border-border/40">
      <div className="container mx-auto max-w-4xl text-center space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2">
            <Sparkles className="w-6 h-6 text-[#B5CC89]" />
          </div>
          <h2 className="text-3xl font-bold">Kết nối với mình</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Mình luôn sẵn sàng lắng nghe ý kiến đóng góp hoặc đơn giản là một lời chào từ bạn.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          {links.map((l, i) => (
            <a
              key={i}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-8 py-3 rounded-2xl font-bold transition-all hover:-translate-y-1 shadow-lg hover:shadow-xl ${l.color}`}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
