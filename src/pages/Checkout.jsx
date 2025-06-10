import { useForm } from "react-hook-form";
import { useCart } from "../context/CartContext";
import { db } from "../firebase/config";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useEffect } from "react";

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const navigate = useNavigate();
  const auth = getAuth();

  // 🔒 Redirecționează dacă nu e logat
  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login-client");
    }
  }, [auth, navigate]);

  // 📥 Preia automat datele din "utilizatori"
  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;

      try {
        const docRef = doc(db, "utilizatori", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          reset({
            nume: `${data.firstName || ""} ${data.lastName || ""}`,
            email: data.email || auth.currentUser.email || "",
            adresa: data.address || "",
          });
        } else {
          reset({
            email: auth.currentUser.email || "",
          });
        }
      } catch (error) {
        console.error("Eroare la preluarea datelor:", error.message);
      }
    };

    fetchUserData();
  }, [auth.currentUser, reset]);

  // 📨 Trimite comanda în Firestore
  const onSubmit = async (data) => {
    try {
      await addDoc(collection(db, "comenzi"), {
        ...data,
        produse: cart,
        total: cart.reduce((acc, p) => acc + p.price, 0),
        data: Timestamp.now(),
        uid: auth.currentUser?.uid || null,
        procesata: false,
      });

      reset();
      clearCart();
      navigate("/thanks", { state: { nume: data.nume } });
    } catch (err) {
      alert("Eroare la trimiterea comenzii.");
      console.error(err);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Finalizare comandă</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block">Nume complet</label>
          <input
            className="border w-full p-2 rounded"
            {...register("nume", { required: "Numele este obligatoriu" })}
          />
          {errors.nume && <p className="text-red-500 text-sm">{errors.nume.message}</p>}
        </div>

        <div>
          <label className="block">Email</label>
          <input
            className="border w-full p-2 rounded"
            {...register("email", { required: "Emailul este obligatoriu" })}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block">Adresă de livrare</label>
          <input
            className="border w-full p-2 rounded"
            {...register("adresa", { required: "Adresa este obligatorie" })}
          />
          {errors.adresa && <p className="text-red-500 text-sm">{errors.adresa.message}</p>}
        </div>

        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 cursor-pointer"
        >
          Trimite comanda
        </button>
      </form>
    </div>
  );
};

export default Checkout;
