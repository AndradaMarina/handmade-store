import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";

const DeliveryTab = () => {
  const [comenzi, setComenzi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ready");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLivrari = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "comenzi"), orderBy("data", "desc"));
      const snap = await getDocs(q);
      const lista = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        livrata: doc.data().livrata || false,
        procesata: doc.data().procesata || false
      }));
      setComenzi(lista);
    } catch (error) {
      console.error("Eroare la încărcarea livrărilor:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLivrata = async (id, current) => {
    try {
      const ref = doc(db, "comenzi", id);
      await updateDoc(ref, { 
        livrata: !current,
        dataLivrare: !current ? new Date() : null,
        updatedAt: new Date()
      });
      setComenzi(prev => prev.map(c => 
        c.id === id ? { 
          ...c, 
          livrata: !current, 
          dataLivrare: !current ? new Date() : null 
        } : c
      ));
    } catch (error) {
      console.error("Eroare la actualizarea livrării:", error);
    }
  };

  const markAllAsDelivered = async () => {
    const readyOrders = comenzi.filter(c => c.procesata && !c.livrata);
    if (readyOrders.length === 0) return;
    
    if (!window.confirm(`Marchezi toate ${readyOrders.length} comenzile ca livrate?`)) return;
    
    try {
      const updates = readyOrders.map(async (comanda) => {
        const ref = doc(db, "comenzi", comanda.id);
        await updateDoc(ref, { 
          livrata: true,
          dataLivrare: new Date(),
          updatedAt: new Date()
        });
      });
      
      await Promise.all(updates);
      fetchLivrari();
    } catch (error) {
      console.error("Eroare la actualizarea în bloc:", error);
    }
  };

  useEffect(() => {
    fetchLivrari();
  }, []);

  // Filtrare comenzi
  const filteredOrders = comenzi.filter(comanda => {
    const matchesFilter = filter === "all" || 
      (filter === "ready" && comanda.procesata && !comanda.livrata) ||
      (filter === "delivered" && comanda.livrata);
    
    const matchesSearch = searchTerm === "" ||
      comanda.nume?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comanda.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comanda.adresa?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Statistici reale
  const readyForDelivery = comenzi.filter(c => c.procesata && !c.livrata).length;
  const delivered = comenzi.filter(c => c.livrata).length;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă livrările...</p>
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
              placeholder="Caută după nume, email sau adresă..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filtre simple */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("ready")}
              className={`px-4 py-3 rounded-lg transition-colors font-medium ${
                filter === "ready"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🚚 Gata livrare ({readyForDelivery})
            </button>
            <button
              onClick={() => setFilter("delivered")}
              className={`px-4 py-3 rounded-lg transition-colors font-medium ${
                filter === "delivered"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ✅ Livrate ({delivered})
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-3 rounded-lg transition-colors font-medium ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Toate
            </button>
          </div>

          {/* Acțiuni */}
          <div className="flex items-center gap-2">
            {readyForDelivery > 0 && (
              <button
                onClick={markAllAsDelivered}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                ✅ Livrează tot ({readyForDelivery})
              </button>
            )}
            <button
              onClick={fetchLivrari}
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

      {/* Alertă pentru comenzi gata */}
      {readyForDelivery > 0 && filter === "ready" && (
        <div className="mb-6 bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
          <div className="flex items-center">
            <div className="text-2xl mr-3">📦</div>
            <div>
              <h3 className="text-lg font-medium text-orange-900">
                {readyForDelivery} comenzi gata de livrare
              </h3>
              <p className="text-orange-700 text-sm">
                Aceste comenzi au fost procesate și pot fi expediate.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista comenzilor */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🚚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === "ready" && readyForDelivery === 0 
              ? "Nu ai comenzi gata de livrare" 
              : filter === "delivered" && delivered === 0
                ? "Nu ai comenzi livrate încă"
                : "Nu există livrări pentru filtrul selectat"
            }
          </h3>
          <p className="text-gray-500">
            {filter === "ready" 
              ? "Când procesezi comenzi, vor apărea aici pentru livrare." 
              : filter === "delivered"
                ? "Când livrezi comenzi, vor apărea aici."
                : "Încearcă să schimbi filtrul sau să cauți altceva."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((comanda) => (
            <div key={comanda.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
              
              {/* Header comandă */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {comanda.nume}
                  </h3>
                  <p className="text-gray-600 text-sm">{comanda.email}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Comandă: {new Date(comanda.data?.seconds * 1000).toLocaleString("ro-RO")}
                  </p>
                  {comanda.livrata && comanda.dataLivrare && (
                    <p className="text-green-600 text-xs mt-1">
                      Livrată: {new Date(comanda.dataLivrare.seconds * 1000 || comanda.dataLivrare).toLocaleString("ro-RO")}
                    </p>
                  )}
                </div>

                {/* Status vizual */}
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg mb-1 ${
                    comanda.livrata 
                      ? "bg-green-100 text-green-600" 
                      : comanda.procesata 
                        ? "bg-orange-100 text-orange-600"
                        : "bg-gray-100 text-gray-600"
                  }`}>
                    {comanda.livrata ? "✅" : comanda.procesata ? "📦" : "⏳"}
                  </div>
                  <span className={`text-xs font-medium ${
                    comanda.livrata ? "text-green-700" : 
                    comanda.procesata ? "text-orange-700" : "text-gray-700"
                  }`}>
                    {comanda.livrata ? "Livrată" : comanda.procesata ? "Gata" : "Așteaptă"}
                  </span>
                </div>
              </div>

              {/* Adresa */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900 text-sm">📍 Adresă de livrare:</h4>
                    <p className="text-blue-800 text-sm mt-1">{comanda.adresa}</p>
                  </div>
                  <button
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(comanda.adresa)}`, '_blank')}
                    className="text-blue-600 hover:text-blue-800 text-xs underline ml-3"
                  >
                    Vezi pe hartă
                  </button>
                </div>
              </div>

              {/* Produse simplu */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-700">🛍️ Produse:</span>
                </div>
                <div className="space-y-1">
                  {comanda.produse?.map((produs, i) => (
                    <div key={i} className="flex items-center justify-between py-1 px-3 bg-gray-50 rounded text-sm">
                      <div>
                        <span className="font-medium">{produs.name}</span>
                        {(produs.variant || produs.size) && (
                          <span className="text-gray-600 ml-2">
                            ({produs.variant}{produs.size ? `, ${produs.size}` : ""})
                          </span>
                        )}
                      </div>
                      <span className="font-semibold">{parseFloat(produs.price).toFixed(2)} lei</span>
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
                  {comanda.procesata && !comanda.livrata && (
                    <button
                      onClick={() => toggleLivrata(comanda.id, comanda.livrata)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      ✅ Marchează livrată
                    </button>
                  )}

                  {comanda.livrata && (
                    <button
                      onClick={() => toggleLivrata(comanda.id, comanda.livrata)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      ↻ Anulează livrarea
                    </button>
                  )}

                  {!comanda.procesata && (
                    <span className="text-gray-500 italic text-sm">Necesită procesare mai întâi</span>
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

export default DeliveryTab;