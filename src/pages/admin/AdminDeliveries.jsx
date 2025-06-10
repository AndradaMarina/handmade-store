import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";

const AdminDeliveries = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProcessedOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, "comenzi"));
      const filtered = snapshot.docs
        .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
        .filter(order => order.procesata);

      setOrders(filtered);
    } catch (err) {
      console.error("Eroare la preluarea livrărilor:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsDelivered = async (id) => {
    try {
      await updateDoc(doc(db, "comenzi", id), {
        livrata: true,
      });
      setOrders(prev =>
        prev.map((order) =>
          order.id === id ? { ...order, livrata: true } : order
        )
      );
    } catch (err) {
      console.error("Eroare la actualizare livrare:", err);
    }
  };

  useEffect(() => {
    fetchProcessedOrders();
  }, []);

  if (loading) return <p className="p-4">Se încarcă comenzile procesate...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-purple-700 mb-6">Livrări</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">Nu există comenzi procesate.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded p-4 bg-white shadow space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-lg">{order.nume}</h2>
                  <p className="text-sm text-gray-600">{order.email}</p>
                  <p className="text-sm text-gray-600">Adresa: {order.adresa}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.data?.seconds * 1000).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      order.livrata
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.livrata ? "Livrată" : "În curs de livrare"}
                  </span>
                </div>
              </div>

              <ul className="text-sm space-y-1">
                {order.produse?.map((p, i) => (
                  <li key={i}>
                    {p.name} ({p.variant}{p.size ? `, ${p.size}` : ""}) - {p.price} lei
                  </li>
                ))}
              </ul>

              <p className="font-bold">Total: {order.total} lei</p>

              {!order.livrata && (
                <button
                  onClick={() => markAsDelivered(order.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                >
                  Marchează ca livrată
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDeliveries;
