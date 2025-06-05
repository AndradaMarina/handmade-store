import { useWishlist } from "../context/WishlistContext";
import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="p-10 text-center text-gray-600">
        <p className="text-xl">Nu ai produse în lista de favorite.</p>
        <Link
          to="/products"
          className="mt-4 inline-block bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
        >
          Vezi produse
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-purple-700 mb-6">Favorite</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {wishlist.map((product) => {
          const defaultColor = product.colors?.[0];
          const image =
            typeof product.images[defaultColor] === "string"
              ? product.images[defaultColor]
              : product.images[defaultColor][0];

          return (
            <div
              key={product.id}
              className="relative border rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col"
            >
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer"
                title="Șterge din favorite"
              >
                <FaTrash />
              </button>

              <img
                src={image}
                alt={product.name}
                className="w-full h-48 object-contain mb-4"
              />

              <h2 className="text-lg font-semibold mb-1">{product.name}</h2>
              <p className="text-purple-700 font-bold mb-4">{product.price} lei</p>

              <Link
                to={`/products/${product.id}?color=${encodeURIComponent(defaultColor)}`}
                className="text-sm bg-purple-600 text-white rounded px-4 py-2 hover:bg-purple-700 transition text-center"
              >
                Vezi detalii
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
