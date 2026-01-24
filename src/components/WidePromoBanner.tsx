import { useEffect, useState } from "react";
import axios from "axios";
import "../assets/css/wide-banner.css";

const API = "http://localhost:5000/wideBanners";

export default function WidePromoBanner({ page }) {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    axios.get(API).then(res => {
      const data = res.data.find(b => b.page === page);
      setBanner(data);
    });
  }, [page]);

  if (!banner) return null;

  return (
    <section
      className="wide-banner"
      style={{ backgroundImage: `url(${banner.image})` }}
    >
      <div className="wide-text">
        <h1>{banner.title}</h1>
        <p>{banner.subtitle}</p>
        <button>{banner.buttonText}</button>
      </div>
    </section>
  );
}
