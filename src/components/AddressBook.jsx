import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AddressBook = () => {
  const [user, setUser] = useState(null);
  const [adresa, setAdresa] = useState({
    nume: "",
    prenume: "",
    adresa: "",
    telefon: "",
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  // Ascultă autentificarea
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  // Preia adresa din documentul utilizatorului (nu cu where!)
  useEffect(() => {
    const fetchAddress = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "adrese", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAdresa(docSnap.data());
        }
      } catch (err) {
        console.error("Eroare la preluarea adresei:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAddress();
  }, [user]);

  const handleChange = (e) => {
    setAdresa((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      const docRef = doc(db, "adrese", user.uid);
      await setDoc(docRef, { ...adresa, uid: user.uid });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Eroare la salvarea adresei:", err.message);
    }
  };

  if (loading) return <p>Se încarcă...</p>;

  return (
    <div className="bg-white shadow p-6 rounded space-y-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold text-purple-800 mb-4">Adresa mea</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="prenume" className="block text-sm mb-1">Prenume</label>
            <input
              id="prenume"
              type="text"
              name="prenume"
              value={adresa.prenume}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label htmlFor="nume" className="block text-sm mb-1">Nume</label>
            <input
              id="nume"
              type="text"
              name="nume"
              value={adresa.nume}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="adresa" className="block text-sm mb-1">Adresă</label>
          <input
            id="adresa"
            type="text"
            name="adresa"
            value={adresa.adresa}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label htmlFor="telefon" className="block text-sm mb-1">Telefon</label>
          <input
            id="telefon"
            type="tel"
            name="telefon"
            value={adresa.telefon}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
        >
          Salvează adresa
        </button>
        {saved && <p className="text-green-600 text-sm">Adresa a fost salvată cu succes.</p>}
      </form>
    </div>
  );
};

export default AddressBook;
