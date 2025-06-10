import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "comenzi"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sortează comenzile după dată (cele mai noi primele)
      list.sort((a, b) => (b.data?.seconds || 0) - (a.data?.seconds || 0));
      setOrders(list);
    } catch (err) {
      console.error("Eroare la preluarea comenzilor:", err);
    } finally {
      setLoading(false);
    }
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

  // Filtrare comenzi
  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === "all" || 
      (filter === "processed" && order.procesata) ||
      (filter === "unprocessed" && !order.procesata);
    
    const matchesSearch = searchTerm === "" ||
      order.nume?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: orders.length,
    processed: orders.filter(o => o.procesata).length,
    unprocessed: orders.filter(o => !o.procesata).length,
    totalValue: orders.reduce((sum, o) => sum + (o.total || 0), 0)
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă comenzile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header cu statistici */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Comenzi</h1>
            <p className="text-gray-600 mt-1">Gestionează comenzile clienților</p>
          </div>
          <button
            onClick={fetchOrders}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizează</span>
          </button>
        </div>

        {/* Statistici */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total comenzi</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 rounded-lg p-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Procesate</p>
                <p className="text-3xl font-bold">{stats.processed}</p>
              </div>
              <div className="bg-green-400 bg-opacity-30 rounded-lg p-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Neprocesate</p>
                <p className="text-3xl font-bold">{stats.unprocessed}</p>
              </div>
              <div className="bg-yellow-400 bg-opacity-30 rounded-lg p-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Valoare totală</p>
                <p className="text-3xl font-bold">{stats.totalValue} lei</p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 rounded-lg p-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filtre și căutare */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Toate ({stats.total})
              </button>
              <button
                onClick={() => setFilter("unprocessed")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "unprocessed"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Neprocesate ({stats.unprocessed})
              </button>
              <button
                onClick={() => setFilter("processed")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === "processed"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Procesate ({stats.processed})
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Caută după nume sau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Lista comenzilor */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 text-lg">Nu există comenzi pentru criteriile selectate</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Informații client */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        {order.nume}
                      </h3>
                      <p className="text-gray-600 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        {order.email}
                      </p>
                      <p className="text-gray-500 text-sm flex items-center mt-1">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {new Date(order.data?.seconds * 1000).toLocaleString("ro-RO")}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        order.procesata
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                      }`}
                    >
                      {order.procesata ? "✅ Procesată" : "⏳ Neprocesată"}
                    </span>
                  </div>

                  {/* Produse */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2L3 7v11a2 2 0 002 2h10a2 2 0 002-2V7l-7-5zM6 9a1 1 0 112 0 1 1 0 01-2 0zm6 0a1 1 0 112 0 1 1 0 01-2 0z" clipRule="evenodd" />
                      </svg>
                      Produse comandate
                    </h4>
                    <div className="space-y-2">
                      {order.produse?.map((p, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">{p.name}</span>
                            <div className="text-sm text-gray-600">
                              {p.variant && <span className="mr-3">Varianta: {p.variant}</span>}
                              {p.size && <span className="mr-3">Mărime: {p.size}</span>}
                              {p.engraving && (
                                <div className="mt-1 text-purple-600">
                                  <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                  Gravură: "{p.engraving}"
                                </div>
                              )}
                              {p.giftWrap && (
                                <span className="inline-flex items-center text-pink-600 text-sm">
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0115 5a3 3 0 013 3v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a3 3 0 013-3z" clipRule="evenodd" />
                                  </svg>
                                  Împachetat cadou
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-gray-900">{p.price} lei</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-gray-900">
                      Total: {order.total} lei
                    </div>
                    {!order.procesata && (
                      <button
                        onClick={() => markAsProcessed(order.id)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Marchează ca procesată</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;