import { Link } from "react-router-dom";
import { useState } from "react";
import { db } from "../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setConfirm("Te rugăm să introduci un email valid.");
      return;
    }

    try {
      await addDoc(collection(db, "newsletter"), { email });
      setConfirm("Mulțumim pentru abonare!");
      setEmail("");
    } catch (error) {
      console.error("Eroare la salvare:", error);
      setConfirm("A apărut o eroare. Încearcă din nou.");
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-10 mt-16 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Descriere Brand */}
        <div>
          <h2 className="text-xl font-bold mb-3">HandmadeStore</h2>
          <p className="text-sm text-gray-400 leading-snug">
            Cadouri personalizate create cu suflet – brățări, lumânări, accesorii și decor.
          </p>
        </div>

        {/* Navigare */}
        <div>
          <h3 className="font-semibold mb-2">Navigare</h3>
          <ul className="space-y-1 text-sm text-gray-300">
            <li><Link to="/" className="hover:text-white transition">Acasă</Link></li>
            <li><Link to="/products" className="hover:text-white transition">Produse</Link></li>
            <li><Link to="/cart" className="hover:text-white transition">Coș</Link></li>
            <li><Link to="/checkout" className="hover:text-white transition">Finalizare</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold mb-2">Contact</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li><a href="mailto:contact@handmadestore.ro" className="hover:underline">contact@handmadestore.ro</a></li>
            <li>Telefon: 0723 456 789</li>
          </ul>
        </div>

        {/* Social media */}
        <div>
          <h3 className="font-semibold mb-2">Social Media</h3>
          <div className="flex space-x-4 text-lg text-purple-400">
            <a href="#" aria-label="Instagram"><FaInstagram className="hover:text-white transition" /></a>
            <a href="#" aria-label="Facebook"><FaFacebook className="hover:text-white transition" /></a>
            <a href="#" aria-label="Tiktok"><FaTiktok className="hover:text-white transition" /></a>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-semibold mb-2">Abonează-te</h3>
          <p className="text-sm text-gray-400 mb-2">
            Noutăți despre produse și oferte:
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
            <input
              type="email"
              placeholder="Emailul tău"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 rounded bg-white text-black text-sm"
              required
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 transition text-sm px-4 py-2 rounded text-white"
            >
              Abonează-te
            </button>
            {confirm && <p className="text-xs text-green-300">{confirm}</p>}
          </form>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-6 border-t border-gray-800 pt-4">
        © {new Date().getFullYear()} HandmadeStore. Toate drepturile rezervate.
      </div>
    </footer>
  );
};

export default Footer;
