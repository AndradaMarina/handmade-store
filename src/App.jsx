import Header from './components/Header';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Register from './pages/Register';
import TestFirebase from './pages/TestFirebase';
import Thanks from "./pages/Thanks";


const App = () => {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 pb-12">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/register" element={<Register />} />
          <Route path="/test" element={<TestFirebase />} />
          <Route path="/thanks" element={<Thanks />} />
        </Routes>
      </main>
    </>
  );
};

export default App;
