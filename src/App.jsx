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

// Autentificare (admin & clienți)
import LoginClient from "./pages/LoginClient";
import Account from "./pages/Account";
import Login from "./pages/Login";

// Admin
import Admin from "./pages/Admin";

const App = () => {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 pb-12">
        <Routes>
          {/* Pagini publice */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/thanks" element={<Thanks />} />

          {/* Autentificare clienți */}
          <Route path="/login-client" element={<LoginClient />} />
          <Route path="/contul-meu" element={<Account />} />

          {/* Admin */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default App;
