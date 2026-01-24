import { Header } from "@/components/Header";
import { HeroSlider } from "@/components/HeroSlider";
import { Features } from "@/components/Features";
import  BestDeals  from "@/components/BestDeals";
import BestSelling from "@/components/BestSelling";
import TrendingProducts from "@/components/TrendingProducts";

import  Categories  from "@/components/Categories";



import { Footer } from "@/components/Footer";
import PromoBanner from "../components/PromoBanner";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header  />
      <main>
        <HeroSlider />
        <Features />
  
        <Categories />
        <BestDeals />
        <BestSelling/>
        <TrendingProducts />
        
<PromoBanner page="home" />



      
      </main>
      <Footer />
    </div>
  );
};

export default Index;
