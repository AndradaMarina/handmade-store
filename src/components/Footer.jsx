import { Link } from "react-router-dom";
import { useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setConfirm("");
    setIsSubmitting(true);

    // Validare email
    if (!email || !email.includes("@") || email.length < 5) {
      setConfirm("Te rugăm să introduci un email valid.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Verifică dacă emailul există deja
      const q = query(collection(db, "newsletter"), where("email", "==", email.toLowerCase().trim()));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        setConfirm("Ești deja abonat la newsletter.");
        setIsSubmitting(false);
        return;
      }

      // Adaugă emailul în baza de date
      await addDoc(collection(db, "newsletter"), { 
        email: email.toLowerCase().trim(),
        dataAbonare: new Date(),
        activ: true
      });
      
      setConfirm("🎉 Mulțumim pentru abonare! Vei primi noutățile noastre pe email.");
      setEmail("");
      
      // Șterge mesajul după 5 secunde
      setTimeout(() => setConfirm(""), 5000);
      
    } catch (error) {
      console.error("Eroare la salvarea în newsletter:", error);
      
      // Mesaje de eroare mai specifice
      if (error.code === 'permission-denied') {
        setConfirm("Nu ai permisiunea să te abonezi. Contactează administratorul.");
      } else if (error.code === 'unavailable') {
        setConfirm("Serviciul este temporar indisponibil. Încearcă din nou mai târziu.");
      } else {
        setConfirm("A apărut o eroare. Te rugăm să încerci din nou.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-10 px-4 mt-auto">
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

        {/* Cont */}
        <div>
          <h3 className="font-semibold mb-2">Cont</h3>
          <ul className="space-y-1 text-sm text-gray-300">
            <li><Link to="/login-client" className="hover:text-white transition">Autentificare</Link></li>
            <li><Link to="/inregistrare" className="hover:text-white transition">Înregistrare</Link></li>
            <li><Link to="/contul-meu" className="hover:text-white transition">Contul meu</Link></li>
            <li><Link to="/wishlist" className="hover:text-white transition">Favorite</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold mb-2">Contact</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>
              <a href="mailto:contact@handmadestore.ro" className="hover:text-white transition">
                contact@handmadestore.ro
              </a>
            </li>
            <li>Telefon: 0723 456 789</li>
          </ul>
          
          {/* Social media */}
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Social Media</h4>
            <div className="flex space-x-4 text-lg text-purple-400">
              <a href="#" aria-label="Instagram" className="hover:text-white transition">
                <FaInstagram />
              </a>
              <a href="#" aria-label="Facebook" className="hover:text-white transition">
                <FaFacebook />
              </a>
              <a href="#" aria-label="Tiktok" className="hover:text-white transition">
                <FaTiktok />
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-semibold mb-2">Newsletter</h3>
          <p className="text-sm text-gray-400 mb-3">
            Abonează-te pentru noutăți despre produse și oferte speciale:
          </p>
          <form onSubmit={handleSubscribe} className="space-y-3">
            <input
              type="email"
              placeholder="Emailul tău"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded bg-white text-black text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition text-sm px-4 py-2 rounded text-white font-medium"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Se abonează...
                </span>
              ) : (
                "Abonează-te"
              )}
            </button>
            
            {/* Mesaj de confirmare/eroare */}
            {confirm && (
              <p className={`text-xs mt-2 ${
                confirm.includes("Mulțumim") || confirm.includes("🎉")
                  ? "text-green-300" 
                  : confirm.includes("deja abonat")
                    ? "text-yellow-300"
                    : "text-red-300"
              }`}>
                {confirm}
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 mt-8 border-t border-gray-800 pt-6">
        <p>© {new Date().getFullYear()} HandmadeStore. Toate drepturile rezervate.</p>
        <p className="mt-2">
          Realizat cu ❤️ pentru pasionații de produse handmade
        </p>
      </div>
    </footer>
  );
};

export default Footer;