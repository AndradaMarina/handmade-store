import { Heart, Gift, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const boxVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2 },
  }),
};

const Benefits = () => {
  const beneficii = [
    {
      icon: <Heart className="w-12 h-12 text-purple-600 group-hover:scale-110 transition" />,
      title: "Făcute cu dragoste",
      desc: "Fiecare produs este creat manual cu grijă și pasiune, unic și special.",
    },
    {
      icon: <Gift className="w-12 h-12 text-purple-600 group-hover:scale-110 transition" />,
      title: "Cadouri perfecte",
      desc: "Produsele noastre sunt ideale pentru surprize de neuitat, frumos ambalate.",
    },
    {
      icon: <Sparkles className="w-12 h-12 text-purple-600 group-hover:scale-110 transition" />,
      title: "Unic și memorabil",
      desc: "Adaugă o notă personală prin gravură, culoare sau parfum distinctiv.",
    },
  ];

  return (
    <section className="bg-white py-16 px-4 md:px-12">
      <h2 className="text-3xl font-bold text-center text-purple-800 mb-12">
        De ce să alegi HandmadeStore?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center max-w-6xl mx-auto">
        {beneficii.map((benefit, i) => (
          <motion.div
            key={i}
            className="group p-4 rounded-lg hover:bg-purple-50 transition"
            custom={i}
            variants={boxVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {benefit.icon}
            <h3 className="font-semibold text-lg mt-4 mb-2">{benefit.title}</h3>
            <p className="text-gray-600 text-sm">{benefit.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Benefits;
