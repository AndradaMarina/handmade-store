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

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [engraving, setEngraving] = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const [engravingImage, setEngravingImage] = useState(null);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
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
          setProduct(null); // important!
        }
      } catch (error) {
        console.error("Eroare la preluarea produsului:", error.message);
        setProduct(null); // fallback în caz de eroare
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, searchParams]);

  useEffect(() => {
    if (product && selectedColor) {
      const image = Array.isArray(product.images?.[selectedColor])
        ? product.images[selectedColor][0]
        : product.images?.[selectedColor];
      setMainImage(image);
    }
  }, [selectedColor, product]);

  if (loading) return <div className="p-4">Se încarcă...</div>;
  if (!product) return <div className="p-4 text-center text-gray-600">Produsul nu a fost găsit.</div>;

  const handleAddToCart = () => {
    const itemToAdd = {
      id,
      name: product.name,
      price: product.price + (giftWrap ? 10 : 0),
      variant: selectedColor,
      size: selectedSize,
      engraving: product.canBeEngraved ? engraving : "",
      giftWrap,
      engravingImage: product.canUploadImage ? engravingImage : null,
    };

    addToCart(itemToAdd);
    alert("Produs adăugat în coș");
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-purple-700">{product.name}</h1>
        <button
          onClick={() =>
            isInWishlist(id)
              ? removeFromWishlist(id)
              : addToWishlist({ id, ...product })
          }
          className={`text-2xl transition duration-200 ${
            isInWishlist(id)
              ? "text-red-500 hover:text-red-600"
              : "text-gray-400 hover:text-purple-600"
          } cursor-pointer`}
          title="Adaugă la favorite"
        >
          {isInWishlist(id) ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

      <div className="mb-4">
        <img
          src={mainImage}
          alt={`${product.name} - ${selectedColor}`}
          className="w-full h-64 object-contain rounded border shadow"
        />
      </div>

      {Array.isArray(product.images?.[selectedColor]) && (
        <div className="flex gap-4 mb-6">
          {product.images[selectedColor].map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Thumbnail ${i + 1}`}
              onClick={() => setMainImage(img)}
              className={`w-20 h-20 object-contain border rounded cursor-pointer ${
                mainImage === img ? "ring-2 ring-purple-500" : ""
              }`}
            />
          ))}
        </div>
      )}

      <p className="mb-2 text-gray-700">{product.description}</p>
      <p className="mb-4 font-semibold text-lg">{product.price} lei</p>

      {/* Culoare */}
      {product.colors && (
        <div className="mb-4">
          <label className="block font-medium mb-1">Opțiune:</label>
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="border p-2 rounded w-full bg-white text-black"
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
        <div className="mb-4">
          <label className="block font-medium mb-1">Mărime:</label>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="border p-2 rounded w-full bg-white text-black"
          >
            {product.sizes.map((size, i) => (
              <option key={i} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Gravură */}
      {product.canBeEngraved && (
        <div className="mb-4">
          <label className="block font-medium mb-1">Text gravat:</label>
          <input
            type="text"
            value={engraving}
            onChange={(e) => setEngraving(e.target.value)}
            className="border p-2 rounded w-full bg-white text-black"
          />
        </div>
      )}

      {/* Imagine gravură */}
      {product.canUploadImage && (
        <div className="mb-4">
          <label className="block font-medium mb-1">
            Imagine gravură (opțional):
          </label>
          <label className="cursor-pointer inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300">
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
              Fișier selectat:{" "}
              <span className="font-medium">{engravingImage.name}</span>
            </p>
          )}
        </div>
      )}

      {/* Ambalaj cadou */}
      {product.hasGiftWrap && (
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={giftWrap}
              onChange={(e) => setGiftWrap(e.target.checked)}
              className="mr-2"
            />
            Ambalaj cadou (+10 lei)
          </label>
        </div>
      )}

      <button
        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 hover:shadow-md transition duration-300 cursor-pointer"
        onClick={handleAddToCart}
      >
        Adaugă în coș
      </button>
    </div>
  );
};

export default ProductDetails;
