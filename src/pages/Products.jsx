import { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link, useSearchParams } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { FaHeart, FaRegHeart, FaFilter } from "react-icons/fa";
import { CardLoading } from "../components/Loading";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtres
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  
  const search = searchParams.get("search")?.toLowerCase() || "";
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // Categorii disponibile
  const categories = ["Bijuterii", "Decorațiuni", "Cadouri", "Lumânări", "Accesorii", "Altele"];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");
        
        const snapshot = await getDocs(collection(db, "produse"));
        const list = snapshot.docs.map(doc => ({
          firebaseId: doc.id,
          ...doc.data(),
        }));
        
        setProducts(list);
      } catch (error) {
        console.error("Eroare la preluarea produselor:", error);
        setError("Eroare la încărcarea produselor. Te rugăm să încerci din nou.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Filtrare și sortare optimizată cu useMemo
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      // Verifică disponibilitatea
      if (product.available === false) return false;
      
      // Filtrare după căutare
      const nameMatch = product.name?.toLowerCase().includes(search);
      const descMatch = (product.description || "").toLowerCase().includes(search);
      const categoryMatch = (product.category || "").toLowerCase().includes(search);
      const variantMatch = (product.colors || []).some((color) =>
        color.toLowerCase().includes(search)
      );
      const searchMatch = !search || nameMatch || descMatch || categoryMatch || variantMatch;
      
      // Filtrare după categorie
      const categoryFilter = selectedCategory === "all" || product.category === selectedCategory;
      
      // Filtrare după preț
      const price = parseFloat(product.price) || 0;
      const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
      const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
      const priceFilter = price >= minPrice && price <= maxPrice;
      
      return searchMatch && categoryFilter && priceFilter;
    });

    // Sortare
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "name":
          aValue = a.name?.toLowerCase() || "";
          bValue = b.name?.toLowerCase() || "";
          break;
        case "price":
          aValue = parseFloat(a.price) || 0;
          bValue = parseFloat(b.price) || 0;
          break;
        case "category":
          aValue = a.category?.toLowerCase() || "";
          bValue = b.category?.toLowerCase() || "";
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

    return filtered;
  }, [products, search, selectedCategory, priceRange, sortBy, sortOrder]);

  const handleWishlistToggle = (product) => {
    if (isInWishlist(product.firebaseId)) {
      removeFromWishlist(product.firebaseId);
    } else {
      addToWishlist({
        ...product,
        id: product.firebaseId
      });
    }
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setPriceRange({ min: "", max: "" });
    setSortBy("name");
    setSortOrder("asc");
    setSearchParams({});
  };

  const hasActiveFilters = selectedCategory !== "all" || priceRange.min || priceRange.max;

  if (loading) {
    return (
      <div className="p-4">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
        <CardLoading count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Eroare</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Încearcă din nou
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header cu search și statistici */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {search ? `Rezultate pentru "${search}"` : "Toate produsele"}
            </h1>
            <p className="text-gray-600 mt-1">
              {filteredAndSortedProducts.length} produs{filteredAndSortedProducts.length !== 1 ? 'e' : ''} 
              {hasActiveFilters && " (filtrate)"}
            </p>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaFilter className="w-4 h-4" />
            Filtre {hasActiveFilters && <span className="bg-purple-600 text-white text-xs rounded-full w-2 h-2"></span>}
          </button>
        </div>

        {/* Filtre */}
        {showFilters && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Categorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categorie</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Toate categoriile</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Preț minim */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preț minim (lei)</label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Preț maxim */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preț maxim (lei)</label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  placeholder="1000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Sortare */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sortează după</label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="name">Nume</option>
                    <option value="price">Preț</option>
                    <option value="category">Categorie</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title={sortOrder === "asc" ? "Crescător" : "Descrescător"}
                  >
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </button>
                </div>
              </div>
            </div>

            {/* Acțiuni filtre */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="text-sm text-gray-600 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Șterge toate filtrele
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Aplică filtrele
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Produse */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {search ? "Nu am găsit produse pentru această căutare" : "Nu există produse"}
          </h3>
          <p className="text-gray-500 mb-6">
            {search 
              ? "Încearcă să cauți altceva sau să schimbi filtrele."
              : "Produsele vor fi adăugate în curând."
            }
          </p>
          {(search || hasActiveFilters) && (
            <button
              onClick={clearFilters}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Vezi toate produsele
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProducts.map((product) => {
            const defaultColor = product.colors?.[0];
            const defaultImageData = product.images?.[defaultColor];
            const defaultImage = Array.isArray(defaultImageData)
              ? defaultImageData[0]
              : defaultImageData;

            return (
              <div
                key={product.firebaseId}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative group"
              >
                {/* Wishlist button */}
                <button
                  onClick={() => handleWishlistToggle(product)}
                  className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200 ${
                    isInWishlist(product.firebaseId)
                      ? "text-red-500 bg-red-50 hover:bg-red-100"
                      : "text-gray-400 bg-white hover:text-purple-600 hover:bg-purple-50"
                  } shadow-md opacity-0 group-hover:opacity-100`}
                  title={isInWishlist(product.firebaseId) ? "Elimină din favorite" : "Adaugă la favorite"}
                >
                  {isInWishlist(product.firebaseId) ? <FaHeart /> : <FaRegHeart />}
                </button>

                {/* Imagine */}
                <div className="relative overflow-hidden rounded-t-xl">
                  <img
                    src={defaultImage}
                    alt={product.name}
                    className="w-full h-48 object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {product.category && (
                    <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  )}
                </div>

                {/* Conținut */}
                <div className="flex flex-col justify-between flex-1 p-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-2 min-h-[48px] text-gray-900 group-hover:text-purple-700 transition-colors">
                      {product.name}
                    </h2>
                    
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <p className="text-xl font-bold text-purple-700 mb-3">
                      {parseFloat(product.price).toFixed(2)} lei
                    </p>
                  </div>

                  {/* Variante de culori */}
                  {product.colors && product.colors.length > 1 && (
                    <div className="flex gap-1 mb-3 overflow-x-auto">
                      {product.colors.slice(0, 4).map((color, i) => {
                        const img = Array.isArray(product.images?.[color])
                          ? product.images[color][0]
                          : product.images?.[color];
                        return (
                          <Link
                            key={i}
                            to={`/products/${product.firebaseId}?color=${encodeURIComponent(color)}`}
                            className="flex-shrink-0"
                          >
                            <img
                              src={img}
                              alt={color}
                              className="w-8 h-8 object-cover border rounded hover:scale-110 transition-transform duration-200"
                              title={color}
                            />
                          </Link>
                        );
                      })}
                      {product.colors.length > 4 && (
                        <div className="w-8 h-8 bg-gray-100 border rounded flex items-center justify-center text-xs text-gray-500">
                          +{product.colors.length - 4}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Buton */}
                  <div className="mt-auto">
                    <Link
                      to={`/products/${product.firebaseId}?color=${encodeURIComponent(defaultColor || "")}`}
                      className="block w-full text-center bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      Vezi detalii
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;