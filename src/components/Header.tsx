import { Search, MapPin, Heart, ShoppingCart, Menu, X, User } from "lucide-react";
import { useState,useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "@/context/WishlistContext";
import axios from "axios";




const navLinks = [
  
  { label: "Deals", href: "/deals" },
  { label: "Food", href: "/food" },
  { label: "Beverages", href: "/beverages" },
   { label: "Munchies", href: "/munchies" },
  { label: "Household", href: "/household" },
  { label: "Personal Care", href: "/personal-care" },
  { label: "About Us", href: "/about" },
   
  
];

export const Header = () => {
  const { totalItems } = useCart();
  const { wishlist } = useWishlist();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);





  const navigate = useNavigate();


  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount] = useState(3);
  const location = useLocation();
  const [showNav, setShowNav] = useState(true);
const [lastScrollY, setLastScrollY] = useState(0);
useEffect(() => {
  const handleScroll = () => {
    setShowNav(window.scrollY < lastScrollY || window.scrollY < 10);
    setLastScrollY(window.scrollY);
  };

  
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [lastScrollY]);

/* fetch the products*/
useEffect(() => {
  axios.get("http://localhost:5000/products").then(res => {
    setSuggestions(res.data);
  });
}, []);


const filteredSuggestions = suggestions
  .filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase())
  )
  .slice(0, 5);

  return (
    <header className="sticky top-0 z-50">
      
      

      {/* Main header */}
      <div className="bg-primary">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="font-display text-2xl md:text-3xl font-bold text-primary-foreground tracking-tight">
            Clovers.
          </Link>
          
          {/* Search bar - desktop */}
       <div className="hidden md:flex flex-1 max-w-md mx-8">
  <div className="relative w-full">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && query.trim()) {
          navigate(`/search?q=${query}`);
          setQuery("");
        }
        if (e.key === "Escape") setQuery("");
      }}
      placeholder="Search products..."
      className="w-full pl-10 pr-4 py-2.5 rounded-full bg-primary-foreground text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
    />

    {/* 🔽 PUT SUGGESTIONS HERE */}
    {query && filteredSuggestions.length > 0 && (
      <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg z-50">
        {filteredSuggestions.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              navigate(`/product/${p.id}`);
              setQuery("");
            }}
          >
            <img
              src={p.image}
              alt={p.name}
              className="w-10 h-10 rounded object-cover"
            />
            <span className="text-sm">{p.name}</span>
          </div>
        ))}
      </div>
    )}
  </div>
</div>


          {/* Icons */}
          <div className="flex items-center gap-3 md:gap-4">
            <button className="p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-full transition-colors md:hidden">
              <Search className="w-5 h-5" />
            </button>
           <button
  className="hidden md:flex p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-full"
  onClick={() => navigate("/profile")}
>
  <User className="w-5 h-5" />
</button>

            <button className="hidden md:flex p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-full transition-colors">
              <MapPin className="w-6 h-5" />
            </button>
            
           <button
  onClick={() => navigate("/wishlist")}
  className="hidden md:flex relative p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-full transition-colors"
>
  <Heart className="w-5 h-5" />

  {wishlist.length > 0 && (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
      {wishlist.length}
    </span>
  )}
</button>


           <button
  onClick={() => navigate("/cart")}
  className="relative p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-full transition-colors"
>
  <ShoppingCart className="w-5 h-5" />

  {totalItems > 0 && (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-100 text-black text-xs font-bold rounded-full flex items-center justify-center">
      {totalItems}
    </span>
  )}
</button>

            <button 
              className="md:hidden p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
     <nav
  className={`bg-card shadow-soft transition-transform duration-300 ${
    showNav ? "translate-y-0" : "-translate-y-full"
  }`}
>

        <div className="container">
          <ul className="hidden md:flex items-center justify-center gap-8 py-4">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link 
                  to={link.href}
                  className={`font-medium transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full  ${
                    location.pathname === link.href ? 'text-primary after:w-full  no-underline' : 'text-foreground hover:text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              {/* <Link to="/orders" className="text-primary font-semibold">My Orders</Link> */}
            </li>
            <li>
              {/* <Link to="/about" className="text-primary font-semibold">About Us</Link> */}
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border animate-slide-in-right">
          <div className="container py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className={`block py-2 font-medium transition-colors ${
                      location.pathname === link.href ? 'text-primary' : 'text-foreground hover:text-primary'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/orders" className="block py-2 text-primary font-semibold" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};
