import { useForm } from "react-hook-form";
import { useCart } from "../context/CartContext";
import { db } from "../firebase/config";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const Checkout = () => {
  const { cart, clearCart } = useCart(); 
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const navigate = useNavigate();
  const auth = getAuth();

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
      clearCart(); // golește coșul
      navigate("/thanks");
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
