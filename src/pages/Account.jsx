// src/pages/Account.jsx
import { useState } from "react";
import AccountOverview from "../components/AccountOverview";
import MyDetails from "../components/MyDetails";
import LoginDetails from "../components/LoginDetails";
import MyOrders from "../components/MyOrders";
import AddressBook from "../components/AddressBook";
import PaymentAndBilling from "../components/PaymentAndBilling";

const Account = () => {
  const [selectedSection, setSelectedSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sections = [
    {
      key: "overview",
      label: "Prezentare generală",
      icon: "📊",
      description: "Vedere de ansamblu asupra contului"
    },
    {
      key: "details",
      label: "Datele mele",
      icon: "👤",
      description: "Informații personale"
    },
    {
      key: "login",
      label: "Date de autentificare",
      icon: "🔐",
      description: "Parolă și securitate"
    },
    {
      key: "orders",
      label: "Comenzile mele",
      icon: "📦",
      description: "Istoricul comenzilor"
    },
    {
      key: "address",
      label: "Agenda de adrese",
      icon: "📍",
      description: "Adrese de livrare"
    },
    {
      key: "payment",
      label: "Plata & facturare",
      icon: "💳",
      description: "Metode de plată"
    }
  ];

  const renderSection = () => {
    switch (selectedSection) {
      case "overview":
        return <AccountOverview />;
      case "details":
        return <MyDetails />;
      case "login":
        return <LoginDetails />;
      case "orders":
        return <MyOrders />;
      case "address":
        return <AddressBook />;
      case "payment":
        return <PaymentAndBilling />;
      default:
        return <AccountOverview />;
    }
  };

  const currentSection = sections.find(section => section.key === selectedSection);

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

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className={`lg:w-80 bg-white rounded-xl shadow-sm border border-gray-200 h-fit ${
            sidebarOpen ? 'block' : 'hidden lg:block'
          }`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Contul meu</h2>
                  <p className="text-gray-600 text-sm mt-1">Gestionează-ți setările</p>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-1 rounded hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-4">
              <div className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.key}
                    onClick={() => {
                      setSelectedSection(section.key);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-start p-4 rounded-lg transition-all duration-200 group ${
                      selectedSection === section.key
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
                        : "hover:bg-gray-50 text-gray-700 hover:text-purple-600"
                    }`}
                  >
                    <span className="text-xl mr-4 group-hover:scale-110 transition-transform">
                      {section.icon}
                    </span>
                    <div className="text-left">
                      <div className="font-medium">{section.label}</div>
                      <div className={`text-sm mt-1 ${
                        selectedSection === section.key 
                          ? "text-purple-100" 
                          : "text-gray-500"
                      }`}>
                        {section.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </nav>

            {/* User info */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  U
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Utilizator</div>
                  <div className="text-sm text-gray-500">Membru din 2024</div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1">
            {/* Page header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl">
                  {currentSection?.icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentSection?.label}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {currentSection?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
              {renderSection()}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Account;