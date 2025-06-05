import { useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import products from "../data/products";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const ProductDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const product = products.find((p) => p.id === id);

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const initialColor = searchParams.get("color") || product.colors[0];
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [engraving, setEngraving] = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const [engravingImage, setEngravingImage] = useState(null);

  const [mainImage, setMainImage] = useState(
    Array.isArray(product.images[selectedColor])
      ? product.images[selectedColor][0]
      : product.images[selectedColor]
  );

  useEffect(() => {
    setMainImage(
      Array.isArray(product.images[selectedColor])
        ? product.images[selectedColor][0]
        : product.images[selectedColor]
    );
  }, [selectedColor, product.images]);

  if (!product) {
    return <div className="p-4">Produsul nu a fost găsit.</div>;
  }

  const handleAddToCart = () => {
    const itemToAdd = {
      id: product.id,
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
      {/* Titlu și icon wishlist */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-purple-700">{product.name}</h1>
        <button
          onClick={() =>
            isInWishlist(product.id)
              ? removeFromWishlist(product.id)
              : addToWishlist(product)
          }
          className={`text-2xl transition duration-200 ${
            isInWishlist(product.id)
              ? "text-red-500 hover:text-red-600"
              : "text-gray-400 hover:text-purple-600"
          } cursor-pointer`}
          title="Adaugă la favorite"
        >
          {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>

      {/* Imagine principală */}
      <div className="mb-4">
        <img
          src={mainImage}
          alt={`${product.name} - ${selectedColor}`}
          className="w-full h-64 object-contain rounded border shadow"
        />
      </div>

      {/* Galerie imagini (miniaturi) */}
      {Array.isArray(product.images[selectedColor]) && (
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

      {/* Descriere & Preț */}
      <p className="mb-2 text-gray-700">
        {product.descriptionByColor
          ? product.descriptionByColor[selectedColor]
          : product.description}
      </p>
      <p className="mb-4 font-semibold text-lg">{product.price} lei</p>

      {/* Selectare variantă */}
      <div className="mb-4">
        <label className="block font-medium mb-1">
          {product.variantLabel || "Opțiune"}:
        </label>
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

      {/* Selectare mărime */}
      {product.sizes && product.sizes.length > 0 && (
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

      {/* Gravură text */}
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
            Imagine gravată (opțional):
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

      {/* Buton Adaugă în coș */}
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
