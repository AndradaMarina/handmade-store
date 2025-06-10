import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";

const OrdersTab = () => {
  const [comenzi, setComenzi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchComenzi = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "comenzi"), orderBy("data", "desc"));
      const snapshot = await getDocs(q);
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        procesata: doc.data().procesata || false,
        livrata: doc.data().livrata || false,
      }));
      setComenzi(lista);
    } catch (error) {
      console.error("Eroare la încărcarea comenzilor:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProcesata = async (id, current) => {
    try {
      const ref = doc(db, "comenzi", id);
      await updateDoc(ref, { 
        procesata: !current,
        updatedAt: new Date()
      });
      setComenzi(prev => prev.map(c => 
        c.id === id ? { ...c, procesata: !current } : c
      ));
    } catch (error) {
      console.error("Eroare la actualizarea comenzii:", error);
    }
  };

  const markAsDelivered = async (id) => {
    try {
      const ref = doc(db, "comenzi", id);
      await updateDoc(ref, { 
        livrata: true,
        dataLivrare: new Date(),
        updatedAt: new Date()
      });
      setComenzi(prev => prev.map(c => 
        c.id === id ? { ...c, livrata: true, dataLivrare: new Date() } : c
      ));
    } catch (error) {
      console.error("Eroare la marcarea ca livrată:", error);
    }
  };

  useEffect(() => {
    fetchComenzi();
  }, []);

  // Filtrare comenzi
  const filteredOrders = comenzi.filter(comanda => {
    const matchesFilter = filter === "all" || 
      (filter === "new" && !comanda.procesata) ||
      (filter === "processed" && comanda.procesata && !comanda.livrata) ||
      (filter === "delivered" && comanda.livrata);
    
    const matchesSearch = searchTerm === "" ||
      comanda.nume?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comanda.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Statistici reale
  const newOrders = comenzi.filter(c => !c.procesata).length;
  const totalValue = Math.round(comenzi.reduce((sum, c) => sum + (c.total || 0), 0) * 100) / 100;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă comenzile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Filtre și căutare - FĂRĂ duplicate header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Căutare */}
          <div className="relative flex-1 max-w-lg">
            <input
              type="text"
              placeholder="Caută după nume sau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filtre simple */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-3 rounded-lg transition-colors font-medium ${
                filter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Toate ({comenzi.length})
            </button>
            <button
              onClick={() => setFilter("new")}
              className={`px-4 py-3 rounded-lg transition-colors font-medium ${
                filter === "new"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Noi ({newOrders})
            </button>
            <button
              onClick={() => setFilter("processed")}
              className={`px-4 py-3 rounded-lg transition-colors font-medium ${
                filter === "processed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Procesate
            </button>
            <button
              onClick={() => setFilter("delivered")}
              className={`px-4 py-3 rounded-lg transition-colors font-medium ${
                filter === "delivered"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Livrate
            </button>
          </div>

          {/* Statistici + Actualizează */}
          <div className="flex items-center gap-4">
            {totalValue > 0 && (
              <div className="text-center px-4 py-2 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-700">{totalValue} lei</div>
                <div className="text-xs text-green-600">Total comenzi</div>
              </div>
            )}
            <button
              onClick={fetchComenzi}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizează
            </button>
          </div>
        </div>
      </div>

      {/* Lista comenzilor */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {comenzi.length === 0 ? "Nu ai comenzi încă" : "Nu există comenzi pentru filtrul selectat"}
          </h3>
          <p className="text-gray-500">
            {comenzi.length === 0 
              ? "Când clienții vor comanda produse, vor apărea aici." 
              : "Încearcă să schimbi filtrul sau să cauți altceva."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((comanda, index) => (
            <div key={comanda.id || index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
              
              {/* Header comandă */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {comanda.nume}
                  </h3>
                  <p className="text-gray-600 text-sm">{comanda.email}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(comanda.data?.seconds * 1000).toLocaleString("ro-RO")}
                  </p>
                </div>

                {/* Status */}
                <div className="text-right">
                  {comanda.livrata ? (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      ✅ Livrată
                    </span>
                  ) : comanda.procesata ? (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      📦 Procesată
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      🔔 Nouă
                    </span>
                  )}
                </div>
              </div>

              {/* Adresa */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-700">📍 Adresă:</span>
                </div>
                <p className="text-gray-800 text-sm">{comanda.adresa}</p>
              </div>

              {/* Produse */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-700">🛍️ Produse:</span>
                </div>
                <div className="space-y-2">
                  {comanda.produse?.map((produs, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900 text-sm">{produs.name}</span>
                        <div className="text-xs text-gray-600 mt-1">
                          {produs.variant && <span className="mr-3">Varianta: {produs.variant}</span>}
                          {produs.size && <span className="mr-3">Mărime: {produs.size}</span>}
                          {produs.engraving && (
                            <div className="text-purple-600 mt-1">
                              ✏️ Gravură: "{produs.engraving}"
                            </div>
                          )}
                          {produs.giftWrap && (
                            <span className="text-pink-600">🎁 Ambalaj cadou</span>
                          )}
                        </div>
                      </div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {parseFloat(produs.price).toFixed(2)} lei
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer cu total și acțiuni */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-lg font-bold text-gray-900">
                  Total: {parseFloat(comanda.total).toFixed(2)} lei
                </div>

                <div className="flex items-center gap-2">
                  {!comanda.procesata && (
                    <button
                      onClick={() => toggleProcesata(comanda.id, comanda.procesata)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      ✅ Procesează
                    </button>
                  )}

                  {comanda.procesata && !comanda.livrata && (
                    <button
                      onClick={() => markAsDelivered(comanda.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      🚚 Livrează
                    </button>
                  )}

                  {comanda.procesata && (
                    <button
                      onClick={() => toggleProcesata(comanda.id, comanda.procesata)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      ↻ Revenire
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;