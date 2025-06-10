import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "comenzi"),
          where("uid", "==", user.uid),
          orderBy("data", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(data);
      } catch (err) {
        console.error("Eroare la preluarea comenzilor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  return (
    <div className="bg-white p-6 rounded shadow-md max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Comenzile mele</h2>

      <div aria-live="polite">
        {loading ? (
          <p>Se încarcă...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-600">Nu ai comenzi înregistrate.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded p-4 bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">
                  Data:{" "}
                  {order.data?.toDate
                    ? order.data.toDate().toLocaleDateString("ro-RO")
                    : "N/A"}
                </p>
                <ul className="list-disc list-inside text-sm mb-2">
                  {Array.isArray(order.produse) &&
                    order.produse.map((item, i) => (
                      <li key={i}>
                        {item?.name || "Produs indisponibil"} – {item?.price || 0} lei
                      </li>
                    ))}
                </ul>
                <p className="font-bold text-purple-700">
                  Total: {order.total || 0} lei
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
