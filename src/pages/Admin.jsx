// src/pages/Admin.jsx
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import OrdersTab from "../admin/tabs/OrdersTab";
import ProductsTab from "../admin/tabs/ProductsTab";
import DeliveryTab from "../admin/tabs/DeliveryTab";
import ProductListTab from "../admin/tabs/ProductListTab";

const Admin = () => {
  const auth = getAuth();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");

  const adminUID = "9yGDw0kZi6V2MmsPNfpKW5bMaae2"; // înlocuiește cu UID-ul real

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      navigate("/login");
    } else if (user.uid !== adminUID) {
      navigate("/");
    } else {
      setAllowed(true);
    }
  }, []);

  if (!allowed) return null;

  const renderTab = () => {
    switch (activeTab) {
      case "orders":
        return <OrdersTab />;
      case "products":
        return <ProductsTab />;
      case "delivery":
        return <DeliveryTab />;
      case "manage":
        return <ProductListTab />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 mt-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">Panou Administrator</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === "orders"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          📦 Comenzi
        </button>

        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === "products"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          🍭 Adaugă Produse
        </button>

        <button
          onClick={() => setActiveTab("delivery")}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === "delivery"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          🚚 Livrări
        </button>

        <button
          onClick={() => setActiveTab("manage")}
          className={`px-4 py-2 rounded font-medium transition ${
            activeTab === "manage"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          ✏️ Gestionează Produse
        </button>
      </div>

      <div>{renderTab()}</div>
    </div>
  );
};

export default Admin;
