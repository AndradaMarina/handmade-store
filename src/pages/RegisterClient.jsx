import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const RegisterClient = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [firebaseError, setFirebaseError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    setFirebaseError("");
    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      await setDoc(doc(db, "utilizatori", res.user.uid), {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        dob: `${data.day}-${data.month}-${data.year}`,
        telephone: data.telephone,
        address: data.address || "",
        createdAt: new Date(),
      });

      navigate("/contul-meu");
    } catch (error) {
      setFirebaseError("Înregistrarea a eșuat. Încearcă din nou.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Înregistrare rapidă și sigură</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prenume</label>
          <input
            {...register("firstName", { required: true })}
            className="w-full border border-gray-300 p-3 rounded-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nume</label>
          <input
            {...register("lastName", { required: true })}
            className="w-full border border-gray-300 p-3 rounded-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            {...register("email", { required: true })}
            className="w-full border border-gray-300 p-3 rounded-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parolă</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", { required: true, minLength: 6 })}
              className="w-full border border-gray-300 p-3 rounded-full pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Parola trebuie să conțină între 6 și 12 caractere, inclusiv litere și cifre.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data nașterii</label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="ZZ"
              maxLength={2}
              {...register("day", { required: true })}
              className="border border-gray-300 p-3 rounded-full text-center"
            />
            <input
              type="text"
              placeholder="LL"
              maxLength={2}
              {...register("month", { required: true })}
              className="border border-gray-300 p-3 rounded-full text-center"
            />
            <input
              type="text"
              placeholder="AAAA"
              maxLength={4}
              {...register("year", { required: true })}
              className="border border-gray-300 p-3 rounded-full text-center"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Formatul datei este ZZ LL AAAA.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
          <input
            type="tel"
            {...register("telephone", { required: true })}
            className="w-full border border-gray-300 p-3 rounded-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresa</label>
          <input
            type="text"
            {...register("address")}
            className="w-full border border-gray-300 p-3 rounded-full"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-full text-center transition"
        >
          Creează cont
        </button>

        {firebaseError && <p className="text-red-500 text-sm mt-4">{firebaseError}</p>}
      </form>
    </div>
  );
};

export default RegisterClient;
