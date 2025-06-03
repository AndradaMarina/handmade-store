import { useEffect, useState } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { collection, query, where, getDocs } from "firebase/firestore";

const Account = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [comenzi, setComenzi] = useState([]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate("/login-client");
    } else {
      setUser(currentUser);
      fetchComenzi(currentUser.uid);
    }
  }, []);

  const fetchComenzi = async (uid) => {
    try {
      const q = query(collection(db, "comenzi"), where("uid", "==", uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComenzi(data);
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
      <p className="mb-6">
        Salut, <strong>{user?.email}</strong>
      </p>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 mb-6 rounded hover:bg-red-600 cursor-pointer"
      >
        Logout
      </button>

      <h2 className="text-xl font-semibold text-gray-700 mb-3">
        Comenzile tale:
      </h2>

      {comenzi.length === 0 ? (
        <p className="text-gray-600">Nu ai comenzi înregistrate.</p>
      ) : (
        comenzi.map((c, i) => (
          <div
            key={i}
            className={`border rounded p-4 mb-4 ${
              i % 2 === 0 ? "bg-gray-50" : "bg-white"
            }`}
          >
            <p className="text-sm text-gray-600 mb-2">
              Data:{" "}
              {c.data?.toDate
                ? new Date(c.data.seconds * 1000).toLocaleDateString("ro-RO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </p>

            <ul className="list-disc pl-5 mb-2">
              {c.produse.map((p, index) => (
                <li key={index}>
                  {p.name} – {p.price} lei
                </li>
              ))}
            </ul>

            <p className="font-bold text-purple-700">Total: {c.total} lei</p>
          </div>
        ))
      )}
    </div>
  );
};

export default Account;


