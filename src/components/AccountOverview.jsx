import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
  doc,
  getDoc
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

const AccountOverview = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/login-client");
      } else {
        setUser(currentUser);
        await Promise.all([
          fetchRecentOrders(currentUser.uid),
          fetchAddress(currentUser.uid),
        ]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchRecentOrders = async (uid) => {
    try {
      const q = query(
        collection(db, "comenzi"),
        where("uid", "==", uid),
        orderBy("data", "desc"),
        limit(2)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(data);
    } catch (error) {
      console.error("Eroare la preluarea comenzilor:", error.message);
    }
  };

  const fetchAddress = async (uid) => {
    try {
      const docRef = doc(db, "adrese", uid); // respectă regula: uid == docId
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAddress(docSnap.data());
      }
    } catch (error) {
      console.error("Eroare la preluarea adresei:", error.message);
    }
  };

  if (loading) return <p className="text-center">Se încarcă...</p>;

  return (
    <div className="space-y-8">
      {/* Salutare */}
      <div className="bg-white shadow p-6 rounded">
        <h2 className="text-xl font-semibold mb-2 text-purple-800">
          Bine ai venit în contul tău, {user?.email || "utilizator"}!
        </h2>
        <p className="text-gray-600">
          Aici poți vedea ultimele tale comenzi și adresa principală salvată.
        </p>
      </div>

      {/* Ultimele comenzi */}
      <div className="bg-white shadow p-6 rounded">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Ultimele comenzi</h3>
        {orders.length === 0 ? (
          <p className="text-gray-600">Nu ai comenzi recente.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li key={order.id} className="border rounded p-4">
                <p className="text-sm text-gray-500">
                  Data:{" "}
                  {order.data?.toDate
                    ? order.data.toDate().toLocaleString("ro-RO")
                    : "Data necunoscută"}
                </p>
                <p className="text-gray-800 font-medium">
                  Total: {order.total || 0} lei
                </p>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/contul-meu/comenzi"
          className="inline-block mt-4 text-sm text-purple-600 hover:underline"
        >
          Vezi toate comenzile →
        </Link>
      </div>

      {/* Adresă principală */}
      <div className="bg-white shadow p-6 rounded">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Adresa principală</h3>
        {address ? (
          <div className="text-gray-700 space-y-1">
            <p>{address.nume} {address.prenume}</p>
            <p>{address.adresa}</p>
            <p>{address.telefon}</p>
          </div>
        ) : (
          <p className="text-gray-600">Nu ai salvat o adresă.</p>
        )}
        <Link
          to="/contul-meu/adrese"
          className="inline-block mt-4 text-sm text-purple-600 hover:underline"
        >
          Gestionează adresele →
        </Link>
      </div>
    </div>
  );
};

export default AccountOverview;
