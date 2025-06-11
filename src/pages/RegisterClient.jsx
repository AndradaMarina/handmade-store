import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
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
    watch,
  } = useForm();

  const navigate = useNavigate();
  const [firebaseError, setFirebaseError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Watch pentru confirmarea parolei
  const watchedPassword = watch("password");

  const onSubmit = async (data) => {
    setFirebaseError("");
    setIsSubmitting(true);
    
    try {
      // Creează contul în Firebase Auth
      const res = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Actualizează profilul cu numele complet
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      await updateProfile(res.user, {
        displayName: fullName
      });

      // Salvează datele în Firestore - STRUCTURĂ CONSISTENTĂ
      await setDoc(doc(db, "utilizatori", res.user.uid), {
        // Format consistent pentru checkout
        prenume: data.firstName,
        nume: data.lastName,
        email: data.email,
        telefon: data.telephone,
        dataNasterii: `${data.day}-${data.month}-${data.year}`,
        
        // Backup format pentru compatibilitate
        firstName: data.firstName,
        lastName: data.lastName,
        telephone: data.telephone,
        
        // Metadata
        createdAt: new Date(),
        updatedAt: new Date(),
        uid: res.user.uid
      });

      // Dacă a introdus o adresă, salvează-o și în colecția "adrese"
      if (data.address && data.address.trim()) {
        await setDoc(doc(db, "adrese", res.user.uid), {
          prenume: data.firstName,
          nume: data.lastName,
          telefon: data.telephone,
          adresa: data.address.trim(),
          uid: res.user.uid,
          createdAt: new Date()
        });
      }

      // Redirect către contul utilizatorului
      navigate("/contul-meu");
      
    } catch (error) {
      console.error("Eroare la înregistrare:", error);
      
      // Mesaje de eroare mai specifice
      switch (error.code) {
        case 'auth/email-already-in-use':
          setFirebaseError("Acest email este deja înregistrat. Încearcă să te loghezi.");
          break;
        case 'auth/weak-password':
          setFirebaseError("Parola este prea slabă. Alege o parolă mai puternică.");
          break;
        case 'auth/invalid-email':
          setFirebaseError("Formatul emailului nu este valid.");
          break;
        default:
          setFirebaseError("Înregistrarea a eșuat. Încearcă din nou.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white rounded-xl shadow-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Creează-ți contul</h2>
        <p className="text-gray-600 mt-2">Înregistrare rapidă și sigură pentru o experiență personalizată</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Nume și prenume */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prenume *
            </label>
            <input
              {...register("firstName", { 
                required: "Prenumele este obligatoriu",
                minLength: { value: 2, message: "Prenumele trebuie să aibă cel puțin 2 caractere" }
              })}
              className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="ex: Maria"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nume *
            </label>
            <input
              {...register("lastName", { 
                required: "Numele este obligatoriu",
                minLength: { value: 2, message: "Numele trebuie să aibă cel puțin 2 caractere" }
              })}
              className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="ex: Ionescu"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adresa de email *
          </label>
          <input
            type="email"
            {...register("email", { 
              required: "Emailul este obligatoriu",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Format email invalid"
              }
            })}
            className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="ex: maria.ionescu@email.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Parolă */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parolă *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", { 
                required: "Parola este obligatorie",
                minLength: { value: 6, message: "Parola trebuie să aibă cel puțin 6 caractere" },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[0-9])/,
                  message: "Parola trebuie să conțină cel puțin o literă și o cifră"
                }
              })}
              className={`w-full border rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Minim 6 caractere"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Parola trebuie să conțină cel puțin 6 caractere, cu litere și cifre.
          </p>
        </div>

        {/* Confirmă parola */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmă parola *
          </label>
          <input
            type="password"
            {...register("confirmPassword", { 
              required: "Confirmarea parolei este obligatorie",
              validate: value => value === watchedPassword || "Parolele nu coincid"
            })}
            className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Repetă parola"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Data nașterii */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data nașterii *
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <select
                {...register("day", { required: "Ziua este obligatorie" })}
                className={`w-full border rounded-lg px-3 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.day ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Ziua</option>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                {...register("month", { required: "Luna este obligatorie" })}
                className={`w-full border rounded-lg px-3 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.month ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Luna</option>
                {[
                  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
                  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"
                ].map((month, i) => (
                  <option key={i + 1} value={i + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                {...register("year", { required: "Anul este obligatoriu" })}
                className={`w-full border rounded-lg px-3 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.year ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Anul</option>
                {Array.from({ length: 100 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          {(errors.day || errors.month || errors.year) && (
            <p className="text-red-500 text-sm mt-1">Toate câmpurile pentru data nașterii sunt obligatorii</p>
          )}
        </div>

        {/* Telefon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Număr de telefon *
          </label>
          <input
            type="tel"
            {...register("telephone", { 
              required: "Numărul de telefon este obligatoriu",
              pattern: {
                value: /^(\+4|4|0)[0-9]{8,9}$/,
                message: "Numărul de telefon nu este valid (ex: 0722123456)"
              }
            })}
            className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.telephone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="ex: 0722 123 456"
          />
          {errors.telephone && (
            <p className="text-red-500 text-sm mt-1">{errors.telephone.message}</p>
          )}
        </div>

        {/* Adresă (opțional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adresă (opțional)
          </label>
          <textarea
            {...register("address")}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Strada, numărul, orașul, județul, codul poștal (poți completa mai târziu)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Adresa poate fi completată mai târziu din contul tău.
          </p>
        </div>

        {/* Termeni și condiții */}
        <div>
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("acceptTerms", { 
                required: "Trebuie să accepți termenii și condițiile" 
              })}
              className="w-5 h-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mt-0.5"
            />
            <span className="text-sm text-gray-700">
              Accept{" "}
              <a href="#" className="text-purple-600 hover:text-purple-800 underline">
                termenii și condițiile
              </a>{" "}
              și{" "}
              <a href="#" className="text-purple-600 hover:text-purple-800 underline">
                politica de confidențialitate
              </a>
              .
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-red-500 text-sm mt-1">{errors.acceptTerms.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg text-center transition-colors font-medium text-lg"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Se creează contul...
            </span>
          ) : (
            "Creează contul"
          )}
        </button>

        {/* Eroare Firebase */}
        {firebaseError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{firebaseError}</p>
          </div>
        )}

        {/* Link login */}
        <div className="text-center pt-4">
          <p className="text-gray-600">
            Ai deja cont?{" "}
            <button
              type="button"
              onClick={() => navigate("/login-client")}
              className="text-purple-600 hover:text-purple-800 font-medium underline"
            >
              Loghează-te aici
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterClient;