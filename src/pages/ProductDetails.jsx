import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import products from "../data/products";

const ProductDetails = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);

  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [engraving, setEngraving] = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const [mainImage, setMainImage] = useState(
    Array.isArray(product.images[product.colors[0]])
      ? product.images[product.colors[0]][0]
      : product.images[product.colors[0]]
  );

  useEffect(() => {
    const imgs = product.images[selectedColor];
    if (Array.isArray(imgs)) {
      setMainImage(imgs[0]);
    } else {
      setMainImage(imgs);
    }
  }, [selectedColor]);

  if (!product) {
    return <div className="p-4">Produsul nu a fost găsit.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">{product.name}</h1>

      {/* Imagine principală */}
      <img
        src={mainImage}
        alt="Imagine principală"
        className="w-full h-80 object-contain border rounded mb-4"
      />

      {/* Galerie selectabilă */}
      <div className="flex gap-2 mb-4">
        {Array.isArray(product.images[selectedColor]) &&
          product.images[selectedColor].map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Imagine ${i + 1}`}
              className={`w-28 h-28 object-contain border rounded cursor-pointer ${
                mainImage === img ? "ring-2 ring-purple-500" : ""
              }`}
              onClick={() => setMainImage(img)}
            />
          ))}
      </div>

      {/* Descriere personalizată */}
      <p className="mb-2 text-gray-700">
        {product.descriptionByColor
          ? product.descriptionByColor[selectedColor]
          : product.description}
      </p>

      <p className="mb-4 font-semibold text-lg">{product.price} lei</p>

      {/* Selectare parfum / culoare */}
      <div className="mb-4">
        <label className="block font-medium mb-1">
          {product.id === "2" ? "Parfum" : "Culoare"}:
        </label>
        <select
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="border p-2 rounded w-full"
        >
          {product.colors.map((color, i) => (
            <option key={i} value={color}>{color}</option>
          ))}
        </select>
      </div>

      {/* Mărime (doar dacă există) */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="mb-4">
          <label className="block font-medium mb-1">Mărime:</label>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="border p-2 rounded w-full"
          >
            {product.sizes.map((size, i) => (
              <option key={i} value={size}>{size}</option>
            ))}
          </select>
        </div>
      )}

      {/* Gravură obligatorie */}
      {product.canBeEngraved && (
        <div className="mb-4">
          <label className="block font-medium mb-1">Text pentru gravare:</label>
          <input
            type="text"
            value={engraving}
            onChange={(e) => setEngraving(e.target.value)}
            className="border p-2 rounded w-full"
            required
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

      {/* Buton "Adaugă în coș" */}
      <button
        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
        onClick={() => {
          if (product.canBeEngraved && engraving.trim() === "") {
            alert("Te rugăm să introduci textul pentru gravare.");
            return;
          }

          console.log({
            id: product.id,
            name: product.name,
            price: product.price + (giftWrap ? 10 : 0),
            color: selectedColor,
            size: selectedSize,
            engraving,
            giftWrap
          });

          alert("Produs adăugat în coș (simulat)");
        }}
      >
        Adaugă în coș
      </button>
    </div>
  );
};

export default ProductDetails;
