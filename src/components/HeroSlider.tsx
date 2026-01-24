import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroBread from "@/assets/hero-bread.jpg";
import heroFruits from "@/assets/hero-fruits.jpg";
import heroDairy from "@/assets/hero-dairy.jpg";

const slides = [
  {
    id: 1,
    image: heroBread,
    subtitle: "Easy, Fresh & Convenient",
    title: "Stock Up on",
    highlight: "Daily Essentials",
    description: "Save Big on Your Favorite Brands",
    link: "/deals",
    buttonText: "Shop Now",
  },
  {
    id: 2,
    image: heroFruits,
    subtitle: "Farm Fresh Goodness",
    title: "Fresh Fruits &",
    highlight: "Vegetables",
    description: "Up to 40% Off on Organic Produce",
    link: "/food",
    buttonText: "Explore Fresh",
  },
  {
    id: 3,
    image: heroDairy,
    subtitle: "Pure & Natural",
    title: "Premium Dairy",
    highlight: "Products",
    description: "Quality Milk, Cheese & More",
    link: "/beverages",
    buttonText: "Shop Dairy",
  },
];

export const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  const slide = slides[currentSlide];

  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] overflow-hidden">
      {/* Background images */}
      {slides.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={s.image}
            alt={s.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="container relative z-10 flex items-center min-h-[60vh] md:min-h-[70vh] py-12">
        <div className="max-w-xl">
          <p
            key={`subtitle-${currentSlide}`}
            className="text-lg md:text-xl text-muted-foreground mb-2 animate-fade-up"
          >
            {slide.subtitle}
          </p>
          <h1
            key={`title-${currentSlide}`}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 leading-tight animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            {slide.title}
            <br />
            <span className="text-primary">{slide.highlight}</span>
          </h1>
          <p
            key={`desc-${currentSlide}`}
            className="text-xl md:text-2xl text-foreground/80 mb-8 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            {slide.description}
          </p>
          <Link to={slide.link}>
            <Button
              variant="hero"
              size="xl"
              className="animate-fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              {slide.buttonText}
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-card/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-card transition-colors group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-card/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-card transition-colors group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-primary w-8"
                : "bg-foreground/30 hover:bg-foreground/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
