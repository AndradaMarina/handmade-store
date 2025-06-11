import { useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const ProductDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [engraving, setEngraving] = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const [engravingImage, setEngravingImage] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        
        const docRef = doc(db, "produse", id);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const data = snap.data();
          setProduct(data);
          
          const color = searchParams.get("color") || data.colors?.[0] || "";
          setSelectedColor(color);
          setSelectedSize(data.sizes?.[0] || "");
          
          const defaultImage = Array.isArray(data.images?.[color])
            ? data.images[color][0]
            : data.images?.[color];
          setMainImage(defaultImage);
        } else {
          setError("Produsul nu a fost găsit.");
        }
      } catch (error) {
        console.error("Eroare la preluarea produsului:", error);
        setError("Eroare la încărcarea produsului. Te rugăm să încerci din nou.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, searchParams]);

  useEffect(() => {
    if (product && selectedColor && product.images?.[selectedColor]) {
      const image = Array.isArray(product.images[selectedColor])
        ? product.images[selectedColor][0]
        : product.images[selectedColor];
      setMainImage(image);
    }
  }, [selectedColor, product]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    
    try {
      const itemToAdd = {
        id,
        name: product.name,
        price: product.price + (giftWrap ? 10 : 0),
        variant: selectedColor,
        size: selectedSize,
        engraving: product.canBeEngraved ? engraving : "",
        giftWrap,
        engravingImage: product.canUploadImage ? engravingImage : null,
        image: mainImage, // Adaugă imaginea produsului
        quantity: quantity
      };

      // Adaugă produsul de mai multe ori dacă cantitatea > 1
      for (let i = 0; i < quantity; i++) {
        addToCart({ ...itemToAdd, quantity: 1 });
      }

      // Reset form
      setQuantity(1);
      setEngraving("");
      setGiftWrap(false);
      setEngravingImage(null);
      
      // Feedback vizual
      const button = document.querySelector('#add-to-cart-btn');
      if (button) {
        button.textContent = "✓ Adăugat!";
        button.classList.add('bg-green-600');
        setTimeout(() => {
          button.textContent = "Adaugă în coș";
          button.classList.remove('bg-green-600');
        }, 2000);
      }
      
    } catch (error) {
      console.error("Eroare la adăugarea în coș:", error);
      setError("Eroare la adăugarea produsului în coș.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist({ 
        firebaseId: id, 
        id: id,
        ...product,
        image: mainImage 
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto p-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Oops! Ceva nu a mers bine</h2>
          <p className="text-red-600 mb-4">{error || "Produsul nu a fost găsit."}</p>
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

  // Check if product is available
  if (product.available === false) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Produs indisponibil</h2>
          <p className="text-yellow-700 mb-4">Acest produs nu este disponibil momentan.</p>
          <a
            href="/products"
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
          >
            Vezi alte produse
          </a>
        </div>
      </div>
    );
  }

  const finalPrice = product.price + (giftWrap ? 10 : 0);
  const totalPrice = finalPrice * quantity;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagini */}
        <div className="space-y-4">
          <div className="relative">
            <img
              src={mainImage}
              alt={`${product.name} - ${selectedColor}`}
              className="w-full h-96 object-contain rounded-lg border shadow-lg bg-white"
            />
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-4 right-4 text-2xl transition duration-200 p-2 rounded-full bg-white shadow-lg ${
                isInWishlist(id)
                  ? "text-red-500 hover:text-red-600"
                  : "text-gray-400 hover:text-purple-600"
              }`}
              title={isInWishlist(id) ? "Elimină din favorite" : "Adaugă la favorite"}
            >
              {isInWishlist(id) ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          {/* Thumbnails */}
          {Array.isArray(product.images?.[selectedColor]) && product.images[selectedColor].length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images[selectedColor].map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  onClick={() => setMainImage(img)}
                  className={`w-20 h-20 object-cover border-2 rounded cursor-pointer flex-shrink-0 transition-all ${
                    mainImage === img ? "border-purple-500 ring-2 ring-purple-200" : "border-gray-200 hover:border-purple-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detalii produs */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-purple-700 mb-2">{product.name}</h1>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-3xl font-bold text-purple-600">{finalPrice.toFixed(2)} lei</p>
            {giftWrap && (
              <p className="text-sm text-purple-600 mt-1">Include ambalaj cadou (+10 lei)</p>
            )}
          </div>

          <div className="space-y-4">
            {/* Culoare */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block font-medium mb-2 text-gray-700">Opțiune:</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {product.colors.map((color, i) => (
                    <option key={i} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Mărime */}
            {product.sizes?.length > 0 && (
              <div>
                <label className="block font-medium mb-2 text-gray-700">Mărime:</label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {product.sizes.map((size, i) => (
                    <option key={i} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Cantitate */}
            <div>
              <label className="block font-medium mb-2 text-gray-700">Cantitate:</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Gravură */}
            {product.canBeEngraved && (
              <div>
                <label className="block font-medium mb-2 text-gray-700">Text gravat:</label>
                <input
                  type="text"
                  value={engraving}
                  onChange={(e) => setEngraving(e.target.value)}
                  placeholder="Introduceți textul pentru gravură..."
                  className="w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Imagine gravură */}
            {product.canUploadImage && (
              <div>
                <label className="block font-medium mb-2 text-gray-700">
                  Imagine gravură (opțional):
                </label>
                <label className="cursor-pointer inline-block bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition duration-300">
                  Alege fișier
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEngravingImage(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                {engravingImage && (
                  <p className="mt-2 text-sm text-gray-600">
                    Fișier selectat: <span className="font-medium">{engravingImage.name}</span>
                  </p>
                )}
              </div>
            )}

            {/* Ambalaj cadou */}
            {product.hasGiftWrap && (
              <div className="bg-pink-50 rounded-lg p-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={giftWrap}
                    onChange={(e) => setGiftWrap(e.target.checked)}
                    className="mr-3 w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                  />
                  <span className="font-medium text-gray-700">
                    🎁 Ambalaj cadou (+10 lei)
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Total și butoane */}
          <div className="border-t pt-6">
            {quantity > 1 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  {quantity} × {finalPrice.toFixed(2)} lei = <span className="font-bold text-purple-700">{totalPrice.toFixed(2)} lei</span>
                </p>
              </div>
            )}

            <button
              id="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="w-full bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 font-medium text-lg"
            >
              {addingToCart ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Se adaugă...
                </span>
              ) : (
                `Adaugă în coș - ${totalPrice.toFixed(2)} lei`
              )}
            </button>

            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>

          {/* Informații suplimentare */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">ℹ️ Informații suplimentare</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Livrare în 2-5 zile lucrătoare</li>
              <li>• Posibilitate de returnare în 14 zile</li>
              <li>• Produs realizat manual cu grijă</li>
              {product.canBeEngraved && <li>• Gravura se realizează în 1-2 zile suplimentare</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;