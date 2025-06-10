import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { Heart, ShoppingBag, User } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";

const Header = () => {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const auth = getAuth();
  const navigate = useNavigate();
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const ADMIN_UID = "9yGDw0kZi6V2MmsPNfpKW5bMaae2";

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "produse"));
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllProducts(products);
      } catch (error) {
        console.error("Eroare la preluarea produselor:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleLogout = () => {
    signOut(auth);
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length > 1) {
      const filtered = allProducts.filter((product) =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 6));
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (product) => {
    navigate(`/products/${product.id}?color=${encodeURIComponent(product.colors?.[0] || "")}`);
    setSearchTerm("");
    setSuggestions([]);
  };

  return (
    <header className="bg-white shadow-md py-4 mb-6 relative z-50">
      <nav className="max-w-6xl mx-auto px-4 flex flex-wrap justify-between items-center">
        {/* Stânga: logo + linkuri */}
        <div className="flex items-center gap-6 text-sm sm:text-base">
          <h1 className="text-xl font-bold text-purple-700">Handmade Store</h1>
          <Link to="/" className="hover:text-purple-600">Home</Link>
          <Link to="/products" className="hover:text-purple-600">Produse</Link>
          {user?.uid === ADMIN_UID && (
            <Link to="/admin" className="hover:text-purple-600 font-semibold">🔒 Admin</Link>
          )}
        </div>

        {/* Dreapta: căutare și iconuri */}
        <div className="flex items-center gap-4 mt-4 sm:mt-0 relative">
          {/* Formular căutare */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center border border-gray-300 rounded overflow-hidden relative z-50"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Caută..."
              className="px-3 py-1 text-sm outline-none"
            />
            <button type="submit" className="bg-purple-600 text-white px-3 py-1 text-sm hover:bg-purple-700">
              Caută
            </button>
          </form>

          {/* Sugestii autocomplete */}
          {suggestions.length > 0 && (
            <ul className="absolute top-12 left-0 right-0 bg-white border border-gray-300 rounded shadow-md z-40">
              {suggestions.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleSuggestionClick(item)}
                  className="px-4 py-2 hover:bg-purple-50 cursor-pointer text-sm text-left"
                >
                  {item.name}
                </li>
              ))}
            </ul>
          )}

          {/* Icon: Cont */}
          <Link to={user ? "/contul-meu" : "/login-client"} title="Contul meu">
            <User className="w-5 h-5 hover:text-purple-600" />
          </Link>

          {/* Icon: Wishlist cu număr */}
          <Link to="/wishlist" title="Favorite" className="relative">
            <Heart className="w-5 h-5 hover:text-purple-600 cursor-pointer" />
            {wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Icon: Coș cu număr */}
          <Link to="/cart" title="Coșul meu" className="relative">
            <ShoppingBag className="w-5 h-5 hover:text-purple-600 cursor-pointer" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </Link>

          {/* Logout */}
          {user && (
            <button
              onClick={handleLogout}
              className="text-xs text-purple-600 hover:text-purple-800 underline ml-2"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
