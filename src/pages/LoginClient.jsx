import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase/config";

const LoginClient = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const errorMessages = {
    "auth/invalid-email": "Emailul introdus nu este valid.",
    "auth/user-not-found": "Nu există niciun cont cu acest email.",
    "auth/wrong-password": "Parola introdusă este greșită.",
    "auth/missing-password": "Introduceți parola.",
    "auth/email-already-in-use": "Acest email este deja folosit.",
    "auth/weak-password": "Parola trebuie să aibă cel puțin 6 caractere.",
    "auth/invalid-credential": "Emailul sau parola nu sunt corecte.",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate("/contul-meu");
    } catch (err) {
      const msg = errorMessages[err.code] || "A apărut o eroare. Încearcă din nou.";
      setError(msg);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">
        {isLogin ? "Autentificare" : "Înregistrare"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          type="password"
          placeholder="Parolă"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 cursor-pointer transition"
        >
          {isLogin ? "Intră în cont" : "Creează cont"}
        </button>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </form>

      <p className="mt-6 text-sm text-center text-gray-600">
        {isLogin ? "Nu ai cont?" : "Ai deja cont?"}{" "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-purple-600 hover:underline cursor-pointer font-medium"
        >
          {isLogin ? "Înregistrează-te aici" : "Autentifică-te aici"}
        </button>
      </p>
    </div>
  );
};

export default LoginClient;
