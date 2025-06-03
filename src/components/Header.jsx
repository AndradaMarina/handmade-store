import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { useEffect, useState } from "react";

const Header = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = () => {
    signOut(auth);
    navigate("/");
  };

  return (
    <header className="bg-white shadow-md py-4 mb-6">
      <nav className="max-w-6xl mx-auto px-4 flex flex-wrap justify-between items-center">
        <h1 className="text-xl font-bold text-purple-700">Handmade Store</h1>

        <div className="flex gap-6 mt-2 sm:mt-0 text-sm sm:text-base items-center">
          <Link to="/" className="hover:text-purple-600">Home</Link>
          <Link to="/products" className="hover:text-purple-600">Produse</Link>
          <Link to="/cart" className="hover:text-purple-600">Coș</Link>

          {!user && (
            <Link to="/login-client" className="hover:text-purple-600">
              Login
            </Link>
          )}

          {user && (
            <>
              <Link to="/contul-meu" className="hover:text-purple-600">
                Contul meu
              </Link>
              <button
                onClick={handleLogout}
                className="text-purple-600 hover:text-purple-800 transition underline cursor-pointer"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;




