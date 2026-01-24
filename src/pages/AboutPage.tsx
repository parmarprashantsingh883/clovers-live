import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MapPin, Phone, Mail, Clock, Users, Leaf, Award, Truck } from "lucide-react";
import WidePromoBanner from "@/components/WidePromoBanner";
import Breadcrumb from "@/components/Breadcrumb";

const stats = [
  { icon: Users, label: "Happy Customers", value: "500K+" },
  { icon: Leaf, label: "Organic Products", value: "2000+" },
  { icon: Award, label: "Quality Awards", value: "50+" },
  { icon: Truck, label: "Daily Deliveries", value: "10K+" },
];

const team = [
  { name: "Sarah Johnson", role: "CEO & Founder", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop" },
  { name: "Michael Chen", role: "Head of Operations", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop" },
  { name: "Emily Davis", role: "Quality Manager", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop" },
  { name: "James Wilson", role: "Logistics Director", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop" },
];

const AboutPage = () => {
  return (
    <>
    <div className="min-h-screen bg-background">
      <Header />
     


      <main>
        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-foreground to-foreground/90 py-20">
          <div className="container text-center text-primary-foreground">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 animate-fade-up">
              About <span className="text-primary">Clovers</span>
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Your trusted neighborhood supermarket since 2010, bringing fresh groceries and daily essentials to your doorstep.
            </p>
          </div>
        </section>
        <Breadcrumb />

        {/* Stats */}
        <section className="py-12 bg-card border-b border-border">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-up">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Our Story
                </h2>
                <p className="text-muted-foreground mb-4">
                  Clovers started as a small family grocery store in 2010 with a simple mission: to provide fresh, quality groceries at affordable prices. What began as a single store has now grown into a trusted online supermarket serving thousands of families daily.
                </p>
                <p className="text-muted-foreground mb-4">
                  We believe in sourcing locally whenever possible, supporting our community's farmers and producers while ensuring you get the freshest products. Our commitment to quality has earned us multiple awards and the trust of over 500,000 happy customers.
                </p>
                <p className="text-muted-foreground">
                  Today, we continue to innovate with same-day delivery, a user-friendly app, and an ever-expanding selection of organic and specialty products. At Clovers, we're not just selling groceries – we're part of your family's daily life.
                </p>
              </div>
              <div className="relative animate-fade-up" style={{ animationDelay: '0.2s' }}>
                <div className="aspect-square rounded-2xl overflow-hidden shadow-hover">
                  <img 
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=600&fit=crop" 
                    alt="Fresh produce at Clovers"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-2xl shadow-lg">
                  <div className="text-4xl font-bold">14+</div>
                  <div className="text-sm">Years of Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-12 animate-fade-up">
              Meet Our Team
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <div key={member.name} className="text-center animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 shadow-card">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-16">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: MapPin, title: "Visit Us", text: "123 Market Street, Fresh City, FC 12345" },
                { icon: Phone, title: "Call Us", text: "1-800-CLOVERS (256-8377)" },
                { icon: Mail, title: "Email Us", text: "support@clovers.com" },
                { icon: Clock, title: "Hours", text: "24/7 Online Shopping" },
              ].map((item, index) => (
                <div key={item.title} className="flex items-start gap-4 p-6 bg-card rounded-2xl shadow-soft animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="wide-banner-wrapper">
      <WidePromoBanner page="home" />
    </section>

      </main>
    

     
    </div>
     
     <Footer />
    </>
  );
};

export default AboutPage;
