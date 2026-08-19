import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { api, errMsg } from "@/lib/api";
import Breadcrumb from "@/components/Breadcrumb";
import { toast } from "sonner";

import { Camera, User, Mail, Phone, MapPin, ShoppingBag, Heart, Star, Trash2 } from "lucide-react";

const EMPTY_ADDR = { label: "Home", name: "", phone: "", line1: "", city: "", state: "", pincode: "" };

export default function ProfilePage() {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { user: authUser } = useAuth() || {};

  const [profile, setProfile] = useState(() =>
    JSON.parse(localStorage.getItem("profile")) || {
      name: "",
      email: "",
      phone: "",
      avatar: ""
    }
  );

  // Server-side address book — follows the account, used at checkout.
  const [addresses, setAddresses] = useState([]);
  const [addrForm, setAddrForm] = useState(EMPTY_ADDR);
  const [showAddrForm, setShowAddrForm] = useState(false);

  useEffect(() => {
    localStorage.setItem("profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (!authUser) return;
    setProfile((p) => ({ ...p, name: p.name || authUser.name, email: authUser.email }));
    api.get("/addresses").then((res) => setAddresses(res.data)).catch(() => {});
  }, [authUser]);

  const uploadAvatar = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile({ ...profile, avatar: reader.result });
    reader.readAsDataURL(file);
  };

  const saveAddress = async () => {
    if (!addrForm.name || !addrForm.line1 || !addrForm.city || !addrForm.pincode) {
      toast.error("Name, address, city and pincode are required");
      return;
    }
    try {
      const { data } = await api.post("/addresses", addrForm);
      setAddresses((prev) => data.isDefault
        ? [...prev.map((a) => ({ ...a, isDefault: false })), data]
        : [...prev, data]);
      setAddrForm(EMPTY_ADDR);
      setShowAddrForm(false);
      toast.success("Address saved");
    } catch (err) {
      toast.error(errMsg(err, "Could not save address"));
    }
  };

  const makeDefault = async (a) => {
    try {
      await api.put(`/addresses/${a.id}`, { isDefault: true });
      setAddresses((prev) => prev.map((x) => ({ ...x, isDefault: x.id === a.id })));
    } catch (err) {
      toast.error(errMsg(err, "Could not update address"));
    }
  };

  const removeAddress = async (a) => {
    try {
      await api.delete(`/addresses/${a.id}`);
      setAddresses((prev) => prev.filter((x) => x.id !== a.id));
      toast.success("Address removed");
    } catch (err) {
      toast.error(errMsg(err, "Could not remove address"));
    }
  };

  return (
    <>
      <Header />
      <Breadcrumb/>

      <section className="container py-16 grid md:grid-cols-3 gap-10">

        {/* LEFT CARD */}
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center">
          <label className="relative cursor-pointer inline-block">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                className="w-28 h-28 rounded-full object-cover mx-auto"
              />
            ) : (
              <div className="w-28 h-28 rounded-full mx-auto flex items-center justify-center bg-green-100 text-green-700 text-3xl font-bold">
                {(profile.name || "G")
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()}
              </div>
            )}
            <input type="file" hidden onChange={uploadAvatar} />
            <Camera className="absolute bottom-0 right-1 bg-red-500 text-white p-1 rounded-full" />
          </label>

          <h3 className="mt-4 text-xl font-bold">{profile.name || "Guest"}</h3>
          <p className="text-gray-500">{profile.email}</p>

          <div className="mt-6 flex justify-around">
            <div>
              <ShoppingBag className="mx-auto text-red-500" />
              <p className="font-bold">{cart.length}</p>
            </div>
            <div>
              <Heart className="mx-auto text-red-500" />
              <p className="font-bold">{wishlist.length}</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="md:col-span-2 bg-white p-10 rounded-3xl shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Personal Information</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <Input icon={User} value={profile.name} onChange={v => setProfile({ ...profile, name: v })} />
            <Input icon={Mail} value={profile.email} onChange={v => setProfile({ ...profile, email: v })} />
            <Input icon={Phone} value={profile.phone} onChange={v => setProfile({ ...profile, phone: v })} />
          </div>

          {/* ADDRESS BOOK */}
          <div className="mt-10 flex items-center justify-between">
            <h3 className="font-bold text-lg">Saved Addresses</h3>
            <button
              className="text-sm text-red-600 font-medium hover:underline"
              onClick={() => setShowAddrForm((s) => !s)}
            >
              {showAddrForm ? "Close" : "+ Add address"}
            </button>
          </div>

          {!authUser && (
            <p className="text-sm text-gray-500 mt-2">Sign in to manage your address book.</p>
          )}

          {showAddrForm && (
            <div className="mt-4 grid md:grid-cols-2 gap-3 bg-gray-50 rounded-2xl p-5">
              {[
                ["label", "Label (Home / Work)"],
                ["name", "Full name"],
                ["phone", "Phone"],
                ["line1", "Address"],
                ["city", "City"],
                ["state", "State"],
                ["pincode", "Pincode"],
              ].map(([key, ph]) => (
                <input
                  key={key}
                  className="rounded-xl border px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder={ph}
                  value={addrForm[key]}
                  onChange={(e) => setAddrForm({ ...addrForm, [key]: e.target.value })}
                />
              ))}
              <button
                onClick={saveAddress}
                className="bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-700 transition md:col-span-2"
              >
                Save Address
              </button>
            </div>
          )}

          {authUser && addresses.length === 0 && !showAddrForm && (
            <p className="text-sm text-gray-500 mt-3">No saved addresses yet — add one to speed up checkout.</p>
          )}

          <ul className="mt-4 space-y-3">
            {addresses.map((a) => (
              <li key={a.id} className="bg-gray-50 px-5 py-4 rounded-xl flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <MapPin size={18} className="text-red-500 mt-1 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">
                      {a.label}
                      {a.isDefault && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">{a.name} · {a.phone}</p>
                    <p className="text-sm text-gray-500">{a.line1}, {a.city}{a.state ? `, ${a.state}` : ""} – {a.pincode}</p>
                  </div>
                </div>
                <div className="flex gap-3 shrink-0">
                  {!a.isDefault && (
                    <button onClick={() => makeDefault(a)} title="Make default" className="text-gray-400 hover:text-yellow-500">
                      <Star size={16} />
                    </button>
                  )}
                  <button onClick={() => removeAddress(a)} title="Remove" className="text-gray-400 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </>
  );
}

const Input = ({ icon: Icon, value, onChange }) => (
  <div className="input-wrap">
    <Icon size={18} />
    <input value={value} onChange={e => onChange(e.target.value)} />
  </div>
);
