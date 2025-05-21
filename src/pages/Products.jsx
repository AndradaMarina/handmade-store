import products from '../data/products';
import { Link } from 'react-router-dom';

const Products = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-purple-700">Produsele Noastre</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover rounded"
            />
            <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
            <p className="text-purple-600 font-bold">{product.price} RON</p>
            <Link
              to={`/products/${product.id}`}
              className="inline-block mt-3 text-sm text-purple-700 hover:underline"
            >
              Vezi detalii
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
