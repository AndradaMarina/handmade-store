const products = [
  {
    id: '1',
    name: 'Brățară personalizată',
    price: 89,
    images: {
     roz: '/images/bratara1.jpg',
      alb: '/images/bratara2.jpg',
    },
    description: `Brățară handmade personalizată pentru orice ocazie. 
Poți alege numele, mărimea, culoarea.
Toate charm-urile sunt din rhinestone.`,
    colors: ['roz', 'alb'],
    sizes: ['Bebeluș', 'Copil', 'Adult'],
    canBeEngraved: true,
    hasGiftWrap: true,
    variantLabel: "Culoare"

  },

  {
    id: "2",
    name: "Lumânare parfumată cu cristale",
    price: 75.99,
    images: {
      orhidee: [ "/images/lumanare-freesia.jpg", 
        "/images/lumanare-freesia-marime.jpg"],
      lavandă: ["/images/lumanare-lavender.jpg",
        "/images/lumanare-lavender-marime.jpg"

      ],

    },
    descriptionByColor: {
      orhidee: "Lumânare de lux cu parfum de orhidee, cristale roz naturale și note florale fine. Ideală pentru relaxare și echilibru emoțional.",
      lavandă: "Lumânare handmade cu ulei esențial de lavandă, perfectă pentru calmare, aromaterapie și decor elegant cu pietre semiprețioase."
    },
    colors: ["orhidee", "lavandă"],
    sizes: [], // Nu se selectează
    canBeEngraved: false,
    hasGiftWrap: true,
    variantLabel: "Parfum",

  }
];

export default products;
