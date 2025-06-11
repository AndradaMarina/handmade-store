import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Loading from "./components/Loading";

// Layout
import Header from "./components/Header";
import Footer from "./components/Footer";

// Lazy loading pentru componente mari
const Home = React.lazy(() => import("./pages/Home"));
const Products = React.lazy(() => import("./pages/Products"));
const ProductDetails = React.lazy(() => import("./pages/ProductDetails"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const Thanks = React.lazy(() => import("./pages/Thanks"));

// Autentificare clienți
const LoginClient = React.lazy(() => import("./pages/LoginClient"));
const RegisterClient = React.lazy(() => import("./pages/RegisterClient"));
const Account = React.lazy(() => import("./pages/Account"));

// Autentificare admin
const Login = React.lazy(() => import("./pages/Login"));
const Admin = React.lazy(() => import("./pages/Admin"));
const AdminEditProduct = React.lazy(() => import("./pages/admin/AdminEditProduct"));

// Rute protejate
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";

// Wishlist
const Wishlist = React.lazy(() => import("./pages/Wishlist"));

const App = () => {
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Antetul aplicației */}
        <Header />

        {/* Conținutul paginii cu Suspense pentru lazy loading */}
        <main className="flex-grow max-w-6xl mx-auto px-4 pb-12 w-full">
          <Suspense fallback={<Loading size="lg" text="Se încarcă pagina..." className="min-h-[400px]" />}>
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
                  <ErrorBoundary>
                    <PrivateRoute>
                      <Account />
                    </PrivateRoute>
                  </ErrorBoundary>
                }
              />

              {/* Autentificare & dashboard admin */}
              <Route path="/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <ErrorBoundary>
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/admin/editeaza/:id" 
                element={
                  <ErrorBoundary>
                    <AdminRoute>
                      <AdminEditProduct />
                    </AdminRoute>
                  </ErrorBoundary>
                }
              />

              {/* Pagină fallback îmbunătățită */}
              <Route 
                path="*" 
                element={
                  <div className="text-center py-20">
                    <div className="max-w-md mx-auto">
                      <svg 
                        className="w-24 h-24 text-gray-300 mx-auto mb-6" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1} 
                          d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                        />
                      </svg>
                      <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        404 - Pagina nu a fost găsită
                      </h1>
                      <p className="text-gray-600 mb-6">
                        Ne pare rău, pagina pe care o căutați nu există sau a fost mutată.
                      </p>
                      <div className="space-x-4">
                        <button
                          onClick={() => window.history.back()}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors"
                        >
                          ← Înapoi
                        </button>
                        <a
                          href="/"
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors inline-block"
                        >
                          🏠 Acasă
                        </a>
                      </div>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </Suspense>
        </main>

        {/* Subsolul aplicației */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default App;