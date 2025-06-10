import { useState } from "react";
import AccountOverview from "../components/AccountOverview";
import MyDetails from "../components/MyDetails";
import LoginDetails from "../components/LoginDetails";
import MyOrders from "../components/MyOrders";
import AddressBook from "../components/AddressBook";
import PaymentAndBilling from "../components/PaymentAndBilling";

const Account = () => {
  const [selectedSection, setSelectedSection] = useState("overview");

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

  return (
    <div className="flex flex-col md:flex-row max-w-6xl mx-auto p-4 gap-6">
      <aside className="w-full md:w-64 bg-white rounded shadow p-4 space-y-2 border">
        {[
          { key: "overview", label: "Prezentare generală" },
          { key: "details", label: "Datele mele" },
          { key: "login", label: "Date de autentificare" },
          { key: "orders", label: "Comenzile mele" },
          { key: "address", label: "Agenda de adrese" },
          { key: "payment", label: "Plata & facturare" },
        ].map((section) => (
          <button
            key={section.key}
            onClick={() => setSelectedSection(section.key)}
            className={`block w-full text-left px-4 py-2 rounded hover:bg-purple-100 ${
              selectedSection === section.key ? "bg-purple-200" : ""
            }`}
          >
            {section.label}
          </button>
        ))}
      </aside>

      <section className="flex-1 bg-white rounded shadow p-6 border">
        {renderSection()}
      </section>
    </div>
  );
};

export default Account;
