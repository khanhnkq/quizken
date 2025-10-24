import { Button } from "@/components/ui/button";
import { Sparkles } from "@/lib/icons";
import { type MouseEvent } from "react";
import { gsap } from "gsap";

const Footer = () => {
  const scrollToGenerator = () => {
    const el = document.getElementById("generator");
    if (!el) return;
    const headerHeight =
      (document.querySelector("nav") as HTMLElement | null)?.clientHeight ?? 64;
    const yOffset = -(headerHeight + 8); // account for sticky navbar height + margin
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
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
    <footer
      id="footer"
      className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background min-h-screen py-20 px-4">
      {/* CTA Section */}
      <div className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-center">
              <Sparkles className="w-16 h-16 text-[#B5CC89]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Bắt đầu tạo các bài kiểm tra tuyệt vời ngay hôm nay
            </h2>
            <p className="text-lg text-muted-foreground">
              Cùng tham gia và chia sẻ kiến thức
            </p>
            <div className="flex justify-center">
              <Button
                variant="hero"
                size="lg"
                className="flex items-center gap-2 group"
                onClick={scrollToGenerator}
                onMouseEnter={handleHoverEnter}
                onMouseLeave={handleHoverLeave}>
                Tạo bài kiểm tra đầu tiên của bạn
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
            </div>
          </div>
        </div>
      </div>

      {/* Footer Links */}

      {/* Copyright */}
      <div className="border-t py-6 px-4">
        <div className="container mx-auto max-w-7xl">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 QuizKen. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
