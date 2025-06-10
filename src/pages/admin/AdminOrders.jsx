import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, "comenzi"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(list);
    } catch (err) {
      console.error("Eroare la preluarea comenzilor:", err);
    }
    setLoading(false);
  };

  const markAsProcessed = async (orderId) => {
    try {
      await updateDoc(doc(db, "comenzi", orderId), {
        procesata: true,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, procesata: true } : o
        )
      );
    } catch (err) {
      console.error("Eroare la actualizarea comenzii:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p className="p-4">Se încarcă comenzile...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-purple-700 mb-6">Comenzi</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">Nu există comenzi.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border rounded p-4 bg-white shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="font-semibold text-lg">{order.nume}</h2>
                  <p className="text-sm text-gray-600">{order.email}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.data?.seconds * 1000).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      order.procesata
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.procesata ? "Procesată" : "Neprocesată"}
                  </span>
                </div>
              </div>

              <ul className="mb-2 text-sm space-y-1">
                {order.produse?.map((p, i) => (
                  <li key={i} className="border-b py-1">
                    {p.name} ({p.variant}{p.size ? `, ${p.size}` : ""}) - {p.price} lei
                    {p.engraving && ` - Gravură: "${p.engraving}"`}
                    {p.giftWrap && ` 🎁`}
                  </li>
                ))}
              </ul>

              <p className="font-bold mb-2">Total: {order.total} lei</p>

              {!order.procesata && (
                <button
                  onClick={() => markAsProcessed(order.id)}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition text-sm"
                >
                  Marchează ca procesată
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
