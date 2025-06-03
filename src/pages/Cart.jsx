import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import products from "../data/products";

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
          {cart.map((item, index) => {
            const product = products.find((p) => p.id === item.id);
            const image = product?.images?.[item.variant];
            const mainImage = Array.isArray(image) ? image[0] : image;

            return (
              <div key={index} className="flex gap-4 border-b pb-4 mb-4 items-start">
                {mainImage && (
                  <img
                    src={mainImage}
                    alt={item.name}
                    className="w-24 h-24 object-contain border rounded"
                  />
                )}

                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{item.name}</h2>

                  <p className="text-sm text-gray-700">Culoare: {item.variant}</p>

                  {item.size && (
                    <p className="text-sm text-gray-700">Mărime: {item.size}</p>
                  )}

                  {item.engraving && (
                    <p className="text-sm text-gray-700">Gravură: {item.engraving}</p>
                  )}

                  {item.engravingImage && (
                    <div className="mt-1">
                      <p className="text-sm text-gray-700">Imagine gravată:</p>
                      <img
                        src={URL.createObjectURL(item.engravingImage)}
                        alt="engraving preview"
                        className="w-16 h-16 object-cover mt-1 border rounded"
                      />
                    </div>
                  )}

                  {item.giftWrap && (
                    <p className="text-sm text-green-700 font-medium mt-1">
                      Ambalaj cadou: Da
                    </p>
                  )}

                  <p className="text-purple-700 font-bold mt-2">{item.price} lei</p>

                  <button
                    onClick={() => removeFromCart(index)}
                    className="text-red-500 mt-2 hover:underline text-sm"
                  >
                    Șterge
                  </button>
                </div>
              </div>
            );
          })}

          <hr className="my-4" />
          <p className="text-right font-bold text-lg">Total: {total} lei</p>

          <Link
            to="/checkout"
            className="inline-block mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
          >
            Finalizează comanda
          </Link>
        </>
      )}
    </div>
  );
};

export default Cart;
