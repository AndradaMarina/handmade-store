import products from "../data/products";
import { Link } from "react-router-dom";

const Products = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
      {products.map((product) => {
        const defaultColor = product.colors[0];
        const defaultImageData = product.images[defaultColor];
        const defaultImage = Array.isArray(defaultImageData)
          ? defaultImageData[0]
          : defaultImageData;

        return (
          <div key={product.id} className="border rounded-lg shadow hover:shadow-md transition">
            <img
              src={defaultImage}
              alt={product.name}
              className="w-full h-48 object-contain rounded-t-lg"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-gray-700">{product.price} lei</p>

              <Link
                to={`/products/${product.id}?color=${encodeURIComponent(defaultColor)}`}
                className="text-purple-600 hover:underline text-sm mt-2 inline-block"
              >
                Vezi detalii
              </Link>

              {/* Previzualizare variante */}
              <div className="flex gap-2 mt-3">
                {product.colors.slice(0, 4).map((color, i) => {
                  const img = Array.isArray(product.images[color]) ? product.images[color][0] : product.images[color];
                  return (
                    <Link key={i} to={`/products/${product.id}?color=${encodeURIComponent(color)}`}>
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
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Products;
