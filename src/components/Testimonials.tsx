import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MessageSquare } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Mitchell",
      initial: "S",
      role: "Giáo viên trung học",
      text: "QuizKen đã thay đổi hoàn toàn cách tôi tạo bài kiểm tra. Việc từng mất hàng giờ giờ chỉ còn vài phút, và học sinh của tôi rất thích những câu hỏi hấp dẫn!",
      rating: 5,
    },
    {
      name: "David Park",
      initial: "D",
      role: "Chuyên gia đào tạo doanh nghiệp",
      text: "Chất lượng quiz do AI tạo ra thật xuất sắc. Rất phù hợp cho chương trình đào tạo nhân viên và đánh giá năng lực.",
      rating: 5,
    },
    {
      name: "Maria Garcia",
      initial: "M",
      role: "Người sáng tạo nội dung",
      text: "Công cụ này thực sự bứt phá! Tôi tạo nội dung giáo dục cho hàng nghìn người theo dõi và QuizKen giúp mọi thứ dễ dàng hơn rất nhiều.",
      rating: 5,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <MessageSquare className="w-12 h-12 text-[#B5CC89]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Người dùng nói gì
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn nhà giáo và người tạo nội dung hài lòng
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-2">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-foreground italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3 pt-2">
                  <Avatar>
                    <AvatarFallback className="bg-[#B5CC89] text-black font-semibold">
                      {testimonial.initial}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
