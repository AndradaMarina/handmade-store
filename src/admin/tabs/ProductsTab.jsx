import { useEffect, useState } from "react";
import { db, storage } from "../../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const ProductsTab = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    colors: "",
    sizes: "",
    canBeEngraved: false,
    canUploadImage: false,
    hasGiftWrap: false,
    colorImages: {},
    colorDescriptions: {},
    description: "",
    available: true,
  });

  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    "Bijuterii",
    "Decorațiuni",
    "Cadouri",
    "Lumânări",
    "Accesorii",
    "Altele"
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, "produse"));
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      lista.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setProducts(lista);
    } catch (error) {
      console.error("Eroare la încărcarea produselor:", error);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Sigur vrei să ștergi produsul "${name}"?`)) return;
    
    try {
      await deleteDoc(doc(db, "produse", id));
      setProducts(products.filter((p) => p.id !== id));
      setStatus("✅ Produs șters cu succes.");
      setTimeout(() => setStatus(""), 3000);
    } catch (error) {
      console.error("Eroare la ștergerea produsului:", error);
      setStatus("❌ Eroare la ștergerea produsului.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e, color) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      colorImages: {
        ...prev.colorImages,
        [color]: files,
      },
    }));
  };
  //Adaugarea produselor
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Se încarcă imaginile...");
    setUploading(true);

    try {//Upload imagini pentru fiecare culoare
      const colorsArray = formData.colors.split(",").map((c) => c.trim());
      const images = {};

      for (const color of colorsArray) {
        if (!formData.colorImages[color]) continue;

        const files = formData.colorImages[color];
        const urls = [];

        for (const file of files) {
          const fileName = `products/${crypto.randomUUID()}-${file.name}`;
          const storageRef = ref(storage, fileName);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          urls.push(url);
        }

        images[color] = urls;
      }
      //Salvare produs in Firestore
      await addDoc(collection(db, "produse"), {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        description: formData.description,
        colors: colorsArray,
        sizes: formData.sizes
          ? formData.sizes.split(",").map((s) => s.trim())
          : [],
        canBeEngraved: formData.canBeEngraved,
        canUploadImage: formData.canUploadImage,
        hasGiftWrap: formData.hasGiftWrap,
        available: formData.available,
        images,
        descriptions: formData.colorDescriptions,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setStatus("✅ Produs adăugat cu succes!");
      setFormData({
        name: "",
        price: "",
        category: "",
        colors: "",
        sizes: "",
        canBeEngraved: false,
        canUploadImage: false,
        hasGiftWrap: false,
        colorImages: {},
        colorDescriptions: {},
        description: "",
        available: true,
      });
      fetchProducts();
      setTimeout(() => setStatus(""), 5000);
    } catch (err) {
      console.error("Eroare la salvare:", err);
      setStatus("❌ Eroare la încărcare.");
    } finally {
      setUploading(false);
    }
  };

  // Filtrare produse
  const filteredProducts = products.filter(product => {
    return searchTerm === "" ||
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6">
      {/* Header cu toggle */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-2 font-medium ${
                showForm 
                  ? "bg-gray-500 hover:bg-gray-600 text-white" 
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {showForm ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Ascunde formularul
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Adaugă produs nou
                </>
              )}
            </button>

            {products.length > 0 && (
              <div className="text-sm text-gray-600">
                {products.length} produs{products.length !== 1 ? 'e' : ''} în total
              </div>
            )}
          </div>

          <button
            onClick={fetchProducts}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizează
          </button>
        </div>
      </div>

      {/* Formularul de adăugare - condiționat */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Adaugă produs nou</h3>
            <p className="text-sm text-gray-600 mt-1">Completează informațiile despre noul produs</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Informații de bază */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nume produs *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="ex: Colier cu medalion personalizat"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preț (lei) *
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="ex: 149"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categorie *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selectează categoria</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="available"
                  value={formData.available}
                  onChange={(e) => setFormData(prev => ({...prev, available: e.target.value === "true"}))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="true">Disponibil</option>
                  <option value="false">Indisponibil</option>
                </select>
              </div>
            </div>

            {/* Descriere */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descriere produsului
              </label>
              <textarea
                name="description"
                placeholder="Descriere detaliată a produsului..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Culori și mărimi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Culori disponibile *
                </label>
                <input
                  type="text"
                  name="colors"
                  placeholder="ex: Roșu, Albastru, Verde"
                  value={formData.colors}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Separate prin virgulă</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mărimi disponibile
                </label>
                <input
                  type="text"
                  name="sizes"
                  placeholder="ex: S, M, L, XL"
                  value={formData.sizes}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Opțional, separate prin virgulă</p>
              </div>
            </div>

            {/* Opțiuni speciale */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Opțiuni speciale</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="canBeEngraved"
                    checked={formData.canBeEngraved}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900 text-sm">Poate fi gravat</div>
                    <div className="text-xs text-gray-500">Permite gravuri personalizate</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="canUploadImage"
                    checked={formData.canUploadImage}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900 text-sm">Upload imagine</div>
                    <div className="text-xs text-gray-500">Client poate încărca imagine</div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="hasGiftWrap"
                    checked={formData.hasGiftWrap}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900 text-sm">Ambalaj cadou</div>
                    <div className="text-xs text-gray-500">Oferă opțiunea de ambalaj</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Imagini pentru culori */}
            {formData.colors && (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Imagini pentru culori</h4>
                {formData.colors.split(",").map((color) => {
                  const trimmed = color.trim();
                  return (
                    <div key={trimmed} className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3">
                        Culoarea: {trimmed}
                      </h5>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descriere pentru {trimmed}
                          </label>
                          <textarea
                            placeholder={`Descriere specifică pentru culoarea ${trimmed}...`}
                            value={formData.colorDescriptions?.[trimmed] || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                colorDescriptions: {
                                  ...prev.colorDescriptions,
                                  [trimmed]: e.target.value,
                                },
                              }))
                            }
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Imagini pentru {trimmed}
                          </label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, trimmed)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                          />
                          <p className="text-xs text-gray-500 mt-1">Poți selecta multiple imagini</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Status și submit */}
            {status && (
              <div className={`p-4 rounded-lg text-sm ${
                status.includes("succes") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {status}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={uploading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 font-medium"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Se încarcă...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Adaugă produsul</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista produselor existente */}
      {products.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Produse existente</h3>
                <p className="text-sm text-gray-600 mt-1">Produsele tale din magazin</p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Caută produse..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {filteredProducts.map((product) => {
                const firstColor = product.colors?.[0];
                const firstImage = Array.isArray(product.images?.[firstColor])
                  ? product.images[firstColor][0]
                  : product.images?.[firstColor];

                return (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Imagine produs */}
                      <div className="flex-shrink-0">
                        {firstImage ? (
                          <img
                            src={firstImage}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Informații produs */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{product.name}</h4>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-sm text-gray-600">{product.category}</span>
                              <span className="font-bold text-purple-600">{parseFloat(product.price).toFixed(2)} lei</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                product.available !== false
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {product.available !== false ? "Disponibil" : "Indisponibil"}
                              </span>
                              
                              {product.canBeEngraved && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                                  Personalizabil
                                </span>
                              )}
                              
                              {product.hasGiftWrap && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-pink-100 text-pink-700">
                                  Ambalaj cadou
                                </span>
                              )}
                            </div>
                            
                            {product.colors && (
                              <div className="mt-2">
                                <span className="text-xs text-gray-500">Culori: </span>
                                <span className="text-xs text-gray-700">{product.colors.join(", ")}</span>
                              </div>
                            )}
                          </div>

                          {/* Acțiuni */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                              title="Șterge"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty state pentru când nu ai produse */}
      {products.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nu ai produse încă</h3>
          <p className="text-gray-500">Creează primul tău produs folosind formularul de mai sus.</p>
        </div>
      )}
    </div>
  );
};

export default ProductsTab;