import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as Icons from "lucide-react";
import { Link } from "react-router-dom";
import Skeleton from "@/components/ui/Skeleton";


const API = "https://clovers-live-production.up.railway.app/categories";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const CATEGORY_PAGE_MAP = {
  fruits: "/food",
  vegetables: "/food",
  dairy: "/food",
  snacks: "/food",
  munchies: "/food",
  bakery: "/food",
  frozen: "/food",
  beverages: "/beverages",
  "personal-care": "/personal-care",
  household: "/household",
};


  /* ================= FETCH ================= */
  useEffect(() => {
    const start = Date.now();

    axios.get(API).then(res => {
      setCategories(res.data);

      const elapsed = Date.now() - start;
      const MIN = 800;

      setTimeout(() => setLoading(false), Math.max(MIN - elapsed, 0));
    });
  }, []);

  /* ============== INFINITE LOOP ============== */
  useEffect(() => {
  const slider = sliderRef.current;
  if (!slider) return;

  const card = slider.querySelector(".category-card");
  if (!card) return;

  const cardWidth = card.offsetWidth + 18;

  const onScroll = () => {
    const index = Math.round(slider.scrollLeft / cardWidth);
    setActiveIndex(index % categories.length);
  };

  slider.addEventListener("scroll", onScroll);
  return () => slider.removeEventListener("scroll", onScroll);
}, [categories]);

  /* ============== DRAG MOMENTUM ============== */
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    slider.addEventListener("mousedown", e => {
      isDown = true;
      slider.classList.add("dragging");
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener("mouseup", () => {
      isDown = false;
      slider.classList.remove("dragging");
    });

    slider.addEventListener("mouseleave", () => {
      isDown = false;
      slider.classList.remove("dragging");
    });

    slider.addEventListener("mousemove", e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.2;
      slider.scrollLeft = scrollLeft - walk;
    });
  }, []);

  /* ============== BUTTON SCROLL ============== */
  const scroll = dir => {
    const slider = sliderRef.current;
    if (!slider) return;

    const card = slider.querySelector(".category-card");
    if (!card) return;

    const gap = 18;
    const cardWidth = card.offsetWidth + gap;
    const visible = Math.floor(slider.offsetWidth / cardWidth);

    slider.scrollBy({
      left: dir === "left"
        ? -visible * cardWidth
        : visible * cardWidth,
      behavior: "smooth"
    });
  };

  const looped = [...categories, ...categories];

  return (
    <section className="category-strip">
      <div className="container">

        {/* HEADER */}
        <div className="category-header">
          <h2>Category</h2>

          <div className="category-nav">
            <span>View All Categories →</span>
            <button onClick={() => scroll("left")}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scroll("right")}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* SLIDER */}
        <div className="category-slider" ref={sliderRef}>
          {loading
            ? [...Array(6)].map((_, i) => (
                <div className="category-card" key={i}>
                  <Skeleton type="circle" />
                  <Skeleton width="70%" />
                </div>
              ))
            : looped.map((cat, i) => {
                const Icon = Icons[cat.icon] || Icons.Box;

                return (
          <Link
  key={i}
  to={`${CATEGORY_PAGE_MAP[cat.categorySlug] || "/food"}?category=${cat.categorySlug}`}
  className="category-card"
>
  <div className="category-icon">
    <Icon size={28} />
  </div>
  <p>{cat.name}</p>
</Link>

                );
              })}
        </div>

        {/* DOTS */}
        <div className="category-dots">
  {categories.map((_, i) => (
    <span
      key={i}
      className={i === activeIndex ? "active" : ""}
    />
  ))}
</div>


      </div>
    </section>
  );
}
