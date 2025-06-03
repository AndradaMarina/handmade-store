import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [eroare, setEroare] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setEroare("");

    const auth = getAuth();

    try {
      await signInWithEmailAndPassword(auth, email, parola);
      navigate("/admin");
    } catch (err) {
      setEroare("Email sau parolă incorectă.");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 border rounded shadow bg-white">
      <h1 className="text-2xl font-bold text-center text-purple-700 mb-6">
        Autentificare Admin
      </h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border p-2 rounded bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Parolă</label>
          <input
            type="password"
            value={parola}
            onChange={(e) => setParola(e.target.value)}
            required
            className="w-full border p-2 rounded bg-white text-black"
          />
        </div>

        {eroare && (
          <p className="text-red-600 text-sm">{eroare}</p>
        )}

        <button
          type="submit"
          className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition cursor-pointer"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
