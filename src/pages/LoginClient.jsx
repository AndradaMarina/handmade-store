import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider, db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { Eye, EyeOff } from "lucide-react";

const LoginClient = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const errorMessages = {
    "auth/invalid-email": "Emailul introdus nu este valid.",
    "auth/user-not-found": "Nu există niciun cont cu acest email.",
    "auth/wrong-password": "Parola introdusă este greșită.",
    "auth/missing-password": "Introduceți parola.",
    "auth/invalid-credential": "Emailul sau parola nu sunt corecte.",
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/contul-meu");
    } catch (err) {
      const msg = errorMessages[err.code] || "A apărut o eroare. Încearcă din nou.";
      setError(msg);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await setDoc(doc(db, "utilizatori", user.uid), {
        email: user.email,
        nume: user.displayName || "",
        data: new Date(),
      });
      navigate("/contul-meu");
    } catch (err) {
      setError("Autentificarea cu Google a eșuat.");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return setError("Introdu adresa de email pentru resetare.");
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Verifică emailul pentru resetarea parolei.");
    } catch {
      setError("Nu s-a putut trimite emailul de resetare.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 mt-10 bg-white rounded shadow grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* LOGIN */}
      <div>
        <h2 className="text-xl font-bold mb-6 text-purple-700">Clienți existenți</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Parolă"
              className="w-full p-2 border rounded pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-purple-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-purple-600 hover:underline cursor-pointer"
            >
              Ai uitat parola?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition cursor-pointer"
          >
            Intră în cont
          </button>
        </form>

        <button
          onClick={handleGoogleLogin}
          className="w-full mt-4 flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-800 hover:border-purple-600 py-2 px-4 rounded-full transition cursor-pointer"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            className="w-5 h-5"
          />
          Continuă cu Google
        </button>

        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>

      {/* ÎNREGISTRARE */}
      <div className="md:pl-4">
        <h2 className="text-xl font-bold mb-4 text-purple-700">Client nou?</h2>
        <p className="text-sm text-gray-700 mb-4">
          Creează un cont pentru a urmări comenzile și a salva produse favorite.
        </p>
        <button
          onClick={() => navigate("/inregistrare")}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition cursor-pointer"
        >
          Înregistrează-te acum
        </button>
      </div>
    </div>
  );
};

export default LoginClient;
