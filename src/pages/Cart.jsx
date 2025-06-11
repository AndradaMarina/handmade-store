import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

const Cart = () => {
  const { 
    cart, 
    removeFromCart, 
    removeItemCompletely, 
    updateQuantity, 
    clearCart, 
    getCartTotal 
  } = useCart();

  const total = getCartTotal();

  const handleQuantityChange = (item, newQuantity) => {
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 0) return;
    
    updateQuantity(item.id, item.variant, item.size, item.engraving, quantity);
  };

  const getUniqueKey = (item, index) => {
    return `${item.id}-${item.variant || ''}-${item.size || ''}-${item.engraving || ''}-${index}`;
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-6 text-purple-700">🛒 Coșul tău</h1>
        <div className="bg-gray-50 rounded-lg p-8">
          <p className="text-gray-600 mb-4">Coșul tău este gol.</p>
          <Link 
            to="/products" 
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition-colors"
          >
            Continuă cumpărăturile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-purple-700">🛒 Coșul tău</h1>

      <div className="space-y-4">
        {cart.map((item, index) => (
          <div
            key={getUniqueKey(item, index)}
            className="flex gap-4 items-center border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                loading="lazy"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-purple-800 truncate">
                {item.name}
              </h2>
              {item.variant && (
                <p className="text-sm text-gray-600">Variant: {item.variant}</p>
              )}
              {item.size && (
                <p className="text-sm text-gray-600">Mărime: {item.size}</p>
              )}
              {item.engraving && (
                <p className="text-sm text-gray-600">Gravură: "{item.engraving}"</p>
              )}
              <p className="font-medium mt-1 text-purple-700">
                {item.price} lei {item.quantity > 1 && `× ${item.quantity}`}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeFromCart(item.id, item.variant, item.size, item.engraving)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                  aria-label="Scade cantitatea"
                >
                  −
                </button>
                
                <input
                  type="number"
                  min="1"
                  value={item.quantity || 1}
                  onChange={(e) => handleQuantityChange(item, e.target.value)}
                  className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:border-purple-500"
                />
                
                <button
                  onClick={() => updateQuantity(
                    item.id, 
                    item.variant, 
                    item.size, 
                    item.engraving, 
                    (item.quantity || 1) + 1
                  )}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                  aria-label="Crește cantitatea"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItemCompletely(item.id, item.variant, item.size, item.engraving)}
                className="text-red-600 text-sm hover:text-red-800 hover:underline transition-colors px-2"
                aria-label="Elimină produsul din coș"
              >
                🗑️ Șterge
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-6">
        <div className="flex justify-between items-center mb-6">
          <p className="text-xl font-bold text-purple-800">
            Total: {total.toFixed(2)} lei
          </p>
          <button
            onClick={clearCart}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Golește coșul
          </button>
        </div>

        <div className="flex gap-4 justify-end">
          <Link
            to="/products"
            className="px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
          >
            Continuă cumpărăturile
          </Link>
          <Link
            to="/checkout"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Continuă către plată
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;