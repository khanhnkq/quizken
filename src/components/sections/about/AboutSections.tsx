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
} from '@/lib/icons';
import logo from "@/assets/logo/logo.png";
import { useEffect, useState, type MouseEvent } from "react";
import { gsap } from "gsap";

export const SEOHead = () => {
  useEffect(() => {
    const title = "Giới thiệu QuizKen - Nguyễn Khánh";
    const description =
      "Nền tảng tạo bài kiểm tra bằng AI cho giáo viên, học sinh, sinh viên, creator. Mình xây dựng QuizKen để giúp tạo đề chất lượng trong vài phút.";
    document.title = title;
    const ensureMeta = (attr: string, key: string, value: string) => {
      let el = document.querySelector(
        `meta[${attr}='${key}']`
      ) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };
    ensureMeta("name", "description", description);
    ensureMeta("property", "og:title", title);
    ensureMeta("property", "og:description", description);
    ensureMeta("property", "og:type", "website");
    ensureMeta("property", "og:url", window.location.href);
    ensureMeta("property", "og:image", "/favicon/android-chrome-512x512.png");
    ensureMeta("name", "twitter:card", "summary_large_image");
    ensureMeta("name", "twitter:title", title);
    ensureMeta("name", "twitter:description", description);
  }, []);
  return null;
};

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
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background pt-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8 lg:space-y-10 py-16">
          <div className="flex justify-center">
            <img
              src={logo}
              alt="Avatar Nguyễn Khánh"
              className="w-20 h-20 rounded-full ring-4 ring-primary/20 bg-background object-cover"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-normal leading-snug md:leading-normal">
            Xin chào, mình là <span className="text-primary">Nguyễn Khánh</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Mình xây dựng QuizKen không chỉ là nơi học — mà là nơi thực hành,
            chia sẻ và phát triển.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="hero"
              size="lg"
              className="group text-base flex items-center gap-2 w-full sm:w-auto hover:bg-black hover:text-white transition-colors"
              onClick={handlePrimary}
              onMouseEnter={handleHoverEnter}
              onMouseLeave={handleHoverLeave}>
              Tạo Bài Kiểm Tra Ngay
              <div className="bg-[#B5CC89] p-1 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-black group-hover:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
            </Button>
            <Link to="/library">
              <Button variant="outline" size="lg" className="text-base">
                Xem thư viện
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export const AboutMissionVision = () => {
  return (
    <section className="py-16 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl p-8 bg-gradient-to-br from-[#B5CC89]/20 to-accent/20 space-y-3">
            <div className="inline-flex p-3 bg-[#B5CC89] rounded-xl">
              <Target className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-2xl font-semibold">Sứ mệnh</h3>
            <p className="text-muted-foreground">
              Giúp học tập trở nên dễ tiếp cận, thực tiễn và thú vị hơn thông
              qua trắc nghiệm tương tác. Tận dụng sức mạnh của AI để hỗ trợ
              người học tạo nội dung nhanh, chính xác và sáng tạo. Kết nối cộng
              đồng người học để cùng nhau đóng góp, chia sẻ và cải thiện nguồn
              tài nguyên học tập. Truyền cảm hứng học chủ động, nơi mỗi sai lầm
              là một bước tiến trong quá trình hiểu biết.
            </p>
          </div>
          <div className="rounded-2xl p-8 bg-gradient-to-br from-[#B5CC89]/10 to-accent/10 space-y-3">
            <div className="inline-flex p-3 bg-[#B5CC89]/80 rounded-xl">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-2xl font-semibold">Tầm nhìn</h3>
            <p className="text-muted-foreground">
              Quizken hướng đến việc trở thành một thư viện mở về học tập chủ
              động, nơi mọi người có thể học bằng cách làm, không chỉ ghi nhớ mà
              thật sự hiểu và áp dụng. Mục tiêu của mình là xây dựng một cộng
              đồng học tập tương tác, nơi kiến thức được chia sẻ, mở rộng và
              phát triển liên tục bởi chính người học.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export const AboutStory = () => {
  return (
    <section className="relative py-20 px-4 bg-background overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-[#B5CC89]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="container mx-auto max-w-7xl relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium">
                Hành trình
              </span>
              <Sparkles className="w-4 h-4 text-[#B5CC89]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Đôi lời về <span className="text-primary">Quizken</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:mr-2 first-letter:text-primary first-letter:float-left">
              Xin chào, mình là Khánh, hiện đang học tập và làm việc tại Đà
              Nẵng. Trong quá trình học, mình nhận ra một điều đơn giản mà quan
              trọng: lý thuyết chỉ thật sự hiệu quả khi được thực hành.
              <br></br>
              <br></br>Mình không giỏi ghi nhớ bằng cách đọc hay nghe, nhưng mỗi
              khi trực tiếp làm bài, thử nghiệm và sai, kiến thức lại in sâu hơn
              rất nhiều. Vì vậy, mình thường tìm hoặc nhờ AI tạo ra các bài trắc
              nghiệm để tự luyện tập. Nhưng việc tự làm – tự chấm – tự kiểm tra
              thật sự khá mất thời gian. Và đó chính là lý do Quizken ra đời.
            </p>
            <div className="rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#B5CC89] shrink-0 mt-0.5" />
                <p className="italic text-base md:text-lg leading-relaxed text-foreground">
                  Quizken giúp bạn tạo ra bài trắc nghiệm bằng AI, và làm – chấm
                  điểm trực tiếp ngay trên web, không cần thao tác thủ công. Mỗi
                  bài trắc nghiệm bạn tạo sẽ được lưu lại trong thư viện dùng
                  chung, nơi mọi người có thể khám phá, luyện tập và chia sẻ
                  kiến thức cùng nhau.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs md:text-sm px-3 py-1 rounded-full bg-muted text-foreground/80">
                Tạo bài tập trong tic tắc
              </span>
              <span className="text-xs md:text-sm px-3 py-1 rounded-full bg-muted text-foreground/80">
                Câu hỏi rõ ràng
              </span>
              <span className="text-xs md:text-sm px-3 py-1 rounded-full bg-muted text-foreground/80">
                Dễ dùng, trực quan
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#B5CC89]/20 to-accent/20 rounded-2xl p-8">
            <div className="relative">
              <div
                className="absolute left-2 top-0 bottom-0 w-px bg-border/70"
                aria-hidden="true"
              />
              <ul className="space-y-6 text-muted-foreground pl-6">
                <li className="relative">
                  <span className="absolute -left-[22px] top-1.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(181,204,137,0.25)]" />
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                    <span>
                      “Mình tin rằng quizken không chỉ giúp các bạn học sinh,
                      sinh viên mà còn có thể giúp giáo viên có thêm thời gian
                      cho điều quan trọng nhất: kết nối với học sinh và truyền
                      cảm hứng học tập chủ động.”
                    </span>
                  </div>
                </li>
                <li className="relative">
                  <span className="absolute -left-[22px] top-1.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(181,204,137,0.25)]" />
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-primary mt-0.5" />
                    <span>
                      Có thể nhanh chóng đưa ra các câu hỏi trắc nghiệm phù hợp
                      với mọi người
                    </span>
                  </div>
                </li>
                <li className="relative">
                  <span className="absolute -left-[22px] top-1.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_0_4px_rgba(181,204,137,0.25)]" />
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-primary mt-0.5" />
                    <span>Mình muốn xây dụng một cộng đồng tích cực</span>
                  </div>
                </li>
              </ul>
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
    },
    { title: "Tốc độ", desc: "Tạo bài tập trong tic tắc", icon: Zap },
    {
      title: "Dễ dùng",
      desc: "Giao diện trực quan, bắt đầu ngay",
      icon: MousePointer,
    },
    {
      title: "Người dùng",
      desc: "Phù hợp với tất cả mọi người",
      icon: Users,
    },
  ];
  return (
    <section className="py-16 px-4 bg-muted/50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold">Giá trị cốt lõi</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Những nguyên tắc định hình sản phẩm và trải nghiệm
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#B5CC89] to-[#B5CC89]/60 flex items-center justify-center">
                  <Icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold">{v.title}</h3>
                <p className="text-muted-foreground text-sm">{v.desc}</p>
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
    <section className="py-12 px-4 bg-background">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold">
            Các sản phẩm mình yêu thích & dùng khi làm web này
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
  type LinkItem = { label: string; href: string; disabled?: boolean };
  const links: LinkItem[] = [
    { label: "Facebook", href: "https://www.facebook.com/qkanengk30825" },
    { label: "GitHub", href: "https://github.com/" },
    { label: "CV", href: "https://" },
  ];
  return (
    <section className="py-12 px-4 bg-background">
      <div className="container mx-auto max-w-7xl text-center">
        <div className="inline-flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-[#B5CC89]" />
          <span className="text-sm text-muted-foreground">Kết nối với tôi</span>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          {links.map((l, i) =>
            l.disabled ? (
              <Button key={i} variant="outline" disabled>
                {l.label}
              </Button>
            ) : (
              <a
                key={i}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("analytics", {
                      detail: {
                        event: `social_${l.label.toLowerCase()}_click`,
                      },
                    })
                  )
                }>
                <Button variant="outline">{l.label}</Button>
              </a>
            )
          )}
        </div>
      </div>
    </section>
  );
};
