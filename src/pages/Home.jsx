import HeroSlider from "../components/HeroSlider";
import { Link } from "react-router-dom";
import productData from "../data/products";
import Testimoniale from "../components/Testimoniale";
import { Sparkles, Leaf, Gift } from "lucide-react";

const Home = () => {
  const recomandate = productData.slice(0, 3);

  return (
    <div className="space-y-24 px-4 md:px-12 py-10 bg-gradient-to-b from-purple-50 via-white to-white text-gray-800">

      {/* Slider */}
      <section className="-mt-8">
        <HeroSlider />
      </section>

      {/* Despre noi */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <h2 className="text-4xl font-bold text-purple-800">Cadouri handmade cu suflet</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          Realizăm cu grijă și pasiune brățări gravate, lumânări cu cristale și obiecte de decor unicat.
          Produsele noastre sunt personalizabile și perfecte pentru ocazii speciale.
        </p>
        <Link
          to="/products"
          className="mt-4 inline-block px-8 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition text-base shadow-md"
        >
          Vezi produsele
        </Link>
      </section>

      {/* Beneficii */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition border border-purple-100">
          <Sparkles className="w-10 h-10 mx-auto text-purple-600" />
          <h3 className="font-bold mt-4 mb-2 text-lg">Unicat & Personalizat</h3>
          <p className="text-sm text-gray-600">Fiecare produs e creat manual, cu opțiuni de personalizare.</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition border border-purple-100">
          <Leaf className="w-10 h-10 mx-auto text-purple-600" />
          <h3 className="font-bold mt-4 mb-2 text-lg">Natural & Handmade</h3>
          <p className="text-sm text-gray-600">Folosim materiale naturale: soia, cristale, lemn, ață cerată.</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition border border-purple-100">
          <Gift className="w-10 h-10 mx-auto text-purple-600" />
          <h3 className="font-bold mt-4 mb-2 text-lg">Cadouri ideale</h3>
          <p className="text-sm text-gray-600">Perfecte pentru aniversări, Crăciun, botez sau surprize de suflet.</p>
        </div>
      </section>

      {/* Produse recomandate */}
      <section className="space-y-10 max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-center text-gray-800">Recomandate</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {recomandate.map((produs) => {
            const primaImagine = Array.isArray(Object.values(produs.images)[0])
              ? Object.values(produs.images)[0][0]
              : Object.values(produs.images)[0];

            return (
              <div
                key={produs.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden border border-gray-100"
              >
                <img
                  src={primaImagine}
                  alt={produs.name}
                  className="w-full h-56 object-cover"
                />
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-1 text-gray-800">{produs.name}</h3>
                  <p className="text-purple-600 font-bold mb-2">{produs.price} lei</p>
                  <Link
                    to={`/products/${produs.id}`}
                    className="inline-block mt-2 px-5 py-2 text-sm border border-purple-700 text-purple-700 rounded hover:bg-purple-700 hover:text-white transition"
                  >
                    Detalii
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimoniale */}
      <Testimoniale />
    </div>
  );
};

export default Home;
