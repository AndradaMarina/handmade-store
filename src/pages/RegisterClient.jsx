import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { useNavigate } from "react-router-dom";

const RegisterClient = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, "utilizatori", res.user.uid), {
        email: form.email,
        nume: form.fullName,
        telefon: form.phone,
        adresa: form.address,
        data: new Date(),
      });
      navigate("/contul-meu");
    } catch (err) {
      setError("A apărut o eroare la crearea contului.");
    }
  };

  return (
    <form onSubmit={handleRegister} className="max-w-lg mx-auto p-6 mt-10 bg-white rounded shadow space-y-4">
      <h2 className="text-2xl font-bold text-purple-700">Creează un cont nou</h2>
      <input name="fullName" placeholder="Nume complet" onChange={handleChange} value={form.fullName} className="w-full p-2 border rounded" required />
      <input name="phone" placeholder="Telefon" onChange={handleChange} value={form.phone} className="w-full p-2 border rounded" required />
      <input name="address" placeholder="Adresă livrare" onChange={handleChange} value={form.address} className="w-full p-2 border rounded" required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} value={form.email} className="w-full p-2 border rounded" required />
      <input type="password" name="password" placeholder="Parolă" onChange={handleChange} value={form.password} className="w-full p-2 border rounded" required />
      <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
        Creează cont
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
};

export default RegisterClient;
