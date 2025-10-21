import {
  Sparkles,
  BookOpen,
  Users,
  Target,
  Zap,
  Award,
  Star,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: Sparkles,
      title: "Tạo nội dung bằng AI",
      description:
        "AI tiên tiến tạo ra câu hỏi thông minh, phù hợp ngữ cảnh theo đúng chủ đề của bạn.",
    },
    {
      icon: Zap,
      title: "Kết quả tức thì",
      description:
        "Tạo trọn bộ quiz trong vài giây thay vì hàng giờ. Tiết kiệm thời gian và tăng hiệu suất.",
    },
    {
      icon: BookOpen,
      title: "Nhiều chủ đề",
      description:
        "Tạo quiz cho mọi lĩnh vực: khoa học, lịch sử, ngôn ngữ hoặc chủ đề tùy chỉnh.",
    },
    {
      icon: Target,
      title: "Tùy chỉnh độ khó",
      description:
        "Điều chỉnh mức độ khó từ cơ bản đến nâng cao cho đúng đối tượng người học.",
    },
    {
      icon: Users,
      title: "Phù hợp cho mọi người",
      description:
        "Lý tưởng cho giáo viên, huấn luyện viên, người tạo nội dung và bất kỳ ai cần quiz.",
    },
    {
      icon: Award,
      title: "Câu hỏi chất lượng",
      description:
        "Mỗi câu hỏi đều có giải thích chi tiết để tăng hiệu quả học tập.",
    },
  ];

  return (
    <section id="features" className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Star className="w-12 h-12 text-[#B5CC89]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Vì sao chọn QuizKen
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cách thông minh nhất để tạo các bài kiểm tra hấp dẫn. Sử dụng AI
            tiên tiến để cung cấp nội dung giáo dục chất lượng ngay lập tức.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-2 hover:border-[#B5CC89] transition-colors duration-300 hover:shadow-lg">
              <CardContent className="p-8 text-center space-y-4">
                <div className="inline-flex p-4 bg-[#B5CC89]/20 rounded-2xl">
                  <feature.icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-12 pointer-events-none">
        <div className="container mx-auto max-w-7xl h-full">
          <div className="h-px bg-border/50" />
        </div>
      </div>
    </section>
  );
};

export default Features;
