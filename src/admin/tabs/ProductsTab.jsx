import { useEffect, useState } from "react";
import { db, storage } from "../../firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const ProductsTab = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    colors: "",
    sizes: "",
    canBeEngraved: false,
    canUploadImage: false,
    hasGiftWrap: false,
    colorImages: {},
    colorDescriptions: {},
  });

  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "produse"));
    const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProducts(lista);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Sigur vrei să ștergi acest produs?");
    if (!confirm) return;
    await deleteDoc(doc(db, "produse", id));
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e, color) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      colorImages: {
        ...prev.colorImages,
        [color]: files,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Se încarcă imaginile...");
    setUploading(true);

    try {
      const colorsArray = formData.colors.split(",").map((c) => c.trim());
      const images = {};

      for (const color of colorsArray) {
        if (!formData.colorImages[color]) continue;

        const files = formData.colorImages[color];
        const urls = [];

        for (const file of files) {
          const fileName = `products/${crypto.randomUUID()}-${file.name}`;
          const storageRef = ref(storage, fileName);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          urls.push(url);
        }

        images[color] = urls;
      }

      await addDoc(collection(db, "produse"), {
        name: formData.name,
        price: parseFloat(formData.price),
        colors: colorsArray,
        sizes: formData.sizes
          ? formData.sizes.split(",").map((s) => s.trim())
          : [],
        canBeEngraved: formData.canBeEngraved,
        canUploadImage: formData.canUploadImage,
        hasGiftWrap: formData.hasGiftWrap,
        images,
        descriptions: formData.colorDescriptions,
        createdAt: new Date().toISOString(),
      });

      setStatus("✅ Produs adăugat cu succes.");
      setFormData({
        name: "",
        price: "",
        colors: "",
        sizes: "",
        canBeEngraved: false,
        canUploadImage: false,
        hasGiftWrap: false,
        colorImages: {},
        colorDescriptions: {},
      });
      fetchProducts();
    } catch (err) {
      console.error("Eroare la salvare:", err);
      setStatus("❌ Eroare la încărcare.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white shadow p-6 rounded max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-purple-800 mb-4">
        Adaugă un produs nou
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Nume produs"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="number"
          name="price"
          placeholder="Preț (lei)"
          value={formData.price}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          name="colors"
          placeholder="Culori (separate prin virgulă)"
          value={formData.colors}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          name="sizes"
          placeholder="Mărimi (separate prin virgulă, opțional)"
          value={formData.sizes}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />

        <div className="flex flex-col gap-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="canBeEngraved"
              checked={formData.canBeEngraved}
              onChange={handleChange}
            />
            <span className="ml-2">Poate fi gravat</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="canUploadImage"
              checked={formData.canUploadImage}
              onChange={handleChange}
            />
            <span className="ml-2">Poți încărca imagine pentru gravură</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="hasGiftWrap"
              checked={formData.hasGiftWrap}
              onChange={handleChange}
            />
            <span className="ml-2">Ambalaj cadou disponibil</span>
          </label>
        </div>

        {formData.colors &&
          formData.colors.split(",").map((color) => {
            const trimmed = color.trim();
            return (
              <div key={trimmed} className="mb-4">
                <label className="block mb-1 font-medium text-sm">
                  Descriere pentru culoarea "{trimmed}"
                </label>
                <textarea
                  className="w-full border rounded px-3 py-2 mb-2"
                  value={formData.colorDescriptions?.[trimmed] || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      colorDescriptions: {
                        ...prev.colorDescriptions,
                        [trimmed]: e.target.value,
                      },
                    }))
                  }
                />
                <label className="block mb-1 font-medium text-sm">
                  Imagini pentru culoarea "{trimmed}"
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, trimmed)}
                />
              </div>
            );
          })}

        <button
          type="submit"
          disabled={uploading}
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
        >
          {uploading ? "Se încarcă..." : "Adaugă produsul"}
        </button>
        {status && <p className="text-sm text-center mt-2">{status}</p>}
      </form>

      <hr className="my-6" />
      <h3 className="text-lg font-semibold mb-4">Produse existente</h3>
      <div className="grid gap-4">
        {products.map((p) => {
          const firstColor = p.colors?.[0];
          const firstImage = Array.isArray(p.images?.[firstColor])
            ? p.images[firstColor][0]
            : p.images?.[firstColor];

          return (
            <div
              key={p.id}
              className="border p-4 rounded shadow flex items-center gap-4"
            >
              {firstImage && (
                <img
                  src={firstImage}
                  alt={p.name}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold">{p.name}</h4>
                <p className="text-sm text-gray-500">{p.price} lei</p>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Șterge
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductsTab;
