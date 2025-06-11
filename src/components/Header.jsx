import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { Heart, ShoppingBag, User, Search } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";

const Header = () => {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const auth = getAuth();
  const navigate = useNavigate();
  const { getCartItemsCount } = useCart(); // Folosește funcția corectă
  const { wishlist } = useWishlist();

  const ADMIN_UID = "9yGDw0kZi6V2MmsPNfpKW5bMaae2";
  const cartItemsCount = getCartItemsCount();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, "produse"));
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllProducts(products);
      } catch (error) {
        console.error("Eroare la preluarea produselor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Eroare la deconectare:", error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 1) {
      const filtered = allProducts
        .filter((product) =>
          product.name.toLowerCase().includes(value.toLowerCase()) ||
          product.description?.toLowerCase().includes(value.toLowerCase()) ||
          product.category?.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product) => {
    navigate(`/products/${product.id}?color=${encodeURIComponent(product.colors?.[0] || "")}`);
    setSearchTerm("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    if (searchTerm.length > 1 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay pentru a permite click pe sugestii
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          {/* Logo și navigare principală */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold text-purple-700 hover:text-purple-800 transition-colors">
              Handmade Store
            </Link>
            
            <div className="hidden md:flex items-center gap-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
              >
                Acasă
              </Link>
              <Link 
                to="/products" 
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
              >
                Produse
              </Link>
              {user?.uid === ADMIN_UID && (
                <Link 
                  to="/admin" 
                  className="text-purple-600 hover:text-purple-800 transition-colors font-semibold flex items-center gap-1"
                >
                  <span>🔒</span>
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* Căutare și iconuri */}
          <div className="flex items-center gap-4">
            {/* Formular căutare cu sugestii îmbunătățite */}
            <div className="relative">
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    placeholder="Caută produse..."
                    className="w-64 px-4 py-2 pr-10 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                <button 
                  type="submit" 
                  className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  Caută
                </button>
              </form>

              {/* Sugestii autocomplete îmbunătățite */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mx-auto"></div>
                    </div>
                  ) : (
                    suggestions.map((item) => {
                      const firstColor = item.colors?.[0];
                      const firstImage = Array.isArray(item.images?.[firstColor])
                        ? item.images[firstColor][0]
                        : item.images?.[firstColor];

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSuggestionClick(item)}
                          className="flex items-center gap-3 p-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          {firstImage && (
                            <img
                              src={firstImage}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.category}</p>
                          </div>
                          <p className="text-sm font-bold text-purple-600">{item.price} lei</p>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Iconuri navigare */}
            <div className="flex items-center gap-3">
              {/* Icon: Cont */}
              <Link 
                to={user ? "/contul-meu" : "/login-client"} 
                title={user ? "Contul meu" : "Autentificare"}
                className="p-2 rounded-full hover:bg-purple-50 transition-colors"
              >
                <User className="w-5 h-5 text-gray-700 hover:text-purple-600" />
              </Link>

              {/* Icon: Wishlist cu număr */}
              <Link 
                to="/wishlist" 
                title="Favorite" 
                className="relative p-2 rounded-full hover:bg-purple-50 transition-colors"
              >
                <Heart className="w-5 h-5 text-gray-700 hover:text-purple-600" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {wishlist.length > 9 ? '9+' : wishlist.length}
                  </span>
                )}
              </Link>

              {/* Icon: Coș cu număr */}
              <Link 
                to="/cart" 
                title="Coșul meu" 
                className="relative p-2 rounded-full hover:bg-purple-50 transition-colors"
              >
                <ShoppingBag className="w-5 h-5 text-gray-700 hover:text-purple-600" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {cartItemsCount > 9 ? '9+' : cartItemsCount}
                  </span>
                )}
              </Link>

              {/* Logout */}
              {user && (
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-600 hover:text-purple-700 underline ml-2 transition-colors"
                  title="Deconectare"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigare mobilă */}
        <div className="md:hidden mt-4 flex justify-center gap-6">
          <Link 
            to="/" 
            className="text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium"
          >
            Acasă
          </Link>
          <Link 
            to="/products" 
            className="text-gray-700 hover:text-purple-600 transition-colors text-sm font-medium"
          >
            Produse
          </Link>
          {user?.uid === ADMIN_UID && (
            <Link 
              to="/admin" 
              className="text-purple-600 hover:text-purple-800 transition-colors text-sm font-semibold"
            >
              🔒 Admin
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;