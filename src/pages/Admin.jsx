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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminUID = "9yGDw0kZi6V2MmsPNfpKW5bMaae2";

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

  if (!allowed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă panoul administrator...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      key: "orders",
      label: "Comenzi",
      icon: "📦",
      description: "Gestionează comenzile clienților",
      color: "bg-blue-500"
    },
    {
      key: "products",
      label: "Adaugă Produse",
      icon: "➕",
      description: "Creează produse noi",
      color: "bg-green-500"
    },
    {
      key: "manage",
      label: "Gestionează Produse",
      icon: "✏️",
      description: "Editează produsele existente",
      color: "bg-purple-500"
    },
    {
      key: "delivery",
      label: "Livrări",
      icon: "🚚",
      description: "Urmărește livrările",
      color: "bg-orange-500"
    }
  ];

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

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Eroare la deconectare:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-purple-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-start p-4 rounded-xl transition-all duration-200 group ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span className="text-2xl mr-4 group-hover:scale-110 transition-transform">
                  {tab.icon}
                </span>
                <div className="text-left">
                  <div className="font-semibold">{tab.label}</div>
                  <div className={`text-sm mt-1 ${
                    activeTab === tab.key ? "text-purple-100" : "text-gray-500"
                  }`}>
                    {tab.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <div className="font-semibold text-gray-900">Administrator</div>
              <div className="text-sm text-gray-500">admin@handmade.ro</div>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Deconectare
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar SIMPLU - FĂRĂ statistici false */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="hidden lg:block">
              <h2 className="text-2xl font-bold text-gray-900">
                {tabs.find(tab => tab.key === activeTab)?.label}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {tabs.find(tab => tab.key === activeTab)?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main>
          <div className="min-h-[600px]">
            {renderTab()}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Admin;