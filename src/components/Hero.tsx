import { Button } from "@/components/ui/button";
import heroBread from "@/assets/hero-bread.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img 
          src={heroBread} 
          alt="Fresh bread selection" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="container relative z-10 flex items-center min-h-[60vh] md:min-h-[70vh] py-12">
        <div className="max-w-xl">
          <p className="text-lg md:text-xl text-muted-foreground mb-2 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Easy, Fresh & Convenient
          </p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-tight animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Stock Up on<br />
            <span className="text-primary">Daily Essentials</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            Save Big on Your Favorite Brands
          </p>
          <Button variant="hero" size="xl" className="animate-fade-up" style={{ animationDelay: '0.4s' }}>
            Shop Now
          </Button>
        </div>
      </div>
    </section>
  );
};
