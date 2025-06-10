import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

const PaymentAndBilling = () => {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [card, setCard] = useState({
    titular: "",
    nrCard: "",
    expira: "",
  });
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

  // Preia datele existente din Firestore
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "plati", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && isMounted) {
          setCard(docSnap.data());
        }
      } catch (error) {
        console.error("Eroare la citirea metodei de plată:", error.message);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleChange = (e) => {
    setCard((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      const docRef = doc(db, "plati", user.uid);
      await setDoc(docRef, {
        ...card,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Eroare la salvarea metodei de plată:", error.message);
    }
  };

  return (
    <div className="bg-white shadow p-6 rounded space-y-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold text-purple-800 mb-4">Metodă de plată</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="titular" className="block text-sm mb-1">
            Nume pe card
          </label>
          <input
            id="titular"
            name="titular"
            type="text"
            value={card.titular}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label htmlFor="nrCard" className="block text-sm mb-1">
            Număr card (ultimele 4 cifre)
          </label>
          <input
            id="nrCard"
            name="nrCard"
            type="text"
            maxLength="4"
            value={card.nrCard}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label htmlFor="expira" className="block text-sm mb-1">
            Dată expirare (MM/YY)
          </label>
          <input
            id="expira"
            name="expira"
            type="text"
            value={card.expira}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
        >
          Salvează metoda
        </button>
        {saved && (
          <p className="text-green-600 text-sm mt-2">
            Metoda de plată a fost salvată cu succes.
          </p>
        )}
      </form>
    </div>
  );
};

export default PaymentAndBilling;
