import { useState, useEffect } from "react";
import { db, storage } from "../firebase/config";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const ProductForm = ({ product = null, isEdit = false, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    colors: [""],
    sizes: [""],
    canBeEngraved: false,
    canUploadImage: false,
    hasGiftWrap: false,
    available: true,
  });

  const [images, setImages] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [colorDescriptions, setColorDescriptions] = useState({});

  const categories = [
    "Bijuterii",
    "Decorațiuni",
    "Cadouri",
    "Lumânări",
    "Accesorii",
    "Altele"
  ];

  // Populează formularul când este în modul editare
  useEffect(() => {
    if (isEdit && product) {
      setForm({
        name: product.name || "",
        price: product.price?.toString() || "",
        description: product.description || "",
        category: product.category || "",
        colors: product.colors || [""],
        sizes: product.sizes || [""],
        canBeEngraved: product.canBeEngraved || false,
        canUploadImage: product.canUploadImage || false,
        hasGiftWrap: product.hasGiftWrap || false,
        available: product.available !== false,
      });
      
      // Setează descrierile pentru culori dacă există
      if (product.descriptions) {
        setColorDescriptions(product.descriptions);
      }
    }
  }, [isEdit, product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleColorChange = (index, value) => {
    const updated = [...form.colors];
    updated[index] = value;
    setForm({ ...form, colors: updated });
  };

  const handleImageChange = (index, files) => {
    const fileArray = Array.from(files);
    setImages((prev) => ({ ...prev, [index]: fileArray }));

    const previews = fileArray.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => ({ ...prev, [index]: previews }));
  };

  const handleSizeChange = (index, value) => {
    const updated = [...form.sizes];
    updated[index] = value;
    setForm({ ...form, sizes: updated });
  };

  const addColorField = () => {
    setForm({ ...form, colors: [...form.colors, ""] });
  };

  const removeColorField = (index) => {
    if (form.colors.length > 1) {
      const updated = form.colors.filter((_, i) => i !== index);
      setForm({ ...form, colors: updated });
      
      // Șterge și imaginile/descrierile asociate
      const newImages = { ...images };
      const newPreviews = { ...imagePreviews };
      const newDescriptions = { ...colorDescriptions };
      
      delete newImages[index];
      delete newPreviews[index];
      delete newDescriptions[form.colors[index]];
      
      setImages(newImages);
      setImagePreviews(newPreviews);
      setColorDescriptions(newDescriptions);
    }
  };

  const addSizeField = () => {
    setForm({ ...form, sizes: [...form.sizes, ""] });
  };

  const removeSizeField = (index) => {
    if (form.sizes.length > 1) {
      const updated = form.sizes.filter((_, i) => i !== index);
      setForm({ ...form, sizes: updated });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setSuccess(false);
    
    try {
      const imageUrls = {};
      const validColors = form.colors.filter((c) => c.trim() !== "");
      
      // Pentru editare, păstrează imaginile existente dacă nu sunt înlocuite
      if (isEdit && product?.images) {
        Object.keys(product.images).forEach(color => {
          if (validColors.includes(color)) {
            imageUrls[color] = product.images[color];
          }
        });
      }

      // Încarcă imaginile noi
      for (let index = 0; index < validColors.length; index++) {
        const color = validColors[index];
        if (images[index] && images[index].length > 0) {
          const uploaded = await Promise.all(
            images[index].map(async (file) => {
              const fileRef = ref(storage, `products/${uuidv4()}-${file.name}`);
              await uploadBytes(fileRef, file);
              return await getDownloadURL(fileRef);
            })
          );
          imageUrls[color] = uploaded;
        }
      }

      const productData = {
        name: form.name,
        price: parseFloat(form.price),
        description: form.description,
        category: form.category,
        colors: validColors,
        sizes: form.sizes.filter((s) => s.trim() !== ""),
        images: imageUrls,
        descriptions: colorDescriptions,
        canBeEngraved: form.canBeEngraved,
        canUploadImage: form.canUploadImage,
        hasGiftWrap: form.hasGiftWrap,
        available: form.available,
        updatedAt: new Date(),
      };

      if (isEdit && product) {
        // Actualizează produsul existent
        await updateDoc(doc(db, "produse", product.id), productData);
        setSuccess("✅ Produs actualizat cu succes!");
      } else {
        // Creează produs nou
        productData.createdAt = new Date();
        await addDoc(collection(db, "produse"), productData);
        setSuccess("✅ Produs adăugat cu succes!");
        
        // Reset form pentru produs nou
        setForm({
          name: "",
          price: "",
          description: "",
          category: "",
          colors: [""],
          sizes: [""],
          canBeEngraved: false,
          canUploadImage: false,
          hasGiftWrap: false,
          available: true,
        });
        setImages({});
        setImagePreviews({});
        setColorDescriptions({});
      }

      if (typeof onSuccess === "function") onSuccess();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("Eroare la salvare:", err);
      setSuccess("❌ Eroare la salvare.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informații de bază */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nume produs *
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="ex: Colier cu medalion personalizat"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preț (lei) *
          </label>
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="ex: 149"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categorie *
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            value={form.available}
            onChange={(e) => setForm(prev => ({...prev, available: e.target.value === "true"}))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Culori cu imagini */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Culori și imagini *
        </label>
        {form.colors.map((color, index) => (
          <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <input
                value={color}
                onChange={(e) => handleColorChange(index, e.target.value)}
                placeholder="ex: Roșu, Albastru"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              {form.colors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeColorField(index)}
                  className="text-red-600 hover:text-red-800 px-2 py-1"
                >
                  🗑️
                </button>
              )}
            </div>

            {/* Descriere pentru culoare */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descriere pentru {color || "această culoare"}
              </label>
              <textarea
                placeholder={`Descriere specifică pentru ${color || "această culoare"}...`}
                value={colorDescriptions[color] || ""}
                onChange={(e) =>
                  setColorDescriptions(prev => ({
                    ...prev,
                    [color]: e.target.value,
                  }))
                }
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Upload imagini */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagini pentru {color || "această culoare"}
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageChange(index, e.target.files)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              {imagePreviews[index] && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {imagePreviews[index].map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addColorField}
          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
        >
          + Adaugă culoare
        </button>
      </div>

      {/* Mărimi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mărimi disponibile (opțional)
        </label>
        {form.sizes.map((size, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <input
              value={size}
              onChange={(e) => handleSizeChange(i, e.target.value)}
              placeholder="ex: S, M, L"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {form.sizes.length > 1 && (
              <button
                type="button"
                onClick={() => removeSizeField(i)}
                className="text-red-600 hover:text-red-800 px-2 py-1"
              >
                🗑️
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addSizeField}
          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
        >
          + Adaugă mărime
        </button>
      </div>

      {/* Opțiuni speciale */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Opțiuni speciale</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="canBeEngraved"
              checked={form.canBeEngraved}
              onChange={handleChange}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
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
              checked={form.canUploadImage}
              onChange={handleChange}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
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
              checked={form.hasGiftWrap}
              onChange={handleChange}
              className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <div>
              <div className="font-medium text-gray-900 text-sm">Ambalaj cadou</div>
              <div className="text-xs text-gray-500">Oferă opțiunea de ambalaj</div>
            </div>
          </label>
        </div>
      </div>

      {/* Status și submit */}
      {success && (
        <div className={`p-4 rounded-lg text-sm ${
          success.includes("succes") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {success}
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={uploading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 font-medium"
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
              <span>{isEdit ? "Actualizează produsul" : "Adaugă produsul"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;