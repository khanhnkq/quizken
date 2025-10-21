import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Brain, Target, Users, Award } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const About = () => {
  return (
    <>
      <Navbar />

      <div id="smooth-content">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background pt-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8 lg:space-y-10 py-16">
              <div className="flex justify-center">
                <Sparkles className="w-16 h-16 text-[#B5CC89]" />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-normal leading-snug md:leading-normal">
                Về <span className="text-primary">QuizKen</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Chúng tôi sáng tạo nền tảng tạo bài kiểm tra thông qua trí tuệ
                nhân tạo, giúp giáo viên, nhà đào tạo và người sáng tạo nội dung
                tạo ra các bài kiểm tra chất lượng cao chỉ trong vài phút.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 px-4 bg-background">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-bold">
                  Câu chuyện của chúng tôi
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  QuizKen được thành lập từ niềm đam mê với việc cách mạng hóa
                  cách chúng ta học và dạy. Chúng tôi nhận thấy rằng việc tạo
                  bài kiểm tra chất lượng cao thường tốn thời gian, nên chúng
                  tôi quyết định sử dụng sức mạnh của AI để giải quyết vấn đề
                  này.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Với công nghệ AI tiên tiến, chúng tôi giúp giáo viên tập trung
                  vào điều quan trọng nhất: kết nối với học sinh và phát triển
                  khả năng dạy học. Hãy để AI lo phần tạo bài kiểm tra.
                </p>
                <div className="flex items-center gap-4 pt-6">
                  <div className="flex -space-x-4">
                    <div className="w-12 h-12 rounded-full bg-[#B5CC89] border-2 border-background flex items-center justify-center">
                      <Users className="w-6 h-6 text-black" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#B5CC89]/80 border-2 border-background flex items-center justify-center">
                      <Brain className="w-6 h-6 text-black" />
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#B5CC89]/60 border-2 border-background flex items-center justify-center">
                      <Zap className="w-6 h-6 text-black" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">Tham gia cùng cộng đồng</p>
                    <p className="text-sm text-muted-foreground">
                      Bởi những nhà giáo dục cho những nhà giáo dục
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#B5CC89]/20 to-accent/20 rounded-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#B5CC89] rounded-xl">
                      <Target className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Sứ mệnh của chúng tôi</h3>
                      <p className="text-sm text-muted-foreground">
                        Trao quyền cho nhà giáo dục với AI
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#B5CC89]/80 rounded-xl">
                      <Users className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Tầm nhìn của chúng tôi</h3>
                      <p className="text-sm text-muted-foreground">
                        Đổi mới trải nghiệm giáo dục toàn cầu
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#B5CC89]/60 rounded-xl">
                      <Award className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Giá trị của chúng tôi</h3>
                      <p className="text-sm text-muted-foreground">
                        Chất lượng, đổi mới và sự bao gồm
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl md:text-5xl font-bold">
                Nhóm của chúng tôi
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Những chuyên gia đam mê về giáo dục và công nghệ cùng nhau xây
                dựng tương lai học tập
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#B5CC89] to-[#B5CC89]/60 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center">
                    <Brain className="w-12 h-12 text-[#B5CC89]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Khang Nguyễn</h3>
                  <p className="text-muted-foreground">AI Engineer & Founder</p>
                  <p className="text-sm mt-2">
                    Chuyên gia AI với niềm đam mê áp dụng công nghệ để giải
                    quyết vấn đề giáo dục
                  </p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#B5CC89]/80 to-[#B5CC89]/40 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center">
                    <Users className="w-12 h-12 text-[#B5CC89]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Nhóm Giáo dục</h3>
                  <p className="text-muted-foreground">
                    Giáo viên & Chuyên gia
                  </p>
                  <p className="text-sm mt-2">
                    Nhóm giáo viên tận tâm cung cấp chuyên môn và hiểu biết thực
                    tiễn
                  </p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#B5CC89]/60 to-[#B5CC89]/20 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center">
                    <Zap className="w-12 h-12 text-[#B5CC89]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Nhóm Phát triển</h3>
                  <p className="text-muted-foreground">Kỹ sư & Nhà thiết kế</p>
                  <p className="text-sm mt-2">
                    Xây dựng sản phẩm tuyệt vời với đam mê và sự chính xác
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 bg-background">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl md:text-5xl font-bold">QuizKen số liệu</h2>
              <p className="text-lg text-muted-foreground">
                Tác động của chúng tôi đến cộng đồng giáo dục
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center space-y-4">
                <div className="text-5xl font-bold text-primary">100K+</div>
                <p className="text-muted-foreground">Bài kiểm tra đã tạo</p>
              </div>
              <div className="text-center space-y-4">
                <div className="text-5xl font-bold text-primary">50K+</div>
                <p className="text-muted-foreground">
                  Giáo viên đang hoạt động
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="text-5xl font-bold text-primary">150+</div>
                <p className="text-muted-foreground">Trường học và tổ chức</p>
              </div>
              <div className="text-center space-y-4">
                <div className="text-5xl font-bold text-primary">4.9★</div>
                <p className="text-muted-foreground">Đánh giá của người dùng</p>
              </div>
            </div>
          </div>
        </section>

        {/* Join Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="container mx-auto max-w-4xl text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Tham gia cùng chúng tôi
            </h2>
            <p className="text-lg text-muted-foreground">
              Sẵn sàng cách mạng hóa cách bạn tạo và quản lý bài kiểm tra với
              AI?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-base group text-white hover:bg-white hover:text-black transition-colors"
                onClick={() => {
                  document.getElementById("generator")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}>
                Bắt đầu ngay
                <div className="bg-[#B5CC89] p-1 rounded-lg ml-2">
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
              <Button
                variant="outline"
                size="lg"
                className="text-base"
                onClick={() =>
                  window.open(
                    "https://www.facebook.com/qkanengk30825",
                    "_blank"
                  )
                }>
                Liên hệ với chúng tôi
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;
