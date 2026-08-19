import { Search, Heart, ShoppingCart, Menu, X, User, ChevronDown, MapPin, Package, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import CartDrawer from "./CartDrawer";

const navLinks = [
  { label: "Deals", href: "/deals" },
  { label: "Food", href: "/food" },
  { label: "Beverages", href: "/beverages" },
  { label: "Munchies", href: "/munchies" },
  { label: "Household", href: "/household" },
  { label: "Personal Care", href: "/personal-care" },
  { label: "About Us", href: "/about" },
];

const SEARCH_HINTS = ['Search "milk"', 'Search "chips"', 'Search "chocolate"', 'Search "shampoo"', 'Search "ice cream"'];

export const Header = () => {
  const { totalItems, totalPrice } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout } = useAuth() as any;
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // rotating search placeholder
  useEffect(() => {
    const t = setInterval(() => setHintIdx((i) => (i + 1) % SEARCH_HINTS.length), 3000);
    return () => clearInterval(t);
  }, []);

  // debounced server-side suggestions
  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); return; }
    const t = setTimeout(() => {
      api.get("/products", { params: { q: query.trim(), limit: 6 } })
        .then((res) => setSuggestions(res.data))
        .catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  // close popovers on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggest(false);
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const goSearch = () => {
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
    setShowSuggest(false);
  };

  const SuggestList = () =>
    showSuggest && query && suggestions.length > 0 ? (
      <div className="absolute top-full mt-1.5 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[70]">
        {suggestions.map((p) => (
          <button
            key={p.id}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-gray-50 text-left"
            onClick={() => { navigate(`/product/${p.id}`); setQuery(""); setShowSuggest(false); }}
          >
            <img
              src={p.image}
              alt=""
              className="w-9 h-9 rounded-md object-contain border bg-white shrink-0"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden"; }}
            />
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-medium text-gray-800 truncate">{p.name}</span>
              <span className="block text-[11px] text-gray-400">{p.weight} · ₹{p.price}</span>
            </span>
            <Search size={13} className="text-gray-300 shrink-0" />
          </button>
        ))}
        <button
          className="w-full px-3.5 py-2.5 text-[13px] font-semibold text-green-600 hover:bg-green-50 text-left"
          onClick={goSearch}
        >
          See all results for “{query}” →
        </button>
      </div>
    ) : null;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_1px_3px_rgba(0,0,0,.08)]">
      {/* MAIN BAR */}
      <div className="container flex items-center gap-4 md:gap-6 py-3">
        {/* logo */}
        <Link to="/" className="font-display text-2xl md:text-[26px] font-extrabold tracking-tight text-primary shrink-0">
          Clovers.
        </Link>

        {/* delivery promise */}
        <button className="hidden lg:flex flex-col items-start leading-tight shrink-0 group">
          <span className="text-[13px] font-extrabold text-gray-900">Delivery in 10 minutes</span>
          <span className="flex items-center gap-0.5 text-[11.5px] text-gray-500 group-hover:text-gray-700">
            <MapPin size={11} /> Ahmedabad, 380001 <ChevronDown size={12} />
          </span>
        </button>

        {/* search */}
        <div className="hidden md:block flex-1" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type="text"
              value={query}
              onFocus={() => setShowSuggest(true)}
              onChange={(e) => { setQuery(e.target.value); setShowSuggest(true); }}
              onKeyDown={(e) => {
                if (e.key === "Enter") goSearch();
                if (e.key === "Escape") { setQuery(""); setShowSuggest(false); }
              }}
              placeholder={SEARCH_HINTS[hintIdx]}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[14px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100 transition"
            />
            <SuggestList />
          </div>
        </div>

        {/* right side */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto shrink-0">
          {/* account */}
          <div className="relative hidden md:block" ref={accountRef}>
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-50 text-[13.5px] font-semibold text-gray-800"
              onClick={() => (user ? setAccountOpen((o) => !o) : navigate("/login"))}
            >
              <User size={17} />
              {user ? (user.name || "Account").split(" ")[0] : "Login"}
              {user && <ChevronDown size={13} className="text-gray-400" />}
            </button>
            {accountOpen && user && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-[70]">
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-gray-50" onClick={() => { setAccountOpen(false); navigate("/orders"); }}>
                  <Package size={15} className="text-gray-400" /> My Orders
                </button>
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-gray-50" onClick={() => { setAccountOpen(false); navigate("/profile"); }}>
                  <User size={15} className="text-gray-400" /> Profile & Addresses
                </button>
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] hover:bg-gray-50" onClick={() => { setAccountOpen(false); navigate("/wishlist"); }}>
                  <Heart size={15} className="text-gray-400" /> Wishlist
                </button>
                <div className="border-t my-1" />
                <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50" onClick={() => { setAccountOpen(false); logout?.(); navigate("/"); }}>
                  <LogOut size={15} /> Logout
                </button>
              </div>
            )}
          </div>

          {/* wishlist */}
          <button
            onClick={() => navigate("/wishlist")}
            className="hidden md:flex relative p-2.5 rounded-lg hover:bg-gray-50 text-gray-700"
            aria-label="Wishlist"
          >
            <Heart size={19} />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* cart pill */}
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl px-3.5 py-2.5 transition-colors"
            aria-label="Open cart"
          >
            <ShoppingCart size={18} />
            {totalItems > 0 ? (
              <span className="leading-tight text-left hidden sm:block">
                <b className="block text-[12.5px]">{totalItems} item{totalItems > 1 ? "s" : ""}</b>
                <em className="not-italic block text-[11px] opacity-90">₹{totalPrice}</em>
              </span>
            ) : (
              <span className="text-[13px] font-bold hidden sm:block">My Cart</span>
            )}
          </button>

          {/* mobile menu */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-50 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* CATEGORY NAV */}
      <nav className="border-t border-gray-100 bg-white">
        <div className="container">
          <ul className="hidden md:flex items-center gap-7 py-2.5 overflow-x-auto">
            {navLinks.map((link) => (
              <li key={link.label} className="shrink-0">
                <Link
                  to={link.href}
                  className={`text-[13.5px] font-semibold transition-colors ${
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="container py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { goSearch(); setMobileMenuOpen(false); } }}
                placeholder="Search products…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className={`block py-2 text-[14px] font-medium ${
                      location.pathname === link.href ? "text-primary" : "text-gray-700"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="border-t pt-2 mt-2">
                <Link to={user ? "/orders" : "/login"} className="block py-2 text-[14px] font-semibold text-primary" onClick={() => setMobileMenuOpen(false)}>
                  {user ? "My Orders" : "Login / Sign up"}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
};
