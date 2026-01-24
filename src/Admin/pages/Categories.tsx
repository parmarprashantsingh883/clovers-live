import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Modal from "../components/Modal";
import { Plus, Pencil, Trash2 } from "lucide-react";

const API = "http://localhost:5000/categories";
const PER_PAGE = 6;

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: ""
  });

 useEffect(() => {
  document.title = "Admin - Categories";
  fetchCategories();
  fetchProducts();
}, []);


  const fetchCategories = async () => {
    const res = await axios.get(API);
    setCategories(res.data);
  };
  const fetchProducts = async () => {
  const res = await axios.get("http://localhost:5000/products");
  setProducts(res.data);
};


  const paginated = categories.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  );

  const totalPages = Math.ceil(categories.length / PER_PAGE);

  const handleAddCategory = async () => {
    if (!formData.name || !formData.image) {
      return alert("Please fill all required fields");
    }
await axios.post(API, {
  name: formData.name,
  description: formData.description,
  image: formData.image
});


    fetchCategories();
    setIsAddModalOpen(false);
    setFormData({ name: "", description: "", image: "" });
  };

  const handleEditCategory = async () => {
    await axios.put(`${API}/${selectedCategory.id}`, formData);
    fetchCategories();
    setIsEditModalOpen(false);
  };

  const handleDeleteCategory = async () => {
    await axios.delete(`${API}/${selectedCategory.id}`);
    fetchCategories();
    setIsDeleteModalOpen(false);
  };

  return (
    <div>
      <Header title="Categories" subtitle="Organize your product categories" />

      <div className="p-6 space-y-6">

        <div className="flex justify-end">
          <button
            onClick={() => {
              setFormData({ name: "", description: "", image: "" });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md"
          >
            <Plus size={16} /> Add Category
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map(c => (
            <div key={c.id} className="bg-white p-5 rounded-xl border group">
              <div className="flex gap-4">
                <img src={c.image} className="w-14 h-14 rounded-lg object-cover border" />

                <div className="flex-1">
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="text-sm text-gray-500">{c.description}</p>
                 <p className="text-primary font-bold mt-2">
  {products.filter(p => p.category_id === c.id).length} products
</p>

                </div>

                <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                  <button onClick={() => { setSelectedCategory(c); setFormData(c); setIsEditModalOpen(true); }}>
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => { setSelectedCategory(c); setIsDeleteModalOpen(true); }}>
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-3">
          {[...Array(totalPages)].map((_, i) => (
            <button key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-1 border rounded ${currentPage === i + 1 && "bg-primary text-white"}`}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* ADD MODAL */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Category">
        <div className="add-form">

          <div className="form-grid">
            <div className="form-group full">
              <label>Name</label>
              <input value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="form-group full">
              <label>Image URL</label>
              <input value={formData.image}
                onChange={e => setFormData({ ...formData, image: e.target.value })} />
            </div>

            <div className="form-group full">
              <label>Description</label>
              <textarea className="desc-input" value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>

          {formData.image && (
            <div className="image-preview">
              <img src={formData.image} />
            </div>
          )}

          <button onClick={handleAddCategory} className="save-btn">Save Category</button>
        </div>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Category">
        <div className="add-form">

          <div className="form-grid">
            <div className="form-group full">
              <label>Name</label>
              <input value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="form-group full">
              <label>Image URL</label>
              <input value={formData.image}
                onChange={e => setFormData({ ...formData, image: e.target.value })} />
            </div>

            <div className="form-group full">
              <label>Description</label>
              <textarea className="desc-input" value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>

          {formData.image && (
            <div className="image-preview">
              <img src={formData.image} />
            </div>
          )}

          <button onClick={handleEditCategory} className="save-btn">Update Category</button>
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Category">
        <p>Delete <b>{selectedCategory?.name}</b>?</p>
        <button onClick={handleDeleteCategory} className="save-btn bg-red-500 mt-4">Delete</button>
      </Modal>
    </div>
  );
}
