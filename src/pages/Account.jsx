import { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";

const Account = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate("/login-client");
    } else {
      setUser(currentUser);
      fetchOrders(currentUser.uid);
    }
  }, []);

  const fetchOrders = async (uid) => {
    try {
      const q = query(collection(db, "comenzi"), where("uid", "==", uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
    } catch (err) {
      console.error("Eroare la preluarea comenzilor:", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white rounded shadow">
      <h1 className="text-3xl font-bold text-purple-700 mb-4">Contul meu</h1>

      {user && (
        <div className="mb-6">
          <p className="text-gray-700">
            Bine ai venit, <span className="font-semibold">{user.email}</span>
          </p>
          <button
            onClick={handleLogout}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-800 mb-3">
        Istoric comenzi:
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-600">Nu ai comenzi înregistrate.</p>
      ) : (
        orders.map((order, index) => (
          <div
            key={order.id}
            className={`border rounded p-4 mb-4 ${
              index % 2 === 0 ? "bg-gray-50" : "bg-white"
            }`}
          >
            <p className="text-sm text-gray-600 mb-2">
              Data:{" "}
              {order.data?.toDate
                ? order.data.toDate().toLocaleString("ro-RO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </p>

            <ul className="list-disc list-inside text-sm mb-2">
              {order.produse.map((item, i) => (
                <li key={i}>
                  {item.name} – {item.price} lei
                </li>
              ))}
            </ul>

            <p className="text-purple-700 font-bold">Total: {order.total} lei</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Account;

