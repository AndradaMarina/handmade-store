import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-white shadow-md py-4 mb-6">
      <nav className="max-w-6xl mx-auto px-4 flex flex-wrap justify-between items-center">
        <h1 className="text-xl font-bold text-purple-700">Handmade Store</h1>
        <div className="flex gap-6 mt-2 sm:mt-0 text-sm sm:text-base">
          <Link to="/" className="hover:text-purple-600">Home</Link>
          <Link to="/products" className="hover:text-purple-600">Produse</Link>
          <Link to="/cart" className="hover:text-purple-600">Coș</Link>
          <Link to="/register" className="hover:text-purple-600">Înregistrare</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;


