import { Truck, Store, Headphones, Smartphone } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "To Your Door",
    link: null,
  },
  {
    icon: Store,
    title: "Local Pickup",
    description: "Check Out",
    link: "Locations",
  },
  {
    icon: Headphones,
    title: "Available for You",
    description: "24/7",
    link: "Online Support",
  },
  {
    icon: Smartphone,
    title: "Order on the Go",
    description: "",
    link: "Download Our App",
  },
];

export const Features = () => {
  return (
    <section className="bg-card py-8 border-y border-border">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="flex items-center gap-3 md:gap-4 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm md:text-base">{feature.title}</h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  {feature.link ? (
                    <>
                      {feature.description && `${feature.description} `}
                      <a href="#" className="text-primary hover:underline">{feature.link}</a>
                    </>
                  ) : (
                    feature.description
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
