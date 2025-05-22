import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-md p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-purple-700">Handmade Store</h1>
        <ul className="flex gap-4 text-gray-700 font-medium">
          <li>
            <Link to="/" className="hover:text-purple-500">Home</Link>
          </li>
          <li>
            <Link to="/products" className="hover:text-purple-500">Produse</Link>
          </li>
          <li>
            <Link to="/cart" className="hover:text-purple-500">Coș</Link>
          </li>
          <li>
            <Link to="/register" className="hover:text-purple-500">Înregistrare</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

