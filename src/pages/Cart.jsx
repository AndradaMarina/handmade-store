import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cart, removeFromCart } = useCart();

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">Coșul tău</h1>

      {cart.length === 0 ? (
        <p className="text-gray-600">Coșul este gol.</p>
      ) : (
        <>
         {cart.map((item, index) => (
  <div key={index} className="border-b pb-4 mb-4">
    <h2 className="text-lg font-semibold">{item.name}</h2>

    {/* Afișează doar dacă există parfum */}
    {item.parfum && <p>Parfum: {item.parfum}</p>}

    {/* Afișează doar dacă există gravură */}
    {item.engraving && <p>Gravură: {item.engraving}</p>}

    {/* Afișează doar dacă e bifat ambalaj */}
    {item.giftWrap && <p>Ambalaj cadou: Da</p>}

    <p className="text-purple-700 font-bold">{item.price} lei</p>

    <button
      onClick={() => removeFromCart(index)}
      className="text-red-500 mt-2 hover:underline text-sm"
    >
      Șterge
    </button>
  </div>
))}


          <hr className="my-4" />
          <p className="text-right font-bold text-lg">Total: {total} lei</p>
        </>
      )}
    </div>
  );
};

export default Cart;
