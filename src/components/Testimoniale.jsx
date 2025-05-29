const testimoniale = [
  {
    nume: "Andreea P.",
    mesaj: "Brățara a fost exact cum mi-am dorit! Fină, elegantă și livrată rapid. Mulțumesc!",
    avatar: "https://ui-avatars.com/api/?name=Andreea+P&background=8b5cf6&color=fff"
  },
  {
    nume: "Cristina T.",
    mesaj: "Lumânarea cu lavandă a umplut casa de miros plăcut. Plus că arată superb!",
    avatar: "https://ui-avatars.com/api/?name=Cristina+T&background=facc15&color=000"
  },
  {
    nume: "Marius B.",
    mesaj: "Am luat un cadou pentru soția mea, a fost încântată! Recomand cu drag.",
    avatar: "https://ui-avatars.com/api/?name=Marius+B&background=34d399&color=000"
  },
];

const Testimoniale = () => {
  return (
    <section className="my-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-10">Ce spun clienții</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimoniale.map((t, idx) => (
          <div key={idx} className="bg-white shadow-md rounded-xl p-6 flex flex-col items-center text-center">
            <img src={t.avatar} alt={t.nume} className="w-16 h-16 rounded-full mb-4" />
            <p className="text-gray-700 italic">“{t.mesaj}”</p>
            <p className="mt-4 font-semibold text-purple-600">{t.nume}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimoniale;
