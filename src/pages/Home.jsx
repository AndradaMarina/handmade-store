import HeroSlider from "../components/HeroSlider";
import { Link, useNavigate } from "react-router-dom";
import productData from "../data/products";
import Testimoniale from "../components/Testimoniale";
import { Sparkles, Leaf, Gift } from "lucide-react";
import { useState } from "react";

const Home = () => {
  const recomandate = productData.slice(0, 3);
  const navigate = useNavigate();
  const [selectedVariants, setSelectedVariants] = useState({});

  const handleVariantClick = (productId, variantId) => {
    navigate(`/products/${variantId}`);
  };

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
      <section className="max-w-6xl mx-auto space-y-8 mt-20">
        <div className="flex items-center justify-between px-2 md:px-0">
          <h2 className="text-3xl font-bold text-gray-800">Recomandate</h2>
          <Link to="/products" className="text-purple-600 hover:underline font-medium text-sm">
            Vezi toate produsele →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {recomandate.map((produs) => {
            const primaImagine = Array.isArray(Object.values(produs.images)[0])
              ? Object.values(produs.images)[0][0]
              : Object.values(produs.images)[0];

            const variantPreviewImages = Object.entries(produs.images)
              .map(([variantId, imgArray]) => ({
                id: variantId,
                src: Array.isArray(imgArray) ? imgArray[0] : imgArray,
              }))
              .slice(0, 3);

            return (
              <div
                key={produs.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden border border-gray-100 flex flex-col"
              >
                <img
                  src={primaImagine}
                  alt={produs.name}
                  className="w-full h-56 object-contain bg-white"
                />
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{produs.name}</h3>

                  <div className="flex gap-2 mb-3">
                    {variantPreviewImages.map((variant, i) => (
                      <img
                        key={i}
                        src={variant.src}
                        alt={`variant-${i}`}
                        onClick={() => handleVariantClick(produs.id, variant.id)}
                        className={`w-10 h-10 object-cover border rounded cursor-pointer ${
                          selectedVariants[produs.id] === variant.id ? "ring-2 ring-purple-600" : ""
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-purple-700 font-bold mb-3">{produs.price} lei</p>

                  <div className="mt-auto">
                    <Link
                      to={`/products/${produs.id}`}
                      className="inline-block text-sm px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition w-full text-center"
                    >
                      Detalii produs
                    </Link>
                  </div>
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
