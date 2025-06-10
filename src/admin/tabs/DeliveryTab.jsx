// DeliveryTab.jsx
import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";

const DeliveryTab = () => {
  const [comenzi, setComenzi] = useState([]);

  const fetchLivrari = async () => {
    const q = query(collection(db, "comenzi"), orderBy("data", "desc"));
    const snap = await getDocs(q);
    const lista = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      livrata: doc.data().livrata || false
    }));
    setComenzi(lista);
  };

  const toggleLivrata = async (id, current) => {
    const ref = doc(db, "comenzi", id);
    await updateDoc(ref, { livrata: !current });
    fetchLivrari();
  };

  useEffect(() => {
    fetchLivrari();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-purple-700 mb-4">🚚 Livrări</h2>
      {comenzi.length === 0 ? (
        <p className="text-gray-600">Nu sunt comenzi pentru livrare.</p>
      ) : (
        comenzi.map((c) => (
          <div
            key={c.id}
            className="border rounded p-4 mb-4 bg-white shadow hover:shadow-md"
          >
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700">
                <strong>Comandă:</strong> {c.nume} ({c.email}) – {c.total} lei
              </p>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={c.livrata}
                  onChange={() => toggleLivrata(c.id, c.livrata)}
                />
                <span className={c.livrata ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {c.livrata ? "Livrată" : "Nelivrată"}
                </span>
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              <strong>Adresă:</strong> {c.adresa}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default DeliveryTab;
