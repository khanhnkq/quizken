const stats = [
  { number: "50K+", label: "Quizzes Generated" },
  { number: "100+", label: "Topics Covered" },
  { number: "99%", label: "Satisfaction Rate" },
  { number: "<10s", label: "Average Generation" },
];

const Stats = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Trusted by Educators Worldwide
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of teachers, trainers, and content creators who use QuizAI to create engaging educational content.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-secondary/20 backdrop-blur-sm">
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
