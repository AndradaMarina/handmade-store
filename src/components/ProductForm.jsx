import { useState } from "react";
import { db, storage } from "../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const ProductForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    colors: [""],
    sizes: [""],
    canBeEngraved: false,
    canUploadImage: false,
    hasGiftWrap: false,
  });

  const [images, setImages] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const addField = (field) => {
    setForm({ ...form, [field]: [...form[field], ""] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const imageUrls = {};
      for (let index = 0; index < form.colors.length; index++) {
        const color = form.colors[index].trim();
        if (color && images[index]) {
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

      await addDoc(collection(db, "produse"), {
        name: form.name,
        price: parseFloat(form.price),
        description: form.description,
        colors: form.colors.filter((c) => c.trim() !== ""),
        sizes: form.sizes.filter((s) => s.trim() !== ""),
        images: imageUrls,
        canBeEngraved: form.canBeEngraved,
        canUploadImage: form.canUploadImage,
        hasGiftWrap: form.hasGiftWrap,
        createdAt: new Date().toISOString(),
      });

      setSuccess(true);
      setForm({
        name: "",
        price: "",
        description: "",
        colors: [""],
        sizes: [""],
        canBeEngraved: false,
        canUploadImage: false,
        hasGiftWrap: false,
      });
      setImages({});
      setImagePreviews({});
      if (typeof onSuccess === "function") onSuccess();
    } catch (err) {
      console.error("Eroare la salvare:", err);
    }
    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-gray-50 border rounded shadow">
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Nume produs"
        className="w-full border px-3 py-2 rounded"
        required
      />

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Descriere"
        className="w-full border px-3 py-2 rounded"
        required
      />

      <input
        name="price"
        type="number"
        value={form.price}
        onChange={handleChange}
        placeholder="Preț"
        className="w-full border px-3 py-2 rounded"
        required
      />

      <div>
        <p className="font-semibold mb-2">Culori și imagini:</p>
        {form.colors.map((color, index) => (
          <div key={index} className="mb-4">
            <input
              value={color}
              onChange={(e) => handleColorChange(index, e.target.value)}
              placeholder="Ex: lemn"
              className="border rounded px-3 py-2 w-full mb-2"
              required
            />

            <label className="inline-block cursor-pointer bg-gray-100 border px-4 py-2 rounded hover:bg-gray-200">
              Alege imagini
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageChange(index, e.target.files)}
                className="hidden"
              />
            </label>

            {imagePreviews[index] && (
              <div className="flex flex-wrap gap-2 mt-2">
                {imagePreviews[index].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`preview-${i}`}
                    className="w-20 h-20 object-cover rounded border"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addField("colors")}
          className="text-sm text-purple-700 underline"
        >
          + Adaugă culoare
        </button>
      </div>

      <div>
        <p className="font-semibold mb-1">Mărimi (opțional):</p>
        {form.sizes.map((size, i) => (
          <input
            key={i}
            value={size}
            onChange={(e) => handleSizeChange(i, e.target.value)}
            placeholder="Ex: M, L"
            className="border rounded px-3 py-2 mb-2 block w-full"
          />
        ))}
        <button
          type="button"
          onClick={() => addField("sizes")}
          className="text-sm text-purple-700 underline"
        >
          + Adaugă mărime
        </button>
      </div>

     <div className="flex flex-col gap-3 pt-2">
  <label className="flex items-center gap-3">
    <input
      type="checkbox"
      name="canBeEngraved"
      checked={form.canBeEngraved}
      onChange={handleChange}
      className="accent-purple-600 w-4 h-4"
    />
    <span className="text-sm font-medium">Poate fi gravat</span>
  </label>

  <label className="flex items-center gap-3">
    <input
      type="checkbox"
      name="canUploadImage"
      checked={form.canUploadImage}
      onChange={handleChange}
      className="accent-purple-600 w-4 h-4"
    />
    <span className="text-sm font-medium">Poți încărca imagine pentru gravură</span>
  </label>

  <label className="flex items-center gap-3">
    <input
      type="checkbox"
      name="hasGiftWrap"
      checked={form.hasGiftWrap}
      onChange={handleChange}
      className="accent-purple-600 w-4 h-4"
    />
    <span className="text-sm font-medium">Ambalaj cadou disponibil</span>
  </label>
</div>


      <button
        type="submit"
        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
        disabled={uploading}
      >
        {uploading ? "Se încarcă..." : "Salvează produsul"}
      </button>

      {success && (
        <p className="text-green-600 text-sm mt-2">✅ Produsul a fost adăugat cu succes!</p>
      )}
    </form>
  );
};

export default ProductForm;
