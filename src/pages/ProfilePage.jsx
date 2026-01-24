import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Breadcrumb from "@/components/Breadcrumb";

import { Camera, User, Mail, Phone, MapPin, ShoppingBag, Heart } from "lucide-react";

export default function ProfilePage() {
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const [profile, setProfile] = useState(() =>
    JSON.parse(localStorage.getItem("profile")) || {
      name: "Prashant Singh",
      email: "",
      phone: "",
      addresses: [],
      avatar: ""
    }
  );

  const [addressInput, setAddressInput] = useState("");

  useEffect(() => {
    localStorage.setItem("profile", JSON.stringify(profile));
  }, [profile]);

  const uploadAvatar = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile({ ...profile, avatar: reader.result });
    reader.readAsDataURL(file);
  };

  const addAddress = () => {
    if (!addressInput) return;
    setProfile({ ...profile, addresses: [...profile.addresses, addressInput] });
    setAddressInput("");
  };

  return (
    <>
      <Header />
      <Breadcrumb/>

      <section className="container py-16 grid md:grid-cols-3 gap-10">

        {/* LEFT CARD */}
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center">
          <label className="relative cursor-pointer inline-block">
            <img
              src={profile.avatar || "https://i.imgur.com/1X4hHsb.png"}
              className="w-28 h-28 rounded-full object-cover mx-auto"
            />
            <input type="file" hidden onChange={uploadAvatar} />
            <Camera className="absolute bottom-0 right-1 bg-red-500 text-white p-1 rounded-full" />
          </label>

          <h3 className="mt-4 text-xl font-bold">{profile.name}</h3>
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

          {/* ADDRESS */}
          <h3 className="mt-10 font-bold text-lg">Addresses</h3>

          <div className="flex gap-3 mt-3">
            <input
              className="flex-1 input-ui"
              value={addressInput}
              onChange={e => setAddressInput(e.target.value)}
              placeholder="Add new address"
            />
            <button onClick={addAddress} className="btn-ui">Add</button>
          </div>

          <ul className="mt-4 space-y-2">
            {profile.addresses.map((a,i) => (
              <li key={i} className="bg-gray-50 px-4 py-2 rounded-xl flex justify-between">
                <span>{a}</span>
                <button onClick={() =>
                  setProfile({ ...profile, addresses: profile.addresses.filter((_,x)=>x!==i)})
                } className="text-red-500 text-sm">Remove</button>
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
