// tabs/ProductListTab.jsx
import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductListTab = () => {
  const [produse, setProduse] = useState([]);
  const navigate = useNavigate();

  const fetchProduse = async () => {
    const snapshot = await getDocs(collection(db, "produse"));
    const list = snapshot.docs.map(docSnap => ({
      id: docSnap.id, // Corect! Nu din .data()
      ...docSnap.data()
    }));
    setProduse(list);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Sigur vrei să ștergi acest produs?")) return;
    await deleteDoc(doc(db, "produse", id));
    fetchProduse();
  };

  useEffect(() => {
    fetchProduse();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-purple-700 mb-4">📋 Lista Produse</h2>
      {produse.length === 0 ? (
        <p className="text-gray-600">Nu există produse în sistem.</p>
      ) : (
        produse.map((produs) => (
          <div key={produs.id} className="bg-white rounded-xl shadow p-4 flex justify-between items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">{produs.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-3">{produs.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => navigate(`/admin/editeaza/${produs.id}`)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
              >
                <Pencil size={16} /> Editează
              </button>
              <button
                onClick={() => handleDelete(produs.id)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
              >
                <Trash2 size={16} /> Șterge
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ProductListTab;
