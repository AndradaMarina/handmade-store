import React from "react";
import { Routes, Route } from "react-router-dom";

// Layout
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pagini principale
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Thanks from "./pages/Thanks";

// Autentificare clienți
import LoginClient from "./pages/LoginClient";
import RegisterClient from "./pages/RegisterClient";
import Account from "./pages/Account";

// Autentificare admin
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import AdminEditProduct from "./pages/admin/AdminEditProduct"; 

// Rute protejate
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";

// Wishlist
import Wishlist from "./pages/Wishlist";

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Antetul aplicației */}
      <Header />

      {/* Conținutul paginii */}
      <main className="flex-grow max-w-6xl mx-auto px-4 pb-12">
        <Routes>

          {/* Pagini publice */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/thanks" element={<Thanks />} />
          <Route path="/wishlist" element={<Wishlist />} />

          {/* Autentificare clienți */}
          <Route path="/login-client" element={<LoginClient />} />
          <Route path="/inregistrare" element={<RegisterClient />} />
          <Route
            path="/contul-meu"
            element={
              <PrivateRoute>
                <Account />
              </PrivateRoute>
            }
          />

          {/* Autentificare & dashboard admin */}
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/editeaza/:id" 
            element={
              <AdminRoute>
                <AdminEditProduct />
              </AdminRoute>
            }
          />

          {/* Pagină fallback */}
          <Route path="*" element={<div className="text-center py-10">Pagina nu a fost găsită</div>} />
        </Routes>
      </main>

      {/* Subsolul aplicației */}
      <Footer />
    </div>
  );
};

export default App;
