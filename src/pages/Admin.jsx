import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";

const Admin = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [comenzi, setComenzi] = useState([]);

  const adminUID = "9yGDw0kZi6V2MmsPNfpKW5bMaae2";

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
    } else if (user.uid !== adminUID) {
      navigate("/");
    } else {
      setAllowed(true);
      fetchComenzi();
    }
  }, []);

  const fetchComenzi = async () => {
    const q = query(collection(db, "comenzi"), orderBy("data", "desc"));
    const snapshot = await getDocs(q);
    const lista = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      procesata: doc.data().procesata || false,
    }));
    setComenzi(lista);
  };

  const toggleProcesata = async (id, current) => {
    const ref = doc(db, "comenzi", id);
    await updateDoc(ref, { procesata: !current });
    fetchComenzi();
  };

  if (!allowed) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 mt-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">📦 Comenzi primite</h1>

      {comenzi.length === 0 ? (
        <p className="text-gray-600">Momentan nu există comenzi.</p>
      ) : (
        comenzi.map((c, i) => (
          <div key={i} className="border rounded p-4 mb-6 bg-white shadow hover:shadow-md transition">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
              <p className="text-sm text-gray-500">
                <strong>Plasată:</strong> {c.data.toDate().toLocaleString()}
              </p>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={c.procesata}
                  onChange={() => toggleProcesata(c.id, c.procesata)}
                  className="cursor-pointer"
                />
                <span className={`font-semibold ${c.procesata ? "text-green-600" : "text-yellow-600"}`}>
                  {c.procesata ? "Procesată" : "Neprocesată"}
                </span>
              </label>
            </div>

            <div className="mb-2">
              <p className="text-gray-800 text-sm"><strong>Client:</strong> {c.nume} ({c.email})</p>
              <p className="text-gray-700 text-sm"><strong>Adresă:</strong> {c.adresa}</p>
            </div>

            <ul className="list-disc pl-5 text-sm text-gray-800 space-y-1 mb-2">
              {c.produse.map((p, index) => (
                <li key={index}>
                  {p.name} – {p.price} lei {p.variant && `– ${p.variant}`}
                  {p.size && ` – mărime ${p.size}`}
                  {p.engraving && ` – gravură: "${p.engraving}"`}
                </li>
              ))}
            </ul>

            <div className="text-right">
              <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                Total: {c.total} lei
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Admin;
