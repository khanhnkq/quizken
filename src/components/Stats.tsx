import dogCharacter from "@/assets/dog-character.png";

const Stats = () => {
  return (
    <section className="py-20 px-4 bg-secondary/50">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Character */}
          <div className="relative flex justify-center lg:justify-start">
            <div className="relative">
              <img 
                src={dogCharacter} 
                alt="Cute shiba inu character" 
                className="w-80 h-80 object-contain drop-shadow-xl"
              />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 bg-muted/50 rounded-full blur-lg" />
            </div>
          </div>

          {/* Right - Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Perfect Care for Every <span className="text-primary">Paw</span>,{" "}
                <span className="text-primary">Wing</span>, and{" "}
                <span className="text-primary">Whisker</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                At PawPrint Care, we believe in treating every pet like family with personalized attention and expert medical care.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">3-5</div>
                <div className="text-sm text-muted-foreground">Min Response</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">98%</div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold text-primary">1,500+</div>
                <div className="text-sm text-muted-foreground">Happy Pets</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
