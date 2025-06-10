// Cart.jsx
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useCart();

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-2xl font-bold mb-6 text-purple-700">🛒 Coșul tău</h1>

      {cart.length === 0 ? (
        <p className="text-gray-600 text-center">Coșul este gol.</p>
      ) : (
        <div className="space-y-6">
          {cart.map((item, i) => (
            <div
              key={i}
              className="flex gap-4 items-center border p-4 rounded shadow-sm bg-white"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-purple-800">
                  {item.name}
                </h2>
                <p className="text-sm text-gray-600">{item.variant}</p>
                {item.size && <p className="text-sm text-gray-600">Mărime: {item.size}</p>}
                {item.engraving && <p className="text-sm text-gray-600">Gravură: "{item.engraving}"</p>}
                <p className="font-medium mt-1">{item.price} lei</p>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-600 text-sm hover:underline"
              >
                Șterge
              </button>
            </div>
          ))}

          <div className="text-right mt-6">
            <p className="text-lg font-bold mb-2">Total: {total} lei</p>
            <Link
              to="/checkout"
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
            >
              Continuă către plată
            </Link>
            <button
              onClick={clearCart}
              className="ml-4 inline-block text-sm text-gray-500 hover:text-red-600"
            >
              Golește coșul
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
