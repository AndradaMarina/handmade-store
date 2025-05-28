import { Link } from "react-router-dom";
import productData from "../data/products";

const Home = () => {
  const recomandate = productData.slice(0, 3); // primele 3 produse

  return (
    <div className="p-4 md:p-10">
      {/* Hero Banner */}
      <div className="bg-purple-100 rounded-2xl p-6 text-center mb-10 shadow-md">
        <h1 className="text-4xl font-bold text-purple-800 mb-4">Cadouri handmade unicat</h1>
        <p className="text-gray-700 text-lg mb-6">Brățări, lumânări și decorațiuni personalizate cu dragoste.</p>
        <Link to="/products" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">
          Vezi produsele
        </Link>
      </div>

      {/* Categorii */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Categorii populare</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow hover:shadow-lg transition">
            <h3 className="font-bold text-purple-700 mb-2">Bijuterii</h3>
            <p className="text-sm text-gray-600">Brățări și coliere personalizabile.</p>
          </div>
          <div className="bg-white p-4 rounded shadow hover:shadow-lg transition">
            <h3 className="font-bold text-purple-700 mb-2">Lumânări parfumate</h3>
            <p className="text-sm text-gray-600">Cu cristale și uleiuri esențiale.</p>
          </div>
          <div className="bg-white p-4 rounded shadow hover:shadow-lg transition">
            <h3 className="font-bold text-purple-700 mb-2">Cadouri</h3>
            <p className="text-sm text-gray-600">Seturi speciale pentru aniversări și ocazii.</p>
          </div>
        </div>
      </div>

      {/* Produse recomandate */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recomandate</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recomandate.map((produs) => {
            const primaImagine = Array.isArray(Object.values(produs.images)[0])
              ? Object.values(produs.images)[0][0]
              : Object.values(produs.images)[0];

            return (
              <div
                key={produs.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-300"
              >
                <img
                  src={primaImagine}
                  alt={produs.name}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">{produs.name}</h3>
                  <p className="text-purple-600 font-bold text-md">{produs.price} lei</p>
                  <Link
                    to={`/products/${produs.id}`}
                    className="inline-block mt-3 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                  >
                    Detalii produs
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
