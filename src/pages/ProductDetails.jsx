import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import products from "../data/products";
import { useCart } from "../context/CartContext";

const ProductDetails = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);

  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "");
  const [engraving, setEngraving] = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const { addToCart } = useCart();

  // Imagine principală selectabilă
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

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">{product.name}</h1>

      {/* Imagine principală */}
      <div className="mb-4">
        <img
          src={mainImage}
          alt={`${product.name} - ${selectedColor}`}
          className="w-full h-64 object-contain rounded border shadow"
        />
      </div>

      {/* Galerie imagini thumbnails */}
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

      {/* Descriere */}
      <p className="mb-2 text-gray-700">
        {product.descriptionByColor
          ? product.descriptionByColor[selectedColor]
          : product.description}
      </p>

      <p className="mb-4 font-semibold text-lg">{product.price} lei</p>

      {/* Parfum sau Culoare */}
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
            <option key={i} value={color}>{color}</option>
          ))}
        </select>
      </div>

      {/* Mărime doar dacă există */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="mb-4">
          <label className="block font-medium mb-1">Mărime:</label>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="border p-2 rounded w-full bg-white text-black"
          >
            {product.sizes.map((size, i) => (
              <option key={i} value={size}>{size}</option>
            ))}
          </select>
        </div>
      )}

      {/* Gravură dacă e permisă */}
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

      {/* Buton coș */}
      <button
        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
        onClick={() => {
          addToCart({
            id: product.id,
            name: product.name,
            price: product.price + (giftWrap ? 10 : 0),
            variant: selectedColor,
            size: selectedSize,
            engraving,
            giftWrap
          });
          alert("Produs adăugat în coș");
        }}
      >
        Adaugă în coș
      </button>
    </div>
  );
};

export default ProductDetails;
