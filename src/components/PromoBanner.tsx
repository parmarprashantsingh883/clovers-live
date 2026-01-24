import { useEffect, useState } from "react";
import axios from "axios";
import "../assets/css/flesdeals.css";

const API = "http://localhost:5000/promoBanners";

export default function PromoBanner({ page }) {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    axios.get(API).then(res => {
      const pageBanners = res.data.filter(b => b.page === page);
      setBanners(pageBanners);
    });
  }, [page]);

  return (
    <section className="promo-wrapper container">
      <div className="promo-grid">
        {banners.map(banner => (
          <div className="promo-box " key={banner.id}>
            <img src={banner.image} className="promo-img" alt={banner.title} />

            {banner.page === "home" && (
              <div className="promo-overlay">
                <span className="mini badge-mini">{banner.mini}</span>
                <h2>{banner.title}<strong>{banner.highlight}</strong></h2>
                <span>{banner.subtitle}</span>
                {<br /> }
                <button>{banner.buttonText}</button>
              </div>
            )}

            {banner.page === "food" && (
              <div className="promo-overlay">
                <span className="mini badge-mini">{banner.mini}</span>
                <h2>{banner.title}<br /><strong>{banner.highlight}</strong></h2>
                <span>{banner.subtitle}</span>
                {<br />}
                <button>{banner.buttonText}</button>
              </div>
            )}

            
          </div>
        ))}
      </div>
    </section>
  );
}
