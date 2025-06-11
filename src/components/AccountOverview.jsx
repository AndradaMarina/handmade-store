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
        limit(3) // Afișează ultimele 3 comenzi
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
      const docRef = doc(db, "adrese", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAddress(docSnap.data());
      }
    } catch (error) {
      console.error("Eroare la preluarea adresei:", error.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă informațiile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Salutare */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <h2 className="text-2xl font-bold mb-2 text-purple-800">
          Bine ai venit în contul tău!
        </h2>
        <p className="text-gray-600">
          👋 Salut, <span className="font-medium">{user?.email || "utilizator"}</span>! 
          Aici poți gestiona comenzile, adresele și setările contului tău.
        </p>
      </div>

      {/* Statistici rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Comenzi totale</p>
              <p className="text-2xl font-bold text-purple-600">{orders.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Valoare comenzi</p>
              <p className="text-2xl font-bold text-green-600">
                {orders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)} lei
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Status cont</p>
              <p className="text-2xl font-bold text-blue-600">Activ</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Ultimele comenzi */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            Ultimele comenzi
          </h3>
          <Link
            to="/contul-meu/comenzi"
            className="text-purple-600 hover:text-purple-800 text-sm font-medium hover:underline transition-colors"
          >
            Vezi toate comenzile →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 mb-4">Nu ai comenzi încă.</p>
            <Link
              to="/products"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors inline-block"
            >
              Descoperă produsele noastre
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {order.data?.toDate
                        ? order.data.toDate().toLocaleString("ro-RO")
                        : order.data?.seconds
                          ? new Date(order.data.seconds * 1000).toLocaleString("ro-RO")
                          : "Data necunoscută"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {order.procesata ? (
                      order.livrata ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          ✅ Livrată
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          🚚 În livrare
                        </span>
                      )
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                        ⏳ În procesare
                      </span>
                    )}
                  </div>
                </div>

                {/* Produse din comandă */}
                {order.produse && order.produse.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm text-gray-600">
                      {order.produse.slice(0, 2).map((item, i) => (
                        <span key={i}>
                          {item?.name || "Produs necunoscut"}
                          {i < Math.min(order.produse.length, 2) - 1 && ", "}
                        </span>
                      ))}
                      {order.produse.length > 2 && (
                        <span className="text-gray-500"> și încă {order.produse.length - 2} produse</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="font-bold text-purple-700">
                    Total: {order.total ? parseFloat(order.total).toFixed(2) : "0.00"} lei
                  </p>
                  <Link
                    to="/contul-meu/comenzi"
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium hover:underline transition-colors"
                  >
                    Vezi detalii
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Adresă principală */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Adresa principală
          </h3>
          <Link
            to="/contul-meu/adrese"
            className="text-purple-600 hover:text-purple-800 text-sm font-medium hover:underline transition-colors"
          >
            Gestionează adresele →
          </Link>
        </div>

        {address ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-gray-700 space-y-1">
              <p className="font-medium">{address.nume} {address.prenume}</p>
              <p className="text-gray-600">{address.adresa}</p>
              <p className="text-gray-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {address.telefon}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-600 mb-3">Nu ai salvat o adresă principală.</p>
            <Link
              to="/contul-meu/adrese"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors inline-block text-sm"
            >
              Adaugă adresa
            </Link>
          </div>
        )}
      </div>

      {/* Acțiuni rapide */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/contul-meu/date-personale"
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 group-hover:text-purple-600">Date personale</h4>
              <p className="text-sm text-gray-500">Actualizează profilul</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link
          to="/contul-meu/autentificare"
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 group-hover:text-purple-600">Securitate</h4>
              <p className="text-sm text-gray-500">Schimbă parola</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link
          to="/contul-meu/plati"
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 group-hover:text-purple-600">Plăți</h4>
              <p className="text-sm text-gray-500">Metode de plată</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link
          to="/wishlist"
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 group-hover:text-purple-600">Favorite</h4>
              <p className="text-sm text-gray-500">Produse salvate</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AccountOverview;