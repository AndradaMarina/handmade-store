import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link, useSearchParams } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search")?.toLowerCase() || "";
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "produse"));
      const list = snapshot.docs.map(doc => ({
        firebaseId: doc.id, // salvăm ID-ul corect de la Firestore
        ...doc.data(),
      }));
      setProducts(list);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(search);
    const descMatch = (product.description || "").toLowerCase().includes(search);
    const variantMatch = (product.colors || []).some((color) =>
      color.toLowerCase().includes(search)
    );
    return nameMatch || descMatch || variantMatch;
  });

  if (loading) return <p className="text-center mt-10">Se încarcă produse...</p>;

  return (
    <div className="p-4">
      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500">
          Niciun produs nu se potrivește cu termenul căutat.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const defaultColor = product.colors?.[0];
            const defaultImageData = product.images?.[defaultColor];
            const defaultImage = Array.isArray(defaultImageData)
              ? defaultImageData[0]
              : defaultImageData;

            return (
              <div
                key={product.firebaseId}
                className="border rounded-lg shadow hover:shadow-md transition flex flex-col relative"
              >
                <img
                  src={defaultImage}
                  alt={product.name}
                  className="w-full h-48 object-contain rounded-t-lg"
                />

                <button
                  onClick={() =>
                    isInWishlist(product.firebaseId)
                      ? removeFromWishlist(product.firebaseId)
                      : addToWishlist(product)
                  }
                  className={`absolute top-2 right-2 text-xl transition duration-200 ${
                    isInWishlist(product.firebaseId)
                      ? "text-red-500 hover:text-red-600"
                      : "text-gray-400 hover:text-purple-600"
                  } cursor-pointer`}
                  title="Adaugă la favorite"
                >
                  {isInWishlist(product.firebaseId) ? <FaHeart /> : <FaRegHeart />}
                </button>

                <div className="flex flex-col justify-between flex-1 p-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-2 min-h-[48px]">
                      {product.name}
                    </h2>
                    <p className="text-purple-700 font-bold mb-3 min-h-[24px]">
                      {product.price} lei
                    </p>
                  </div>

                  <div className="flex gap-2 mb-3">
                    {(product.colors || []).slice(0, 4).map((color, i) => {
                      const img = Array.isArray(product.images?.[color])
                        ? product.images[color][0]
                        : product.images?.[color];
                      return (
                        <Link
                          key={i}
                          to={`/products/${product.firebaseId}?color=${encodeURIComponent(color)}`}
                        >
                          <img
                            src={img}
                            alt={color}
                            className="w-10 h-10 object-cover border rounded hover:scale-110 transition-transform duration-200"
                            title={color}
                          />
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-auto">
                    <Link
                      to={`/products/${product.firebaseId}?color=${encodeURIComponent(defaultColor)}`}
                      className="inline-block text-sm px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition w-full text-center"
                    >
                      Vezi detalii
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;
