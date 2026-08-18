import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Header from "../components/Header";
import Modal from "../components/Modal";
import { Plus, Search } from "lucide-react";
import "./products.css";
import Swal from "sweetalert2";

const API = "/products";
const ITEMS_PER_PAGE = 20;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
const [categories, setCategories] = useState([]);

 
const [imagePreview, setImagePreview] = useState([]);


 const [form, setForm] = useState({
  name: "",
  price: "",
  images: ["", "", "", ""],
  rating: "",
  stock: "",
  category_id: "",
  category_name: "",
  subcategory: "",   // ✅ NEW
  discountPrice:"",
  description:""
});


 useEffect(() => {
  fetchProducts();
  fetchCategories();
}, []); // EMPTY dependency array



  const fetchProducts = async () => {
    setLoading(true);
    const res = await api.get(API);
    setProducts(res.data);
    setLoading(false);
  };
   const fetchCategories = async () => {
  const res = await api.get("/categories");
  setCategories(res.data);
};

const handleAdd = async () => {
  if (!form.name || !form.price || !form.category_id || !form.images[0]) {
    return alert("Please add a main product image");
  }

  await api.post(API, {
  name: form.name,
  title: form.name,
  price: Number(form.price),
  oldPrice: Number(form.price),
  discountPrice: Number(form.discountPrice || form.price),
  image: form.images[0],
  images: form.images.filter(Boolean),
  rating: Number(form.rating || 0),
  stock: Number(form.stock || 0),
  category_id: Number(form.category_id),
  category_name: String(form.category_name),
  subcategory: String(form.subcategory), // ✅ ADDED
  description: String(form.description),
  features: [],
  nutritionFacts: {},
  reviewsList: []
});

  Swal.fire({
  icon: "success",
  title: "Product Added!",
  text: `${form.name} has been added successfully.`,
  showConfirmButton: false,
  timer: 1500
});


  setIsAddOpen(false);
 setForm({
  name: "",
  price: "",
  images: ["", "", "", ""],
  rating: "",
  stock: "",
  category_id: "",
  category_name: "",
  subcategory: "",   // ✅ reset
  discountPrice:"",
  description: ""
});

  setImagePreview([]);

  fetchProducts();
};



 const filtered = products.filter(p => {
  const productName = (p.name || p.title || "").toLowerCase();
  const productCategory = p.category_name || "";

  return (
    productName.includes(search.toLowerCase()) &&
    (categoryFilter === "all" || productCategory === categoryFilter)
  );
});



  const sorted = [...filtered].sort((a, b) => {
    if (sort === "low") return a.price - b.price;
    if (sort === "high") return b.price - a.price;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div>
      <Header title="Products" subtitle="Inventory Control Panel" />

      <div className="p-6 space-y-6">

        {/* TOP BAR */}
        <div className="flex justify-between gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search product..."
              onChange={e => setSearch(e.target.value)}
              className="pl-10 border px-4 py-2 rounded-xl w-full"
            />
          </div>

          <button onClick={() => setIsAddOpen(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl flex gap-2">
            <Plus size={18} /> Add Product
          </button>
        </div>

        {/* PRODUCTS */}
        <div className="product-list-grid">
          {paginated.map(p => (
            <div key={p.id} className="product-list-card">
              <div className="left">
                <img src={p.image} />
                <div className="meta">
                  <h4>{p.name}</h4>
                  <span className="count">₹{p.price}</span>
                </div>
              </div>
              <div className="right">
                <span className="stock">{p.stock} in stock</span>
                <span className="rating">⭐ {p.rating}</span>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center gap-3">
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-full border ${page === i + 1 && "bg-blue-600 text-white"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Product">
  <div className="add-form">

    <div className="form-grid">

     



      <div className="form-group">
        <label>Product Name</label>
        <input placeholder="Fresh Kiwi"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Price</label>
        <input type="number"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Discount Price</label>
        <input type="number"
          value={form.discountPrice}
          onChange={e => setForm({ ...form, discountPrice: e.target.value })}
        />
      </div>

      <div className="form-group">
        <label>Rating</label>
        <input type="number" step="0.1" max="5"
          value={form.rating}
          onChange={e => setForm({ ...form, rating: e.target.value })}
        />
      </div>
 <div className="form-group">
  <label>Category</label>
  <select
    value={form.category_id}
    onChange={e => {
      const selected = categories.find(c => c.id === Number(e.target.value));
      setForm({
        ...form,
        category_id: selected.id,
        category_name: selected.name
      });
    }}
  >
    <option value="">Select Category</option>
    {categories.map(cat => (
      <option key={cat.id} value={cat.id}>
        {cat.name}
      </option>
    ))}
  </select>
</div>
<div className="form-group">
  <label>Sub Category</label>
  <input
    placeholder="e.g. Juice, Soft Drink, Shampoo"
    value={form.subcategory}
    onChange={e =>
      setForm({ ...form, subcategory: e.target.value })
    }
  />
</div>



      

      <div className="form-group full">
        <label>Stock</label>
        <input type="number"
          value={form.stock}
          onChange={e => setForm({ ...form, stock: e.target.value })}
        />
      </div>

      <div className="form-group full">
        <label>Description</label>
        <textarea className="desc-input"
          placeholder="Short product description..."
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
      </div>
<div className="form-group full">
  <label>Main Image</label>
  <input
    placeholder="Main Image URL"
    value={form.images[0]}
    onChange={e => {
      const imgs = [...form.images];
      imgs[0] = e.target.value;
      setForm({ ...form, images: imgs });
      setImagePreview(imgs);
    }}
  />
</div>

{[1,2,3].map(i => (
  <div className="form-group full" key={i}>
    <label>Thumbnail {i}</label>
    <input
      placeholder={`Thumbnail ${i} URL`}
      value={form.images[i]}
      onChange={e => {
        const imgs = [...form.images];
        imgs[i] = e.target.value;
        setForm({ ...form, images: imgs });
        setImagePreview(imgs);
      }}
    />
  </div>
))}


    </div>

    {imagePreview.length > 0 && (
  <div className="image-preview multi">
    {imagePreview.map((img, i) =>
      img ? <img key={i} src={img} /> : null
    )}
  </div>
)}


    <button onClick={handleAdd} className="save-btn">
      Save Product
    </button>

  </div>
</Modal>

    </div>
  );
}
