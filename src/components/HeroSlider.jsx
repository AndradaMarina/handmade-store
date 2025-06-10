import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    image: "/images/slider1.jpg",
    text: "Brățări personalizate cu mărgele și cristale – cadouri din suflet.",
  },
  {
    id: 2,
    image: "/images/slider2.jpg",
    text: "Săpunuri naturale handmade – delicatețe și aromă în fiecare gest.",
  },
  {
    id: 3,
    image: "/images/slider3.jpg",
    text: "Lumânări parfumate  – relaxare și atmosferă unică.",
  },
];

const HeroSlider = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (i) => {
    setIndex(i);
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-xl shadow-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[index].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={slides[index].image}
            alt={slides[index].text}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="text-center px-6 md:px-12">
              <h1 className="text-white text-2xl md:text-4xl font-bold drop-shadow-lg">
                {slides[index].text}
              </h1>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicatori de buline */}
      <div className="absolute bottom-4 w-full flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`w-3 h-3 rounded-full ${
              i === index ? "bg-white" : "bg-white/50"
            } transition`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
