import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

const MyDetails = () => {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    nume: "",
    prenume: "",
    telefon: "",
    dataNasterii: "",
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Ascultă autentificarea
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "utilizatori", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data());
        }
      } catch (error) {
        console.error("Eroare la preluarea datelor:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const docRef = doc(db, "utilizatori", user.uid);
      await setDoc(docRef, formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Eroare la salvare:", error.message);
    }
  };

  if (loading) return <p>Se încarcă...</p>;

  return (
    <div className="bg-white shadow p-6 rounded space-y-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold text-purple-800 mb-4">Date personale</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="prenume" className="block mb-1 text-sm">
              Prenume
            </label>
            <input
              id="prenume"
              type="text"
              name="prenume"
              value={formData.prenume}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label htmlFor="nume" className="block mb-1 text-sm">
              Nume
            </label>
            <input
              id="nume"
              type="text"
              name="nume"
              value={formData.nume}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="telefon" className="block mb-1 text-sm">
            Număr de telefon
          </label>
          <input
            id="telefon"
            type="tel"
            name="telefon"
            value={formData.telefon}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="dataNasterii" className="block mb-1 text-sm">
            Data nașterii
          </label>
          <input
            id="dataNasterii"
            type="date"
            name="dataNasterii"
            value={formData.dataNasterii}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
        >
          Salvează modificările
        </button>

        {saved && (
          <p className="text-green-600 text-sm mt-2">
            Datele au fost salvate cu succes.
          </p>
        )}
      </form>
    </div>
  );
};

export default MyDetails;

