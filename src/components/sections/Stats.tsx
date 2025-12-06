import { Users } from '@/lib/icons';

const stats = [
  { number: "50K+", label: "Quiz đã tạo" },
  { number: "100+", label: "Chủ đề được bao phủ" },
  { number: "99%", label: "Mức độ hài lòng" },
  { number: "<10s", label: "Thời gian tạo trung bình" },
];

const Stats = () => {
  return (
    <section id="stats" className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="space-y-12">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Users className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Được tin dùng bởi nhà giáo trên toàn thế giới
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tham gia cùng hàng nghìn giáo viên, huấn luyện viên và người tạo
              nội dung đang dùng QuizKen để tạo nội dung học tập hấp dẫn.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-secondary/20 backdrop-blur-sm">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
