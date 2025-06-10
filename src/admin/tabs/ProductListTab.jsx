import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ProductListTab = () => {
  const [produse, setProduse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [previewProduct, setPreviewProduct] = useState(null);
  const navigate = useNavigate();

  const categories = [
    "Bijuterii",
    "Decorațiuni", 
    "Cadouri",
    "Lumânări",
    "Accesorii",
    "Altele"
  ];

  const fetchProduse = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "produse"));
      const list = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setProduse(list);
    } catch (error) {
      console.error("Eroare la încărcarea produselor:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Sigur vrei să ștergi produsul "${name}"?`)) return;
    
    try {
      await deleteDoc(doc(db, "produse", id));
      setProduse(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Eroare la ștergerea produsului:", error);
      alert("Eroare la ștergerea produsului!");
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, "produse", id), {
        available: !currentStatus,
        updatedAt: new Date()
      });
      setProduse(prev => prev.map(p => 
        p.id === id ? { ...p, available: !currentStatus } : p
      ));
    } catch (error) {
      console.error("Eroare la actualizarea statusului:", error);
    }
  };

  const showPreview = (product) => {
    setPreviewProduct(product);
  };

  const closePreview = () => {
    setPreviewProduct(null);
  };

  useEffect(() => {
    fetchProduse();
  }, []);

  // Filtrare și sortare
  const filteredAndSortedProducts = produse
    .filter(produs => {
      const matchesSearch = searchTerm === "" ||
        produs.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produs.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produs.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || produs.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "name":
          aValue = a.name?.toLowerCase() || "";
          bValue = b.name?.toLowerCase() || "";
          break;
        case "price":
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case "category":
          aValue = a.category?.toLowerCase() || "";
          bValue = b.category?.toLowerCase() || "";
          break;
        case "created":
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          return 0;
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă produsele...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Filtre și sortare - FĂRĂ header duplicate */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Căutare */}
          <div className="relative flex-1 max-w-lg">
            <input
              type="text"
              placeholder="Caută produse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filtre și sortare */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
            >
              <option value="all">Toate categoriile</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
            >
              <option value="name">Sortează după nume</option>
              <option value="price">Sortează după preț</option>
              <option value="category">Sortează după categorie</option>
              <option value="created">Sortează după dată</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 font-medium"
            >
              <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
              <span>{sortOrder === "asc" ? "Crescător" : "Descrescător"}</span>
            </button>
          </div>

          {/* Statistici + Actualizează */}
          <div className="flex items-center gap-4">
            {produse.length > 0 && (
              <div className="text-center px-4 py-2 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-700">{produse.length}</div>
                <div className="text-xs text-purple-600">Produse</div>
              </div>
            )}
            <button
              onClick={fetchProduse}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizează
            </button>
          </div>
        </div>
      </div>

      {/* Lista produselor */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {produse.length === 0 ? "Nu ai produse încă" : "Nu există produse pentru criteriile selectate"}
          </h3>
          <p className="text-gray-500">
            {produse.length === 0 
              ? "Mergi la 'Adaugă Produse' pentru a crea primul produs." 
              : "Încearcă să schimbi filtrul sau să cauți altceva."
            }
          </p>
          {produse.length === 0 && (
            <button
              onClick={() => navigate("/admin")}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Adaugă primul produs
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedProducts.map((produs) => {
            const firstColor = produs.colors?.[0];
            const firstImage = Array.isArray(produs.images?.[firstColor])
              ? produs.images[firstColor][0]
              : produs.images?.[firstColor];

            return (
              <div key={produs.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-6">
                  {/* Imagine produs */}
                  <div className="flex-shrink-0">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={produs.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Informații produs */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{produs.name}</h3>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <span className="text-lg font-bold text-purple-600">{parseFloat(produs.price).toFixed(2)} lei</span>
                          {produs.category && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {produs.category}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 mb-3">
                          <button
                            onClick={() => toggleAvailability(produs.id, produs.available)}
                            className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                              produs.available !== false
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-red-100 text-red-700 hover:bg-red-200"
                            }`}
                          >
                            {produs.available !== false ? "✅ Disponibil" : "❌ Indisponibil"}
                          </button>
                          
                          {produs.canBeEngraved && (
                            <span className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-700">
                              🎨 Personalizabil
                            </span>
                          )}
                          
                          {produs.hasGiftWrap && (
                            <span className="px-3 py-1 text-sm font-medium rounded-full bg-pink-100 text-pink-700">
                              🎁 Ambalaj cadou
                            </span>
                          )}
                        </div>

                        {produs.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{produs.description}</p>
                        )}

                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          {produs.colors && (
                            <div>
                              <span className="font-medium">Culori:</span> {produs.colors.join(", ")}
                            </div>
                          )}
                          {produs.sizes && produs.sizes.length > 0 && (
                            <div>
                              <span className="font-medium">Mărimi:</span> {produs.sizes.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Acțiuni */}
                      <div className="flex flex-col space-y-2 ml-6">
                        <button
                          onClick={() => showPreview(produs)}
                          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Previzualizează</span>
                        </button>
                        
                        <button
                          onClick={() => navigate(`/admin/editeaza/${produs.id}`)}
                          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          <span>Editează</span>
                        </button>
                        
                        <button
                          onClick={() => handleDelete(produs.id, produs.name)}
                          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Șterge</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Previzualizare */}
      {previewProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Previzualizare Produs</h3>
              <button 
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Imagine produs */}
              {previewProduct.images && previewProduct.colors && previewProduct.colors[0] && (
                <div className="text-center">
                  {Array.isArray(previewProduct.images[previewProduct.colors[0]]) && previewProduct.images[previewProduct.colors[0]][0] ? (
                    <img 
                      src={previewProduct.images[previewProduct.colors[0]][0]} 
                      alt={previewProduct.name}
                      className="w-48 h-48 object-cover rounded-lg mx-auto"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mx-auto flex items-center justify-center">
                      <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
              
              {/* Informații produs */}
              <div className="text-center">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{previewProduct.name}</h4>
                <p className="text-3xl font-bold text-purple-600 mb-4">{parseFloat(previewProduct.price).toFixed(2)} lei</p>
                
                {previewProduct.category && (
                  <span className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm mb-4">
                    📂 {previewProduct.category}
                  </span>
                )}
              </div>
              
              {/* Descriere */}
              {previewProduct.description && (
                <div>
                  <h5 className="font-semibold mb-3 text-gray-900">📝 Descriere:</h5>
                  <p className="text-gray-600 leading-relaxed">{previewProduct.description}</p>
                </div>
              )}
              
              {/* Culori */}
              {previewProduct.colors && previewProduct.colors.length > 0 && (
                <div>
                  <h5 className="font-semibold mb-3 text-gray-900">🎨 Culori disponibile:</h5>
                  <div className="flex flex-wrap gap-2">
                    {previewProduct.colors.map((color, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Mărimi */}
              {previewProduct.sizes && previewProduct.sizes.length > 0 && (
                <div>
                  <h5 className="font-semibold mb-3 text-gray-900">📏 Mărimi disponibile:</h5>
                  <div className="flex flex-wrap gap-2">
                    {previewProduct.sizes.map((size, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Caracteristici speciale */}
              <div className="space-y-3">
                {previewProduct.canBeEngraved && (
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                    <p className="text-purple-700 font-medium">
                      🎨 Acest produs poate fi personalizat cu gravură
                    </p>
                  </div>
                )}
                
                {previewProduct.canUploadImage && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-blue-700 font-medium">
                      📸 Clientul poate încărca propria imagine
                    </p>
                  </div>
                )}
                
                {previewProduct.hasGiftWrap && (
                  <div className="bg-pink-50 border border-pink-200 p-4 rounded-lg">
                    <p className="text-pink-700 font-medium">
                      🎁 Ambalaj cadou disponibil
                    </p>
                  </div>
                )}
                
                {/* Status disponibilitate */}
                <div className={`p-4 rounded-lg border ${
                  previewProduct.available !== false 
                    ? "bg-green-50 border-green-200" 
                    : "bg-red-50 border-red-200"
                }`}>
                  <p className={`font-medium ${
                    previewProduct.available !== false 
                      ? "text-green-700" 
                      : "text-red-700"
                  }`}>
                    {previewProduct.available !== false 
                      ? "✅ Produsul este disponibil pentru comandă" 
                      : "❌ Produsul nu este disponibil momentan"
                    }
                  </p>
                </div>
              </div>
              
              {/* Butoane acțiuni */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => {
                    closePreview();
                    navigate(`/admin/editeaza/${previewProduct.id}`);
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  <span>Editează</span>
                </button>
                
                <button 
                  onClick={closePreview}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Închide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListTab;