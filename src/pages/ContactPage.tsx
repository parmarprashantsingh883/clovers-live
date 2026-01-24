import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, MessageCircle, HelpCircle, FileText, Headphones } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import Breadcrumb from "@/components/Breadcrumb";


const faqs = [
  { question: "What are your delivery hours?", answer: "We deliver 7 days a week from 8 AM to 10 PM. Same-day delivery is available for orders placed before 2 PM." },
  { question: "What is your return policy?", answer: "We accept returns within 7 days of purchase for non-perishable items. Perishable items can be returned within 24 hours if there's a quality issue." },
  { question: "Do you offer free delivery?", answer: "Yes! We offer free delivery on orders over $50. Orders under $50 have a flat delivery fee of $4.99." },
  { question: "How do I track my order?", answer: "Once your order is dispatched, you'll receive a tracking link via email and SMS. You can also track orders in the 'My Orders' section." },
];

const contactMethods = [
  { icon: Phone, title: "Phone Support", value: "1-800-CLOVERS", description: "Available 24/7" },
  { icon: Mail, title: "Email", value: "support@clovers.com", description: "Response within 2 hours" },
  { icon: MessageCircle, title: "Live Chat", value: "Start a chat", description: "Instant response" },
  { icon: MapPin, title: "Store Locations", value: "Find a store", description: "50+ locations" },
];

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
     


      <main>
        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-primary to-primary/80 py-16">
          <div className="container text-center text-primary-foreground">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Headphones className="w-8 h-8" />
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 animate-fade-up">
              How Can We Help?
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Our customer support team is here to assist you 24/7.
            </p>
          </div>
        </section>
        <Breadcrumb />

        {/* Contact Methods */}
        <section className="py-12 bg-card border-b border-border">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {contactMethods.map((method, index) => (
                <div
                  key={method.title}
                  className="p-6 rounded-2xl bg-muted/50 hover:bg-muted transition-colors text-center animate-fade-up cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <method.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{method.title}</h3>
                  <p className="text-primary font-medium">{method.value}</p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & FAQs */}
        <section className="py-16">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="animate-fade-up">
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
                  Send Us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Subject</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Your message..."
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="w-full">
                    Send Message
                  </Button>
                </form>
              </div>

              {/* FAQs */}
              <div className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="p-4 bg-card rounded-xl shadow-soft">
                      <div className="flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                          <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Store Hours */}
        <section className="py-12 bg-muted/30">
          <div className="container">
            <div className="max-w-xl mx-auto text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Store Hours</h2>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="p-4 bg-card rounded-xl">
                  <p className="font-medium text-foreground">Monday - Friday</p>
                  <p className="text-muted-foreground">7:00 AM - 11:00 PM</p>
                </div>
                <div className="p-4 bg-card rounded-xl">
                  <p className="font-medium text-foreground">Saturday - Sunday</p>
                  <p className="text-muted-foreground">8:00 AM - 10:00 PM</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Online shopping available 24/7!</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
