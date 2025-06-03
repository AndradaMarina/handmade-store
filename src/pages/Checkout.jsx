import { useForm } from "react-hook-form";
import { useCart } from "../context/CartContext";
import { db } from "../firebase/config";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const navigate = useNavigate();

  const total = cart.reduce((acc, p) => acc + p.price, 0);

  const onSubmit = async (data) => {
    try {
      await addDoc(collection(db, "comenzi"), {
        ...data,
        produse: cart,
        total,
        status: "nou",
        data: Timestamp.now(),
      });

      reset();
      clearCart();
      navigate("/thanks", { state: { nume: data.nume } });
    } catch (err) {
      alert("Eroare la trimiterea comenzii.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-purple-700">Finalizare comandă</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
        <div>
          <label className="block font-medium">Nume complet *</label>
          <input
            className="border w-full p-2 rounded"
            {...register("nume", { required: "Numele este obligatoriu" })}
          />
          {errors.nume && <p className="text-red-500 text-sm">{errors.nume.message}</p>}
        </div>

        <div>
          <label className="block font-medium">Email *</label>
          <input
            className="border w-full p-2 rounded"
            {...register("email", { required: "Emailul este obligatoriu" })}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block font-medium">Adresă de livrare *</label>
          <input
            className="border w-full p-2 rounded"
            {...register("adresa", { required: "Adresa este obligatorie" })}
          />
          {errors.adresa && <p className="text-red-500 text-sm">{errors.adresa.message}</p>}
        </div>

        <div>
          <label className="block font-medium">Mesaj opțional</label>
          <textarea
            className="border w-full p-2 rounded"
            {...register("mesaj")}
          />
        </div>

        <button
          type="submit"
          className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
        >
          Trimite comanda
        </button>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-2">Rezumat comandă</h2>
        {cart.map((item, i) => (
          <div key={i} className="mb-2 border-b pb-2 text-sm">
            <p className="font-medium">
              {item.name} – {item.variant} {item.size && `– ${item.size}`}
            </p>
            {item.engraving && <p>Gravură: {item.engraving}</p>}
            {item.giftWrap && <p>Ambalaj cadou: Da</p>}
            <p className="text-purple-700 font-bold">{item.price} lei</p>
          </div>
        ))}
        <p className="text-right font-bold text-lg mt-4">Total: {total} lei</p>
      </div>
    </div>
  );
};

export default Checkout;
