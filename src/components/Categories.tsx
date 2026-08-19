import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";

const DEPT_ROUTE: Record<string, string> = {
  Food: "/food",
  Beverages: "/beverages",
  Munchies: "/munchies",
  Household: "/household",
  "Personal Care": "/personal-care",
};

/**
 * "Shop by category" image tiles — built from the live catalog: one tile per
 * real category, using an actual product photo, linking to its department page.
 */
export default function Categories() {
  const [tiles, setTiles] = useState<any[]>([]);

  useEffect(() => {
    api.get("/products").then((res) => {
      const seen = new Map<string, any>();
      for (const p of res.data) {
        if (!p.category || seen.has(p.category)) continue;
        seen.set(p.category, {
          name: p.category,
          image: p.image,
          to: DEPT_ROUTE[p.department] || "/food",
        });
      }
      setTiles([...seen.values()]);
    });
  }, []);

  if (tiles.length === 0) return null;

  return (
    <section className="container" style={{ padding: "34px 0 4px" }}>
      <div className="shelf-head">
        <h2>Shop by category</h2>
      </div>

      <div className="cat-tiles">
        {tiles.map((t) => (
          <Link key={t.name} to={t.to} className="cat-tile">
            <span className="cat-tile-img">
              <img
                src={t.image}
                alt={t.name}
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
              />
            </span>
            <span className="cat-tile-name">{t.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
